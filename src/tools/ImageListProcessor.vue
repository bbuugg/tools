<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ $t('tools.imageListProcessor.title') }}
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('tools.imageListProcessor.description') }}
        </p>
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
              v-model="options.sortByName"
              @change="processImages"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >🔤 {{ $t('tools.imageListProcessor.options.sortByName') }}</span
            >
          </label>
          <div class="flex gap-3 ml-auto">
            <button
              @click="copyResults"
              :disabled="processedData.length === 0"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ $t('common.copy') }}
            </button>
            <button
              @click="loadExample"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium cursor-pointer"
            >
              {{ $t('common.loadExample') }}
            </button>
            <button
              @click="clearContent"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Input Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.imageListProcessor.inputTitle') }}
        </h2>
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">
            输入图片链接，每行一个，将以可视化画廊的形式展示：
          </p>
          <ul class="text-sm text-gray-500 list-disc list-inside space-y-1">
            <li>直接图片链接（每行一个）</li>
            <li>支持常见格式：JPG、PNG、GIF、WebP、SVG 等</li>
            <li>以 # 或 // 开头的注释行将被忽略</li>
            <li>空行将被自动跳过</li>
          </ul>
        </div>
        <textarea
          v-model="inputData"
          @input="processImages"
          placeholder="在此粘贴图片链接，每行一个...

https://example.com/image1.jpg
https://example.com/image2.png
https://example.com/image3.gif

# 以 # 开头的注释将被忽略
// 或者双斜杠注释"
          class="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
        ></textarea>
      </div>

      <!-- Results Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.imageListProcessor.resultsTitle') }}
        </h2>
        <div class="mb-3 px-3 py-2 bg-blue-50 rounded-md border-l-4 border-blue-400">
          <span class="text-blue-800 font-medium text-sm">
            {{ imageList.length }} {{ $t('common.items') }} {{ $t('common.found') }}
          </span>
        </div>

        <div v-if="imageList.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-lg mb-2">🖼️</div>
          <p class="text-gray-500">
            {{ $t('tools.imageListProcessor.noResults') }}
          </p>
        </div>

        <div v-else class="space-y-6">
          <!-- Image Preview Grid -->
          <div
            v-if="imageList.length > 0"
            class="border border-gray-200 rounded-lg overflow-hidden"
          >
            <h3 class="bg-gray-800 text-white px-3 py-2 font-medium flex items-center text-sm">
              <span class="mr-2">🖼️</span>
              {{ $t('tools.imageListProcessor.imagePreview') }} ({{ imageList.length }})
            </h3>
            <div class="p-4">
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div
                  v-for="(image, index) in imageList.slice(0, 24)"
                  :key="index"
                  class="relative group"
                >
                  <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      :src="image.url"
                      :alt="image.alt || `Image ${index + 1}`"
                      class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      @error="handleImageError"
                      loading="lazy"
                    />
                  </div>
                  <div
                    class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center"
                  >
                    <button
                      @click="copyImageUrl(image.url)"
                      class="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-800 px-2 py-1 rounded text-xs"
                    >
                      {{ $t('common.copy') }}
                    </button>
                  </div>
                  <div
                    v-if="image.alt"
                    class="mt-1 text-xs text-gray-600 truncate"
                    :title="image.alt"
                  >
                    {{ image.alt }}
                  </div>
                </div>
              </div>
              <div v-if="imageList.length > 24" class="mt-4 text-center text-sm text-gray-500">
                {{ $t('tools.imageListProcessor.showingFirst') }} 24
                {{ $t('tools.imageListProcessor.of') }} {{ imageList.length }}
                {{ $t('common.items') }}
              </div>
            </div>
          </div>

          <!-- Processed Output -->
          <div v-if="processedOutput" class="border border-gray-200 rounded-lg overflow-hidden">
            <h3 class="bg-gray-800 text-white px-3 py-2 font-medium flex items-center text-sm">
              <span class="mr-2">📋</span>
              {{ $t('tools.imageListProcessor.processedOutput') }} ({{
                processingMode.toUpperCase()
              }})
            </h3>
            <div class="p-4">
              <pre
                class="bg-gray-50 p-3 rounded border text-sm overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap"
                >{{ processedOutput }}</pre
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Descriptions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">🖼️ 简单展示</h3>
          <p class="text-gray-600 text-sm">
            逐行输入图片URL，快速创建可视化图片画廊。简单直观的界面设计。
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">📝 智能解析</h3>
          <p class="text-gray-600 text-sm">
            自动识别图片URL，支持多种图片格式。忽略注释行和空行，提供干净的展示效果。
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">⚡ 高效便捷</h3>
          <p class="text-gray-600 text-sm">
            支持批量展示和URL复制功能。可选择按文件名排序，满足不同使用需求。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

