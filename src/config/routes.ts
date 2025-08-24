import { type RouteRecordRaw } from 'vue-router'

// Lazy loaded components
const UniversalConverter = () => import('../tools/json/UniversalConverter.vue')
const HtmlExtractor = () => import('../tools/HtmlExtractor.vue')
const FileRenamer = () => import('../tools/FileRenamer.vue')
const FaviconGenerator = () => import('../tools/FaviconGenerator.vue')
const ImageCompressor = () => import('../tools/image/ImageCompressor.vue')
const ImageListProcessor = () => import('../tools/image/ImageListProcessor.vue')
const VideoToGifConverter = () => import('../tools/image/VideoToGifConverter.vue')
const BackgroundRemover = () => import('../tools/image/BackgroundRemover.vue')
const ImageWatermark = () => import('../tools/image/ImageWatermark.vue')
const JsonToExcel = () => import('../tools/json/JsonToExcel.vue')
const ExcelToJson = () => import('../tools/json/ExcelToJson.vue')
const JsonFormatter = () => import('../tools/json/JsonFormatter.vue')
const JsonExtractor = () => import('../tools/json/JsonExtractor.vue')
const ExcelTextToJson = () => import('../tools/json/ExcelTextToJson.vue')
const JsonMerge = () => import('../tools/json/JsonMerge.vue')
const GetToJson = () => import('../tools/json/GetToJson.vue')
const CookieToJson = () => import('../tools/json/CookieToJson.vue')
const ListToJson = () => import('../tools/json/ListToJson.vue')
const JsonKeysExtractor = () => import('../tools/json/JsonKeysExtractor.vue')
const HeaderToJson = () => import('../tools/json/HeaderToJson.vue')
const JsonSplitter = () => import('../tools/json/JsonSplitter.vue')
const JsonToList = () => import('../tools/json/JsonToList.vue')
const JsonToGet = () => import('../tools/json/JsonToGet.vue')

