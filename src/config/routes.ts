import { type RouteRecordRaw } from 'vue-router'

// ComingSoon component for tools under development
const ComingSoon = () => import('../components/ComingSoon.vue')

// Helper function to get the correct component based on development status
const getComponent = (toolComponent: () => Promise<unknown>, status: Status = Status.Active) => {
  if (status === Status.ComingSoon && import.meta.env.PROD) {
    return ComingSoon
  }
  return toolComponent
}

export enum Status {
  Active = 'active',
  ComingSoon = 'coming-soon',
}

// Lazy loaded components
const UniversalConverter = () => import('../tools/json/UniversalConverter.vue')
const HtmlExtractor = () => import('../tools/HtmlExtractor.vue')
const FileRenamer = () => import('../tools/FileRenamer.vue')
const FaviconGenerator = () => import('../tools/FaviconGenerator.vue')
const ImageCompressor = () => import('../tools/image/ImageCompressor.vue')
const ImageListProcessor = () => import('../tools/image/ImageListProcessor.vue')
const VideoToGifConverter = () => import('../tools/image/VideoToGifConverter.vue')
const ImageToGifConverter = () => import('../tools/image/ImageToGifConverter.vue')
const GifEditor = () => import('../tools/image/GifEditor.vue')
const BackgroundRemover = () => import('../tools/image/BackgroundRemover.vue')
const ImageWatermark = () => import('../tools/image/ImageWatermark.vue')
const VideoImageConverter = () => import('../tools/image/VideoImageConverter.vue')
const JsonMissingKeyFinder = () => import('../tools/json/JsonMissingKeyFinder.vue')
const JsonArraySlicer = () => import('../tools/json/JsonArraySlicer.vue')
const JsonPathExtractor = () => import('../tools/json/JsonPathExtractor.vue')
const JsonArrayDeduplicator = () => import('../tools/json/JsonArrayDeduplicator.vue')
const QrCodeTool = () => import('../tools/qrcode/QrCodeTool.vue')
const TextSteganography = () => import('../tools/TextSteganography.vue')
const ImageSteganography = () => import('../tools/ImageSteganography.vue')
const TextProcessor = () => import('../tools/TextProcessor.vue')
const ColorPickerTool = () => import('../tools/ColorPickerTool.vue')
const HeartCollage = () => import('../tools/image/HeartCollage.vue')
const WsTool = () => import('../tools/WsTool.vue')
const JwtTool = () => import('../tools/JwtTool.vue')
const TransformTools = () => import('../tools/TransformTools.vue')

// Lazy loaded PDF Viewer component
const PdfViewer = () => import('../tools/pdf/PdfViewer.vue')

