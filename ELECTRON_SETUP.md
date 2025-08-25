# Electron 自定义窗口控制设置

本项目已经配置为支持Electron应用，并移除了默认的顶部菜单，使用自定义的窗口控制按钮。

## 主要更改

### 1. Electron 主进程配置 (`electron/main.js`)

- 设置 `frame: false` 移除默认窗口框架
- 设置 `titleBarStyle: 'hidden'` 隐藏标题栏
- 添加了窗口控制的IPC处理程序：
  - `window-minimize`: 最小化窗口
  - `window-maximize`: 最大化/还原窗口
  - `window-close`: 关闭窗口
  - `window-is-maximized`: 检查窗口是否最大化

### 2. 预加载脚本 (`electron/preload.js`)

- 暴露窗口控制API到渲染进程：
  - `windowMinimize()`
  - `windowMaximize()`
  - `windowClose()`
  - `windowIsMaximized()`

### 3. 自定义标题栏组件 (`src/components/ElectronTitleBar.vue`)

- 创建了自定义标题栏，包含：
  - 应用标题和图标
  - 最小化按钮
  - 最大化/还原按钮
  - 关闭按钮
- 只在Electron环境中显示
- 支持拖拽移动窗口（`-webkit-app-region: drag`）
- 按钮区域禁用拖拽（`-webkit-app-region: no-drag`）

### 4. 布局调整

- `App.vue`: 添加了ElectronTitleBar组件，并为Electron环境添加顶部边距和隐藏滚动条样式
- `Header.vue`: 为Electron环境添加顶部边距，避免与自定义标题栏重叠
- `main.css`: 添加了Electron特定的样式，包括自定义断点(1000px)和滚动条隐藏样式
- 移动端断点从1024px(lg)改为1000px，左侧菜单在窗口宽度小于1000px时隐藏

## 使用方法

### 开发模式

```bash
npm run electron:dev
```

### 构建生产版本

```bash
npm run build
npm run electron:build
```

## 功能特性

1. **无边框窗口**: 移除了默认的操作系统窗口装饰
2. **自定义标题栏**: 深色主题的标题栏，显示应用名称和图标
3. **窗口控制按钮**:
   - 最小化：将窗口最小化到任务栏
   - 最大化/还原：在最大化和正常大小之间切换
   - 关闭：关闭应用程序
4. **拖拽支持**: 可以通过标题栏拖拽移动窗口
5. **响应式设计**: 自动检测Electron环境并调整布局
6. **隐藏滚动条**: 在Electron环境下隐藏主内容区域的滚动条
7. **自定义断点**: 左侧菜单在窗口宽度小于1000px时隐藏

## 样式说明

- 标题栏高度：32px (2rem)
- 标题栏背景：深灰色 (`bg-gray-800`)
- 按钮悬停效果：最小化和最大化按钮悬停时变为浅灰色，关闭按钮悬停时变为红色
- 窗口控制按钮尺寸：32x32px
- 自定义断点：1000px（替代默认的lg断点1024px）
- 滚动条：在Electron环境下完全隐藏（支持所有主流浏览器内核）

## 注意事项

1. 自定义标题栏只在Electron环境中显示，在浏览器中不会显示
2. 窗口控制功能需要Electron的IPC通信支持
3. 标题栏区域支持拖拽，但按钮区域除外
4. 应用会自动检测运行环境并调整布局

## 故障排除

如果遇到问题，请检查：

1. Electron是否正确安装：`npm list electron`
2. 预加载脚本是否正确加载
3. IPC通信是否正常工作
4. 浏览器控制台是否有错误信息
