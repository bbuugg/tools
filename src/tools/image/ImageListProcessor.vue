<template>
  <div class="min-h-screen bg-dark-950 text-slate-100 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="glass rounded-xl p-6 mb-8 border border-slate-700/50 shadow-dark-lg">
        <h1 class="text-3xl font-bold text-slate-100 mb-4">
          🖼️ {{ $t('tools.imageListProcessor.title') }}
        </h1>
        <p class="text-slate-400 text-lg">
          {{ $t('tools.imageListProcessor.description') }}
        </p>
      </div>

      <!-- Input Section -->
      <div class="glass rounded-xl p-6 mb-8 border border-slate-700/50">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-2">
          {{ $t('tools.imageListProcessor.inputTitle') }}
        </h3>
        <p class="text-sm text-slate-400 mb-4">
          {{ $t('tools.imageListProcessor.inputNote') }}
        </p>
        <textarea
          v-model="inputData"
          @input="processImages"
          class="w-full h-64 p-4 bg-slate-800/30 border border-slate-600/50 rounded-xl resize-vertical focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm text-slate-100 placeholder-slate-500 transition-all duration-200"
          :placeholder="$t('tools.imageListProcessor.inputPlaceholder')"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="glass rounded-xl p-6 mb-8 border border-slate-700/50" v-if="imageList.length > 0">
        <div class="flex flex-wrap items-center gap-4">
          <button
            @click="clearAll"
            class="px-6 py-2 bg-slate-700 text-slate-100 rounded-xl hover:bg-slate-600 transition-all duration-200 cursor-pointer hover-lift"
          >
            🗑️ {{ $t('common.clear') }}
          </button>
          <button
            @click="copyUrls"
            class="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all duration-200 cursor-pointer hover-lift"
          >
            📋 {{ $t('common.copy') }} URLs
          </button>
          <div class="text-sm text-slate-400">
            {{ $t('common.total') }}: {{ imageList.length }} {{ $t('common.items') }}
          </div>
        </div>
      </div>

      <!-- Image Gallery -->
      <div class="glass rounded-xl p-6 mb-8 border border-slate-700/50" v-if="imageList.length > 0">
        <h3 class="text-lg font-semibold text-slate-100 mb-6 border-b border-slate-700/30 pb-2">
          {{ $t('tools.imageListProcessor.imagePreview') }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(image, index) in imageList"
            :key="index"
            class="bg-slate-800/30 rounded-xl overflow-hidden border border-slate-700/50 hover:border-slate-600/70 transition-all duration-200 hover-lift group"
          >
            <div class="aspect-square relative bg-slate-800/50">
              <img
                referrerpolicy="no-referrer"
                :src="image.url"
                :alt="image.alt || `Image ${index + 1}`"
                @error="handleImageError"
                @load="handleImageLoad"
                class="w-full h-full object-contain cursor-pointer group-hover:scale-105 transition-transform duration-200 p-2"
                @click="showLightbox(index)"
              />
              <div
                v-if="image.loading"
                class="absolute inset-0 bg-slate-700/80 animate-pulse flex items-center justify-center rounded-xl"
              >
                <div class="text-slate-300 text-sm">{{ $t('common.loading') }}</div>
              </div>
              <div
                v-if="image.error"
                class="absolute inset-0 bg-red-900/80 flex items-center justify-center p-4 rounded-xl"
              >
                <div class="text-red-200 text-sm text-center">
                  ❌ {{ $t('tools.imageListProcessor.imageError') }}
                </div>
              </div>
            </div>
            <div class="p-3">
              <div class="text-xs text-slate-300 truncate" :title="image.url">
                {{ image.filename || extractFilename(image.url) }}
              </div>
              <div class="text-xs text-slate-500 mt-1 truncate" :title="image.url">
                {{ image.url }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div
        v-if="imageList.length === 0 && inputData.trim()"
        class="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-6 text-center"
      >
        <div class="text-yellow-400 text-lg mb-2">⚠️</div>
        <p class="text-yellow-200">{{ $t('tools.imageListProcessor.noResults') }}</p>
      </div>

      <!-- Empty State -->
      <div
        v-if="!inputData.trim()"
        class="bg-slate-800/30 border-2 border-dashed border-slate-600/50 rounded-xl p-12 text-center"
      >
        <div class="text-slate-500 text-6xl mb-4">🖼️</div>
        <h3 class="text-lg font-medium text-slate-100 mb-2">
          {{ $t('tools.imageListProcessor.emptyState.title') }}
        </h3>
        <p class="text-slate-400 mb-4">
          {{ $t('tools.imageListProcessor.emptyState.description') }}
        </p>
        <button
          @click="loadExampleUrls"
          class="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all duration-200 cursor-pointer hover-lift"
        >
          {{ $t('common.loadExample') }}
        </button>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            🔗 {{ $t('tools.imageListProcessor.features.simple.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.imageListProcessor.features.simple.description') }}
          </p>
        </div>

        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            🖼️ {{ $t('tools.imageListProcessor.features.gallery.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.imageListProcessor.features.gallery.description') }}
          </p>
        </div>

        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            ⚡ {{ $t('tools.imageListProcessor.features.fast.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.imageListProcessor.features.fast.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Vue Easy Lightbox -->
  <vue-easy-lightbox
    :visible="lightboxVisible"
    :imgs="lightboxImages"
    :index="lightboxIndex"
    @hide="hideLightbox"
    :move-disabled="false"
    :scroll-disabled="false"
    :drag="true"
    :wheel="true"
    :pinch="true"
    :dblclick="true"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
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

// Lightbox state
const lightboxVisible = ref(false)
const lightboxIndex = ref(0)

// Computed property for lightbox images
const lightboxImages = computed(() => {
  return imageList.value.map((image) => ({
    src: image.url,
    title: image.filename || extractFilename(image.url),
  }))
})

// Show lightbox
function showLightbox(index: number) {
  lightboxIndex.value = index
  lightboxVisible.value = true
}

// Hide lightbox
function hideLightbox() {
  lightboxVisible.value = false
}

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

<style scoped>
/* Ensure proper image display in gallery */
.aspect-square img {
  transition: transform 0.2s ease-in-out;
}

.aspect-square:hover img {
  transform: scale(1.05);
}

/* Ensure images maintain aspect ratio while fitting in container */
.object-contain {
  object-fit: contain;
}
</style>