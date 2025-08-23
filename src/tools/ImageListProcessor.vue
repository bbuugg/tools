<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ $t('tools.imageListProcessor.title') }}</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('tools.imageListProcessor.description') }}
        </p>
      </div>

      <!-- Processing Options -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.imageListProcessor.processingOptions') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="radio"
              value="extract"
              v-model="processingMode"
              @change="processImages"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span class="text-sm font-medium text-gray-700">📋 {{ $t('tools.imageListProcessor.modes.extract') }}</span>
          </label>
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="radio"
              value="markdown"
              v-model="processingMode"
              @change="processImages"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span class="text-sm font-medium text-gray-700">📝 {{ $t('tools.imageListProcessor.modes.markdown') }}</span>
          </label>
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="radio"
              value="html"
              v-model="processingMode"
              @change="processImages"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span class="text-sm font-medium text-gray-700">🌐 {{ $t('tools.imageListProcessor.modes.html') }}</span>
          </label>
          <label
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="radio"
              value="csv"
              v-model="processingMode"
              @change="processImages"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span class="text-sm font-medium text-gray-700">📊 {{ $t('tools.imageListProcessor.modes.csv') }}</span>
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
              v-model="options.includeAltText"
              @change="processImages"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700">🏷️ {{ $t('tools.imageListProcessor.options.includeAltText') }}</span>
          </label>
          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              v-model="options.includeDimensions"
              @change="processImages"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700">📐 {{ $t('tools.imageListProcessor.options.includeDimensions') }}</span>
          </label>
          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              v-model="options.validateUrls"
              @change="processImages"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700">✅ {{ $t('tools.imageListProcessor.options.validateUrls') }}</span>
          </label>
          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              v-model="options.sortByName"
              @change="processImages"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700">🔤 {{ $t('tools.imageListProcessor.options.sortByName') }}</span>
          </label>
          <div class="flex gap-3 ml-auto">
            <button
              @click="processImages"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {{ $t('common.extract') }}
            </button>
            <button
              @click="copyResults"
              :disabled="processedData.length === 0"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('common.copy') }}
            </button>
            <button
              @click="downloadResults"
              :disabled="processedData.length === 0"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('common.download') }}
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

      <!-- Input Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.imageListProcessor.inputTitle') }}
        </h2>
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">
            {{ $t('tools.imageListProcessor.inputNote') }}
          </p>
          <ul class="text-sm text-gray-500 list-disc list-inside space-y-1">
            <li>{{ $t('tools.imageListProcessor.supportedFormats.urls') }}</li>
            <li>{{ $t('tools.imageListProcessor.supportedFormats.html') }}</li>
            <li>{{ $t('tools.imageListProcessor.supportedFormats.markdown') }}</li>
            <li>{{ $t('tools.imageListProcessor.supportedFormats.csv') }}</li>
          </ul>
        </div>
        <textarea
          v-model="inputData"
          @input="processImages"
          :placeholder="$t('tools.imageListProcessor.inputPlaceholder')"
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
          <div v-if="imageList.length > 0" class="border border-gray-200 rounded-lg overflow-hidden">
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
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      @click="copyImageUrl(image.url)"
                      class="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-800 px-2 py-1 rounded text-xs"
                    >
                      {{ $t('common.copy') }}
                    </button>
                  </div>
                  <div v-if="image.alt" class="mt-1 text-xs text-gray-600 truncate" :title="image.alt">
                    {{ image.alt }}
                  </div>
                </div>
              </div>
              <div v-if="imageList.length > 24" class="mt-4 text-center text-sm text-gray-500">
                {{ $t('tools.imageListProcessor.showingFirst') }} 24 {{ $t('tools.imageListProcessor.of') }} {{ imageList.length }} {{ $t('common.items') }}
              </div>
            </div>
          </div>

          <!-- Processed Output -->
          <div v-if="processedOutput" class="border border-gray-200 rounded-lg overflow-hidden">
            <h3 class="bg-gray-800 text-white px-3 py-2 font-medium flex items-center text-sm">
              <span class="mr-2">📋</span>
              {{ $t('tools.imageListProcessor.processedOutput') }} ({{ processingMode.toUpperCase() }})
            </h3>
            <div class="p-4">
              <pre class="bg-gray-50 p-3 rounded border text-sm overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">{{ processedOutput }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Descriptions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">🖼️ {{ $t('tools.imageListProcessor.features.extraction.title') }}</h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageListProcessor.features.extraction.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">📝 {{ $t('tools.imageListProcessor.features.formats.title') }}</h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageListProcessor.features.formats.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">⚡ {{ $t('tools.imageListProcessor.features.batch.title') }}</h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageListProcessor.features.batch.description') }}
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
  includeAltText: boolean
  includeDimensions: boolean
  validateUrls: boolean
  sortByName: boolean
}

const { t } = useI18n()
const { copySuccess, copyError, downloadSuccess } = useToast()

const inputData = ref('')
const processingMode = ref('extract')
const imageList = ref<ImageInfo[]>([])
const processedData = ref<ImageInfo[]>([])
const options = ref<ProcessingOptions>({
  includeAltText: true,
  includeDimensions: false,
  validateUrls: false,
  sortByName: false
})

