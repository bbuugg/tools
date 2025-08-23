<script setup lang="ts">
import { ref, computed } from 'vue'

interface ExtractedItem {
  type: string
  url: string
  text?: string
  attributes?: Record<string, string>
}

interface ExtractionOptions {
  images: boolean
  videos: boolean
  audios: boolean
  links: boolean
  css: boolean
  js: boolean
  iframes: boolean
  metadata: boolean
  forms: boolean
  uniqueOnly: boolean
  absoluteUrls: boolean
}

const htmlInput = ref('')
const baseUrl = ref('')
const options = ref<ExtractionOptions>({
  images: true,
  videos: true,
  audios: true,
  links: true,
  css: true,
  js: true,
  iframes: true,
  metadata: true,
  forms: true,
  uniqueOnly: true,
  absoluteUrls: false
})

const extractedResults = ref<ExtractedItem[]>([])

// Helper function to convert relative URLs to absolute
function makeAbsolute(url: string, base: string): string {
  if (!url || !base || url.startsWith('http') || url.startsWith('//')) {
    return url
  }

  try {
    const baseURL = new URL(base)
    return new URL(url, baseURL).href
  } catch {
    return url
  }
}

// Extract images from HTML
function extractImages(doc: Document): ExtractedItem[] {
  const results: ExtractedItem[] = []

  // Extract img tags
  const imgs = doc.querySelectorAll('img')
  imgs.forEach(img => {
    const src = img.getAttribute('src')
    if (src) {
      const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
      results.push({
        type: 'image',
        url,
        text: img.getAttribute('alt') || '',
        attributes: {
          alt: img.getAttribute('alt') || '',
          title: img.getAttribute('title') || ''
        }
      })
    }
  })

  // Extract CSS background images
  const elementsWithBg = doc.querySelectorAll('*')
  elementsWithBg.forEach(el => {
    const style = (el as HTMLElement).style.backgroundImage
    if (style) {
      const matches = style.match(/url\(["']?([^"')]+)["']?\)/g)
      matches?.forEach(match => {
        const urlMatch = match.match(/url\(["']?([^"')]+)["']?\)/)
        if (urlMatch?.[1]) {
          const url = options.value.absoluteUrls ? makeAbsolute(urlMatch[1], baseUrl.value) : urlMatch[1]
          results.push({
            type: 'css-background',
            url,
            text: 'CSS Background Image'
          })
        }
      })
    }
  })

  return results
}

// Extract links
function extractLinks(doc: Document): ExtractedItem[] {
  const results: ExtractedItem[] = []
  const links = doc.querySelectorAll('a[href]')

  links.forEach(link => {
    const href = link.getAttribute('href')
    if (href) {
      const url = options.value.absoluteUrls ? makeAbsolute(href, baseUrl.value) : href
      results.push({
        type: 'link',
        url,
        text: link.textContent?.trim() || '',
        attributes: {
          target: link.getAttribute('target') || '',
          rel: link.getAttribute('rel') || ''
        }
      })
    }
  })

  return results
}

// Extract videos and audios
function extractMedia(doc: Document): ExtractedItem[] {
  const results: ExtractedItem[] = []

  // Videos
  const videos = doc.querySelectorAll('video')
  videos.forEach(video => {
    const src = video.getAttribute('src')
    if (src) {
      const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
      results.push({
        type: 'video',
        url,
        attributes: {
          controls: video.getAttribute('controls') || '',
          autoplay: video.getAttribute('autoplay') || ''
        }
      })
    }

    // Video sources
    const sources = video.querySelectorAll('source')
    sources.forEach(source => {
      const src = source.getAttribute('src')
      if (src) {
        const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
        results.push({
          type: 'video',
          url,
          attributes: {
            type: source.getAttribute('type') || ''
          }
        })
      }
    })
  })

  // Audio
  const audios = doc.querySelectorAll('audio')
  audios.forEach(audio => {
    const src = audio.getAttribute('src')
    if (src) {
      const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
      results.push({
        type: 'audio',
        url
      })
    }

    // Audio sources
    const sources = audio.querySelectorAll('source')
    sources.forEach(source => {
      const src = source.getAttribute('src')
      if (src) {
        const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
        results.push({
          type: 'audio',
          url,
          attributes: {
            type: source.getAttribute('type') || ''
          }
        })
      }
    })
  })

  return results
}

