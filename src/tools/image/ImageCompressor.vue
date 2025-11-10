<template>
  <div class="min-h-screen bg-dark-950 text-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-slate-100 mb-4">
          {{ $t('tools.imageCompressor.title') }}
        </h1>
        <p class="text-xl text-slate-400 max-w-3xl mx-auto">
          {{ $t('tools.imageCompressor.description') }}
        </p>
      </div>

      <!-- Upload Area -->
      <div class="glass rounded-xl p-6 mb-8 border border-slate-700/50">
        <div @drop="handleDrop" @dragover.prevent @dragenter.prevent @click="openFileSelector" :class="[
          'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-slate-600/50 hover:border-slate-500/70',
        ]">
          <input ref="fileInput" type="file" multiple accept="image/*" @change="handleFileSelect" class="hidden" />
          <div class="space-y-4">
            <div class="text-6xl text-slate-500">📸</div>
            <div>
              <h3 class="text-lg font-medium text-slate-100 mb-2">
                {{ $t('tools.imageCompressor.uploadTitle') }}
              </h3>
              <p class="text-slate-400">
                {{ $t('tools.imageCompressor.uploadDescription') }}
              </p>
              <p class="text-sm text-slate-500 mt-2">
                {{ $t('tools.imageCompressor.supportedFormats') }}: JPG, PNG, WebP, GIF
              </p>
            </div>
            <button
              class="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all duration-200 cursor-pointer hover-lift">
              {{ $t('tools.imageCompressor.selectFiles') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Panel -->
      <div class="glass rounded-xl p-6 mb-8 border border-slate-700/50">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-2">
          {{ $t('tools.imageCompressor.settings') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Quality Settings -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.imageCompressor.quality') }}: {{ compressionQuality }}%
            </label>
            <input type="range" min="10" max="95" v-model="compressionQuality"
              class="w-full h-2 bg-slate-700 rounded-xl appearance-none cursor-pointer slider" />
            <div class="flex justify-between text-xs text-slate-500 mt-1">
              <span>{{ $t('tools.imageCompressor.smaller') }}</span>
              <span>{{ $t('tools.imageCompressor.larger') }}</span>
            </div>
          </div>

          <!-- Output Format -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.imageCompressor.outputFormat') }}
            </label>
            <select v-model="outputFormat"
              class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-100 transition-all duration-200">
              <option value="original">{{ $t('tools.imageCompressor.keepOriginal') }}</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

          <!-- Max Width -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.imageCompressor.maxWidth') }} (px)
            </label>
            <input type="number" v-model="maxWidth" placeholder="留空保持原尺寸" min="100" max="4096"
              class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-100 placeholder-slate-500 transition-all duration-200" />
          </div>
        </div>
      </div>

      <!-- Images List -->
      <div v-if="images.length > 0" class="glass rounded-xl p-6 mb-8 border border-slate-700/50">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.imageCompressor.imageList') }} ({{ images.length }})
          </h3>
          <div class="flex gap-3">
            <button @click="compressAll" :disabled="isCompressing"
              class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all duration-200 cursor-pointer hover-lift disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="isCompressing" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                {{ $t('tools.imageCompressor.compressing') }}
              </span>
              <span v-else>{{ $t('tools.imageCompressor.compressAll') }}</span>
            </button>
            <button @click="downloadAll" :disabled="!hasCompressedImages"
              class="px-4 py-2 bg-success-600 text-white rounded-xl hover:bg-success-500 transition-all duration-200 cursor-pointer hover-lift disabled:opacity-50 disabled:cursor-not-allowed">
              {{ $t('tools.imageCompressor.downloadAll') }}
            </button>
            <button @click="clearAll"
              class="px-4 py-2 bg-slate-700 text-slate-100 rounded-xl hover:bg-slate-600 transition-all duration-200 cursor-pointer hover-lift">
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <!-- Statistics -->
        <div v-if="compressionStats.totalOriginalSize > 0"
          class="mb-6 p-4 bg-success-900/30 rounded-xl border border-success-700/50">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-success-400">
                {{ formatFileSize(compressionStats.totalOriginalSize) }}
              </div>
              <div class="text-sm text-success-300">
                {{ $t('tools.imageCompressor.originalSize') }}
              </div>
            </div>
            <div>
              <div class="text-2xl font-bold text-success-400">
                {{ formatFileSize(compressionStats.totalCompressedSize) }}
              </div>
              <div class="text-sm text-success-300">
                {{ $t('tools.imageCompressor.compressedSize') }}
              </div>
            </div>
            <div>
              <div class="text-2xl font-bold text-success-400">
                {{ compressionStats.savedPercentage }}%
              </div>
              <div class="text-sm text-success-300">
                {{ $t('tools.imageCompressor.spaceSaved') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Image Items -->
        <div class="space-y-4">
          <div v-for="(image, index) in images" :key="index"
            class="border border-slate-700/50 rounded-xl p-4 hover:shadow-dark-lg transition-all duration-200">
            <div class="flex items-center space-x-4">
              <!-- Thumbnail -->
              <div class="flex-shrink-0">
                <img referrerpolicy="no-referrer" :src="image.preview" :alt="image.name"
                  class="w-16 h-16 object-cover rounded-xl border border-slate-600/50" />
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-slate-100 truncate">{{ image.name }}</h4>
                <p class="text-sm text-slate-400">
                  {{ image.dimensions.width }} × {{ image.dimensions.height }} px
                </p>
                <div class="flex items-center space-x-4 mt-1">
                  <span class="text-sm text-slate-400">
                    {{ $t('tools.imageCompressor.original') }}:
                    {{ formatFileSize(image.originalSize) }}
                  </span>
                  <span v-if="image.compressedSize" class="text-sm text-success-400">
                    {{ $t('tools.imageCompressor.compressed') }}:
                    {{ formatFileSize(image.compressedSize) }}
                  </span>
                  <span v-if="image.savedPercentage" class="text-sm font-medium text-success-500">
                    -{{ image.savedPercentage }}%
                  </span>
                </div>
              </div>

              <!-- Status & Actions -->
              <div class="flex-shrink-0 flex items-center space-x-3">
                <!-- Status -->
                <div class="text-center">
                  <div :class="[
                    'w-3 h-3 rounded-full mx-auto mb-1',
                    image.status === 'pending'
                      ? 'bg-slate-500'
                      : image.status === 'compressing'
                        ? 'bg-warning-500'
                        : image.status === 'completed'
                          ? 'bg-success-500'
                          : 'bg-error-500',
                  ]"></div>
                  <span class="text-xs text-slate-400">
                    {{ $t(`tools.imageCompressor.status.${image.status}`) }}
                  </span>
                </div>

                <!-- Progress -->
                <div v-if="image.status === 'compressing'" class="w-16">
                  <div class="bg-slate-700 rounded-full h-2">
                    <div class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${image.progress}%` }"></div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex space-x-2">
                  <button @click="compressImage(index)" :disabled="isCompressing"
                    class="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-500 transition-all duration-200 cursor-pointer hover-lift disabled:opacity-50">
                    {{ $t('tools.imageCompressor.compress') }}
                  </button>
                  <button v-if="image.status === 'completed' && image.compressedBlob" @click="downloadImage(index)"
                    class="px-3 py-1 text-sm bg-success-600 text-white rounded hover:bg-success-500 transition-all duration-200 cursor-pointer hover-lift">
                    {{ $t('common.download') }}
                  </button>
                  <button v-if="image.status === 'completed' && image.compressedBlob" @click="previewImage(index)"
                    class="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-500 transition-all duration-200 cursor-pointer hover-lift">
                    {{ $t('common.preview') }}
                  </button>
                  <button @click="removeImage(index)"
                    class="px-3 py-1 text-sm bg-slate-700 text-slate-100 rounded hover:bg-slate-600 transition-all duration-200 cursor-pointer hover-lift">
                    {{ $t('tools.imageCompressor.remove') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <div v-if="showPreviewModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div class="relative glass rounded-xl shadow-dark-xl w-full max-w-4xl mx-4 border border-slate-700/50">
          <div class="flex items-center justify-between p-4 border-b border-slate-700/30 rounded-t-xl">
            <h3 class="text-xl font-semibold text-slate-100">
              {{ $t('tools.imageCompressor.imagePreview') }}
            </h3>
            <button @click="showPreviewModal = false"
              class="text-slate-400 bg-transparent hover:bg-slate-800/50 hover:text-slate-100 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-all duration-200 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="text-lg font-medium text-slate-100 mb-2">
                  {{ $t('tools.imageCompressor.originalImage') }}
                </h4>
                <div class="border border-slate-700/50 rounded-xl p-2">
                  <img referrerpolicy="no-referrer" :src="previewImageItem?.preview" :alt="previewImageItem?.name"
                    class="w-full h-auto max-h-96 object-contain" />
                </div>
                <div class="mt-2 text-sm text-slate-400">
                  {{ previewImageItem?.name }}<br />
                  {{ $t('tools.imageCompressor.size') }}:
                  {{ formatFileSize(previewImageItem?.originalSize || 0) }}<br />
                  {{ $t('tools.imageCompressor.dimensions') }}:
                  {{ previewImageItem?.dimensions.width }} ×
                  {{ previewImageItem?.dimensions.height }} px
                </div>
              </div>
              <div v-if="previewImageItem?.compressedBlob">
                <h4 class="text-lg font-medium text-slate-100 mb-2">
                  {{ $t('tools.imageCompressor.compressedImage') }}
                </h4>
                <div class="border border-slate-700/50 rounded-xl p-2">
                  <img referrerpolicy="no-referrer" :src="compressedPreviewUrl" :alt="previewImageItem?.name"
                    class="w-full h-auto max-h-96 object-contain" />
                </div>
                <div class="mt-2 text-sm text-slate-400">
                  {{ previewImageItem?.name }}<br />
                  {{ $t('tools.imageCompressor.size') }}:
                  {{ formatFileSize(previewImageItem?.compressedSize || 0) }}<br />
                  {{ $t('tools.imageCompressor.saved') }}: {{ previewImageItem?.savedPercentage }}%
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end p-6 border-t border-slate-700/30 rounded-b-xl">
            <button @click="showPreviewModal = false"
              class="text-slate-300 bg-slate-700 hover:bg-slate-600 focus:ring-4 focus:ring-slate-600 font-medium rounded-lg text-sm px-5 py-2.5 transition-all duration-200 cursor-pointer hover-lift">
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Feature Descriptions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            🚀 {{ $t('tools.imageCompressor.features.efficient.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.imageCompressor.features.efficient.description') }}
          </p>
        </div>

        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            🔒 {{ $t('tools.imageCompressor.features.secure.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.imageCompressor.features.secure.description') }}
          </p>
        </div>

        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            ⚡ {{ $t('tools.imageCompressor.features.batch.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.imageCompressor.features.batch.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
// @ts-expect-error No type definitions available for gif.js
import GIF from 'gif.js'
import { parseGIF, decompressFrames } from 'gifuct-js'

interface ImageItem {
  name: string
  file: File
  preview: string
  originalSize: number
  compressedSize?: number
  dimensions: {
    width: number
    height: number
  }
  status: 'pending' | 'compressing' | 'completed' | 'error'
  progress: number
  savedPercentage?: number
  compressedBlob?: Blob
  isAnimatedGif?: boolean
  gifFrames?: any[]
}

const { t } = useI18n()
const { success, error: showError } = useToast()

const fileInput = ref<HTMLInputElement>()
const images = ref<ImageItem[]>([])
const isDragging = ref(false)
const isCompressing = ref(false)
const compressionQuality = ref(80)
const outputFormat = ref('original')
const maxWidth = ref<number | null>(null)

// Preview modal
const showPreviewModal = ref(false)
const previewImageItem = ref<ImageItem | null>(null)
const compressedPreviewUrl = ref<string>('')

// Computed properties
const hasCompressedImages = computed(() => {
  return images.value.some((img) => img.status === 'completed')
})

const compressionStats = computed(() => {
  const completed = images.value.filter((img) => img.status === 'completed')
  const totalOriginalSize = completed.reduce((sum, img) => sum + img.originalSize, 0)
  const totalCompressedSize = completed.reduce((sum, img) => sum + (img.compressedSize || 0), 0)
  const savedPercentage =
    totalOriginalSize > 0
      ? Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)
      : 0

  return {
    totalOriginalSize,
    totalCompressedSize,
    savedPercentage,
  }
})

// Watch for changes in previewImageItem to update compressedPreviewUrl
watch(previewImageItem, (newVal) => {
  if (newVal && newVal.compressedBlob) {
    compressedPreviewUrl.value = URL.createObjectURL(newVal.compressedBlob)
  } else {
    compressedPreviewUrl.value = ''
  }
})

// File handling
function openFileSelector() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    addFiles(Array.from(files))
  }
  // Reset the input value to allow selecting the same file again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files) {
    addFiles(Array.from(files))
  }
}

async function addFiles(files: File[]) {
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    showError(t('tools.imageCompressor.errors.noValidImages'))
    return
  }

  for (const file of imageFiles) {
    // Check if file already exists - now we allow duplicates
    const existingIndex = images.value.findIndex(
      (img) => img.name === file.name && img.originalSize === file.size,
    )

    if (existingIndex !== -1) {
      // Update existing file
      try {
        const dimensions = await getImageDimensions(file)
        const preview = await createImagePreview(file)
        const isAnimatedGif = await checkIfAnimatedGif(file)

        images.value[existingIndex] = {
          name: file.name,
          file,
          preview,
          originalSize: file.size,
          dimensions,
          status: 'pending',
          progress: 0,
          isAnimatedGif,
        }
      } catch (err) {
        console.error('Error processing file:', file.name, err)
      }
    } else {
      // Add new file
      try {
        const dimensions = await getImageDimensions(file)
        const preview = await createImagePreview(file)
        const isAnimatedGif = await checkIfAnimatedGif(file)

        const imageItem: ImageItem = {
          name: file.name,
          file,
          preview,
          originalSize: file.size,
          dimensions,
          status: 'pending',
          progress: 0,
          isAnimatedGif,
        }

        images.value.push(imageItem)
      } catch (err) {
        console.error('Error processing file:', file.name, err)
      }
    }
  }
}

// Image processing utilities
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Check if a GIF file is animated
async function checkIfAnimatedGif(file: File): Promise<boolean> {
  if (file.type !== 'image/gif') {
    return false
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const gif = parseGIF(arrayBuffer)
    const frames = decompressFrames(gif, true)
    return frames.length > 1
  } catch (err) {
    console.error('Error checking if GIF is animated:', err)
    return false
  }
}

// Compression functions
async function compressImage(index: number) {
  const image = images.value[index]
  if (!image) return

  image.status = 'compressing'
  image.progress = 0

  try {
    // Special handling for animated GIFs when keeping original format
    if (image.isAnimatedGif && outputFormat.value === 'original') {
      await compressAnimatedGif(index)
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = image.preview
    })

    // Calculate new dimensions
    let { width, height } = image.dimensions
    if (maxWidth.value && width > maxWidth.value) {
      height = (height * maxWidth.value) / width
      width = maxWidth.value
    }

    canvas.width = width
    canvas.height = height

    // Draw and compress
    ctx?.drawImage(img, 0, 0, width, height)

    // Simulate progress
    for (let progress = 20; progress <= 80; progress += 20) {
      image.progress = progress
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Determine output format
    let mimeType = image.file.type
    if (outputFormat.value !== 'original') {
      mimeType = `image/${outputFormat.value === 'jpg' ? 'jpeg' : outputFormat.value}`
    }

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob!)
        },
        mimeType,
        compressionQuality.value / 100,
      )
    })

    image.progress = 100
    image.compressedBlob = blob
    image.compressedSize = blob.size
    image.savedPercentage = Math.round(
      ((image.originalSize - blob.size) / image.originalSize) * 100,
    )
    image.status = 'completed'
  } catch (err) {
    console.error('Compression error:', err)
    image.status = 'error'
    showError(t('tools.imageCompressor.errors.compressionFailed', { filename: image.name }))
  }
}

// Special compression function for animated GIFs
async function compressAnimatedGif(index: number) {
  const image = images.value[index]
  if (!image || !image.isAnimatedGif) return

  try {
    const arrayBuffer = await image.file.arrayBuffer()
    const gif = parseGIF(arrayBuffer)
    const frames = decompressFrames(gif, true)

    // Create a canvas to process frames
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx) {
      throw new Error('Unable to get canvas context')
    }

    // Set canvas dimensions to match original GIF
    canvas.width = gif.lsd.width
    canvas.height = gif.lsd.height

    // Configure GIF quality based on compression quality
    const quality = Math.max(1, Math.min(30, Math.floor((100 - compressionQuality.value) / 3)))

    // Create new GIF with compression settings
    const newGif = new GIF({
      workers: 2,
      quality: quality,
      width: canvas.width,
      height: canvas.height,
      workerScript: '/gif.worker.js',
    })

    // Process each frame
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i]

      // Update progress
      image.progress = Math.round((i / frames.length) * 90)

      // Create ImageData from frame patch
      const imageData = new ImageData(
        new Uint8ClampedArray(frame.patch),
        frame.dims.width,
        frame.dims.height,
      )

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw frame at its position
      ctx.putImageData(imageData, frame.dims.left, frame.dims.top)

      // Add frame to new GIF
      newGif.addFrame(ctx, {
        copy: true,
        delay: frame.delay,
      })
    }

    // Generate the compressed GIF
    const blob = await new Promise<Blob>((resolve, reject) => {
      newGif.on('finished', (blob: Blob) => {
        resolve(blob)
      })

      newGif.on('error', (error: Error) => {
        reject(error)
      })

      newGif.render()
    })

    image.progress = 100
    image.compressedBlob = blob
    image.compressedSize = blob.size
    image.savedPercentage = Math.round(
      ((image.originalSize - blob.size) / image.originalSize) * 100,
    )
    image.status = 'completed'
  } catch (err) {
    console.error('Animated GIF compression error:', err)
    image.status = 'error'
    showError(t('tools.imageCompressor.errors.compressionFailed', { filename: image.name }))
  }
}

async function compressAll() {
  isCompressing.value = true

  const pendingImages = images.value.map((img, index) => ({ img, index }))

  // Process in batches of 3 to avoid overwhelming the browser
  const batchSize = 3
  for (let i = 0; i < pendingImages.length; i += batchSize) {
    const batch = pendingImages.slice(i, i + batchSize)
    await Promise.all(batch.map(({ index }) => compressImage(index)))
  }

  isCompressing.value = false
  success(t('tools.imageCompressor.success.compressionComplete'))
}

// Download functions
function downloadImage(index: number) {
  const image = images.value[index]
  if (!image.compressedBlob) return

  const url = URL.createObjectURL(image.compressedBlob)
  const link = document.createElement('a')
  link.href = url

  // Generate filename with format suffix
  const extension =
    outputFormat.value === 'original'
      ? image.name.split('.').pop()
      : outputFormat.value === 'jpg'
        ? 'jpg'
        : outputFormat.value

  const baseName = image.name.substring(0, image.name.lastIndexOf('.'))
  link.download = `${baseName}_compressed.${extension}`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function downloadAll() {
  const { default: JSZip } = await import('jszip')

  const zip = new JSZip()
  const compressedImages = images.value.filter(
    (img) => img.status === 'completed' && img.compressedBlob,
  )

  for (const image of compressedImages) {
    if (image.compressedBlob) {
      const extension =
        outputFormat.value === 'original'
          ? image.name.split('.').pop()
          : outputFormat.value === 'jpg'
            ? 'jpg'
            : outputFormat.value

      const baseName = image.name.substring(0, image.name.lastIndexOf('.'))
      const filename = `${baseName}_compressed.${extension}`

      zip.file(filename, image.compressedBlob)
    }
  }

  const content = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(content)
  const link = document.createElement('a')
  link.href = url
  link.download = `compressed_images_${new Date().toISOString().split('T')[0]}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  success(t('tools.imageCompressor.success.downloadComplete'))
}

// Preview functions
function previewImage(index: number) {
  previewImageItem.value = images.value[index]
  showPreviewModal.value = true
}

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function removeImage(index: number) {
  const image = images.value[index]
  URL.revokeObjectURL(image.preview)
  if (image.compressedBlob) {
    URL.revokeObjectURL(URL.createObjectURL(image.compressedBlob))
  }
  images.value.splice(index, 1)
}

function clearAll() {
  images.value.forEach((img) => {
    URL.revokeObjectURL(img.preview)
    if (img.compressedBlob) {
      URL.revokeObjectURL(URL.createObjectURL(img.compressedBlob))
    }
  })
  images.value = []
  // Reset file input to allow selecting the same files again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Keyboard shortcuts
function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return

  const files: File[] = []
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) files.push(file)
    }
  }

  if (files.length > 0) {
    addFiles(files)
    success(t('tools.imageCompressor.success.pasteSuccess'))
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('paste', handlePaste)

  // Drag and drop for whole page
  document.addEventListener('dragenter', (e) => {
    e.preventDefault()
    isDragging.value = true
  })

  document.addEventListener('dragleave', (e) => {
    if (!e.relatedTarget) {
      isDragging.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
  images.value.forEach((img) => {
    URL.revokeObjectURL(img.preview)
    if (img.compressedBlob) {
      URL.revokeObjectURL(URL.createObjectURL(img.compressedBlob))
    }
  })
  // Revoke the compressed preview URL if it exists
  if (compressedPreviewUrl.value) {
    URL.revokeObjectURL(compressedPreviewUrl.value)
  }
})
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
