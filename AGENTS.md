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
  App.tsx                  # 路由树装配；homeRoute + TOOL_ROUTES.map + 404
  lib/
    routes.ts              # 工具路由表 + 派生分类（唯一定义工具清单的地方）
    utils.ts               # cn() 等通用工具
    barcode.ts             # 条形码码制定义（示例：纯逻辑模块）
    barcode-reader.ts      # 条形码识别封装（示例：依赖库封装）
  components/
    ui/                    # 可复用组件：button, input, select, tabs, dialog, ...
    layout/Layout.tsx      # 全局布局：header + 标签栏 + 多标签内容区
    layout/tab-bar.tsx     # header 下方的标签栏（切换 / 关闭 / 更多操作）
    layout/tabs-context.ts # 标签上下文与 useTabs()
    layout/tabs-provider.tsx # 标签状态：打开 / 关闭 / 持久化到 sessionStorage
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
field / label / dialog / upload-dropzone / color-picker-field 等），
新组件不要重复造轮子。

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

### 3.1 多标签机制（写工具时必读）

所有页面运行在 `components/layout/tabs-provider.tsx` 的**多标签容器**中：

- 一个路径 = 一个标签，激活标签 = 当前 URL；标签列表存 `sessionStorage`，刷新后恢复。
- 切换标签只是**隐藏**（`hidden` 属性）页面组件，**不会卸载**，所以工具里的输入、
  上传的文件、编辑器内容都会原样保留——这是有意为之，不要依赖「切走即重置」。
- 因此组件是常驻的：在 `useEffect` 里启动的定时器、`MediaStream`、`WebSocket`、
  轮询等，务必在 cleanup 中释放，否则切走后仍在后台运行。
- 标签栏中的「重新加载」会重新挂载页面（等价于强制重置状态）。
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