// Extract CSS and JS resources
function extractResources(doc: Document): ExtractedItem[] {
  const results: ExtractedItem[] = []

  // CSS links
  const cssLinks = doc.querySelectorAll('link[rel="stylesheet"]')
  cssLinks.forEach(link => {
    const href = link.getAttribute('href')
    if (href) {
      const url = options.value.absoluteUrls ? makeAbsolute(href, baseUrl.value) : href
      results.push({
        type: 'css',
        url
      })
    }
  })

  // JS scripts
  const scripts = doc.querySelectorAll('script[src]')
  scripts.forEach(script => {
    const src = script.getAttribute('src')
    if (src) {
      const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
      results.push({
        type: 'js',
        url
      })
    }
  })

  return results
}

// Extract iframes
function extractIframes(doc: Document): ExtractedItem[] {
  const results: ExtractedItem[] = []
  const iframes = doc.querySelectorAll('iframe')

  iframes.forEach(iframe => {
    const src = iframe.getAttribute('src')
    if (src) {
      const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
      results.push({
        type: 'iframe',
        url,
        attributes: {
          title: iframe.getAttribute('title') || '',
          width: iframe.getAttribute('width') || '',
          height: iframe.getAttribute('height') || ''
        }
      })
    }
  })

  return results
}

// Extract metadata
function extractMetadata(doc: Document): ExtractedItem[] {
  const results: ExtractedItem[] = []

  // Meta tags
  const metas = doc.querySelectorAll('meta')
  metas.forEach(meta => {
    const content = meta.getAttribute('content')
    const name = meta.getAttribute('name') || meta.getAttribute('property')
    if (content && name) {
      results.push({
        type: 'metadata',
        url: content,
        text: name
      })
    }
  })

  return results
}

// Extract form elements
function extractForms(doc: Document): ExtractedItem[] {
  const results: ExtractedItem[] = []

  const forms = doc.querySelectorAll('form')
  forms.forEach(form => {
    const action = form.getAttribute('action')
    if (action) {
      const url = options.value.absoluteUrls ? makeAbsolute(action, baseUrl.value) : action
      results.push({
        type: 'form',
        url,
        attributes: {
          method: form.getAttribute('method') || 'get',
          enctype: form.getAttribute('enctype') || ''
        }
      })
    }
  })

  return results
}

