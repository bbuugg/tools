<template>
  <ToolLayout :title="$t('tools.backgroundRemover.title')" :description="$t('tools.backgroundRemover.description')"
    icon="✂️" :features="[
      $t('tools.backgroundRemover.features.aiPowered.title'),
      $t('tools.backgroundRemover.features.fastProcessing.title'),
      $t('tools.backgroundRemover.features.highQuality.title'),
    ]">
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Upload Section -->
      <div class="glass rounded-xl border border-slate-700/30 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.backgroundRemover.upload.title') }}
          </h3>
          <div class="flex space-x-2">
            <button v-if="originalImage" @click="resetTool"
              class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/30 hover:border-slate-500/50">
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <!-- File Upload Area -->
        <div @drop="handleDrop" @dragover.prevent @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          class="border-2 border-dashed border-slate-600/50 rounded-lg p-8 text-center hover:border-primary-500/50 transition-colors"
          :class="{ 'border-primary-500/50 bg-primary-500/10': isDragging }">
          <div v-if="!originalImage">
            <div class="text-4xl mb-4">📸</div>
            <h4 class="text-lg font-medium text-slate-100 mb-2">
              {{ $t('tools.backgroundRemover.upload.dragDrop') }}
            </h4>
            <p class="text-slate-400 mb-4">
              {{ $t('tools.backgroundRemover.upload.supportedFormats') }}
            </p>
            <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" class="hidden" />
            <button @click="() => fileInput?.click()"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
              {{ $t('tools.backgroundRemover.upload.selectFile') }}
            </button>
          </div>

          <!-- Original Image Preview -->
          <div v-else class="space-y-4">
            <h4 class="font-medium text-slate-100">
              {{ $t('tools.backgroundRemover.preview.original') }}
            </h4>
            <div class="relative">
              <img referrerpolicy="no-referrer" :src="originalImageUrl"
                :alt="$t('tools.backgroundRemover.preview.originalAlt')"
                class="max-w-full max-h-96 mx-auto rounded-lg shadow-sm border border-slate-700/50" />
              <!-- Progress overlay -->
              <div v-if="isProcessing"
                class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div class="text-white text-center">
                  <div class="relative">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <div v-if="progress > 0" class="absolute inset-0 flex items-center justify-center">
                      <span class="text-xs font-bold">{{ Math.round(progress) }}%</span>
                    </div>
                  </div>
                  <p>{{ currentStatus }}</p>
                  <div v-if="progress > 0" class="w-32 bg-slate-700 rounded-full h-1.5 mt-2 mx-auto">
                    <div class="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                      :style="{ width: progress + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-sm text-slate-400">
              {{ $t('tools.backgroundRemover.imageInfo.size') }}:
              {{ formatFileSize(originalImage.size) }}
            </div>
          </div>
        </div>

        <!-- Advanced Options -->
        <div v-if="originalImage && !processedImage" class="mt-6 space-y-5">
          <h4 class="font-medium text-slate-200">
            {{ $t('tools.backgroundRemover.options.title') }}
          </h4>

          <!-- Model Selection -->
          <div class="space-y-3">
            <label class="text-sm font-medium text-slate-300">{{
              $t('tools.backgroundRemover.options.model')
              }}</label>
            <select v-model="options.model"
              class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200">
              <option value="small">{{ $t('tools.backgroundRemover.models.small') }}</option>
              <option value="medium">{{ $t('tools.backgroundRemover.models.medium') }}</option>
              <option value="large">{{ $t('tools.backgroundRemover.models.large') }}</option>
            </select>
          </div>

          <!-- Output Format -->
          <div class="space-y-3">
            <label class="text-sm font-medium text-slate-300">{{
              $t('tools.backgroundRemover.options.outputFormat')
              }}</label>
            <div class="space-y-2">
              <label class="flex items-center space-x-3">
                <input v-model="options.outputFormat" type="radio" value="png"
                  class="text-primary-500 focus:ring-primary-500 bg-slate-800 border-slate-600" />
                <span class="text-sm font-medium text-slate-300">PNG ({{
                  $t('tools.backgroundRemover.options.transparent') }})</span>
              </label>
              <label class="flex items-center space-x-3">
                <input v-model="options.outputFormat" type="radio" value="jpg"
                  class="text-primary-500 focus:ring-primary-500 bg-slate-800 border-slate-600" />
                <span class="text-sm font-medium text-slate-300">JPG ({{
                  $t('tools.backgroundRemover.options.whiteBackground') }})</span>
              </label>
              <label class="flex items-center space-x-3">
                <input v-model="options.outputFormat" type="radio" value="webp"
                  class="text-primary-500 focus:ring-primary-500 bg-slate-800 border-slate-600" />
                <span class="text-sm font-medium text-slate-300">WebP ({{
                  $t('tools.backgroundRemover.options.transparent') }})</span>
              </label>
            </div>
          </div>

          <!-- Quality Slider -->
          <div v-if="options.outputFormat !== 'png'" class="space-y-2">
            <label class="text-sm font-medium text-slate-300">
              {{ $t('tools.backgroundRemover.options.quality') }}: {{ options.quality }}%
            </label>
            <input v-model="options.quality" type="range" min="70" max="100"
              class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" />
          </div>

          <!-- Background Color Picker -->
          <div v-if="options.outputFormat === 'jpg'" class="space-y-2">
            <label class="text-sm font-medium text-slate-300">{{
              $t('tools.backgroundRemover.options.backgroundColor')
              }}</label>
            <div class="flex space-x-2">
              <input v-model="options.backgroundColor" type="color"
                class="w-12 h-8 border border-slate-600 rounded cursor-pointer bg-slate-800" />
              <input v-model="options.backgroundColor" type="text"
                class="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="#ffffff" />
            </div>
          </div>

          <!-- Process Button -->
          <button @click="handleRemoveBackground" :disabled="isProcessing"
            class="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-medium">
            <span v-if="!isProcessing">{{ $t('tools.backgroundRemover.actions.remove') }}</span>
            <span v-else>{{ currentStatus }}</span>
          </button>
        </div>
      </div>

      <!-- Result Section -->
      <div class="glass rounded-xl border border-slate-700/30 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.backgroundRemover.result.title') }}
          </h3>
          <div v-if="processedImage" class="flex space-x-2">
            <button @click="downloadResult"
              class="px-3 py-1 text-sm bg-green-500/10 text-green-300 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30 hover:border-green-500/50">
              {{ $t('common.download') }}
            </button>
            <button @click="copyToClipboard"
              class="px-3 py-1 text-sm bg-blue-500/10 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/30 hover:border-blue-500/50">
              {{ $t('common.copy') }}
            </button>
          </div>
        </div>

        <div v-if="!processedImage && !isProcessing"
          class="h-96 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-lg">
          <div class="text-center">
            <div class="text-3xl mb-2">✨</div>
            <p>{{ $t('tools.backgroundRemover.result.noResult') }}</p>
          </div>
        </div>

        <!-- Processing Animation -->
        <div v-else-if="isProcessing"
          class="h-96 flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-lg">
          <div class="text-center max-w-md">
            <div class="relative mb-4">
              <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto"></div>
              <div v-if="progress > 0" class="absolute inset-0 flex items-center justify-center">
                <span class="text-sm font-bold text-primary-500">{{ Math.round(progress) }}%</span>
              </div>
            </div>
            <p class="text-slate-300 mb-2 font-medium">{{ currentStatus }}</p>
            <div v-if="progress > 0" class="w-64 bg-slate-700 rounded-full h-2 mx-auto">
              <div class="bg-primary-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: progress + '%' }"></div>
            </div>
            <p class="text-sm text-slate-400 mt-2">
              {{ $t('tools.backgroundRemover.processing.pleaseWait') }}
            </p>
          </div>
        </div>

        <!-- Processed Image -->
        <div v-else-if="processedImage" class="space-y-4">
          <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div class="flex items-center">
              <div class="text-green-400 text-2xl mr-3">✅</div>
              <div>
                <p class="font-medium text-green-300">
                  {{ $t('tools.backgroundRemover.result.complete') }}
                </p>
                <p class="text-sm text-green-400">
                  {{ $t('tools.backgroundRemover.result.ready') }}
                </p>
              </div>
            </div>
          </div>

          <h4 class="font-medium text-slate-200">
            {{ $t('tools.backgroundRemover.preview.processed') }}
          </h4>

          <!-- Comparison View -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Before -->
            <div class="space-y-2">
              <h5 class="text-sm font-medium text-slate-300">
                {{ $t('tools.backgroundRemover.comparison.before') }}
              </h5>
              <div class="relative bg-slate-800/50 rounded-lg overflow-hidden shadow-sm border border-slate-700/50">
                <img referrerpolicy="no-referrer" :src="originalImageUrl"
                  :alt="$t('tools.backgroundRemover.preview.originalAlt')" class="w-full h-48 object-contain" />
              </div>
            </div>

            <!-- After -->
            <div class="space-y-2">
              <h5 class="text-sm font-medium text-slate-300">
                {{ $t('tools.backgroundRemover.comparison.after') }}
              </h5>
              <div class="relative bg-slate-800/50 rounded-lg overflow-hidden shadow-sm border border-slate-700/50"
                style="
                  background-image:
                    linear-gradient(45deg, #334155 25%, transparent 25%),
                    linear-gradient(-45deg, #334155 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #334155 75%),
                    linear-gradient(-45deg, transparent 75%, #334155 75%);
                  background-size: 20px 20px;
                  background-position:
                    0 0,
                    0 10px,
                    10px -10px,
                    -10px 0px;
                ">
                <img referrerpolicy="no-referrer" :src="processedImageUrl"
                  :alt="$t('tools.backgroundRemover.preview.processedAlt')" class="w-full h-48 object-contain" />
              </div>
            </div>
          </div>

          <!-- Image Info -->
          <div class="grid grid-cols-2 gap-4 text-sm text-slate-400">
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
    <div class="glass rounded-xl border border-slate-700/30 p-6 mt-6">
      <h3 class="text-lg font-semibold text-slate-100 mb-3">
        💡 {{ $t('tools.backgroundRemover.tips.title') }}
      </h3>
      <ul class="space-y-2 text-slate-300">
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
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { removeBackground } from '@imgly/background-removal'
import { useToast } from '@/composables/useToast'
import ToolLayout from '@/components/ToolLayout.vue'

const { success, error: showError, downloadSuccess, copySuccess, copyError } = useToast()

// Use showError when displaying error messages
function showErrorToast(message: string) {
  showError(message)
}

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
    showErrorToast('Please select a valid image file')
    return
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    showErrorToast('Image size must be less than 10MB')
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
    const config: {
      model?: 'isnet_quint8' | 'isnet' | 'isnet_fp16'
      output?: {
        format?: 'image/png' | 'image/jpeg' | 'image/webp'
        quality?: number
      }
      progress?: (key: string, current: number, total: number) => void
    } = {
      model:
        options.model === 'small'
          ? 'isnet_quint8'
          : options.model === 'large'
            ? 'isnet'
            : 'isnet_fp16',
      output: {
        format:
          options.outputFormat === 'png'
            ? 'image/png'
            : options.outputFormat === 'jpg'
              ? 'image/jpeg'
              : 'image/webp',
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
    showErrorToast('Failed to remove background: ' + errorMessage)
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
