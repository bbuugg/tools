<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ $t('tools.imageCompressor.title') }}
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('tools.imageCompressor.description') }}
        </p>
      </div>

      <!-- Upload Area -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          @click="openFileSelector"
          :class="[
            'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          ]"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileSelect"
            class="hidden"
          />
          <div class="space-y-4">
            <div class="text-6xl text-gray-400">📸</div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ $t('tools.imageCompressor.uploadTitle') }}
              </h3>
              <p class="text-gray-600">
                {{ $t('tools.imageCompressor.uploadDescription') }}
              </p>
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('tools.imageCompressor.supportedFormats') }}: JPG, PNG, WebP, GIF
              </p>
            </div>
            <button
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ $t('tools.imageCompressor.selectFiles') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Panel -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.imageCompressor.settings') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Quality Settings -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.imageCompressor.quality') }}: {{ compressionQuality }}%
            </label>
            <input
              type="range"
              min="10"
              max="95"
              v-model="compressionQuality"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>{{ $t('tools.imageCompressor.smaller') }}</span>
              <span>{{ $t('tools.imageCompressor.larger') }}</span>
            </div>
          </div>

          <!-- Output Format -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.imageCompressor.outputFormat') }}
            </label>
            <select
              v-model="outputFormat"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="original">{{ $t('tools.imageCompressor.keepOriginal') }}</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

          <!-- Max Width -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.imageCompressor.maxWidth') }} (px)
            </label>
            <input
              type="number"
              v-model="maxWidth"
              placeholder="留空保持原尺寸"
              min="100"
              max="4096"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Images List -->
      <div v-if="images.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ $t('tools.imageCompressor.imageList') }} ({{ images.length }})
          </h3>
          <div class="flex gap-3">
            <button
              @click="compressAll"
              :disabled="isCompressing"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isCompressing" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ $t('tools.imageCompressor.compressing') }}
              </span>
              <span v-else>{{ $t('tools.imageCompressor.compressAll') }}</span>
            </button>
            <button
              @click="downloadAll"
              :disabled="!hasCompressedImages"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('tools.imageCompressor.downloadAll') }}
            </button>
            <button
              @click="clearAll"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <!-- Statistics -->
        <div
          v-if="compressionStats.totalOriginalSize > 0"
          class="mb-6 p-4 bg-green-50 rounded-lg border border-green-200"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-green-700">
                {{ formatFileSize(compressionStats.totalOriginalSize) }}
              </div>
              <div class="text-sm text-green-600">
                {{ $t('tools.imageCompressor.originalSize') }}
              </div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-700">
                {{ formatFileSize(compressionStats.totalCompressedSize) }}
              </div>
              <div class="text-sm text-green-600">
                {{ $t('tools.imageCompressor.compressedSize') }}
              </div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-700">
                {{ compressionStats.savedPercentage }}%
              </div>
              <div class="text-sm text-green-600">{{ $t('tools.imageCompressor.spaceSaved') }}</div>
            </div>
          </div>
        </div>

        <!-- Image Items -->
        <div class="space-y-4">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center space-x-4">
              <!-- Thumbnail -->
              <div class="flex-shrink-0">
                <img
                  :src="image.preview"
                  :alt="image.name"
                  class="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 truncate">{{ image.name }}</h4>
                <p class="text-sm text-gray-500">
                  {{ image.dimensions.width }} × {{ image.dimensions.height }} px
                </p>
                <div class="flex items-center space-x-4 mt-1">
                  <span class="text-sm text-gray-600">
                    {{ $t('tools.imageCompressor.original') }}:
                    {{ formatFileSize(image.originalSize) }}
                  </span>
                  <span v-if="image.compressedSize" class="text-sm text-green-600">
                    {{ $t('tools.imageCompressor.compressed') }}:
                    {{ formatFileSize(image.compressedSize) }}
                  </span>
                  <span v-if="image.savedPercentage" class="text-sm font-medium text-green-700">
                    -{{ image.savedPercentage }}%
                  </span>
                </div>
              </div>

              <!-- Status & Actions -->
              <div class="flex-shrink-0 flex items-center space-x-3">
                <!-- Status -->
                <div class="text-center">
                  <div
                    :class="[
                      'w-3 h-3 rounded-full mx-auto mb-1',
                      image.status === 'pending'
                        ? 'bg-gray-400'
                        : image.status === 'compressing'
                          ? 'bg-yellow-400'
                          : image.status === 'completed'
                            ? 'bg-green-400'
                            : 'bg-red-400',
                    ]"
                  ></div>
                  <span class="text-xs text-gray-600">
                    {{ $t(`tools.imageCompressor.status.${image.status}`) }}
                  </span>
                </div>

                <!-- Progress -->
                <div v-if="image.status === 'compressing'" class="w-16">
                  <div class="bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${image.progress}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex space-x-2">
                  <button
                    v-if="image.status === 'pending' || image.status === 'error'"
                    @click="compressImage(index)"
                    :disabled="isCompressing"
                    class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {{ $t('tools.imageCompressor.compress') }}
                  </button>
                  <button
                    v-if="image.status === 'completed' && image.compressedBlob"
                    @click="downloadImage(index)"
                    class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    {{ $t('common.download') }}
                  </button>
                  <button
                    @click="removeImage(index)"
                    class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    {{ $t('tools.imageCompressor.remove') }}
                  </button>
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
            🚀 {{ $t('tools.imageCompressor.features.efficient.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageCompressor.features.efficient.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🔒 {{ $t('tools.imageCompressor.features.secure.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageCompressor.features.secure.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            ⚡ {{ $t('tools.imageCompressor.features.batch.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageCompressor.features.batch.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

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

// File handling
function openFileSelector() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    addFiles(Array.from(files))
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
    // Check if file already exists
    if (images.value.some((img) => img.name === file.name && img.originalSize === file.size)) {
      continue
    }

    try {
      const dimensions = await getImageDimensions(file)
      const preview = await createImagePreview(file)

      const imageItem: ImageItem = {
        name: file.name,
        file,
        preview,
        originalSize: file.size,
        dimensions,
        status: 'pending',
        progress: 0,
      }

      images.value.push(imageItem)
    } catch (err) {
      console.error('Error processing file:', file.name, err)
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

// Compression functions
async function compressImage(index: number) {
  const image = images.value[index]
  if (!image || image.status === 'compressing') return

  image.status = 'compressing'
  image.progress = 0

  try {
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

async function compressAll() {
  isCompressing.value = true

  const pendingImages = images.value
    .map((img, index) => ({ img, index }))
    .filter(({ img }) => img.status === 'pending' || img.status === 'error')

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
  images.value.splice(index, 1)
}

function clearAll() {
  images.value.forEach((img) => URL.revokeObjectURL(img.preview))
  images.value = []
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
  images.value.forEach((img) => URL.revokeObjectURL(img.preview))
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
