<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ $t('tools.htmlExtractor.title') }}</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('tools.htmlExtractor.description') }}
        </p>
      </div>

      <!-- Input Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('common.input') }} HTML Code
        </h2>
        <div class="mb-4">
          <label for="base-url" class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('tools.htmlExtractor.baseUrl') }}:
          </label>
          <input
            id="base-url"
            type="url"
            v-model="baseUrl"
            placeholder="https://example.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <textarea
          v-model="htmlInput"
          @input="extractContent"
          :placeholder="$t('tools.htmlExtractor.inputPlaceholder')"
          class="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
        ></textarea>
      </div>

      <!-- Content Type Filters -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ $t('tools.htmlExtractor.contentTypes') }}
          </h3>
          <div class="flex gap-2">
            <button
              @click="selectAllContentTypes"
              class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
            >
              {{ $t('common.selectAll') }}
            </button>
            <button
              @click="deselectAllContentTypes"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {{ $t('common.clearSelection') }}
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="options.images"
              @change="extractContent"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >🖼️ {{ $t('tools.htmlExtractor.types.images') }}</span
            >
          </label>
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="options.videos"
              @change="extractContent"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >📹 {{ $t('tools.htmlExtractor.types.videos') }}</span
            >
          </label>
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="options.audios"
              @change="extractContent"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >🎵 {{ $t('tools.htmlExtractor.types.audio') }}</span
            >
          </label>
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="options.links"
              @change="extractContent"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >🔗 {{ $t('tools.htmlExtractor.types.links') }}</span
            >
          </label>
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="options.css"
              @change="extractContent"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >🎨 {{ $t('tools.htmlExtractor.types.css') }}</span
            >
          </label>
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="options.js"
              @change="extractContent"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >📜 {{ $t('tools.htmlExtractor.types.javascript') }}</span
            >
          </label>
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="options.iframes"
              @change="extractContent"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >🖼️ {{ $t('tools.htmlExtractor.types.iframes') }}</span
            >
          </label>
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="options.metadata"
              @change="extractContent"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >🔍 {{ $t('tools.htmlExtractor.types.metadata') }}</span
            >
          </label>
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="options.forms"
              @change="extractContent"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >📝 {{ $t('tools.htmlExtractor.types.forms') }}</span
            >
          </label>
        </div>
      </div>

      <!-- Options -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('common.options') }}
        </h3>
        <div class="flex flex-wrap items-center gap-6">
          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              v-model="options.uniqueOnly"
              @change="extractContent"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >✨ {{ $t('tools.htmlExtractor.options.uniqueOnly') }}</span
            >
          </label>
          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              v-model="options.absoluteUrls"
              @change="extractContent"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >🔗 {{ $t('tools.htmlExtractor.options.absoluteUrls') }}</span
            >
          </label>
          <div class="flex gap-3 ml-auto">
            <button
              @click="extractContent"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {{ $t('common.extract') }} {{ $t('common.results') }}
            </button>
            <button
              @click="copyResults"
              :disabled="totalCount === 0"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('common.copy') }} {{ $t('common.results') }}
            </button>
            <button
              @click="loadExample"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              {{ $t('common.loadExample') }}
            </button>
            <button
              @click="clearContent"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.htmlExtractor.extractionResults') }}
        </h2>
        <div class="mb-3 px-3 py-2 bg-blue-50 rounded-md border-l-4 border-blue-400">
          <span class="text-blue-800 font-medium text-sm"
            >{{ totalCount }} {{ $t('common.items') }} {{ $t('common.found') }}</span
          >
        </div>

        <div v-if="totalCount === 0" class="text-center py-12">
          <div class="text-gray-400 text-lg mb-2">📋</div>
          <p class="text-gray-500">
            {{ $t('tools.htmlExtractor.noResults') }}
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(items, type) in resultsByType"
            :key="type"
            class="border border-gray-200 rounded-lg overflow-hidden"
          >
            <h3 class="bg-gray-800 text-white px-3 py-2 font-medium flex items-center text-sm">
              <span class="mr-2">{{ getTypeEmoji(type) }}</span>
              {{ type.toUpperCase() }} ({{ items.length }})
            </h3>
            <div class="divide-y divide-gray-200">
              <div v-for="(item, index) in items" :key="index" class="px-3 py-2 hover:bg-gray-50">
                <div class="mb-1">
                  <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener"
                    class="text-blue-600 hover:text-blue-800 hover:underline break-all font-medium text-sm"
                  >
                    {{ item.url }}
                  </a>
                </div>
                <div v-if="item.text" class="text-gray-600 text-xs mb-1">{{ item.text }}</div>
                <div v-if="item.attributes" class="flex flex-wrap gap-1 mb-2">
                  <span
                    v-for="(value, key) in item.attributes"
                    :key="key"
                    class="inline-block bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs"
                  >
                    {{ key }}: {{ value }}
                  </span>
                </div>

                <!-- Preview for images -->
                <div
                  v-if="item.type === 'image' || item.type === 'css-background'"
                  class="mt-2 p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <img
                    referrerpolicy="no-referrer"
                    :src="item.url"
                    :alt="item.text || 'Preview image'"
                    class="max-w-full max-h-48 rounded shadow-sm hover:scale-105 transition-transform duration-200"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                    loading="lazy"
                  />
                </div>

                <!-- Preview for videos -->
                <div
                  v-if="item.type === 'video'"
                  class="mt-2 p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <video
                    :src="item.url"
                    class="max-w-full max-h-48 rounded shadow-sm"
                    controls
                    preload="metadata"
                    @error="($event.target as HTMLVideoElement).style.display = 'none'"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Descriptions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🖼️ {{ $t('tools.htmlExtractor.features.imageExtraction.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.htmlExtractor.features.imageExtraction.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🎬 {{ $t('tools.htmlExtractor.features.mediaProcessing.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.htmlExtractor.features.mediaProcessing.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🔗 {{ $t('tools.htmlExtractor.features.linkAnalysis.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.htmlExtractor.features.linkAnalysis.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'

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
  absoluteUrls: false,
})

const { copySuccess, copyError } = useToast()

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
  imgs.forEach((img) => {
    const src = img.getAttribute('src')
    if (src) {
      const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
      results.push({
        type: 'image',
        url,
        text: img.getAttribute('alt') || '',
        attributes: {
          alt: img.getAttribute('alt') || '',
          title: img.getAttribute('title') || '',
        },
      })
    }
  })

  // Extract CSS background images
  const elementsWithBg = doc.querySelectorAll('*')
  elementsWithBg.forEach((el) => {
    const style = (el as HTMLElement).style.backgroundImage
    if (style) {
      const matches = style.match(/url\(["']?([^"')]+)["']?\)/g)
      matches?.forEach((match) => {
        const urlMatch = match.match(/url\(["']?([^"')]+)["']?\)/)
        if (urlMatch?.[1]) {
          const url = options.value.absoluteUrls
            ? makeAbsolute(urlMatch[1], baseUrl.value)
            : urlMatch[1]
          results.push({
            type: 'css-background',
            url,
            text: 'CSS Background Image',
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

  links.forEach((link) => {
    const href = link.getAttribute('href')
    if (href) {
      const url = options.value.absoluteUrls ? makeAbsolute(href, baseUrl.value) : href
      results.push({
        type: 'link',
        url,
        text: link.textContent?.trim() || '',
        attributes: {
          target: link.getAttribute('target') || '',
          rel: link.getAttribute('rel') || '',
        },
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
  videos.forEach((video) => {
    const src = video.getAttribute('src')
    if (src) {
      const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
      results.push({
        type: 'video',
        url,
        attributes: {
          controls: video.getAttribute('controls') || '',
          autoplay: video.getAttribute('autoplay') || '',
        },
      })
    }

    // Video sources
    const sources = video.querySelectorAll('source')
    sources.forEach((source) => {
      const src = source.getAttribute('src')
      if (src) {
        const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
        results.push({
          type: 'video',
          url,
          attributes: {
            type: source.getAttribute('type') || '',
          },
        })
      }
    })
  })

  // Audio
  const audios = doc.querySelectorAll('audio')
  audios.forEach((audio) => {
    const src = audio.getAttribute('src')
    if (src) {
      const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
      results.push({
        type: 'audio',
        url,
      })
    }

    // Audio sources
    const sources = audio.querySelectorAll('source')
    sources.forEach((source) => {
      const src = source.getAttribute('src')
      if (src) {
        const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
        results.push({
          type: 'audio',
          url,
          attributes: {
            type: source.getAttribute('type') || '',
          },
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
  cssLinks.forEach((link) => {
    const href = link.getAttribute('href')
    if (href) {
      const url = options.value.absoluteUrls ? makeAbsolute(href, baseUrl.value) : href
      results.push({
        type: 'css',
        url,
      })
    }
  })

  // JS scripts
  const scripts = doc.querySelectorAll('script[src]')
  scripts.forEach((script) => {
    const src = script.getAttribute('src')
    if (src) {
      const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
      results.push({
        type: 'js',
        url,
      })
    }
  })

  return results
}

// Extract iframes
function extractIframes(doc: Document): ExtractedItem[] {
  const results: ExtractedItem[] = []
  const iframes = doc.querySelectorAll('iframe')

  iframes.forEach((iframe) => {
    const src = iframe.getAttribute('src')
    if (src) {
      const url = options.value.absoluteUrls ? makeAbsolute(src, baseUrl.value) : src
      results.push({
        type: 'iframe',
        url,
        attributes: {
          title: iframe.getAttribute('title') || '',
          width: iframe.getAttribute('width') || '',
          height: iframe.getAttribute('height') || '',
        },
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
  metas.forEach((meta) => {
    const content = meta.getAttribute('content')
    const name = meta.getAttribute('name') || meta.getAttribute('property')
    if (content && name) {
      results.push({
        type: 'metadata',
        url: content,
        text: name,
      })
    }
  })

  return results
}

// Extract form elements
function extractForms(doc: Document): ExtractedItem[] {
  const results: ExtractedItem[] = []

  const forms = doc.querySelectorAll('form')
  forms.forEach((form) => {
    const action = form.getAttribute('action')
    if (action) {
      const url = options.value.absoluteUrls ? makeAbsolute(action, baseUrl.value) : action
      results.push({
        type: 'form',
        url,
        attributes: {
          method: form.getAttribute('method') || 'get',
          enctype: form.getAttribute('enctype') || '',
        },
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
    results = results.filter((item) => {
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
  extractedResults.value.forEach((item) => {
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
    <title>Example Page</title>
    <link rel="stylesheet" href="/css/style.css">
    <meta name="description" content="This is an example page">
</head>
<body>
    <h1>Welcome to Example Page</h1>
    <img src="/images/logo.png" alt="Logo">
    <a href="https://www.example.com">External Link</a>
    <video src="/videos/demo.mp4" controls></video>
    <audio src="/audio/music.mp3"></audio>
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
    <form action="/submit" method="post">
        <input type="text" name="username">
        <button type="submit">Submit</button>
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
  const text = extractedResults.value.map((item) => `${item.type}: ${item.url}`).join('\n')
  navigator.clipboard
    .writeText(text)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

// Select all content types
function selectAllContentTypes() {
  options.value.images = true
  options.value.videos = true
  options.value.audios = true
  options.value.links = true
  options.value.css = true
  options.value.js = true
  options.value.iframes = true
  options.value.metadata = true
  options.value.forms = true
  extractContent()
}

// Deselect all content types
function deselectAllContentTypes() {
  options.value.images = false
  options.value.videos = false
  options.value.audios = false
  options.value.links = false
  options.value.css = false
  options.value.js = false
  options.value.iframes = false
  options.value.metadata = false
  options.value.forms = false
  extractContent()
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
    form: '📝',
  }
  return emojis[type] || '📄'
}
</script>
