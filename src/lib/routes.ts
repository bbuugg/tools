import {
  AppWindow,
  AudioWaveform,
  ArrowLeftRight,
  Braces,
  Calculator,
  CalendarClock,
  Clock,
  ContactRound,
  Code2,
  Database,
  Dumbbell,
  FileCode2,
  FileDiff,
  FileEdit,
  FileText,
  Film,
  Hash,
  ImageDown,
  Image as ImageIcon,
  ImagePlus,
  Images,
  Keyboard,
  KeyRound,
  Landmark,
  MessageCircle,
  Network,
  Palette,
  Percent,
  PiggyBank,
  QrCode,
  Radio,
  Regex,
  Shuffle,
  Spline,
  Stamp,
  Type,
  type LucideIcon,
} from "lucide-react";

/** 路由元信息（存放在 route.handle.meta） */
export interface RouteMeta {
  /** 页面标题 */
  title: string;
  /** 页面描述 */
  description: string;
  /** 所属分类名 */
  category: string;
  /** 菜单图标 */
  icon: LucideIcon;
  /** 图标背景色 Tailwind 类名 */
  color: string;
}

/** react-router handle 结构 */
export interface RouteHandle {
  meta: RouteMeta;
}

/** 侧边栏 / 首页卡片使用的工具项 */
export interface Tool {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

/** 工具分类 */
export interface ToolCategory {
  name: string;
  tools: Tool[];
}

/** 工具路由定义（path + 懒加载 + meta） */
export interface ToolRouteDef {
  /** 路由路径，如 /tools/json */
  path: string;
  /** 懒加载导入函数 */
  lazy: () => Promise<{ default: React.ComponentType }>;
  /** 路由元信息 */
  meta: RouteMeta;
}

/** 分类显示顺序 */
const CATEGORY_ORDER = [
  "开发调试",
  "文本与转换",
  "图像处理",
  "视频与动图",
  "社交模拟",
  "音频工具",
  "生活工具",
];

/** 所有工具路由配置（title / description / icon / color / category 统一存放于 meta） */
export const TOOL_ROUTES: ToolRouteDef[] = [
  {
    path: "/tools/json",
    lazy: () => import("@/pages/tools/json"),
    meta: {
      title: "JSON 格式化与提取",
      description: "JSON 格式化、压缩、排序、转义，以及 JSONPath、字段提取和键值提取",
      category: "开发调试",
      icon: Code2,
      color: "bg-blue-500",
    },
  },
  {
    path: "/tools/format-converter",
    lazy: () => import("@/pages/tools/format-converter"),
    meta: {
      title: "JSON 格式转换",
      description: "JSON、Excel、XML、YAML、CSV、SQL 格式之间互转，支持文件上传和多种输出选项",
      category: "开发调试",
      icon: ArrowLeftRight,
      color: "bg-green-500",
    },
  },
  {
    path: "/tools/code-formatter",
    lazy: () => import("@/pages/tools/code-formatter"),
    meta: {
      title: "代码格式化",
      description: "使用 Prettier 格式化 JavaScript、TypeScript、HTML、CSS、JSON、YAML、SQL 等多种语言",
      category: "开发调试",
      icon: Braces,
      color: "bg-violet-500",
    },
  },
  {
    path: "/tools/jwt",
    lazy: () => import("@/pages/tools/jwt"),
    meta: {
      title: "JWT 工具",
      description: "生成、解码、验证 JSON Web Token，支持 HS256/HS384/HS512 算法",
      category: "开发调试",
      icon: KeyRound,
      color: "bg-rose-500",
    },
  },
  {
    path: "/tools/websocket",
    lazy: () => import("@/pages/tools/websocket"),
    meta: {
      title: "WebSocket 调试",
      description: "连接 WebSocket 服务器，发送和接收消息，支持心跳、JSON 美化和消息记录",
      category: "开发调试",
      icon: Radio,
      color: "bg-cyan-500",
    },
  },
  {
    path: "/tools/regex-tester",
    lazy: () => import("@/pages/tools/regex-tester"),
    meta: {
      title: "正则表达式测试",
      description: "实时测试正则表达式，高亮匹配结果，显示捕获组详情",
      category: "开发调试",
      icon: Regex,
      color: "bg-blue-600",
    },
  },
  {
    path: "/tools/cron-generator",
    lazy: () => import("@/pages/tools/cron-generator"),
    meta: {
      title: "Cron 表达式生成",
      description: "可视化生成和解析 Cron 表达式，支持预设模板和下次执行时间预览",
      category: "开发调试",
      icon: CalendarClock,
      color: "bg-purple-500",
    },
  },
  {
    path: "/tools/string-generator",
    lazy: () => import("@/pages/tools/string-generator"),
    meta: {
      title: "字符串生成",
      description: "UUID/ULID 生成、随机字符串、密码生成，支持字符集自定义和批量导出",
      category: "开发调试",
      icon: Shuffle,
      color: "bg-indigo-600",
    },
  },
  {
    path: "/tools/mock-data-generator",
    lazy: () => import("@/pages/tools/mock-data-generator"),
    meta: {
      title: "Mock 数据生成器",
      description:
        "批量生成中文姓名、手机号、身份证号（含合法校验码）、邮箱、地址、公司名等测试数据，支持字段组合与 JSON/CSV/TSV 导出，附身份证校验",
      category: "开发调试",
      icon: Database,
      color: "bg-fuchsia-600",
    },
  },
  {
    path: "/tools/time-tools",
    lazy: () => import("@/pages/tools/time-tools"),
    meta: {
      title: "时间工具箱",
      description: "时间戳转换、日期差值与加减计算、时区转换，开发常用的时间工具合集",
      category: "开发调试",
      icon: Clock,
      color: "bg-emerald-500",
    },
  },
  {
    path: "/tools/number-base-converter",
    lazy: () => import("@/pages/tools/number-base-converter"),
    meta: {
      title: "进制转换",
      description: "支持 2-36 进制之间的相互转换，提供大写、前缀、分组等高级选项",
      category: "开发调试",
      icon: Hash,
      color: "bg-indigo-500",
    },
  },
  {
    path: "/tools/unit-converter",
    lazy: () => import("@/pages/tools/unit-converter"),
    meta: {
      title: "通用单位换算",
      description:
        "长度（px/rem/cm/m/km/in/ft/yd/mi）、温度（°C/°F/K）、重量（mg/g/kg/t/oz/lb）、数据大小（bit/B/KB/MB/GB/TB，支持十进制 1000 与二进制 1024）之间的实时换算",
      category: "开发调试",
      icon: Calculator,
      color: "bg-teal-600",
    },
  },
  {
    path: "/tools/php-serialize",
    lazy: () => import("@/pages/tools/php-serialize"),
    meta: {
      title: "PHP Serialize",
      description: "PHP serialize/unserialize 在线工具，支持 JSON 与 PHP 序列化格式互转，附带格式说明",
      category: "开发调试",
      icon: Braces,
      color: "bg-purple-600",
    },
  },
  {
    path: "/tools/keyboard-tester",
    lazy: () => import("@/pages/tools/keyboard-tester"),
    meta: {
      title: "键盘按键测试",
      description:
        "可视化键盘按亮测试，支持 Windows / Mac 双布局切换，实时显示 event.key / code / keyCode，附坏键排查与按键事件日志",
      category: "开发调试",
      icon: Keyboard,
      color: "bg-violet-700",
    },
  },
  {
    path: "/tools/subnet-calculator",
    lazy: () => import("@/pages/tools/subnet-calculator"),
    meta: {
      title: "子网计算器",
      description:
        "输入 CIDR 即时计算子网掩码、通配符、可用主机数与网段范围，附二进制网络位视图、子网划分列表与 /0-/32 掩码速查表",
      category: "开发调试",
      icon: Network,
      color: "bg-sky-700",
    },
  },
  {
    path: "/tools/text-diff",
    lazy: () => import("@/pages/tools/text-diff"),
    meta: {
      title: "文本对比",
      description: "逐行或逐词对比两段文本的差异，支持并排与统一视图，可忽略空白与大小写",
      category: "文本与转换",
      icon: FileDiff,
      color: "bg-amber-500",
    },
  },
  {
    path: "/tools/text-processor",
    lazy: () => import("@/pages/tools/text-processor"),
    meta: {
      title: "文本处理工具",
      description: "编码转换、加密哈希、空格清理、YML/Properties 互转，附带文本统计",
      category: "文本与转换",
      icon: Type,
      color: "bg-indigo-500",
    },
  },
  {
    path: "/tools/html-markdown-converter",
    lazy: () => import("@/pages/tools/html-markdown-converter"),
    meta: {
      title: "HTML / Markdown 互转",
      description: "Markdown 与 HTML 双向实时转换，支持示例加载和结果复制",
      category: "文本与转换",
      icon: FileCode2,
      color: "bg-green-600",
    },
  },
  {
    path: "/tools/markdown-word-converter",
    lazy: () => import("@/pages/tools/markdown-word-converter"),
    meta: {
      title: "Markdown / Word互转",
      description: "Markdown 和 Word（.docx）双向互转，支持实时预览和导出",
      category: "文本与转换",
      icon: FileText,
      color: "bg-blue-500",
    },
  },
  {
    path: "/tools/markdown-pdf-converter",
    lazy: () => import("@/pages/tools/markdown-pdf-converter"),
    meta: {
      title: "Markdown / PDF 互转",
      description: "Markdown 与 PDF 双向转换，支持实时预览、PDF 导出与 PDF 文本提取",
      category: "文本与转换",
      icon: FileText,
      color: "bg-orange-600",
    },
  },
  {
    path: "/tools/html-extractor",
    lazy: () => import("@/pages/tools/html-extractor"),
    meta: {
      title: "HTML 提取",
      description: "从 HTML 中提取图片、链接、视频、音频、CSS、JS、Iframe、Meta 标签等资源",
      category: "文本与转换",
      icon: Code2,
      color: "bg-orange-500",
    },
  },
  {
    path: "/tools/css-gradient-generator",
    lazy: () => import("@/pages/tools/css-gradient-generator"),
    meta: {
      title: "CSS 渐变生成",
      description: "可视化生成线性/径向渐变，支持自定义角度、颜色控制点和预设方案",
      category: "文本与转换",
      icon: Palette,
      color: "bg-pink-500",
    },
  },
  {
    path: "/tools/base64-image",
    lazy: () => import("@/pages/tools/base64-image"),
    meta: {
      title: "Base64 图片转换",
      description: "Base64 字符串与图片互转，支持自动识别 MIME 类型和批量处理",
      category: "图像处理",
      icon: ImageIcon,
      color: "bg-teal-500",
    },
  },
  {
    path: "/tools/image-compressor",
    lazy: () => import("@/pages/tools/image-compressor"),
    meta: {
      title: "图片压缩",
      description: "批量压缩图片，调整质量、尺寸和格式，支持 JPG/PNG/WebP 输出",
      category: "图像处理",
      icon: ImageDown,
      color: "bg-purple-500",
    },
  },
  {
    path: "/tools/image-list-processor",
    lazy: () => import("@/pages/tools/image-list-processor"),
    meta: {
      title: "图片列表",
      description: "批量下载图片、生成下载脚本，支持 URL 去重和预览",
      category: "图像处理",
      icon: Images,
      color: "bg-sky-500",
    },
  },
  {
    path: "/tools/image-watermark",
    lazy: () => import("@/pages/tools/image-watermark"),
    meta: {
      title: "图片水印",
      description: "为图片添加文字或图片水印，支持位置、透明度、旋转等设置和批量处理",
      category: "图像处理",
      icon: Stamp,
      color: "bg-pink-500",
    },
  },
  {
    path: "/tools/image-editor",
    lazy: () => import("@/pages/tools/image-editor"),
    meta: {
      title: "图片编辑",
      description: "在线图片编辑器，支持亮度、对比度、饱和度、冷暖、HSL、锐化、虚化、裁剪、马赛克、文字、水印、旋转、镜像等调整",
      category: "图像处理",
      icon: ImageIcon,
      color: "bg-indigo-500",
    },
  },
  {
    path: "/tools/favicon-generator",
    lazy: () => import("@/pages/tools/favicon-generator"),
    meta: {
      title: "Favicon 生成",
      description: "上传图片裁剪并生成多种尺寸的 Favicon，支持 ICO/PNG/JPG 格式",
      category: "图像处理",
      icon: AppWindow,
      color: "bg-yellow-500",
    },
  },
  {
    path: "/tools/qr-code",
    lazy: () => import("@/pages/tools/qr-code"),
    meta: {
      title: "二维码工具",
      description: "生成和识别二维码，支持自定义颜色、样式、Logo 和批量生成",
      category: "图像处理",
      icon: QrCode,
      color: "bg-slate-700",
    },
  },
  {
    path: "/tools/color-picker",
    lazy: () => import("@/pages/tools/color-picker"),
    meta: {
      title: "颜色选择",
      description: "HEX / RGB / CMYK 互转、图片取色与颜色预览工具",
      category: "图像处理",
      icon: Palette,
      color: "bg-red-700",
    },
  },
  {
    path: "/tools/image-to-svg",
    lazy: () => import("@/pages/tools/image-to-svg"),
    meta: {
      title: "图片转 SVG",
      description: "将位图（PNG/JPG/GIF/BMP/WebP）转换为 SVG 矢量图形，支持多种预设和参数调节",
      category: "图像处理",
      icon: Spline,
      color: "bg-cyan-600",
    },
  },
  {
    path: "/tools/avatar-generator",
    lazy: () => import("@/pages/tools/avatar-generator"),
    meta: {
      title: "随机头像生成器",
      description: "基于 Seed 的程序化 SVG 肖像生成，手绘风格复古头像，支持 PNG/SVG 导出",
      category: "图像处理",
      icon: ContactRound,
      color: "bg-amber-600",
    },
  },
  {
    path: "/tools/live-photo",
    lazy: () => import("@/pages/tools/live-photo"),
    meta: {
      title: "Live Photo",
      description: "拆解或制作 Google Motion Photo / Android Live Photo",
      category: "视频与动图",
      icon: Images,
      color: "bg-green-700",
    },
  },
  {
    path: "/tools/gif-editor",
    lazy: () => import("@/pages/tools/gif-editor"),
    meta: {
      title: "GIF 编辑",
      description: "上传 GIF 解析帧序列，编辑延迟、删除帧、调整顺序后重新生成",
      category: "视频与动图",
      icon: Film,
      color: "bg-pink-500",
    },
  },
  {
    path: "/tools/image-to-gif",
    lazy: () => import("@/pages/tools/image-to-gif"),
    meta: {
      title: "图片转 GIF",
      description: "将多张图片合成为 GIF 动画，支持设置宽度、质量、循环次数和每帧延迟",
      category: "视频与动图",
      icon: ImagePlus,
      color: "bg-orange-500",
    },
  },
  {
    path: "/tools/video-image-converter",
    lazy: () => import("@/pages/tools/video-image-converter"),
    meta: {
      title: "视频图片互转",
      description: "视频提取帧为图片（PNG/JPEG/WebP），或将多张图片合成为 WebM 视频",
      category: "视频与动图",
      icon: Film,
      color: "bg-indigo-500",
    },
  },
  {
    path: "/tools/video-to-gif",
    lazy: () => import("@/pages/tools/video-to-gif"),
    meta: {
      title: "视频转 GIF",
      description: "从视频中截取片段生成 GIF，支持时间范围选择和文字叠加",
      category: "视频与动图",
      icon: Film,
      color: "bg-red-500",
    },
  },
  {
    path: "/tools/file-renamer",
    lazy: () => import("@/pages/tools/file-renamer"),
    meta: {
      title: "批量文件重命名",
      description: "序号、替换、大小写、插入、截取等多种重命名方式，支持生成重命名脚本",
      category: "文本与转换",
      icon: FileEdit,
      color: "bg-amber-500",
    },
  },
  {
    path: "/tools/wechat-chat",
    lazy: () => import("@/pages/tools/wechat-chat"),
    meta: {
      title: "微信聊天模拟",
      description: "在线制作微信聊天截图，支持自定义头像、昵称、消息内容、红包、时间等，实时预览并导出图片",
      category: "社交模拟",
      icon: MessageCircle,
      color: "bg-green-500",
    },
  },
  {
    path: "/tools/audio-studio",
    lazy: () => import("@/pages/tools/audio-studio"),
    meta: {
      title: "音频工作室",
      description: "在线音频工具，支持录音、上传、分贝分析、波形显示、格式转换（MP3/FLAC/OGG/WAV）及语音合成（TTS）",
      category: "音频工具",
      icon: AudioWaveform,
      color: "bg-purple-500",
    },
  },
  {
    path: "/tools/mortgage-calculator",
    lazy: () => import("@/pages/tools/mortgage-calculator"),
    meta: {
      title: "房贷计算器",
      description:
        "商业 / 公积金 / 组合贷款月供计算，支持等额本息与等额本金两种还款方式，附完整还款计划表与 CSV 导出",
      category: "生活工具",
      icon: Landmark,
      color: "bg-emerald-600",
    },
  },
  {
    path: "/tools/body-fat-calculator",
    lazy: () => import("@/pages/tools/body-fat-calculator"),
    meta: {
      title: "体脂率计算器",
      description:
        "通过 BMI 公式或围度测量法（美国海军法）估算体脂率，附脂肪量、瘦体重、腰臀比与 ACE 体脂分级对照",
      category: "生活工具",
      icon: Dumbbell,
      color: "bg-lime-600",
    },
  },
  {
    path: "/tools/income-tax-calculator",
    lazy: () => import("@/pages/tools/income-tax-calculator"),
    meta: {
      title: "个税计算器",
      description:
        "工资薪金按累计预扣法逐月测算个税与到手收入，支持年终奖单独计税、税率盲区预警与并入综合所得对比，附明细导出",
      category: "生活工具",
      icon: Percent,
      color: "bg-sky-600",
    },
  },
  {
    path: "/tools/compound-interest-calculator",
    lazy: () => import("@/pages/tools/compound-interest-calculator"),
    meta: {
      title: "复利计算器",
      description:
        "一次性投入与每月定投的复利测算，支持存款目标倒推每月需存金额，附增长曲线图与年度明细表",
      category: "生活工具",
      icon: PiggyBank,
      color: "bg-blue-700",
    },
  },
];

/** 从路由 meta 派生的工具分类列表（供侧边栏与首页使用） */
export const TOOL_CATEGORIES: ToolCategory[] = CATEGORY_ORDER.map((name) => ({
  name,
  tools: TOOL_ROUTES.filter((r) => r.meta.category === name).map((r) => ({
    title: r.meta.title,
    href: r.path,
    description: r.meta.description,
    icon: r.meta.icon,
    color: r.meta.color,
  })),
})).filter((cat) => cat.tools.length > 0);

/** 所有工具的扁平列表 */
export const ALL_TOOLS: Tool[] = TOOL_CATEGORIES.flatMap((c) => c.tools);
