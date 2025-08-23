<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('tools.backgroundRemover.title') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('tools.backgroundRemover.description') }}
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🎯</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.backgroundRemover.features.aiPowered.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.backgroundRemover.features.aiPowered.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚡</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.backgroundRemover.features.fastProcessing.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.backgroundRemover.features.fastProcessing.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🖼️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.backgroundRemover.features.highQuality.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.backgroundRemover.features.highQuality.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Upload Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.backgroundRemover.upload.title') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="originalImage"
                @click="resetTool"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>

          <!-- File Upload Area -->
          <div
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            :class="{ 'border-blue-400 bg-blue-50': isDragging }"
          >
            <div v-if="!originalImage">
              <div class="text-4xl mb-4">📸</div>
              <h4 class="text-lg font-medium text-gray-900 mb-2">
                {{ $t('tools.backgroundRemover.upload.dragDrop') }}
              </h4>
              <p class="text-gray-600 mb-4">
                {{ $t('tools.backgroundRemover.upload.supportedFormats') }}
              </p>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                class="hidden"
              />
              <button
                @click="() => fileInput?.click()"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {{ $t('tools.backgroundRemover.upload.selectFile') }}
              </button>
            </div>

            <!-- Original Image Preview -->
            <div v-else class="space-y-4">
              <h4 class="font-medium text-gray-900">
                {{ $t('tools.backgroundRemover.preview.original') }}
              </h4>
              <div class="relative">
                <img
                  :src="originalImageUrl"
                  :alt="$t('tools.backgroundRemover.preview.originalAlt')"
                  class="max-w-full max-h-96 mx-auto rounded-lg shadow-sm"
                />
                <!-- Progress overlay -->
                <div
                  v-if="isProcessing"
                  class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg"
                >
                  <div class="text-white text-center">
                    <div class="relative">
                      <div
                        class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"
                      ></div>
                      <div
                        v-if="progress > 0"
                        class="absolute inset-0 flex items-center justify-center"
                      >
                        <span class="text-xs font-bold">{{ Math.round(progress) }}%</span>
                      </div>
                    </div>
                    <p>{{ currentStatus }}</p>
                    <div
                      v-if="progress > 0"
                      class="w-32 bg-gray-200 rounded-full h-1.5 mt-2 mx-auto"
                    >
                      <div
                        class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        :style="{ width: progress + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-600">
                {{ $t('tools.backgroundRemover.imageInfo.size') }}:
                {{ formatFileSize(originalImage.size) }}
              </div>
            </div>
          </div>

          <!-- Advanced Options -->
          <div v-if="originalImage && !processedImage" class="mt-6 space-y-4">
            <h4 class="font-medium text-gray-900">
              {{ $t('tools.backgroundRemover.options.title') }}
            </h4>

            <!-- Model Selection -->
            <div class="space-y-3">
              <label class="text-sm font-medium text-gray-700">{{
                $t('tools.backgroundRemover.options.model')
              }}</label>
              <select
                v-model="options.model"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="small">{{ $t('tools.backgroundRemover.models.small') }}</option>
                <option value="medium">{{ $t('tools.backgroundRemover.models.medium') }}</option>
                <option value="large">{{ $t('tools.backgroundRemover.models.large') }}</option>
              </select>
            </div>

            <!-- Output Format -->
            <div class="space-y-3">
              <label class="text-sm font-medium text-gray-700">{{
                $t('tools.backgroundRemover.options.outputFormat')
              }}</label>
              <div class="space-y-2">
                <label class="flex items-center space-x-3">
                  <input
                    v-model="options.outputFormat"
                    type="radio"
                    value="png"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium"
                    >PNG ({{ $t('tools.backgroundRemover.options.transparent') }})</span
                  >
                </label>
                <label class="flex items-center space-x-3">
                  <input
                    v-model="options.outputFormat"
                    type="radio"
                    value="jpg"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium"
                    >JPG ({{ $t('tools.backgroundRemover.options.whiteBackground') }})</span
                  >
                </label>
                <label class="flex items-center space-x-3">
                  <input
                    v-model="options.outputFormat"
                    type="radio"
                    value="webp"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium"
                    >WebP ({{ $t('tools.backgroundRemover.options.transparent') }})</span
                  >
                </label>
              </div>
            </div>

            <!-- Quality Slider -->
            <div v-if="options.outputFormat !== 'png'" class="space-y-2">
              <label class="text-sm font-medium text-gray-700">
                {{ $t('tools.backgroundRemover.options.quality') }}: {{ options.quality }}%
              </label>
              <input
                v-model="options.quality"
                type="range"
                min="70"
                max="100"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <!-- Background Color Picker -->
            <div v-if="options.outputFormat === 'jpg'" class="space-y-2">
              <label class="text-sm font-medium text-gray-700">{{
                $t('tools.backgroundRemover.options.backgroundColor')
              }}</label>
              <div class="flex space-x-2">
                <input
                  v-model="options.backgroundColor"
                  type="color"
                  class="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  v-model="options.backgroundColor"
                  type="text"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <!-- Process Button -->
            <button
              @click="handleRemoveBackground"
              :disabled="isProcessing"
              class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <span v-if="!isProcessing">{{ $t('tools.backgroundRemover.actions.remove') }}</span>
              <span v-else>{{ currentStatus }}</span>
            </button>
          </div>
        </div>

        <!-- Result Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.backgroundRemover.result.title') }}
            </h3>
            <div v-if="processedImage" class="flex space-x-2">
              <button
                @click="downloadResult"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
              <button
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
            </div>
          </div>

          <div
            v-if="!processedImage && !isProcessing"
            class="h-96 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">✨</div>
              <p>{{ $t('tools.backgroundRemover.result.noResult') }}</p>
            </div>
          </div>

          <!-- Processing Animation -->
          <div
            v-else-if="isProcessing"
            class="h-96 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center max-w-md">
              <div class="relative mb-4">
                <div
                  class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"
                ></div>
                <div v-if="progress > 0" class="absolute inset-0 flex items-center justify-center">
                  <span class="text-sm font-bold text-blue-600">{{ Math.round(progress) }}%</span>
                </div>
              </div>
              <p class="text-gray-600 mb-2 font-medium">{{ currentStatus }}</p>
              <div v-if="progress > 0" class="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: progress + '%' }"
                ></div>
              </div>
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('tools.backgroundRemover.processing.pleaseWait') }}
              </p>
            </div>
          </div>

          <!-- Processed Image -->
          <div v-else-if="processedImage" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">
                    {{ $t('tools.backgroundRemover.result.complete') }}
                  </p>
                  <p class="text-sm text-green-600">
                    {{ $t('tools.backgroundRemover.result.ready') }}
                  </p>
                </div>
              </div>
            </div>

            <h4 class="font-medium text-gray-900">
              {{ $t('tools.backgroundRemover.preview.processed') }}
            </h4>

            <!-- Comparison View -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Before -->
              <div class="space-y-2">
                <h5 class="text-sm font-medium text-gray-700">
                  {{ $t('tools.backgroundRemover.comparison.before') }}
                </h5>
                <div class="relative bg-white rounded-lg overflow-hidden shadow-sm border">
                  <img
                    :src="originalImageUrl"
                    :alt="$t('tools.backgroundRemover.preview.originalAlt')"
                    class="w-full h-48 object-contain"
                  />
                </div>
              </div>

              <!-- After -->
              <div class="space-y-2">
                <h5 class="text-sm font-medium text-gray-700">
                  {{ $t('tools.backgroundRemover.comparison.after') }}
                </h5>
                <div
                  class="relative bg-white rounded-lg overflow-hidden shadow-sm border"
                  style="
                    background-image:
                      linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                      linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                      linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
                    background-size: 20px 20px;
                    background-position:
                      0 0,
                      0 10px,
                      10px -10px,
                      -10px 0px;
                  "
                >
                  <img
                    :src="processedImageUrl"
                    :alt="$t('tools.backgroundRemover.preview.processedAlt')"
                    class="w-full h-48 object-contain"
                  />
                </div>
              </div>
            </div>

            <!-- Image Info -->
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                {{ $t('tools.backgroundRemover.imageInfo.format') }}:
                {{ options.outputFormat.toUpperCase() }}
              </div>
              <div v-if="processedSize">
                {{ $t('tools.backgroundRemover.imageInfo.size') }}:
                {{ formatFileSize(processedSize) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-3">
          💡 {{ $t('tools.backgroundRemover.tips.title') }}
        </h3>
        <ul class="space-y-2 text-blue-800">
          <li class="flex items-start">
            <span class="mr-2">•</span>
            <span>{{ $t('tools.backgroundRemover.tips.tip1') }}</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">•</span>
            <span>{{ $t('tools.backgroundRemover.tips.tip2') }}</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">•</span>
            <span>{{ $t('tools.backgroundRemover.tips.tip3') }}</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">•</span>
            <span>{{ $t('tools.backgroundRemover.tips.tip4') }}</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">•</span>
            <span>{{ $t('tools.backgroundRemover.tips.tip5') }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { removeBackground } from '@imgly/background-removal'
import { useToast } from '@/composables/useToast'

const { success, error: showError, downloadSuccess, copySuccess, copyError } = useToast()

const fileInput = ref<HTMLInputElement>()
const originalImage = ref<File | null>(null)
const originalImageUrl = ref<string>('')
const processedImage = ref<Blob | null>(null)
const processedImageUrl = ref<string>('')
const processedSize = ref<number>(0)
const isProcessing = ref(false)
const isDragging = ref(false)
const progress = ref(0)
const currentStatus = ref('')

const options = reactive({
  model: 'medium' as 'small' | 'medium' | 'large',
  outputFormat: 'png' as 'png' | 'jpg' | 'webp',
  quality: 90,
  backgroundColor: '#ffffff',
})

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

function handleFile(file: File) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showError('Please select a valid image file')
    return
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    showError('Image size must be less than 10MB')
    return
  }

  originalImage.value = file
  originalImageUrl.value = URL.createObjectURL(file)

  // Reset processed image
  if (processedImage.value) {
    URL.revokeObjectURL(processedImageUrl.value)
    processedImage.value = null
    processedImageUrl.value = ''
    processedSize.value = 0
  }
}

async function handleRemoveBackground() {
  if (!originalImage.value) return

  isProcessing.value = true
  progress.value = 0
  currentStatus.value = 'Initializing...'

  try {
    // Create image element for processing
    const img = new Image()
    const imageLoadPromise = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = originalImageUrl.value
    })

    await imageLoadPromise

    // Update progress
    progress.value = 10
    currentStatus.value = 'Loading AI model...'

    // Configure background removal options
    const config = {
      model:
        options.model === 'small'
          ? 'isnet_quint8'
          : options.model === 'large'
            ? 'isnet'
            : 'isnet_fp16',
      output: {
        format:
          options.outputFormat === 'png'
            ? ('image/png' as const)
            : options.outputFormat === 'jpg'
              ? ('image/jpeg' as const)
              : ('image/webp' as const),
        quality: options.quality / 100,
      },
      progress: (key: string, current: number, total: number) => {
        const progressPercent = 10 + (current / total) * 80 // 10-90% for processing
        progress.value = progressPercent

        if (key.includes('model')) {
          currentStatus.value = 'Loading AI model...'
        } else if (key.includes('inference')) {
          currentStatus.value = 'Processing image...'
        } else {
          currentStatus.value = 'Analyzing image...'
        }
      },
    }

    // Remove background using IMG.LY
    const blob = await removeBackground(originalImage.value, config)

    progress.value = 95
    currentStatus.value = 'Finalizing...'

    // Handle different output formats
    let finalBlob: Blob

    if (options.outputFormat === 'jpg') {
      // Convert to JPG with background color
      finalBlob = await convertToJpgWithBackground(blob, options.backgroundColor)
    } else if (options.outputFormat === 'webp') {
      // Convert to WebP
      finalBlob = await convertToWebP(blob, options.quality)
    } else {
      // Keep as PNG
      finalBlob = blob
    }

    processedImage.value = finalBlob
    processedImageUrl.value = URL.createObjectURL(finalBlob)
    processedSize.value = finalBlob.size

    progress.value = 100
    currentStatus.value = 'Complete!'

    setTimeout(() => {
      isProcessing.value = false
      success('Background removed successfully!')
    }, 500)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    showError('Failed to remove background: ' + errorMessage)
    isProcessing.value = false
    progress.value = 0
    currentStatus.value = ''
  }
}

