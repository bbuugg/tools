# AGENTS.md

面向 AI 协作者与本仓库维护者的工作指南。新增 / 修改工具前先读此文件。

## 1. 项目概览

一个**在线工具箱**单页应用（SPA），已上线 `https://tools.codeemo.cn`。
每个"工具"是一个独立的懒加载页面，统一在路由表 + 首页卡片 + 侧边栏中呈现。

- 框架：React 19 + TypeScript + Vite 8
- 样式：Tailwind CSS v4（`@tailwindcss/vite` 插件，无 `tailwind.config.js`，主题在 CSS 中）
- 路由：`react-router-dom` v7（`createBrowserRouter`）
- UI 组件：`src/components/ui` 下为 shadcn 风格组件（基于 Radix UI）
- 图标：`lucide-react`
- 提示：`sonner`（`Toaster` 已在 `App.tsx` 全局挂载，直接用 `toast()`）
- 工具函数：`src/lib/utils.ts` 的 `cn(...)`（clsx + tailwind-merge）

## 2. 目录结构

```
src/
  App.tsx                  # 路由树装配 + DndProvider；homeRoute + TOOL_ROUTES.map + 404
  lib/
    routes.ts              # 工具路由表 + 派生分类（唯一定义工具清单的地方）
    utils.ts               # cn() 等通用工具
    barcode.ts             # 条形码码制定义（示例：纯逻辑模块）
    barcode-reader.ts      # 条形码识别封装（示例：依赖库封装）
    pane-layout.ts         # 面板布局树纯函数：拆分 / 尺寸归一化 / 结构校验
    panel-groups.ts        # 分组与标签操作纯函数：打开 / 激活 / 移动 / 拆分 / 合并 / 关闭
  components/
    ui/                    # 可复用组件：button, input, select, tabs, dialog, ...
    layout/Layout.tsx      # 全局布局：侧边栏 + 面板视图（无顶栏，标题只写进 document.title）
    layout/panel-view.tsx  # 面板视图：标签条、分组、拖拽落点、拆分条、内容层
    layout/panel-store.ts  # 面板状态：订阅、用户操作、URL 同步、sessionStorage 持久化
    layout/panel-bodies.ts # 分组内容区 DOM 登记表（内容层按矩形绝对定位）
    layout/tab-runtime.ts  # 标签运行时：已挂载标记 / 重新加载 key
    layout/dnd-context.ts  # react-dnd 拖拽契约与 hooks
    layout/tabs-provider.tsx # 地址栏 ↔ 面板状态桥接 + 防抖持久化
  pages/
    home/                  # 首页：消费 TOOL_CATEGORIES 自动渲染卡片
    not-found.tsx
    tools/<tool-name>/index.tsx   # 每个工具一个文件夹，默认导出页面组件
```

> 路径别名 `@` → `src/`
> 页面组件注册表：`src/lib/tabs.ts`（路径 → 懒加载组件 + 标签标题/图标）（见 `vite.config.ts` 与 `tsconfig*.json`）,
> import 一律用 `@/...`，不要写相对路径越层引用。

## 3. 新增一个工具（标准流程）

只需两步，**无需**手动改首页 / 侧边栏——它们从路由表自动派生。

**① 新建页面** `src/pages/tools/<kebab-name>/index.tsx`，
默认导出一个 React 组件：

```tsx
export default function MyTool() {
  return <div className="container py-6">…</div>
}
```

优先复用 `src/components/ui` 现有组件（button / input / select / tabs / switch /
field / label / dialog / dropdown-menu / context-menu / upload-dropzone /
color-picker-field 等），新组件不要重复造轮子。

**② 在 `src/lib/routes.ts` 的 `TOOL_ROUTES` 中追加一项**：

```ts
import { Wand2 } from "lucide-react";

{
  path: "/tools/my-tool",
  lazy: () => import("@/pages/tools/my-tool"),
  meta: {
    title: "工具中文名",
    description: "一句话描述，会出现在首页卡片与 SEO",
    category: "图像处理",          // 必须是 CATEGORY_ORDER 中已有的分类
    icon: Wand2,                  // 从 lucide-react 选
    color: "bg-slate-600",        // 卡片图标背景色（Tailwind 类）
  },
},
```

`category` 只能是 `CATEGORY_ORDER`（`routes.ts` 顶部）中的值之一；
新分类会**自动**在首页与侧边栏按该顺序出现，无需额外注册。

### 3.1 面板 / 多标签机制（写工具时必读）

所有页面运行在 `components/layout/panel-view.tsx` 的**可拖拽面板容器**中：