// Main extraction function
function extractContent() {
  if (!htmlInput.value.trim()) {
    extractedResults.value = []
    return
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlInput.value, 'text/html')

  let results: ExtractedItem[] = []

  if (options.value.images) {
    results = [...results, ...extractImages(doc)]
  }
  if (options.value.links) {
    results = [...results, ...extractLinks(doc)]
  }
  if (options.value.videos || options.value.audios) {
    results = [...results, ...extractMedia(doc)]
  }
  if (options.value.css || options.value.js) {
    results = [...results, ...extractResources(doc)]
  }
  if (options.value.iframes) {
    results = [...results, ...extractIframes(doc)]
  }
  if (options.value.metadata) {
    results = [...results, ...extractMetadata(doc)]
  }
  if (options.value.forms) {
    results = [...results, ...extractForms(doc)]
  }

  // Remove duplicates if uniqueOnly is enabled
  if (options.value.uniqueOnly) {
    const seen = new Set()
    results = results.filter(item => {
      const key = `${item.type}-${item.url}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  extractedResults.value = results
}

// Computed properties for filtering results by type
const resultsByType = computed(() => {
  const grouped: Record<string, ExtractedItem[]> = {}
  extractedResults.value.forEach(item => {
    if (!grouped[item.type]) {
      grouped[item.type] = []
    }
    grouped[item.type].push(item)
  })
  return grouped
})

const totalCount = computed(() => extractedResults.value.length)

// Functions for demo and clear
function loadExample() {
  htmlInput.value = `<!DOCTYPE html>
<html>
<head>
    <title>示例页面</title>
    <link rel="stylesheet" href="/css/style.css">
    <meta name="description" content="这是一个示例页面">
</head>
<body>
    <h1>欢迎来到示例页面</h1>
    <img src="/images/logo.png" alt="Logo">
    <a href="https://www.example.com">外部链接</a>
    <video src="/videos/demo.mp4" controls></video>
    <audio src="/audio/music.mp3"></audio>
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
    <form action="/submit" method="post">
        <input type="text" name="username">
        <button type="submit">提交</button>
    </form>
    <script src="/js/app.js"><\/script>
</body>
</html>`
  extractContent()
}

function clearContent() {
  htmlInput.value = ''
  extractedResults.value = []
}

function copyResults() {
  const text = extractedResults.value.map(item => `${item.type}: ${item.url}`).join('\n')
  navigator.clipboard.writeText(text).then(() => {
    alert('结果已复制到剪贴板！')
  })
}

// Get emoji for content type
function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    image: '🖼️',
    'css-background': '🎨',
    video: '📹',
    audio: '🎵',
    link: '🔗',
    css: '🎨',
    js: '📜',
    iframe: '🖼️',
    metadata: '🔍',
    form: '📝'
  }
  return emojis[type] || '📄'
}
</script>

<template>
  <div class="html-extractor">
    <header class="header">
      <h1>HTML内容提取工具：一键提取网页资源</h1>
    </header>

    <main class="main-content">
      <!-- Content Type Filters -->
      <section class="content-types">
        <h3>内容类型</h3>
        <div class="type-filters">
          <label class="type-filter">
            <input type="checkbox" v-model="options.images" @change="extractContent" />
            🖼️ 图片
          </label>
          <label class="type-filter">
            <input type="checkbox" v-model="options.videos" @change="extractContent" />
            📹 视频
          </label>
          <label class="type-filter">
            <input type="checkbox" v-model="options.audios" @change="extractContent" />
            🎵 音频
          </label>
          <label class="type-filter">
            <input type="checkbox" v-model="options.links" @change="extractContent" />
            🔗 URL链接
          </label>
          <label class="type-filter">
            <input type="checkbox" v-model="options.css" @change="extractContent" />
            🎨 CSS资源
          </label>
          <label class="type-filter">
            <input type="checkbox" v-model="options.js" @change="extractContent" />
            📜 JS脚本
          </label>
          <label class="type-filter">
            <input type="checkbox" v-model="options.iframes" @change="extractContent" />
            🖼️ iframe嵌入
          </label>
          <label class="type-filter">
            <input type="checkbox" v-model="options.metadata" @change="extractContent" />
            🔍 元数据
          </label>
          <label class="type-filter">
            <input type="checkbox" v-model="options.forms" @change="extractContent" />
            📝 表单元素
          </label>
        </div>
      </section>

      <!-- Options -->
      <section class="options">
        <h3>选项设置</h3>
        <div class="option-controls">
          <label class="option">
            <input type="checkbox" v-model="options.uniqueOnly" @change="extractContent" />
            ✨ 仅显示唯一结果
          </label>
          <label class="option">
            <input type="checkbox" v-model="options.absoluteUrls" @change="extractContent" />
            🔗 转换为绝对URL
          </label>
          <div class="action-buttons">
            <button @click="extractContent" class="btn btn-primary">开始提取</button>
            <button @click="copyResults" class="btn btn-secondary" :disabled="totalCount === 0">
              复制结果
            </button>
            <button @click="loadExample" class="btn btn-secondary">加载示例</button>
            <button @click="clearContent" class="btn btn-secondary">清空内容</button>
          </div>
        </div>
      </section>

      <!-- Input Section -->
      <section class="input-section">
        <h2>输入HTML代码</h2>
        <div class="base-url">
          <label for="base-url">基准URL:</label>
          <input
            id="base-url"
            type="url"
            v-model="baseUrl"
            placeholder="https://example.com"
            class="base-url-input"
          />
        </div>
        <textarea
          v-model="htmlInput"
          @input="extractContent"
          placeholder="在此粘贴HTML代码..."
          class="html-input"
          rows="15"
        ></textarea>
      </section>

      <!-- Results Section -->
      <section class="results-section">
        <h2>提取结果</h2>
        <div class="results-summary">{{ totalCount }} 项内容</div>

        <div v-if="totalCount === 0" class="no-results">
          暂无提取结果，请输入HTML代码并选择要提取的内容类型。
        </div>

        <div v-else class="results-content">
          <div v-for="(items, type) in resultsByType" :key="type" class="result-group">
            <h3 class="result-type-title">
              {{ getTypeEmoji(type) }} {{ type.toUpperCase() }} ({{ items.length }})
            </h3>
            <div class="result-items">
              <div v-for="(item, index) in items" :key="index" class="result-item">
                <div class="result-url">
                  <a :href="item.url" target="_blank" rel="noopener">{{ item.url }}</a>
                </div>
                <div v-if="item.text" class="result-text">{{ item.text }}</div>
                <div v-if="item.attributes" class="result-attributes">
                  <span v-for="(value, key) in item.attributes" :key="key" class="attribute">
                    {{ key }}: {{ value }}
                  </span>
                </div>

                <!-- Preview for images -->
                <div
                  v-if="(item.type === 'image' || item.type === 'css-background')"
                  class="media-preview"
                >
                  <img
                    :src="item.url"
                    :alt="item.text || 'Preview image'"
                    class="preview-image"
                    @error="$event.target.style.display = 'none'"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                  />
                </div>

                <!-- Preview for videos -->
                <div v-if="item.type === 'video'" class="media-preview">
                  <video
                    :src="item.url"
                    class="preview-video"
                    controls
                    preload="metadata"
                    @error="$event.target.style.display = 'none'"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature Descriptions -->
      <section class="features">
        <div class="feature">
          <h3>🖼️ 图片提取</h3>
          <p>
            自动从HTML中提取所有图片URL，支持img标签及CSS背景图片。可识别相对路径并转换为绝对URL，方便您直接使用。
          </p>
        </div>

        <div class="feature">
          <h3>🎬 多媒体处理</h3>
          <p>
            批量提取视频和音频文件链接，支持多种格式（MP4, WebM, Ogg,
            MP3等）。自动识别video和audio标签内的源文件。
          </p>
        </div>

        <div class="feature">
          <h3>🔗 链接分析</h3>
          <p>
            提取页面中所有超链接，包括a标签的href属性。支持过滤内部链接和外部链接，帮助您分析网站结构。
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.html-extractor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.2em;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* Content Types */
.content-types h3,
.options h3 {
  margin-bottom: 15px;
  color: #34495e;
  border-bottom: 2px solid #3498db;
  padding-bottom: 5px;
}

.type-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.type-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-filter:hover {
  background: #e9ecef;
  border-color: #3498db;
}

.type-filter input[type="checkbox"] {
  margin: 0;
}

/* Options */
.option-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Input Section */
.input-section h2,
.results-section h2 {
  color: #2c3e50;
  margin-bottom: 15px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 5px;
}

.base-url {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.base-url label {
  font-weight: bold;
  min-width: 80px;
}

.base-url-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.html-input {
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  resize: vertical;
  min-height: 300px;
}

.html-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Results Section */
.results-summary {
  padding: 10px 15px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-weight: bold;
  margin-bottom: 20px;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

.result-group {
  margin-bottom: 25px;
}

.result-type-title {
  background: #34495e;
  color: white;
  padding: 10px 15px;
  margin: 0 0 10px 0;
  border-radius: 4px;
  font-size: 16px;
}

.result-items {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.result-item {
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
}

.result-item:last-child {
  border-bottom: none;
}

.result-url a {
  color: #3498db;
  text-decoration: none;
  word-break: break-all;
}

.result-url a:hover {
  text-decoration: underline;
}

.result-text {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.result-attributes {
  margin-top: 5px;
}

.attribute {
  display: inline-block;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: #495057;
  margin-right: 8px;
  margin-top: 3px;
}

/* Media Preview Styles */
.media-preview {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.preview-image:hover {
  transform: scale(1.02);
}

.preview-video {
  max-width: 100%;
  max-height: 300px;
  width: auto;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Features */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.feature {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.feature h3 {
  margin-top: 0;
  color: #2c3e50;
}

.feature p {
  margin-bottom: 0;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .html-extractor {
    padding: 15px;
  }

  .type-filters {
    flex-direction: column;
  }

  .option-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    margin-left: 0;
    justify-content: stretch;
  }

  .action-buttons .btn {
    flex: 1;
  }

  .base-url {
    flex-direction: column;
    align-items: stretch;
  }

  .preview-image,
  .preview-video {
    max-height: 200px;
  }

  .media-preview {
    padding: 8px;
  }
}
</style>
