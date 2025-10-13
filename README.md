# Tools — 开发者工具集合

这是一个基于 Vue 3 + Vite 的开发者工具集合仓库。项目把很多实用的小工具（图片处理、JSON/文本处理、二维码、JWT、颜色拾取等）组织在 `src/tools` 下，每个工具以单文件组件的形式实现，方便单独维护与扩展。

下面的 README 参考了 `src/tools` 中的组件，为常用工具做了简短说明并列出常用的开发命令，方便你快速上手和二次开发。

## 仓库结构（重点）

- `src/tools/` — 各类工具组件（Vue 单文件组件），例如：
  - `FaviconGenerator.vue`：从图片裁剪并生成多尺寸 favicon（支持 ICO/PNG/JPG，ZIP 批量下载）。
  - `FileRenamer.vue`：批量文件重命名（顺序、替换、大小写、插入、截断），支持生成重命名脚本（Windows/Linux）。
  - `TextProcessor.vue`：文本处理（URL 编码/解码、Base64 编/解、MD5/SHA256 等哈希）。
  - `ImageSteganography.vue`：图像隐写（在目标图像 LSB 中嵌入/提取隐藏图片）。
  - `ColorPickerTool.vue`：颜色拾取器（图片取色、放大镜、HEX/RGB/HSL/HSV/CMYK 互转、常用色板）。
  - `JwtTool.vue`：JWT 生成 / 解码 / 验证（支持 HS256/384/512、签名校验、claims 展示）。
  - `Pdf*`、`qrcode/QrCodeTool.vue`、`image/*`（`ImageCompressor.vue`、`GifEditor.vue`、`BackgroundRemover.vue`、`ImageToGifConverter.vue`、`SvgEditor.vue` 等）和 `json/*`（`JsonPathExtractor.vue`、`JsonToExcel.vue`、`JsonFormatter.vue` 等）等子目录下还有大量专用工具组件。

具体组件请查看 `src/tools` 目录以获取详细实现与参数。

## 功能概览（按类别）

- 图片类：图片压缩、转 GIF、GIF 编辑、背景移除、拼贴、水印、SVG 编辑、视频转 GIF/帧等。
- JSON / Excel：路径提取、数组切片/去重、Json->Excel、Excel->Json（统一转换器）、格式化与合并等。
- 文本 / 字符串：URL 编/解、Base64 编/解、哈希（MD5/SHA256）、文本统计等。
- 开发辅助：批量重命名、favicon 生成、JWT 工具、WebSocket 调试（`WsTool.vue`）、HTML 抽取等。
- 颜色与 UI：颜色拾取/转换、常用色板、预览在亮/暗主题下的效果。
- 二维码：生成与导出（`QrCodeTool.vue`）。

## 本地开发（快速开始）

首次拉取后安装依赖：

```powershell
pnpm install
```

运行开发服务器（Vite）并热重载：

```powershell
pnpm dev
```

打包生产版本：

```powershell
pnpm build
```

运行单元测试（Vitest）：

```powershell
pnpm test
```

类型检查（使用 vue-tsc）：

```powershell
pnpm type-check
```

代码风格 / ESLint：

```powershell
pnpm lint
```

（注：以上命令对应的 scripts 定义在 `package.json`；若仓库使用 pnpm workspace，请在 workspace 根目录运行命令。）

## 运行与打包（Electron）

仓库包含 `electron/` 目录，支持打包为桌面应用（electron-builder 配置位于根部的 `electron-builder.json` 与 `electron/*.js`）。常见流程：

- 开发（渲染进程使用 Vite）：先运行 `pnpm dev`，在另一个终端启动 Electron（项目可能提供 helper 脚本，如 `electron/dev-runner.js` 或 `electron/build.js`）。
- 打包：请参考项目顶层的 `package.json` 和 `electron-builder.json` 中的脚本与配置。

## 测试与质量门控

- 单元测试：`src/tools/__tests__` 下包含大量针对单个工具的 Vitest 测试，运行 `pnpm test` 可以执行这些用例。
- 建议在提交前运行：`pnpm lint`、`pnpm test` 与 `pnpm type-check`。

## 本地使用示例（快速指引）

- 生成 favicon：打开 `Favicon Generator`，上传或粘贴图片，使用裁剪器选择区域，选择输出格式与尺寸，点击生成并下载单个或打包 ZIP。
- 批量重命名：打开 `File Renamer`，拖入文件（支持多选），在不同标签页中设置规则（序列、替换、插入等），预览后应用并下载重命名后的 ZIP，或导出平台脚本。
- 文本处理：在 `Text Processor` 中粘贴文本，点击相应按钮（URL 编码/Base64/hash）获取结果并复制或下载。

## 如何为项目贡献

1. Fork -> 新建分支 (feature/xxx)
2. 在 `src/tools` 下新增或修改工具组件，保持组件小而专注。
3. 添加/更新对应的单元测试（`src/tools/__tests__`）。
4. 运行 `pnpm lint`、`pnpm test` 和 `pnpm type-check`，确保无错误。
5. 提交 PR，描述你的改动、为什么需要以及如何验证。

常见建议：尽量写小的、可复用的组件；对复杂逻辑抽离到 `composables/` 或 `utils/`；为关键功能补充测试用例。

## 国际化 / 文案

项目中使用 `vue-i18n`（参考 `src/locales`）管理中英文本，新增界面时请在 `src/locales/en.ts` 与 `src/locales/zh.ts` 中补充对应的 key。

## 参考与调试

- 组件源码位于 `src/tools`，公共 UI 在 `src/components`，可复用逻辑在 `src/composables`。
- 如果需要本地调试 Electron 部分，请查看 `electron/` 下的脚本。为避免环境差异，优先在浏览器模式下调试渲染进程逻辑。