const JsonMinifier = () => import('../tools/json/JsonMinifier.vue')
const JsonUnicodeFixer = () => import('../tools/json/JsonUnicodeFixer.vue')
const JsonNumberToText = () => import('../tools/json/JsonNumberToText.vue')
const JsonArrayToLines = () => import('../tools/json/JsonArrayToLines.vue')
const JsonArrayExtractor = () => import('../tools/json/JsonArrayExtractor.vue')
const JsonLinesToArray = () => import('../tools/json/JsonLinesToArray.vue')
const JsonFieldRemover = () => import('../tools/json/JsonFieldRemover.vue')
const JsonArrayShuffler = () => import('../tools/json/JsonArrayShuffler.vue')
const JsonUnicodeEncoder = () => import('../tools/json/JsonUnicodeEncoder.vue')
const JsonToCookie = () => import('../tools/json/JsonToCookie.vue')
const JsonFieldAdder = () => import('../tools/json/JsonFieldAdder.vue')
const JsonTextToNumber = () => import('../tools/json/JsonTextToNumber.vue')
const JsonValueResetter = () => import('../tools/json/JsonValueResetter.vue')
const JsonMissingKeyFinder = () => import('../tools/json/JsonMissingKeyFinder.vue')
const JsonObjectSlicer = () => import('../tools/json/JsonObjectSlicer.vue')
const JsonArraySlicer = () => import('../tools/json/JsonArraySlicer.vue')
const JsonObjectKeyExtractor = () => import('../tools/json/JsonObjectKeyExtractor.vue')
const JsonObjectValueExtractor = () => import('../tools/json/JsonObjectValueExtractor.vue')
const JsonKeyValueExtractor = () => import('../tools/json/JsonKeyValueExtractor.vue')
const CsvToJson = () => import('../tools/json/CsvToJson.vue')
const ListToJsonObject = () => import('../tools/json/ListToJsonObject.vue')
const JsonCaseConverter = () => import('../tools/json/JsonCaseConverter.vue')
const JsonPathExtractor = () => import('../tools/json/JsonPathExtractor.vue')
const JsonTextParser = () => import('../tools/json/JsonTextParser.vue')
const JsonArrayDeduplicator = () => import('../tools/json/JsonArrayDeduplicator.vue')
const JsonLineSplitter = () => import('../tools/json/JsonLineSplitter.vue')
const JsonFieldReplacer = () => import('../tools/json/JsonFieldReplacer.vue')
const JsToJson = () => import('../tools/json/JsToJson.vue')
const JsonTextFormatter = () => import('../tools/json/JsonTextFormatter.vue')
const JsonFieldMapper = () => import('../tools/json/JsonFieldMapper.vue')
const JsonFieldSearcher = () => import('../tools/json/JsonFieldSearcher.vue')
const ListDeduplicator = () => import('../tools/json/ListDeduplicator.vue')
const JsonDuplicateDetector = () => import('../tools/json/JsonDuplicateDetector.vue')
const QrCodeTool = () => import('../tools/qrcode/QrCodeTool.vue')

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
        path: 'json-to-excel',
        name: 'jsonToExcel',
        component: JsonToExcel,
        meta: {
          title: 'JSON to Excel Converter',
          icon: '📊',
          status: 'active',
        },
      },
      {
        path: 'excel-to-json',
        name: 'excelToJson',
        component: ExcelToJson,
        meta: {
          title: 'Excel to JSON Converter',
          icon: '📈',
          status: 'active',
        },
      },
      {
        path: 'json-formatter',
        name: 'jsonFormatter',
        component: JsonFormatter,
        meta: {
          title: 'JSON Formatter',
          icon: '🎨',
          status: 'active',
        },
      },
      {
        path: 'json-extractor',
        name: 'jsonExtractor',
        component: JsonExtractor,
        meta: {
          title: 'JSON Field Extractor',
          icon: '🔍',
          status: 'active',
        },
      },
      {
        path: 'excel-text-to-json',
        name: 'excelTextToJson',
        component: ExcelTextToJson,
        meta: {
          title: 'Excel Text to JSON',
          icon: '📋',
          status: 'active',
        },
      },
      {
        path: 'json-merge',
        name: 'jsonMerge',
        component: JsonMerge,
        meta: {
          title: 'JSON File Merger',
          icon: '🔗',
          status: 'active',
        },
      },
      {
        path: 'get-to-json',
        name: 'getToJson',
        component: GetToJson,
        meta: {
          title: 'GET Parameters to JSON',
          icon: '🌐',
          status: 'active',
        },
      },
      {
        path: 'cookie-to-json',
        name: 'cookieToJson',
        component: CookieToJson,
        meta: {
          title: 'Cookie to JSON',
          icon: '🍪',
          status: 'active',
        },
      },
      {
        path: 'list-to-json',
        name: 'listToJson',
        component: ListToJson,
        meta: {
          title: 'Text List to JSON',
          icon: '📝',
          status: 'active',
        },
      },
      {
        path: 'json-keys-extractor',
        name: 'jsonKeysExtractor',
        component: JsonKeysExtractor,
        meta: {
          title: 'JSON Keys Extractor',
          icon: '🔑',
          status: 'active',
        },
      },
      {
        path: 'header-to-json',
        name: 'headerToJson',
        component: HeaderToJson,
        meta: {
          title: 'HTTP Headers to JSON',
          icon: '📡',
          status: 'active',
        },
      },
      {
        path: 'json-splitter',
        name: 'jsonSplitter',
        component: JsonSplitter,
        meta: {
          title: 'JSON File Splitter',
          icon: '✂️',
          status: 'active',
        },
      },
      {
        path: 'json-to-list',
        name: 'jsonToList',
        component: JsonToList,
        meta: {
          title: 'JSON Array to Text List',
          icon: '📋',
          status: 'active',
        },
      },
      {
        path: 'json-to-get',
        name: 'jsonToGet',
        component: JsonToGet,
        meta: {
          title: 'JSON to GET Parameters',
          icon: '🔗',
          status: 'active',
        },
      },

      {
        path: 'json-minifier',
        name: 'jsonMinifier',
        component: JsonMinifier,
        meta: {
          title: 'JSON Minifier',
          icon: '📦',
          status: 'active',
        },
      },
      {
        path: 'json-unicode-fixer',
        name: 'jsonUnicodeFixer',
        component: JsonUnicodeFixer,
        meta: {
          title: 'JSON Unicode Fixer',
          icon: '🛠️',
          status: 'active',
        },
      },
      {
        path: 'json-number-to-text',
        name: 'jsonNumberToText',
        component: JsonNumberToText,
        meta: {
          title: 'JSON Number to Text',
          icon: '🔢',
          status: 'active',
        },
      },
      {
        path: 'json-array-to-lines',
        name: 'jsonArrayToLines',
        component: JsonArrayToLines,
        meta: {
          title: 'JSON Array to Lines',
          icon: '📄',
          status: 'active',
        },
      },
      {
        path: 'json-array-extractor',
        name: 'jsonArrayExtractor',
        component: JsonArrayExtractor,
        meta: {
          title: 'JSON Array Extractor',
          icon: '🔍',
          status: 'active',
        },
      },
      {
        path: 'json-lines-to-array',
        name: 'jsonLinesToArray',
        component: JsonLinesToArray,
        meta: {
          title: 'JSON Lines to Array',
          icon: '📊',
          status: 'active',
        },
      },
      {
        path: 'json-field-remover',
        name: 'jsonFieldRemover',
        component: JsonFieldRemover,
        meta: {
          title: 'JSON Field Remover',
          icon: '🗑️',
          status: 'active',
        },
      },
      {
        path: 'json-array-shuffler',
        name: 'jsonArrayShuffler',
        component: JsonArrayShuffler,
        meta: {
          title: 'JSON Array Shuffler',
          icon: '🎲',
          status: 'active',
        },
      },
      {
        path: 'json-unicode-encoder',
        name: 'jsonUnicodeEncoder',
        component: JsonUnicodeEncoder,
        meta: {
          title: 'JSON Unicode Encoder',
          icon: '🔒',
          status: 'active',
        },
      },
      {
        path: 'json-to-cookie',
        name: 'jsonToCookie',
        component: JsonToCookie,
        meta: {
          title: 'JSON to Cookie',
          icon: '🍪',
          status: 'active',
        },
      },
      {
        path: 'json-field-adder',
        name: 'jsonFieldAdder',
        component: JsonFieldAdder,
        meta: {
          title: 'JSON Field Adder',
          icon: '➕',
          status: 'active',
        },
      },
      {
        path: 'json-text-to-number',
        name: 'jsonTextToNumber',
        component: JsonTextToNumber,
        meta: {
          title: 'JSON Text to Number',
          icon: '🔢',
          status: 'active',
        },
      },
      {
        path: 'json-value-resetter',
        name: 'jsonValueResetter',
        component: JsonValueResetter,
        meta: {
          title: 'JSON Value Resetter',
          icon: '🔄',
          status: 'active',
        },
      },
      {
        path: 'json-missing-key-finder',
        name: 'jsonMissingKeyFinder',
        component: JsonMissingKeyFinder,
        meta: {
          title: 'JSON Missing Key Finder',
          icon: '🔍',
          status: 'active',
        },
      },
      {
        path: 'json-object-slicer',
        name: 'jsonObjectSlicer',
        component: JsonObjectSlicer,
        meta: {
          title: 'JSON Object Slicer',
          icon: '✂️',
          status: 'active',
        },
      },
      {
        path: 'json-array-slicer',
        name: 'jsonArraySlicer',
        component: JsonArraySlicer,
        meta: {
          title: 'JSON Array Slicer',
          icon: '📊',
          status: 'active',
        },
      },
      {
        path: 'json-object-key-extractor',
        name: 'jsonObjectKeyExtractor',
        component: JsonObjectKeyExtractor,
        meta: {
          title: 'JSON Object Key Extractor',
          icon: '🔑',
          status: 'active',
        },
      },
      {
        path: 'json-object-value-extractor',
        name: 'jsonObjectValueExtractor',
        component: JsonObjectValueExtractor,
        meta: {
          title: 'JSON Object Value Extractor',
          icon: '💎',
          status: 'active',
        },
      },
      {
        path: 'json-key-value-extractor',
        name: 'jsonKeyValueExtractor',
        component: JsonKeyValueExtractor,
        meta: {
          title: 'JSON Key-Value Extractor',
          icon: '🔍',
          status: 'active',
        },
      },
      {
        path: 'csv-to-json',
        name: 'csv-to-json',
        component: CsvToJson,
        meta: {
          title: 'CSV to JSON Converter',
          icon: '📄',
          status: 'active',
        },
      },
      {
        path: 'list-to-json-object',
        name: 'list-to-json-object',
        component: ListToJsonObject,
        meta: {
          title: 'List to JSON Object',
          icon: '📋',
          status: 'active',
        },
      },
      {
        path: 'json-case-converter',
        name: 'json-case-converter',
        component: JsonCaseConverter,
        meta: {
          title: 'JSON Case Converter',
          icon: '🔤',
          status: 'active',
        },
      },
      {
        path: 'json-path-extractor',
        name: 'json-path-extractor',
        component: JsonPathExtractor,
        meta: {
          title: 'JSON Path Extractor',
          icon: '🛤️',
          status: 'active',
        },
      },
      {
        path: 'json-text-parser',
        name: 'json-text-parser',
        component: JsonTextParser,
        meta: {
          title: 'JSON Text Parser',
          icon: '🔍',
          status: 'active',
        },
      },
      {
        path: 'json-array-deduplicator',
        name: 'json-array-deduplicator',
        component: JsonArrayDeduplicator,
        meta: {
          title: 'JSON Array Deduplicator',
          icon: '🔄',
          status: 'active',
        },
      },
      {
        path: 'json-line-splitter',
        name: 'json-line-splitter',
        component: JsonLineSplitter,
        meta: {
          title: 'JSON Line Splitter',
          icon: '📄',
          status: 'active',
        },
      },
      {
        path: 'json-field-replacer',
        name: 'json-field-replacer',
        component: JsonFieldReplacer,
        meta: {
          title: 'JSON Field Replacer',
          icon: '🔄',
          status: 'active',
        },
      },
      {
        path: 'js-to-json',
        name: 'js-to-json',
        component: JsToJson,
        meta: {
          title: 'JavaScript to JSON',
          icon: '⚡',
          status: 'active',
        },
      },
      {
        path: 'json-text-formatter',
        name: 'json-text-formatter',
        component: JsonTextFormatter,
        meta: {
          title: 'JSON Text Formatter',
          icon: '🎨',
          status: 'active',
        },
      },
      {
        path: 'json-field-mapper',
        name: 'json-field-mapper',
        component: JsonFieldMapper,
        meta: {
          title: 'JSON Field Mapper',
          icon: '🗺️',
          status: 'active',
        },
      },
      {
        path: 'json-field-searcher',
        name: 'json-field-searcher',
        component: JsonFieldSearcher,
        meta: {
          title: 'JSON Field Searcher',
          icon: '🔍',
          status: 'active',
        },
      },
      {
        path: 'list-deduplicator',
        name: 'list-deduplicator',
        component: ListDeduplicator,
        meta: {
          title: 'List Deduplicator',
          icon: '📋',
          status: 'active',
        },
      },
      {
        path: 'json-duplicate-detector',
        name: 'json-duplicate-detector',
        component: JsonDuplicateDetector,
        meta: {
          title: 'JSON Duplicate Detector',
          icon: '🔍',
          status: 'active',
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
          status: 'active',
        },
      },
      {
        path: 'universal-converter',
        name: 'universalConverter',
        component: UniversalConverter,
        meta: {
          title: 'Universal Format Converter',
          icon: '🔄',
          status: 'active',
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
          status: 'active',
        },
      },
      {
        path: 'image-compressor',
        name: 'imageCompressor',
        component: ImageCompressor,
        meta: {
          title: 'Image Compressor',
          icon: '🗂',
          status: 'active',
        },
      },
      {
        path: 'background-remover',
        name: 'backgroundRemover',
        component: BackgroundRemover,
        meta: {
          title: 'Background Remover',
          icon: '✂️',
          status: 'active',
        },
      },
      {
        path: 'video-to-gif-converter',
        name: 'videoToGifConverter',
        component: VideoToGifConverter,
        meta: {
          title: 'Video to GIF Converter',
          icon: '🎬',
          status: 'active',
        },
      },
      {
        path: 'image-watermark',
        name: 'imageWatermark',
        component: ImageWatermark,
        meta: {
          title: 'Image Watermark',
          icon: '✂️',
          status: 'active',
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
          status: 'active',
        },
      },
      {
        path: 'url-encoder',
        name: 'url-encoder',
        component: () => import('../tools/ComingSoon.vue'),
        meta: {
          title: 'URL Encoder',
          icon: '🔗',
          status: 'coming-soon',
        },
      },
      {
        path: 'base64-converter',
        name: 'base64-converter',
        component: () => import('../tools/ComingSoon.vue'),
        meta: {
          title: 'Base64 Converter',
          icon: '🔄',
          status: 'coming-soon',
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
          status: 'active',
        },
      },
      {
        path: 'color-picker',
        name: 'color-picker',
        component: () => import('../tools/ComingSoon.vue'),
        meta: {
          title: 'Color Picker',
          icon: '🎨',
          status: 'coming-soon',
        },
      },
      {
        path: 'qr-generator',
        name: 'qr-generator',
        component: QrCodeTool,
        meta: {
          title: 'QR Code Tool',
          icon: '📱',
          status: 'active',
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
    children: [],
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
