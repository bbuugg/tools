import {
  AppWindow,
  AudioWaveform,
  Braces,
  CalendarClock,
  Clock,
  Code2,
  FileCode2,
  FileDiff,
  FileEdit,
  FileSpreadsheet,
  FileText,
  Film,
  Hash,
  Code2 as HtmlIcon,
  ImageDown,
  Image as ImageIcon,
  ImagePlus,
  Images,
  KeyRound,
  MessageCircle,
  Palette,
  QrCode,
  Radio,
  Regex,
  Shuffle,
  Stamp,
  Type,
  type LucideIcon,
} from "lucide-react";

export interface Tool {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export interface ToolCategory {
  name: string;
  tools: Tool[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    name: "开发调试",
    tools: [
      { title: "JSON 工具箱", href: "/tools/json", description: "集成 JSON 格式化、格式转换（XML/CSV/YAML）、转 Excel/CSV/SQL、JSONPath 提取等多种功能。", icon: Code2, color: "bg-blue-500" },
      { title: "代码格式化", href: "/tools/code-formatter", description: "使用 Prettier 格式化 JavaScript、TypeScript、HTML、CSS、JSON、YAML、SQL 等多种语言。", icon: Braces, color: "bg-violet-500" },
      { title: "JWT 工具", href: "/tools/jwt", description: "生成、解码、验证 JSON Web Token，支持 HS256/HS384/HS512 算法。", icon: KeyRound, color: "bg-rose-500" },
      { title: "WebSocket 调试", href: "/tools/websocket", description: "连接 WebSocket 服务器，发送和接收消息，支持心跳、JSON 美化和消息记录。", icon: Radio, color: "bg-cyan-500" },
      { title: "正则表达式测试器", href: "/tools/regex-tester", description: "实时测试正则表达式，高亮匹配结果，显示捕获组详情。", icon: Regex, color: "bg-blue-600" },
      { title: "Cron 表达式生成器", href: "/tools/cron-generator", description: "可视化生成和解析 Cron 表达式，支持预设模板和下次执行时间预览。", icon: CalendarClock, color: "bg-purple-500" },
      { title: "字符串生成器", href: "/tools/string-generator", description: "UUID/ULID 生成、随机字符串、密码生成，支持字符集自定义和批量导出。", icon: Shuffle, color: "bg-indigo-600" },
      { title: "时间工具箱", href: "/tools/time-tools", description: "时间戳转换、日期差值与加减计算、时区转换，开发常用的时间工具合集。", icon: Clock, color: "bg-emerald-500" },
      { title: "进制转换器", href: "/tools/number-base-converter", description: "支持 2-36 进制之间的相互转换，提供大写、前缀、分组等高级选项。", icon: Hash, color: "bg-indigo-500" },
      { title: "PHP Serialize", href: "/tools/php-serialize", description: "PHP serialize/unserialize 在线工具，支持 JSON 与 PHP 序列化格式互转，附带格式说明。", icon: Braces, color: "bg-purple-600" },
    ],
  },
  {
    name: "文本与转换",
    tools: [
      { title: "文本对比", href: "/tools/text-diff", description: "逐行或逐词对比两段文本差异，支持并排与统一视图，可忽略空白与大小写。", icon: FileDiff, color: "bg-amber-500" },
      { title: "文本处理工具", href: "/tools/text-processor", description: "编码转换、加密哈希、空格清理、YML/Properties 互转，附带文本统计。", icon: Type, color: "bg-indigo-500" },
      { title: "HTML / Markdown 互转", href: "/tools/html-markdown-converter", description: "Markdown 与 HTML 双向实时转换，支持示例加载和结果复制。", icon: FileCode2, color: "bg-green-600" },
      { title: "Markdown / Word互转", href: "/tools/markdown-word-converter", description: "Markdown 和 Word（.docx）双向互转，支持实时预览和导出。", icon: FileText, color: "bg-blue-500" },
      { title: "Markdown / PDF 互转", href: "/tools/markdown-pdf-converter", description: "Markdown 与 PDF 双向转换，支持实时预览、PDF 导出与 PDF 文本提取。", icon: FileText, color: "bg-orange-600" },
      { title: "HTML 提取器", href: "/tools/html-extractor", description: "从 HTML 中提取图片、链接、视频、音频、CSS、JS、Iframe、Meta 标签等资源。", icon: HtmlIcon, color: "bg-orange-500" },
      { title: "CSS 渐变生成器", href: "/tools/css-gradient-generator", description: "可视化生成线性/径向渐变，支持自定义角度、颜色控制点和预设方案。", icon: Palette, color: "bg-pink-500" },
    ],
  },
  {
    name: "图像处理",
    tools: [
      { title: "Base64 图片转换", href: "/tools/base64-image", description: "Base64 字符串与图片互转，支持自动识别 MIME 类型和批量处理。", icon: ImageIcon, color: "bg-teal-500" },
      { title: "图片压缩", href: "/tools/image-compressor", description: "批量压缩图片，调整质量、尺寸和格式，支持 JPG/PNG/WebP 输出。", icon: ImageDown, color: "bg-purple-500" },
      { title: "图片列表处理器", href: "/tools/image-list-processor", description: "批量下载图片、生成下载脚本，支持 URL 去重和预览。", icon: Images, color: "bg-sky-500" },
      { title: "图片水印", href: "/tools/image-watermark", description: "为图片添加文字或图片水印，支持位置、透明度、旋转等设置和批量处理。", icon: Stamp, color: "bg-pink-500" },
      { title: "图片编辑器", href: "/tools/image-editor", description: "在线图片编辑器，支持亮度、对比度、饱和度、冷暖、HSL、锐化、虚化、裁剪、马赛克、文字、水印、旋转、镜像等调整。", icon: ImageIcon, color: "bg-indigo-500" },
      { title: "Favicon 生成器", href: "/tools/favicon-generator", description: "上传图片裁剪并生成多种尺寸的 Favicon，支持 ICO/PNG/JPG 格式。", icon: AppWindow, color: "bg-yellow-500" },
      { title: "二维码工具", href: "/tools/qr-code", description: "生成和识别二维码，支持自定义颜色、样式、Logo 和批量生成。", icon: QrCode, color: "bg-slate-700" },
      { title: "颜色选择器", href: "/tools/color-picker", description: "HEX / RGB / CMYK 互转、图片取色与颜色预览工具", icon: Palette, color: "bg-red-700" },
    ],
  },
  {
    name: "视频与动图",
    tools: [
      { title: "动态图片", href: "/tools/live-photo", description: "拆解和制作 Google Motion Photo / Android Live Photo。", icon: Images, color: "bg-green-700" },
      { title: "GIF 编辑器", href: "/tools/gif-editor", description: "上传 GIF 解析帧序列，编辑延迟、删除帧、调整顺序后重新生成。", icon: Film, color: "bg-pink-500" },
      { title: "图片转 GIF", href: "/tools/image-to-gif", description: "将多张图片合成为 GIF 动画，支持设置宽度、质量、循环次数和每帧延迟。", icon: ImagePlus, color: "bg-orange-500" },
      { title: "视频图片互转", href: "/tools/video-image-converter", description: "视频提取帧为图片（PNG/JPEG/WebP），或将多张图片合成为 WebM 视频。", icon: Film, color: "bg-indigo-500" },
      { title: "视频转 GIF", href: "/tools/video-to-gif", description: "从视频中截取片段生成 GIF，支持时间范围选择和文字叠加。", icon: Film, color: "bg-red-500" },
    ],
  },
  {
    name: "文件与数据",
    tools: [
      { title: "Excel 转 JSON", href: "/tools/excel2json", description: "将 Excel/CSV 文件或表格文本快速转换为 JSON，支持表头识别、类型推断和多种输出格式。", icon: FileSpreadsheet, color: "bg-green-500" },
      { title: "批量文件重命名", href: "/tools/file-renamer", description: "序号、替换、大小写、插入、截取等多种重命名方式，支持生成重命名脚本。", icon: FileEdit, color: "bg-amber-500" },
    ],
  },
  {
    name: "社交模拟",
    tools: [
      { title: "微信聊天模拟器", href: "/tools/wechat-chat", description: "在线制作微信聊天截图，支持自定义头像、昵称、消息内容、红包、时间等，实时预览并导出图片。", icon: MessageCircle, color: "bg-green-500" },
    ],
  },
  {
    name: "音频工具",
    tools: [
      { title: "音频工作室", href: "/tools/audio-studio", description: "录音、上传音频分析（分贝/时长/采样率），播放时实时波形显示，格式转换（MP3/FLAC/OGG/WAV），语音合成 TTS。", icon: AudioWaveform, color: "bg-purple-500" },
    ],
  },
];

/** 所有工具的扁平列表 */
export const ALL_TOOLS: Tool[] = TOOL_CATEGORIES.flatMap((c) => c.tools);
