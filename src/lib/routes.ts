import { type SiteDefination } from "@/lib/site";

export interface ToolRoute extends SiteDefination {
  /** 路由路径，如 /tools/json */
  path: string;
  /** 懒加载导入函数 */
  lazy: () => Promise<{ default: React.ComponentType<SiteDefination> }>;
}

/** 所有工具路由配置（title/description 存放在此，动态传入组件） */
export const TOOL_ROUTES: ToolRoute[] = [
  {
    path: "/tools/audio-studio",
    title: "音频工作室",
    description: "在线音频工具，支持录音、上传、分贝分析、波形显示、格式转换（MP3/FLAC/OGG/WAV）及语音合成（TTS）",
    lazy: () => import("@/pages/tools/audio-studio"),
  },
  {
    path: "/tools/base64-image",
    title: "Base64 图片转换",
    description: "Base64 字符串与图片互转，支持自动识别 MIME 类型和批量处理",
    lazy: () => import("@/pages/tools/base64-image"),
  },
  {
    path: "/tools/code-formatter",
    title: "代码格式化",
    description: "使用 Prettier 格式化 JavaScript、TypeScript、HTML、CSS、JSON、YAML、SQL 等多种语言",
    lazy: () => import("@/pages/tools/code-formatter"),
  },
  {
    path: "/tools/color-picker",
    title: "颜色选择器",
    description: "HEX / RGB / CMYK 互转、图片取色与颜色预览工具",
    lazy: () => import("@/pages/tools/color-picker"),
  },
  {
    path: "/tools/cron-generator",
    title: "Cron 表达式生成器",
    description: "可视化生成和解析 Cron 表达式，支持预设模板和下次执行时间预览",
    lazy: () => import("@/pages/tools/cron-generator"),
  },
  {
    path: "/tools/css-gradient-generator",
    title: "CSS 渐变生成器",
    description: "可视化生成线性/径向渐变，支持自定义角度、颜色控制点和预设方案",
    lazy: () => import("@/pages/tools/css-gradient-generator"),
  },
  {
    path: "/tools/excel2json",
    title: "Excel 转 JSON",
    description: "将 Excel/CSV 文件或表格文本快速转换为 JSON，支持表头识别、类型推断和多种输出格式",
    lazy: () => import("@/pages/tools/excel2json"),
  },
  {
    path: "/tools/favicon-generator",
    title: "Favicon 生成器",
    description: "上传图片裁剪并生成多种尺寸的 Favicon，支持 ICO/PNG/JPG 格式",
    lazy: () => import("@/pages/tools/favicon-generator"),
  },
  {
    path: "/tools/file-renamer",
    title: "批量文件重命名",
    description: "序号、替换、大小写、插入、截取等多种重命名方式，支持生成重命名脚本",
    lazy: () => import("@/pages/tools/file-renamer"),
  },
  {
    path: "/tools/gif-editor",
    title: "GIF 编辑器",
    description: "上传 GIF 解析帧序列，编辑延迟、删除帧、调整顺序后重新生成",
    lazy: () => import("@/pages/tools/gif-editor"),
  },
  {
    path: "/tools/html-extractor",
    title: "HTML 提取器",
    description: "从 HTML 中提取图片、链接、视频、音频、CSS、JS、Iframe、Meta 标签等资源",
    lazy: () => import("@/pages/tools/html-extractor"),
  },
  {
    path: "/tools/html-markdown-converter",
    title: "HTML / Markdown 互转",
    description: "Markdown 与 HTML 双向实时转换，支持示例加载和结果复制",
    lazy: () => import("@/pages/tools/html-markdown-converter"),
  },
  {
    path: "/tools/image-compressor",
    title: "图片压缩",
    description: "批量压缩图片，调整质量、尺寸和格式，支持 JPG/PNG/WebP 输出",
    lazy: () => import("@/pages/tools/image-compressor"),
  },
  {
    path: "/tools/image-editor",
    title: "图片编辑器",
    description: "在线图片编辑器，支持亮度、对比度、饱和度、冷暖、HSL、锐化、虚化、裁剪、马赛克、文字、水印、旋转、镜像等调整",
    lazy: () => import("@/pages/tools/image-editor"),
  },
  {
    path: "/tools/image-list-processor",
    title: "图片列表处理器",
    description: "批量下载图片、生成下载脚本，支持 URL 去重和预览",
    lazy: () => import("@/pages/tools/image-list-processor"),
  },
  {
    path: "/tools/image-to-gif",
    title: "图片转 GIF",
    description: "将多张图片合成为 GIF 动画，支持设置宽度、质量、循环次数和每帧延迟",
    lazy: () => import("@/pages/tools/image-to-gif"),
  },
  {
    path: "/tools/image-watermark",
    title: "图片水印",
    description: "为图片添加文字或图片水印，支持位置、透明度、旋转等设置和批量处理",
    lazy: () => import("@/pages/tools/image-watermark"),
  },
  {
    path: "/tools/json",
    title: "JSON 工具箱",
    description: "格式化、转换、提取 JSON 数据的集成工具",
    lazy: () => import("@/pages/tools/json"),
  },
  {
    path: "/tools/jwt",
    title: "JWT 工具",
    description: "生成、解码、验证 JSON Web Token，支持 HS256/HS384/HS512 算法",
    lazy: () => import("@/pages/tools/jwt"),
  },
  {
    path: "/tools/live-photo",
    title: "Live Photo 工具",
    description: "拆解或制作 Google Motion Photo / Android Live Photo",
    lazy: () => import("@/pages/tools/live-photo"),
  },
  {
    path: "/tools/markdown-pdf-converter",
    title: "Markdown / PDF 互转",
    description: "Markdown 与 PDF 双向转换，支持实时预览、PDF 导出与 PDF 文本提取",
    lazy: () => import("@/pages/tools/markdown-pdf-converter"),
  },
  {
    path: "/tools/markdown-word-converter",
    title: "Markdown / Word互转",
    description: "Markdown 和 Word（.docx）双向互转，支持实时预览和导出",
    lazy: () => import("@/pages/tools/markdown-word-converter"),
  },
  {
    path: "/tools/number-base-converter",
    title: "进制转换器",
    description: "支持 2-36 进制之间的相互转换，提供大写、前缀、分组等高级选项",
    lazy: () => import("@/pages/tools/number-base-converter"),
  },
  {
    path: "/tools/php-serialize",
    title: "PHP Serialize",
    description: "PHP serialize/unserialize 在线工具，支持 JSON 与 PHP 序列化格式互转，附带格式说明",
    lazy: () => import("@/pages/tools/php-serialize"),
  },
  {
    path: "/tools/qr-code",
    title: "二维码工具",
    description: "生成和识别二维码，支持自定义颜色、样式、Logo 和批量生成",
    lazy: () => import("@/pages/tools/qr-code"),
  },
  {
    path: "/tools/regex-tester",
    title: "正则表达式测试器",
    description: "实时测试正则表达式，高亮匹配结果，显示捕获组详情",
    lazy: () => import("@/pages/tools/regex-tester"),
  },
  {
    path: "/tools/string-generator",
    title: "字符串生成器",
    description: "UUID/ULID 生成、随机字符串、密码生成，支持字符集自定义和批量导出",
    lazy: () => import("@/pages/tools/string-generator"),
  },
  {
    path: "/tools/text-diff",
    title: "文本对比",
    description: "逐行或逐词对比两段文本的差异，支持并排与统一视图，可忽略空白与大小写",
    lazy: () => import("@/pages/tools/text-diff"),
  },
  {
    path: "/tools/text-processor",
    title: "文本处理工具",
    description: "编码转换、加密哈希、空格清理、YML/Properties 互转，附带文本统计",
    lazy: () => import("@/pages/tools/text-processor"),
  },
  {
    path: "/tools/time-tools",
    title: "时间工具箱",
    description: "时间戳转换、日期差值与加减计算、时区转换，开发常用的时间工具合集",
    lazy: () => import("@/pages/tools/time-tools"),
  },
  {
    path: "/tools/video-image-converter",
    title: "视频图片互转",
    description: "视频提取帧为图片（PNG/JPEG/WebP），或将多张图片合成为 WebM 视频",
    lazy: () => import("@/pages/tools/video-image-converter"),
  },
  {
    path: "/tools/video-to-gif",
    title: "视频转 GIF",
    description: "从视频中截取片段生成 GIF，支持时间范围选择和文字叠加",
    lazy: () => import("@/pages/tools/video-to-gif"),
  },
  {
    path: "/tools/websocket",
    title: "WebSocket 调试",
    description: "连接 WebSocket 服务器，发送和接收消息，支持心跳、JSON 美化和消息记录",
    lazy: () => import("@/pages/tools/websocket"),
  },
  {
    path: "/tools/wechat-chat",
    title: "微信聊天模拟器",
    description: "在线制作微信聊天截图，支持自定义头像、昵称、消息内容、红包、时间等，实时预览并导出图片",
    lazy: () => import("@/pages/tools/wechat-chat"),
  },
];