interface ImageInfo {
  url: string
  alt?: string
  width?: number
  height?: number
  filename?: string
}

interface ProcessingOptions {
  sortByName: boolean
}

useI18n() // Using $t in template
const { copySuccess, copyError, downloadSuccess } = useToast()

const inputData = ref('')

const imageList = ref<ImageInfo[]>([])
const processedData = ref<ImageInfo[]>([])
const options = ref<ProcessingOptions>({
  sortByName: false,
})

// Process input data to extract images
// Process input data to display images line by line
function processImages() {
  if (!inputData.value.trim()) {
    imageList.value = []
    processedData.value = []
    return
  }

  const images: ImageInfo[] = []
  const input = inputData.value.trim()

  // Process each line as an image URL
  const lines = input.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines and comments
    if (!line || line.startsWith('#') || line.startsWith('//')) {
      continue
    }

    // Check if line is a valid image URL
    if (isValidImageUrl(line)) {
      images.push({
        url: line,
        filename: extractFilename(line),
        alt: `Image ${i + 1}`,
      })
    }
  }

  // Sort if requested
  if (options.value.sortByName) {
    images.sort((a, b) => (a.filename || a.url).localeCompare(b.filename || b.url))
  }

  imageList.value = images
  processedData.value = images
}

// Removed generateOutput function - using computed properties for reactive updates

// Helper functions
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false

  // Remove whitespace
  url = url.trim()
  if (!url) return false

  // Check for image file extensions (more comprehensive)
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif|heic|heif)(\?[^\s]*)?$/i

  // Check if it's a data URL
  if (url.startsWith('data:image/')) {
    return true
  }

  // Check if it contains image extension
  if (imageExtensions.test(url)) {
    return true
  }

  // Check for URLs that might be images but without extension (like CDN URLs)
  if (
    url.includes('picsum.photos') ||
    url.includes('unsplash.com') ||
    url.includes('placeholder.com') ||
    url.includes('via.placeholder.com') ||
    url.includes('dummyimage.com') ||
    url.includes('lorempixel.com')
  ) {
    return true
  }

  return false
}

function extractFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname
    return pathname.split('/').pop() || ''
  } catch {
    return url.split('/').pop() || url
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Action functions
function copyResults() {
  if (processedData.value.length === 0) return

  const urls = processedData.value.map((img) => img.url).join('\n')
  navigator.clipboard
    .writeText(urls)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function copyImageUrl(url: string) {
  navigator.clipboard
    .writeText(url)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function loadExample() {
  inputData.value = `# 示例图片链接 - 每行一个
https://picsum.photos/800/600?random=1
https://picsum.photos/800/600?random=2
https://picsum.photos/600/600?random=3
https://picsum.photos/500/700?random=4
https://picsum.photos/700/500?random=5

# 注释行会被忽略
https://picsum.photos/400/600?random=6
https://picsum.photos/600/400?random=7

// 也可以使用双斜杠注释
https://picsum.photos/800/800?random=8
https://picsum.photos/900/600?random=9
https://picsum.photos/600/900?random=10`

  processImages()
}

function clearContent() {
  inputData.value = ''
  imageList.value = []
  processedData.value = []
}
</script>