// Process input data to extract images
function processImages() {
  if (!inputData.value.trim()) {
    imageList.value = []
    processedData.value = []
    return
  }

  const images: ImageInfo[] = []
  const input = inputData.value.trim()

  // Extract images from different formats
  // 1. Direct URLs (one per line)
  const urlLines = input.split('\n').filter(line => line.trim())
  for (const line of urlLines) {
    const url = line.trim()
    if (isValidImageUrl(url)) {
      images.push({
        url,
        filename: extractFilename(url)
      })
    }
  }

  // 2. HTML img tags
  const htmlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'][^>]*)?>/gi
  let htmlMatch
  while ((htmlMatch = htmlRegex.exec(input)) !== null) {
    const url = htmlMatch[1]
    const alt = htmlMatch[2] || ''
    if (isValidImageUrl(url)) {
      images.push({
        url,
        alt,
        filename: extractFilename(url)
      })
    }
  }

  // 3. Markdown images
  const markdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let mdMatch
  while ((mdMatch = markdownRegex.exec(input)) !== null) {
    const alt = mdMatch[1]
    const url = mdMatch[2]
    if (isValidImageUrl(url)) {
      images.push({
        url,
        alt,
        filename: extractFilename(url)
      })
    }
  }

  // 4. CSV format (url,alt,width,height)
  if (input.includes(',')) {
    const csvLines = input.split('\n').filter(line => line.trim() && !line.startsWith('#'))
    for (const line of csvLines) {
      const parts = line.split(',').map(part => part.trim().replace(/^["']|["']$/g, ''))
      if (parts.length >= 1 && isValidImageUrl(parts[0])) {
        images.push({
          url: parts[0],
          alt: parts[1] || '',
          width: parts[2] ? parseInt(parts[2]) : undefined,
          height: parts[3] ? parseInt(parts[3]) : undefined,
          filename: extractFilename(parts[0])
        })
      }
    }
  }

  // Remove duplicates based on URL
  const uniqueImages = images.filter((image, index, self) => 
    index === self.findIndex(t => t.url === image.url)
  )

  // Sort if requested
  if (options.value.sortByName) {
    uniqueImages.sort((a, b) => (a.filename || a.url).localeCompare(b.filename || b.url))
  }

  imageList.value = uniqueImages
  processedData.value = uniqueImages
  generateOutput()
}

// Generate output based on processing mode
const processedOutput = computed(() => {
  if (processedData.value.length === 0) return ''

  switch (processingMode.value) {
    case 'extract':
      return processedData.value.map(img => img.url).join('\n')
    
    case 'markdown':
      return processedData.value.map(img => {
        const alt = options.value.includeAltText ? (img.alt || img.filename || 'Image') : 'Image'
        return `![${alt}](${img.url})`
      }).join('\n')
    
    case 'html':
      return processedData.value.map(img => {
        const alt = options.value.includeAltText ? (img.alt || img.filename || '') : ''
        const dimensions = options.value.includeDimensions && img.width && img.height 
          ? ` width="${img.width}" height="${img.height}"` 
          : ''
        return `<img src="${img.url}" alt="${alt}"${dimensions} />`
      }).join('\n')
    
    case 'csv':
      const headers = ['URL']
      if (options.value.includeAltText) headers.push('Alt Text')
      if (options.value.includeDimensions) headers.push('Width', 'Height')
      
      const csvRows = [headers.join(',')]
      csvRows.push(...processedData.value.map(img => {
        const row = [img.url]
        if (options.value.includeAltText) row.push(img.alt || '')
        if (options.value.includeDimensions) {
          row.push(img.width?.toString() || '')
          row.push(img.height?.toString() || '')
        }
        return row.map(cell => `"${cell}"`).join(',')
      }))
      return csvRows.join('\n')
    
    default:
      return processedData.value.map(img => img.url).join('\n')
  }
})

function generateOutput() {
  // Trigger computed property update
  processingMode.value = processingMode.value
}

// Helper functions
function isValidImageUrl(url: string): boolean {
  if (!url) return false
  
  // Check if it's a valid URL format
  try {
    new URL(url)
  } catch {
    // If not a full URL, check if it's a relative path with image extension
    if (!url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff)$/i)) {
      return false
    }
  }
  
  // Check for image file extensions
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff)(\?|#|$)/i.test(url)
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
  if (!processedOutput.value) return
  
  navigator.clipboard.writeText(processedOutput.value).then(() => {
    copySuccess()
  }).catch(() => {
    copyError()
  })
}

function copyImageUrl(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    copySuccess()
  }).catch(() => {
    copyError()
  })
}

function downloadResults() {
  if (!processedOutput.value) return
  
  const extension = processingMode.value === 'csv' ? 'csv' : 'txt'
  const mimeType = processingMode.value === 'csv' ? 'text/csv' : 'text/plain'
  
  const blob = new Blob([processedOutput.value], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `image-list-${processingMode.value}-${new Date().toISOString().split('T')[0]}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
  downloadSuccess()
}

function loadExample() {
  inputData.value = `# Example image URLs and formats
https://picsum.photos/800/600?random=1
https://picsum.photos/800/600?random=2
https://picsum.photos/800/600?random=3

# HTML format
<img src="https://picsum.photos/400/300?random=4" alt="Random image 4" />
<img src="https://picsum.photos/400/300?random=5" alt="Random image 5" />

# Markdown format
![Random image 6](https://picsum.photos/600/400?random=6)
![Random image 7](https://picsum.photos/600/400?random=7)

# CSV format (url,alt,width,height)
"https://picsum.photos/500/500?random=8","Square image",500,500
"https://picsum.photos/800/400?random=9","Wide image",800,400`
  
  processImages()
}

function clearContent() {
  inputData.value = ''
  imageList.value = []
  processedData.value = []
}
</script>