// Tool routes configuration - this contains ONLY tool routes
export const routeConfig: RouteRecordRaw[] = [
  // JSON Tools Routes
  {
    path: 'json-tools',
    name: 'jsonTools',
    meta: {
      title: 'JSON Tools',
      icon: '📋',
      description: 'Comprehensive JSON processing and conversion utilities',
    },
    children: [
      {
        path: 'json-path-extractor',
        name: 'jsonPathExtractor',
        component: JsonPathExtractor,
        meta: {
          title: 'JSON Path Extractor',
          icon: '🛤️',
          status: Status.Active,
        },
      },
      {
        path: 'json-missing-key-finder',
        name: 'jsonMissingKeyFinder',
        component: JsonMissingKeyFinder,
        meta: {
          title: 'JSON Missing Key Finder',
          icon: '🔍',
          status: Status.Active,
        },
      },
      {
        path: 'json-array-slicer',
        name: 'jsonArraySlicer',
        component: JsonArraySlicer,
        meta: {
          title: 'JSON Array Slicer',
          icon: '📊',
          status: Status.Active,
        },
      },
      {
        path: 'json-array-deduplicator',
        name: 'jsonArrayDeduplicator',
        component: JsonArrayDeduplicator,
        meta: {
          title: 'JSON Array Deduplicator',
          icon: '🔄',
          status: Status.Active,
        },
      },
    ],
  },
  // Web Tools Routes
  {
    path: 'web-tools',
    name: 'webTools',
    meta: {
      title: 'Web Tools',
      icon: '🌐',
    },
    children: [
      {
        path: 'html-extractor',
        name: 'htmlExtractor',
        component: HtmlExtractor,
        meta: {
          title: 'HTML Content Extractor',
          icon: '🖼️',
          status: Status.Active,
        },
      },
      {
        path: 'ws-tool',
        name: 'wsTool',
        component: WsTool,
        meta: {
          title: 'WebSocket Tool',
          icon: '📡',
          status: Status.Active,
        },
      },
      {
        path: 'universal-converter',
        name: 'universalConverter',
        component: UniversalConverter,
        meta: {
          title: 'Universal Format Converter',
          icon: '🔄',
          status: Status.Active,
        },
      },
      {
        path: 'transform-tools',
        name: 'transformTools',
        component: TransformTools,
        meta: {
          title: 'Transform Tools',
          icon: '🔄',
          status: Status.Active,
        },
      },
    ],
  },
  // Image Tools Routes
  {
    path: 'image-tools',
    name: 'imageTools',
    meta: {
      title: 'Image Tools',
      icon: '🖼️',
    },
    children: [
      {
        path: 'image-list-processor',
        name: 'imageListProcessor',
        component: ImageListProcessor,
        meta: {
          title: 'Image List Processor',
          icon: '🖼️',
          status: Status.Active,
        },
      },
      {
        path: 'image-compressor',
        name: 'imageCompressor',
        component: ImageCompressor,
        meta: {
          title: 'Image Compressor',
          icon: '🗂',
          status: Status.Active,
        },
      },
      {
        path: 'background-remover',
        name: 'backgroundRemover',
        component: BackgroundRemover,
        meta: {
          title: 'Background Remover',
          icon: '✂️',
          status: Status.Active,
        },
      },
      {
        path: 'video-to-gif-converter',
        name: 'videoToGifConverter',
        component: VideoToGifConverter,
        meta: {
          title: 'Video to GIF Converter',
          icon: '🎬',
          status: Status.Active,
        },
      },
      {
        path: 'image-to-gif-converter',
        name: 'imageToGifConverter',
        component: ImageToGifConverter,
        meta: {
          title: 'Image to GIF Converter',
          icon: '🖼️',
          status: Status.Active,
        },
      },
      {
        path: 'gif-editor',
        name: 'gifEditor',
        component: GifEditor,
        meta: {
          title: 'GIF Editor',
          icon: '🎞️',
          status: Status.Active,
        },
      },
      {
        path: 'svg-editor',
        name: 'svgEditor',
        component: () => import('../tools/image/SvgEditor.vue'),
        meta: {
          title: 'SVG Editor',
          icon: '🎨',
          status: Status.Active,
        },
      },
      {
        path: 'image-watermark',
        name: 'imageWatermark',
        component: ImageWatermark,
        meta: {
          title: 'Image Watermark',
          icon: '✂️',
          status: Status.Active,
        },
      },
      {
        path: 'heart-collage',
        name: 'heartCollage',
        component: () => getComponent(HeartCollage, Status.ComingSoon),
        meta: {
          title: 'Heart Collage',
          icon: '❤️',
          status: Status.ComingSoon,
        },
      },
      {
        path: 'video-image-converter',
        name: 'videoImageConverter',
        component: VideoImageConverter,
        meta: {
          title: 'Video/Image Converter',
          icon: '🎥',
          status: Status.Active,
        },
      },
      {
        path: 'color-picker',
        name: 'colorPicker',
        component: ColorPickerTool,
        meta: {
          title: 'Color Picker',
          icon: '🎨',
          status: Status.Active,
        },
      },
    ],
  },
  // Converters Routes
  {
    path: 'converters',
    name: 'converters',
    meta: {
      title: 'Converters',
      icon: '🔄',
    },
    children: [
      {
        path: 'file-renamer',
        name: 'fileRenamer',
        component: FileRenamer,
        meta: {
          title: 'File Renamer',
          icon: '📝',
          status: Status.Active,
        },
      },
      {
        path: 'text-processor',
        name: 'textProcessor',
        component: TextProcessor,
        meta: {
          title: 'Text Processor',
          icon: '📝',
          status: Status.Active,
        },
      },
    ],
  },
  // Generators Routes
  {
    path: 'generators',
    name: 'generators',
    meta: {
      title: 'Generators',
      icon: '⚡',
    },
    children: [
      {
        path: 'favicon-generator',
        name: 'faviconGenerator',
        component: FaviconGenerator,
        meta: {
          title: 'Favicon Generator',
          icon: '🎯',
          status: Status.Active,
        },
      },
      {
        path: 'qr-generator',
        name: 'qrCodeTool',
        component: QrCodeTool,
        meta: {
          title: 'QR Code Tool',
          icon: '📱',
          status: Status.Active,
        },
      },
    ],
  },
  // Data Tools Routes (empty for now)
  {
    path: 'data-tools',
    name: 'dataTools',
    meta: {
      title: 'Data Tools',
      icon: '📊',
    },
    children: [
      {
        path: 'jwt-tool',
        name: 'jwtTool',
        component: JwtTool,
        meta: {
          title: 'JWT Tool',
          icon: '🔐',
          status: Status.Active,
        },
      },
      {
        path: 'text-steganography',
        name: 'textSteganography',
        component: TextSteganography,
        meta: {
          title: 'Text Steganography',
          icon: '🔒',
          status: Status.Active,
        },
      },
      {
        path: 'image-steganography',
        name: 'imageSteganography',
        component: getComponent(ImageSteganography, Status.ComingSoon),
        meta: {
          title: 'Image Steganography',
          icon: '🖼️',
          status: Status.ComingSoon,
        },
      },
      {
        path: 'pdf-viewer',
        name: 'pdfViewer',
        component: PdfViewer,
        meta: {
          title: 'PDF Viewer',
          icon: '📄',
          status: Status.Active,
        },
      },
    ],
  },
]

// Generate menu configuration from routeConfig
export const menuConfig = routeConfig.map((item) => ({
  id: item.name,
  name: item.meta?.title,
  icon: item.meta?.icon || '📦',
  description: item.meta?.description,
  children:
    item.children?.map((tool) => ({
      id: tool.name,
      name: tool.meta?.title,
      icon: tool.meta?.icon || '🔧',
      path: `/${item.path}/${tool.path}`,
      status: tool.meta?.status,
    })) || [],
}))