- 一个路径 = 一个标签；标签归属某个分组（面板），**焦点分组的活动标签 = 当前 URL**。
  布局树（横 / 纵拆分 + 尺寸）、分组与标签归属、焦点分组存 `sessionStorage`，刷新后恢复。
- 布局自由组合：拖标签到标签条可换组 / 排序；拖到分组内容区**边缘**拆分为新分组，
  拖到**中心**与目标分组合并；拖分组标题栏的握把可整体移动分组；拖动分隔条调整尺寸。
- 切换标签、跨组移动、拆分、合并都只是**隐藏或改定位**，页面组件**不会卸载**，所以输入、
  上传的文件、编辑器内容都会原样保留——这是有意为之，不要依赖「切走即重置」。
  内容层（`panel-bodies.ts`）保证页面 React 父节点稳定，标签换组不会重挂页面。
- 因此组件是常驻的：在 `useEffect` 里启动的定时器、`MediaStream`、`WebSocket`、
  轮询等，务必在 cleanup 中释放，否则切走后仍在后台运行。
- 标签右键菜单：重新加载（仅重挂该标签）/ 复制链接 / 拆分到新分组 / 移动到分组 /
  关闭（其他 / 左侧 / 右侧）/ 关闭分组；分组标题栏也有菜单与「全部合并」等操作。
- 面板状态操作统一走 `panel-store.ts`（`activateTab` / `moveTab` / `splitTab` /
  `moveGroup` / `resizeSplit` / 各 `close*` 等），纯逻辑在 `lib/panel-groups.ts` 与
  `lib/pane-layout.ts`；不要在页面里另存标签或布局状态。
- 路由表只有一条 `*` 规则（`App.tsx`），页面内容不通过 `<Outlet />` 渲染。

## 4. 依赖安装

```bash
pnpm add <pkg>
```

> ⚠️ 见第 6 节：本机 `NODE_OPTIONS` 注入了 `genie-safe-delete.cjs` shim，
> 安装 / 构建 / 类型检查 / lint 前必须 `env -u NODE_OPTIONS` 绕过，否则命令会被拦截卡死。

## 5. 常用脚本

```bash
pnpm dev          # 本地开发（vite）
pnpm build        # tsc -b && vite build（生产构建）
pnpm build-only   # 仅 vite build
pnpm lint         # eslint .
pnpm preview      # 预览构建产物
```

类型检查 / 构建 / lint 的**正确执行方式**（绕过 shim）：

```bash
env -u NODE_OPTIONS pnpm build
env -u NODE_OPTIONS pnpm lint
```

## 6. ⚠️ 关键环境约束（务必遵守）

本机 shell 的 `NODE_OPTIONS` 注入了 `genie-safe-delete.cjs` shim，会拦截
`fs.unlink` 等，导致 `pnpm` / `vite` / `tsc` / `eslint` 在清理或写产物时卡死或失败。

- **所有**涉及 node 工具链的命令，前置 `env -u NODE_OPTIONS`。
- 不要用裸 `pnpm` / `vite` / `tsc` / `eslint`，一律加前缀。
- 该 shim 不影响浏览器运行时，仅影响本地 Node 命令。

## 7. 库引入注意事项（踩坑记录）

- **`bwip-js`（条形码生成）**：浏览器端用 ESM 默认导出
  `import bwipjs from "bwip-js"`（解析到 `bwip-js/dist/bwip-js.mjs`），
  用 `bwipjs.toSVG(opts)` 返回 SVG 字符串（推荐，矢量、无 canvas 副作用）。
  Node 端则是 `bwip-js/dist/bwip-js-node.mjs`。
- **`@zxing/library`（条形码识别）**：浏览器摄像头 / `BrowserMultiFormatReader`
  **必须** `import { BrowserMultiFormatReader } from "@zxing/library/browser"`，
  从主入口导入会缺少浏览器相关类型与实现。
- 浏览器 API（getUserMedia、Canvas、FileReader 等）只在客户端组件中用，
  注意 SSR / 预渲染无关（本项目纯 SPA，无 SSR）。

## 8. 代码风格

- 提交前确保 `env -u NODE_OPTIONS pnpm lint` 与 `pnpm build` 通过。
- 组件用函数式 + hooks；样式用 Tailwind 工具类，`cn()` 合并条件类名。
- 中文 UI 文案；代码注释可中文可英文，关键业务逻辑写清。
- 不在仓库内写临时文档（README / *.md）除非被明确要求。

## 9. 现有分类（CATEGORY_ORDER）

`开发调试` · `文本与转换` · `图像处理` · `视频与动图` · `社交模拟` ·
`音频工具` · `生活工具`

新增工具时从以上选一个；不要自造分类名（否则不会出现在首页）。