async function convertToJpgWithBackground(blob: Blob, backgroundColor: string): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Fill background
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw image on top
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (result) => {
          resolve(result!)
        },
        'image/jpeg',
        options.quality / 100,
      )
    }

    img.src = URL.createObjectURL(blob)
  })
}

async function convertToWebP(blob: Blob, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (result) => {
          resolve(result!)
        },
        'image/webp',
        quality / 100,
      )
    }

    img.src = URL.createObjectURL(blob)
  })
}

async function copyToClipboard() {
  if (!processedImage.value) return

  try {
    // Create clipboard item
    const clipboardItem = new ClipboardItem({
      [processedImage.value.type]: processedImage.value,
    })

    await navigator.clipboard.write([clipboardItem])
    copySuccess()
  } catch {
    copyError()
  }
}

function downloadResult() {
  if (!processedImage.value) return

  const url = URL.createObjectURL(processedImage.value)
  const link = document.createElement('a')
  link.href = url

  const extension = options.outputFormat === 'jpg' ? 'jpg' : options.outputFormat
  link.download = `background-removed-${Date.now()}.${extension}`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}

function resetTool() {
  if (originalImageUrl.value) {
    URL.revokeObjectURL(originalImageUrl.value)
  }
  if (processedImageUrl.value) {
    URL.revokeObjectURL(processedImageUrl.value)
  }

  originalImage.value = null
  originalImageUrl.value = ''
  processedImage.value = null
  processedImageUrl.value = ''
  processedSize.value = 0
  isProcessing.value = false
  progress.value = 0
  currentStatus.value = ''

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Cleanup URLs on unmount
onUnmounted(() => {
  if (originalImageUrl.value) {
    URL.revokeObjectURL(originalImageUrl.value)
  }
  if (processedImageUrl.value) {
    URL.revokeObjectURL(processedImageUrl.value)
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

/* Custom drag animation */
.border-blue-400 {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    border-color: #60a5fa;
  }
  50% {
    border-color: #3b82f6;
  }
}
</style>
