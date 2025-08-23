import { createRouter, createWebHistory } from 'vue-router'
import ComingSoon from '../tools/ComingSoon.vue'
import HomePage from '../views/Home.vue'
import HomePageContent from '../views/HomePage.vue'
import NotFound from '../views/NotFound.vue'

// JSON Tools imports (placeholder for now, will be created later)
const HtmlExtractor = () => import('../tools/HtmlExtractor.vue')
const FileRenamer = () => import('../tools/FileRenamer.vue')
const FaviconGenerator = () => import('../tools/FaviconGenerator.vue')
const ApngGenerator = () => import('../tools/image/ApngGenerator.vue')
const ImageCompressor = () => import('../tools/image/ImageCompressor.vue')
const ImageListProcessor = () => import('../tools/image/ImageListProcessor.vue')
const VideoToGifConverter = () => import('../tools/image/VideoToGifConverter.vue')
const BackgroundRemover = () => import('../tools/image/BackgroundRemover.vue')
const JsonToExcel = () => import('../tools/json/JsonToExcel.vue')
const ExcelToJson = () => import('../tools/json/ExcelToJson.vue')
const JsonToCsv = () => import('../tools/json/JsonToCsv.vue')
const JsonFormatter = () => import('../tools/json/JsonFormatter.vue')
const JsonExtractor = () => import('../tools/json/JsonExtractor.vue')
const ExcelTextToJson = () => import('../tools/json/ExcelTextToJson.vue')
const JsonMerge = () => import('../tools/json/JsonMerge.vue')
const GetToJson = () => import('../tools/json/GetToJson.vue')
const CookieToJson = () => import('../tools/json/CookieToJson.vue')
const ListToJson = () => import('../tools/json/ListToJson.vue')
const JsonKeysExtractor = () => import('../tools/json/JsonKeysExtractor.vue')
const HeaderToJson = () => import('../tools/json/HeaderToJson.vue')
const JsonToSql = () => import('../tools/json/JsonToSql.vue')
const JsonSplitter = () => import('../tools/json/JsonSplitter.vue')
const JsonToList = () => import('../tools/json/JsonToList.vue')
const JsonToGet = () => import('../tools/json/JsonToGet.vue')
const JsonFieldValueExtractor = () => import('../tools/json/JsonFieldValueExtractor.vue')
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: HomePage,
      children: [
        {
          path: '',
          name: 'homepage',
          component: HomePageContent,
        },
        // JSON Tools Routes
        {
          path: 'json-tools/json-to-excel',
          name: 'json-to-excel',
          component: JsonToExcel,
          meta: {
            category: 'json-tools',
            title: 'JSON to Excel Converter',
          },
        },
        {
          path: 'json-tools/excel-to-json',
          name: 'excel-to-json',
          component: ExcelToJson,
          meta: {
            category: 'json-tools',
            title: 'Excel to JSON Converter',
          },
        },
        {
          path: 'json-tools/json-to-csv',
          name: 'json-to-csv',
          component: JsonToCsv,
          meta: {
            category: 'json-tools',
            title: 'JSON to CSV Converter',
          },
        },
        {
          path: 'json-tools/json-formatter',
          name: 'json-formatter',
          component: JsonFormatter,
          meta: {
            category: 'json-tools',
            title: 'JSON Formatter',
          },
        },
        {
          path: 'json-tools/json-extractor',
          name: 'json-extractor',
          component: JsonExtractor,
          meta: {
            category: 'json-tools',
            title: 'JSON Field Extractor',
          },
        },
        {
          path: 'json-tools/excel-text-to-json',
          name: 'excel-text-to-json',
          component: ExcelTextToJson,
          meta: {
            category: 'json-tools',
            title: 'Excel Text to JSON',
          },
        },
        {
          path: 'json-tools/json-merge',
          name: 'json-merge',
          component: JsonMerge,
          meta: {
            category: 'json-tools',
            title: 'JSON File Merger',
          },
        },
        {
          path: 'json-tools/get-to-json',
          name: 'get-to-json',
          component: GetToJson,
          meta: {
            category: 'json-tools',
            title: 'GET Parameters to JSON',
          },
        },
        {
          path: 'json-tools/cookie-to-json',
          name: 'cookie-to-json',
          component: CookieToJson,
          meta: {
            category: 'json-tools',
            title: 'Cookie to JSON',
          },
        },
        {
          path: 'json-tools/list-to-json',
          name: 'list-to-json',
          component: ListToJson,
          meta: {
            category: 'json-tools',
            title: 'Text List to JSON',
          },
        },
        {
          path: 'json-tools/json-keys-extractor',
          name: 'json-keys-extractor',
          component: JsonKeysExtractor,
          meta: {
            category: 'json-tools',
            title: 'JSON Keys Extractor',
          },
        },
        {
          path: 'json-tools/header-to-json',
          name: 'header-to-json',
          component: HeaderToJson,
          meta: {
            category: 'json-tools',
            title: 'HTTP Headers to JSON',
          },
        },
        {
          path: 'json-tools/json-to-sql',
          name: 'json-to-sql',
          component: JsonToSql,
          meta: {
            category: 'json-tools',
            title: 'JSON to SQL Converter',
          },
        },
        {
          path: 'json-tools/json-splitter',
          name: 'json-splitter',
          component: JsonSplitter,
          meta: {
            category: 'json-tools',
            title: 'JSON File Splitter',
          },
        },
        {
          path: 'json-tools/json-to-list',
          name: 'json-to-list',
          component: JsonToList,
          meta: {
            category: 'json-tools',
            title: 'JSON Array to Text List',
          },
        },
        {
          path: 'json-tools/json-to-get',
          name: 'json-to-get',
          component: JsonToGet,
          meta: {
            category: 'json-tools',
            title: 'JSON to GET Parameters',
          },
        },
        {
          path: 'json-tools/json-field-value-extractor',
          name: 'json-field-value-extractor',
          component: JsonFieldValueExtractor,
          meta: {
            category: 'json-tools',
            title: 'JSON Field Value Extractor',
          },
        },
        {
          path: 'json-tools/json-minifier',
          name: 'json-minifier',
          component: JsonMinifier,
          meta: {
            category: 'json-tools',
            title: 'JSON Minifier',
          },
        },
        {
          path: 'json-tools/json-unicode-fixer',
          name: 'json-unicode-fixer',
          component: JsonUnicodeFixer,
          meta: {
            category: 'json-tools',
            title: 'JSON Unicode Fixer',
          },
        },
        {
          path: 'json-tools/json-number-to-text',
          name: 'json-number-to-text',
          component: JsonNumberToText,
          meta: {
            category: 'json-tools',
            title: 'JSON Number to Text',
          },
        },
        {
          path: 'json-tools/json-array-to-lines',
          name: 'json-array-to-lines',
          component: JsonArrayToLines,
          meta: {
            category: 'json-tools',
            title: 'JSON Array to Lines',
          },
        },
        {
          path: 'json-tools/json-array-extractor',
          name: 'json-array-extractor',
          component: JsonArrayExtractor,
          meta: {
            category: 'json-tools',
            title: 'JSON Array Extractor',
          },
        },
        {
          path: 'json-tools/json-lines-to-array',
          name: 'json-lines-to-array',
          component: JsonLinesToArray,
          meta: {
            category: 'json-tools',
            title: 'JSON Lines to Array',
          },
        },
        {
          path: 'json-tools/json-field-remover',
          name: 'json-field-remover',
          component: JsonFieldRemover,
          meta: {
            category: 'json-tools',
            title: 'JSON Field Remover',
          },
        },
        {
          path: 'json-tools/json-array-shuffler',
          name: 'json-array-shuffler',
          component: JsonArrayShuffler,
          meta: {
            category: 'json-tools',
            title: 'JSON Array Shuffler',
          },
        },
        {
          path: 'json-tools/json-unicode-encoder',
          name: 'json-unicode-encoder',
          component: JsonUnicodeEncoder,
          meta: {
            category: 'json-tools',
            title: 'JSON Unicode Encoder',
          },
        },
        {
          path: 'json-tools/json-to-cookie',
          name: 'json-to-cookie',
          component: JsonToCookie,
          meta: {
            category: 'json-tools',
            title: 'JSON to Cookie',
          },
        },
        {
          path: 'json-tools/json-field-adder',
          name: 'json-field-adder',
          component: JsonFieldAdder,
          meta: {
            category: 'json-tools',
            title: 'JSON Field Adder',
          },
        },
        {
          path: 'json-tools/json-text-to-number',
          name: 'json-text-to-number',
          component: JsonTextToNumber,
          meta: {
            category: 'json-tools',
            title: 'JSON Text to Number',
          },
        },
        {
          path: 'json-tools/json-value-resetter',
          name: 'json-value-resetter',
          component: JsonValueResetter,
          meta: {
            category: 'json-tools',
            title: 'JSON Value Resetter',
          },
        },
        {
          path: 'json-tools/json-missing-key-finder',
          name: 'json-missing-key-finder',
          component: JsonMissingKeyFinder,
          meta: {
            category: 'json-tools',
            title: 'JSON Missing Key Finder',
          },
        },
        {
          path: 'json-tools/json-object-slicer',
          name: 'json-object-slicer',
          component: JsonObjectSlicer,
          meta: {
            category: 'json-tools',
            title: 'JSON Object Slicer',
          },
        },
        {
          path: 'json-tools/json-array-slicer',
          name: 'json-array-slicer',
          component: JsonArraySlicer,
          meta: {
            category: 'json-tools',
            title: 'JSON Array Slicer',
          },
        },
        {
          path: 'json-tools/json-object-key-extractor',
          name: 'json-object-key-extractor',
          component: JsonObjectKeyExtractor,
          meta: {
            category: 'json-tools',
            title: 'JSON Object Key Extractor',
          },
        },
        {
          path: 'json-tools/json-object-value-extractor',
          name: 'json-object-value-extractor',
          component: JsonObjectValueExtractor,
          meta: {
            category: 'json-tools',
            title: 'JSON Object Value Extractor',
          },
        },
        {
          path: 'json-tools/json-key-value-extractor',
          name: 'json-key-value-extractor',
          component: JsonKeyValueExtractor,
          meta: {
            category: 'json-tools',
            title: 'JSON Key-Value Extractor',
          },
        },
        {
          path: 'json-tools/csv-to-json',
          name: 'csv-to-json',
          component: CsvToJson,
          meta: {
            category: 'json-tools',
            title: 'CSV to JSON Converter',
          },
        },
        {
          path: 'json-tools/list-to-json-object',
          name: 'list-to-json-object',
          component: ListToJsonObject,
          meta: {
            category: 'json-tools',
            title: 'List to JSON Object',
          },
        },
        {
          path: 'json-tools/json-case-converter',
          name: 'json-case-converter',
          component: JsonCaseConverter,
          meta: {
            category: 'json-tools',
            title: 'JSON Case Converter',
          },
        },
        {
          path: 'json-tools/json-path-extractor',
          name: 'json-path-extractor',
          component: JsonPathExtractor,
          meta: {
            category: 'json-tools',
            title: 'JSON Path Extractor',
          },
        },
        {
          path: 'json-tools/json-text-parser',
          name: 'json-text-parser',
          component: JsonTextParser,
          meta: {
            category: 'json-tools',
            title: 'JSON Text Parser',
          },
        },
        {
          path: 'json-tools/json-array-deduplicator',
          name: 'json-array-deduplicator',
          component: JsonArrayDeduplicator,
          meta: {
            category: 'json-tools',
            title: 'JSON Array Deduplicator',
          },
        },
        {
          path: 'json-tools/json-line-splitter',
          name: 'json-line-splitter',
          component: JsonLineSplitter,
          meta: {
            category: 'json-tools',
            title: 'JSON Line Splitter',
          },
        },
        {
          path: 'json-tools/json-field-replacer',
          name: 'json-field-replacer',
          component: JsonFieldReplacer,
          meta: {
            category: 'json-tools',
            title: 'JSON Field Replacer',
          },
        },
        {
          path: 'json-tools/js-to-json',
          name: 'js-to-json',
          component: JsToJson,
          meta: {
            category: 'json-tools',
            title: 'JavaScript to JSON',
          },
        },
        {
          path: 'json-tools/json-text-formatter',
          name: 'json-text-formatter',
          component: JsonTextFormatter,
          meta: {
            category: 'json-tools',
            title: 'JSON Text Formatter',
          },
        },
        {
          path: 'json-tools/json-field-mapper',
          name: 'json-field-mapper',
          component: JsonFieldMapper,
          meta: {
            category: 'json-tools',
            title: 'JSON Field Mapper',
          },
        },
        {
          path: 'json-tools/json-field-searcher',
          name: 'json-field-searcher',
          component: JsonFieldSearcher,
          meta: {
            category: 'json-tools',
            title: 'JSON Field Searcher',
          },
        },
        {
          path: 'json-tools/list-deduplicator',
          name: 'list-deduplicator',
          component: ListDeduplicator,
          meta: {
            category: 'json-tools',
            title: 'List Deduplicator',
          },
        },
        {
          path: 'json-tools/json-duplicate-detector',
          name: 'json-duplicate-detector',
          component: JsonDuplicateDetector,
          meta: {
            category: 'json-tools',
            title: 'JSON Duplicate Detector',
          },
        },
        // Web Tools Routes
        {
          path: 'web-tools/html-extractor',
          name: 'html-extractor',
          component: HtmlExtractor,
          meta: {
            category: 'web-tools',
            title: 'HTML Content Extractor',
          },
        },
        {
          path: 'image-tools/image-list-processor',
          name: 'image-list-processor',
          component: ImageListProcessor,
          meta: {
            category: 'image-tools',
            title: 'Image List Processor',
          },
        },
        {
          path: 'image-tools/image-compressor',
          name: 'image-compressor',
          component: ImageCompressor,
          meta: {
            category: 'image-tools',
            title: 'Image Compressor',
          },
        },
        {
          path: 'image-tools/background-remover',
          name: 'background-remover',
          component: BackgroundRemover,
          meta: {
            category: 'image-tools',
            title: 'Background Remover',
          },
        },
        {
          path: 'image-tools/video-to-gif-converter',
          name: 'video-to-gif-converter',
          component: VideoToGifConverter,
          meta: {
            category: 'image-tools',
            title: 'Video to GIF Converter',
          },
        },
        {
          path: 'image-tools/apng-generator',
          name: 'apng-generator',
          component: ApngGenerator,
          meta: {
            category: 'image-tools',
            title: 'APNG Generator',
          },
        },
        {
          path: 'generators/favicon-generator',
          name: 'favicon-generator',
          component: FaviconGenerator,
          meta: {
            category: 'generators',
            title: 'Favicon Generator',
          },
        },
        {
          path: 'converters/file-renamer',
          name: 'file-renamer',
          component: FileRenamer,
          meta: {
            category: 'converters',
            title: 'File Renamer',
          },
        },
        {
          path: 'converters/url-encoder',
          name: 'url-encoder',
          component: ComingSoon,
          meta: {
            category: 'converters',
            title: 'URL Encoder',
          },
        },
        {
          path: 'converters/base64-converter',
          name: 'base64-converter',
          component: ComingSoon,
          meta: {
            category: 'converters',
            title: 'Base64 Converter',
          },
        },
        {
          path: 'generators/color-picker',
          name: 'color-picker',
          component: ComingSoon,
          meta: {
            category: 'generators',
            title: 'Color Picker',
          },
        },
        {
          path: 'generators/qr-generator',
          name: 'qr-generator',
          component: ComingSoon,
          meta: {
            category: 'generators',
            title: 'QR Generator',
          },
        },
      ],
    },
    // 404 catch-all route
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: HomePage,
      children: [
        {
          path: '',
          component: NotFound,
        },
      ],
    },
  ],
})

export default router
