<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          🖼️ {{ $t('tools.imageListProcessor.title') }}
        </h1>
        <p class="text-gray-600 text-lg">
          {{ $t('tools.imageListProcessor.description') }}
        </p>
      </div>

      <!-- Input Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.imageListProcessor.inputTitle') }}
        </h3>
        <p class="text-sm text-gray-600 mb-4">
          {{ $t('tools.imageListProcessor.inputNote') }}
        </p>
        <textarea
          v-model="inputData"
          @input="processImages"
          class="w-full h-64 p-4 border border-gray-300 rounded-lg resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          :placeholder="$t('tools.imageListProcessor.inputPlaceholder')"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8" v-if="imageList.length > 0">
        <div class="flex flex-wrap items-center gap-4">
          <button
            @click="clearAll"
            class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🗑️ {{ $t('common.clear') }}
          </button>
          <button
            @click="copyUrls"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📋 {{ $t('common.copy') }} URLs
          </button>
          <div class="text-sm text-gray-600">
            {{ $t('common.total') }}: {{ imageList.length }} {{ $t('common.items') }}
          </div>
        </div>
      </div>

      <!-- Image Gallery -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8" v-if="imageList.length > 0">
        <h3 class="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
          {{ $t('tools.imageListProcessor.imagePreview') }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(image, index) in imageList"
            :key="index"
            class="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="aspect-square relative bg-gray-100">
              <img
                referrerpolicy="no-referrer"
                :src="image.url"
                :alt="image.alt || `Image ${index + 1}`"
                @error="handleImageError"
                @load="handleImageLoad"
                class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                @click="openImageModal(image)"
              />
              <div
                v-if="image.loading"
                class="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
              >
                <div class="text-gray-500 text-sm">{{ $t('common.loading') }}</div>
              </div>
              <div
                v-if="image.error"
                class="absolute inset-0 bg-red-50 flex items-center justify-center p-4"
              >
                <div class="text-red-500 text-sm text-center">
                  ❌ {{ $t('tools.imageListProcessor.imageError') }}
                </div>
              </div>
            </div>
            <div class="p-3">
              <div class="text-xs text-gray-600 truncate" :title="image.url">
                {{ image.filename || extractFilename(image.url) }}
              </div>
              <div class="text-xs text-gray-400 mt-1 truncate" :title="image.url">
                {{ image.url }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div
        v-if="imageList.length === 0 && inputData.trim()"
        class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center"
      >
        <div class="text-yellow-600 text-lg mb-2">⚠️</div>
        <p class="text-yellow-800">{{ $t('tools.imageListProcessor.noResults') }}</p>
      </div>

      <!-- Empty State -->
      <div
        v-if="!inputData.trim()"
        class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"
      >
        <div class="text-gray-400 text-6xl mb-4">🖼️</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ $t('tools.imageListProcessor.emptyState.title') }}
        </h3>
        <p class="text-gray-600 mb-4">
          {{ $t('tools.imageListProcessor.emptyState.description') }}
        </p>
        <button
          @click="loadExampleUrls"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {{ $t('common.loadExample') }}
        </button>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🔗 {{ $t('tools.imageListProcessor.features.simple.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageListProcessor.features.simple.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🖼️ {{ $t('tools.imageListProcessor.features.gallery.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageListProcessor.features.gallery.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            ⚡ {{ $t('tools.imageListProcessor.features.fast.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageListProcessor.features.fast.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Modal -->
  <div
    v-if="selectedImage"
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    @click="closeImageModal"
  >
    <div class="max-w-4xl max-h-full relative">
      <button
        @click="closeImageModal"
        class="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
      >
        ✕
      </button>
      <img
        :src="selectedImage.url"
        :alt="selectedImage.alt || 'Selected image'"
        class="max-w-full max-h-full object-contain"
        @click.stop
      />
      <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
        <div class="text-sm truncate">{{ selectedImage.url }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

interface ImageInfo {
  url: string
  alt?: string
  filename?: string
  loading?: boolean
  error?: boolean
}

const { t } = useI18n()
const { copySuccess, copyError } = useToast()

const inputData = ref('')
const imageList = ref<ImageInfo[]>([])
const selectedImage = ref<ImageInfo | null>(null)

// Process input data to extract image URLs
function processImages() {
  if (!inputData.value.trim()) {
    imageList.value = []
    return
  }

  const lines = inputData.value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#')) // Filter out empty lines and comments

  const images: ImageInfo[] = []

  for (const line of lines) {
    if (isValidImageUrl(line)) {
      images.push({
        url: line,
        filename: extractFilename(line),
        loading: true,
        error: false,
      })
    }
  }

  // Remove duplicates based on URL
  const uniqueImages = images.filter(
    (image, index, self) => index === self.findIndex((t) => t.url === image.url),
  )

  imageList.value = uniqueImages
}

// Validate if URL is likely an image
function isValidImageUrl(url: string): boolean {
  if (!url) return false

  // Remove whitespace
  url = url.trim()
  if (!url) return false

  // Check if it starts with http/https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false
  }

  return true
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
  const url = img.src
  const imageIndex = imageList.value.findIndex((image) => image.url === url)
  if (imageIndex !== -1) {
    imageList.value[imageIndex].error = true
    imageList.value[imageIndex].loading = false
  }
}

function handleImageLoad(event: Event) {
  const img = event.target as HTMLImageElement
  const url = img.src
  const imageIndex = imageList.value.findIndex((image) => image.url === url)
  if (imageIndex !== -1) {
    imageList.value[imageIndex].loading = false
    imageList.value[imageIndex].error = false
  }
}

function openImageModal(image: ImageInfo) {
  selectedImage.value = image
}

function closeImageModal() {
  selectedImage.value = null
}

// Action functions
function clearAll() {
  inputData.value = ''
  imageList.value = []
}

function copyUrls() {
  if (imageList.value.length === 0) return

  const urls = imageList.value.map((image) => image.url).join('\n')
  navigator.clipboard
    .writeText(urls)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function loadExampleUrls() {
  inputData.value = `https://picsum.photos/400/300?random=1
https://picsum.photos/400/300?random=2
https://picsum.photos/400/300?random=3
https://picsum.photos/400/300?random=4
https://picsum.photos/400/300?random=5
https://picsum.photos/400/300?random=6
https://picsum.photos/400/300?random=7
https://picsum.photos/400/300?random=8`
  processImages()
}
</script>
