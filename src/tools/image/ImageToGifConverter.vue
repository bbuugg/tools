<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="glass rounded-2xl p-6 mb-8 border border-slate-700/30 shadow-dark-lg">
        <h1 class="text-3xl font-bold text-slate-100 mb-4 text-gradient">
          🖼️ {{ $t('tools.imageToGifConverter.title') }}
        </h1>
        <p class="text-slate-300 text-lg">
          {{ $t('tools.imageToGifConverter.description') }}
        </p>
        <div class="mt-4 p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
          <h3 class="font-semibold text-primary-400 mb-2">
            {{ $t('tools.imageToGifConverter.howToUse.title') }}
          </h3>
          <ol class="list-decimal list-inside space-y-1 text-slate-300">
            <li>{{ $t('tools.imageToGifConverter.howToUse.step1') }}</li>
            <li>{{ $t('tools.imageToGifConverter.howToUse.step2') }}</li>
            <li>{{ $t('tools.imageToGifConverter.howToUse.step3') }}</li>
            <li>{{ $t('tools.imageToGifConverter.howToUse.step4') }}</li>
          </ol>
        </div>
      </div>

      <!-- Upload Section -->
      <div class="glass rounded-2xl p-6 mb-8 border border-slate-700/30 shadow-dark-lg">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-3">
          {{ $t('tools.imageToGifConverter.upload.title') }}
        </h3>

        <!-- File Upload -->
        <div class="mb-6">
          <div @drop="handleFileDrop" @dragover.prevent @dragenter.prevent
            class="border-2 border-dashed border-slate-600/50 rounded-2xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer hover-lift"
            :class="{ 'border-primary-500 bg-primary-500/10': isDragging }" @click="fileInput!.click()">
            <div class="text-slate-400 text-4xl mb-4">🖼️</div>
            <p class="text-slate-300 mb-4">
              {{ $t('tools.imageToGifConverter.upload.dragDrop') }}
            </p>
            <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*" multiple class="hidden" />
            <button
              class="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors hover-lift">
              {{ $t('tools.imageToGifConverter.upload.selectFile') }}
            </button>
            <p class="text-xs text-slate-400 mt-2">
              {{ $t('tools.imageToGifConverter.upload.supportedFormats') }}
            </p>
          </div>
        </div>

        <!-- GIF Settings -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.imageToGifConverter.settings.width') }}
            </label>
            <input v-model.number="gifSettings.width" type="number" min="100" max="800"
              class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.imageToGifConverter.settings.quality') }}
            </label>
            <select v-model="gifSettings.quality"
              class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200">
              <option value="high">
                {{ $t('tools.imageToGifConverter.settings.qualityOptions.high') }}
              </option>
              <option value="medium">
                {{ $t('tools.imageToGifConverter.settings.qualityOptions.medium') }}
              </option>
              <option value="low">
                {{ $t('tools.imageToGifConverter.settings.qualityOptions.low') }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.imageToGifConverter.settings.fps') }}
            </label>
            <input v-model.number="gifSettings.fps" type="number" min="1" max="30"
              class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200" />
          </div>
        </div>
      </div>

      <!-- Image Preview Section -->
      <div v-if="selectedImages.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.imageToGifConverter.preview.title') }}
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Image List -->
          <div>
            <h4 class="text-md font-semibold text-gray-800 mb-3">
              {{ $t('tools.imageToGifConverter.preview.selectedImages') }} ({{
                selectedImages.length
              }})
            </h4>

            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div v-for="(image, index) in selectedImages" :key="index"
                class="flex items-center p-3 border border-gray-200 rounded-lg">
                <div class="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                  <img referrerpolicy="no-referrer" :src="image.url" :alt="image.name"
                    class="w-full h-full object-cover" />
                </div>
                <div class="ml-3 flex-grow min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ image.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(image.file.size) }}</p>
                </div>
                <div class="flex items-center">
                  <input v-model.number="image.delay" type="number" min="0.1" max="10" step="0.1"
                    class="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                    @input="updateImageDelay(index, $event)" />
                  <span class="ml-1 text-xs text-gray-500">s</span>
                  <button @click="removeImage(index)" class="ml-2 text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <button @click="moveImageUp" :disabled="selectedImages.length <= 1"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50">
                {{ $t('tools.imageToGifConverter.preview.moveUp') }}
              </button>
              <button @click="moveImageDown" :disabled="selectedImages.length <= 1"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50">
                {{ $t('tools.imageToGifConverter.preview.moveDown') }}
              </button>
              <button @click="reverseImages" :disabled="selectedImages.length <= 1"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50">
                {{ $t('tools.imageToGifConverter.preview.reverse') }}
              </button>
              <button @click="shuffleImages" :disabled="selectedImages.length <= 1"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50">
                {{ $t('tools.imageToGifConverter.preview.shuffle') }}
              </button>
            </div>
          </div>

          <!-- Controls -->
          <div>
            <div class="space-y-4">
              <div class="flex gap-2">
                <button @click="generateGif" :disabled="isProcessing"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {{
                    isProcessing
                      ? $t('common.loading')
                      : $t('tools.imageToGifConverter.actions.generateGif')
                  }}
                </button>
                <button @click="clearAll"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  {{ $t('common.clear') }}
                </button>
              </div>

              <!-- Loop Count -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  {{ $t('tools.imageToGifConverter.settings.loopCount') }}
                </label>
                <div class="flex items-center gap-2">
                  <input v-model.number="gifSettings.loopCount" type="number" min="0" max="100"
                    class="w-20 px-2 py-1 border border-gray-300 rounded text-sm" />
                  <span class="text-sm text-gray-500">
                    (0 = {{ $t('tools.imageToGifConverter.settings.infinite') }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Processing Status -->
      <div v-if="isProcessing" class="glass rounded-2xl p-6 mb-8 border border-slate-700/30 shadow-dark-lg">
        <div class="text-center">
          <div class="relative mx-auto mb-4">
            <div class="w-16 h-16 border-4 border-slate-700 border-t-primary-500 rounded-full animate-spin"></div>
            <div
              class="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary-400 rounded-full animate-spin"
              style="animation-direction: reverse; animation-duration: 1s"></div>
          </div>
          <h3 class="text-lg font-semibold text-slate-100 mb-2">
            {{ $t('tools.imageToGifConverter.processing.title') }}
          </h3>
          <p class="text-slate-300">
            {{ $t('tools.imageToGifConverter.processing.description') }}
          </p>
          <div class="mt-4 bg-slate-700/50 rounded-full h-2">
            <div class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: processingProgress + '%' }"></div>
          </div>
          <p class="text-sm text-slate-400 mt-2">{{ processingProgress }}%</p>

          <!-- Preview of generated GIF -->
          <div v-if="generatedGif" class="mt-6">
            <h4 class="text-md font-medium text-slate-200 mb-2">
              {{ $t('tools.imageToGifConverter.processing.preview') }}
            </h4>
            <img referrerpolicy="no-referrer" :src="generatedGif" alt="GIF Preview"
              class="max-w-full h-auto mx-auto rounded-xl shadow-dark-lg" style="max-height: 200px" />
          </div>
        </div>
      </div>

      <!-- Result Section -->
      <div v-if="generatedGif" class="glass rounded-2xl p-6 mb-8 border border-slate-700/30 shadow-dark-lg">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-3">
          {{ $t('tools.imageToGifConverter.result.title') }}
        </h3>

        <div class="text-center">
          <img referrerpolicy="no-referrer" :src="generatedGif" alt="Generated GIF"
            class="max-w-full h-auto mx-auto rounded-xl shadow-dark-lg mb-4" />

          <div class="flex justify-center gap-4">
            <button @click="downloadGif"
              class="px-6 py-2 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-colors hover-lift">
              {{ $t('tools.imageToGifConverter.result.download') }}
            </button>
            <button @click="resetTool"
              class="px-6 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors hover-lift">
              {{ $t('tools.imageToGifConverter.result.createNew') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="bg-warning-500/10 border-l-4 border-warning-500 p-4 mb-8 rounded-xl">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-warning-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-warning-400">
              {{ $t('tools.imageToGifConverter.tips.title') }}
            </h3>
            <div class="mt-2 text-sm text-slate-300">
              <ul class="list-disc list-inside space-y-1">
                <li>{{ $t('tools.imageToGifConverter.tips.tip1') }}</li>
                <li>{{ $t('tools.imageToGifConverter.tips.tip2') }}</li>
                <li>{{ $t('tools.imageToGifConverter.tips.tip3') }}</li>
                <li>{{ $t('tools.imageToGifConverter.tips.tip4') }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="glass p-6 rounded-2xl shadow-dark-lg border-l-4 border-primary-500">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            🖼️ {{ $t('tools.imageToGifConverter.features.conversion.title') }}
          </h3>
          <p class="text-slate-300 text-sm">
            {{ $t('tools.imageToGifConverter.features.conversion.description') }}
          </p>
        </div>

        <div class="glass p-6 rounded-2xl shadow-dark-lg border-l-4 border-success-500">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            ⚙️ {{ $t('tools.imageToGifConverter.features.customization.title') }}
          </h3>
          <p class="text-slate-300 text-sm">
            {{ $t('tools.imageToGifConverter.features.customization.description') }}
          </p>
        </div>

        <div class="glass p-6 rounded-2xl shadow-dark-lg border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            🔄 {{ $t('tools.imageToGifConverter.features.animation.title') }}
          </h3>
          <p class="text-slate-300 text-sm">
            {{ $t('tools.imageToGifConverter.features.animation.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
// @ts-expect-error No type definitions available for gif.js
import GIF from 'gif.js'

interface GifSettings {
  width: number
  quality: 'high' | 'medium' | 'low'
  fps: number
  loopCount: number
}

interface SelectedImage {
  file: File
  url: string
  name: string
  delay: number
}

const { t } = useI18n()
const { success, error } = useToast()

// Clipboard paste support
onMounted(() => {
  document.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
  // Clean up object URLs
  selectedImages.value.forEach((image) => {
    URL.revokeObjectURL(image.url)
  })
  if (generatedGif.value) {
    URL.revokeObjectURL(generatedGif.value)
  }
})

async function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return

  const imageFiles: File[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile()
      if (blob) {
        // Create a File object from the blob
        const file = new File([blob], `pasted-image-${Date.now()}.png`, {
          type: blob.type,
        })
        imageFiles.push(file)
      }
    }
  }

  if (imageFiles.length > 0) {
    await addImageFiles(imageFiles)
    success(t('tools.imageToGifConverter.messages.filesPasted', { count: imageFiles.length }))
  }
}

// Reactive data
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const isProcessing = ref(false)
const processingProgress = ref(0)
const generatedGif = ref('')
const selectedImages = ref<SelectedImage[]>([])

const gifSettings = reactive<GifSettings>({
  width: 300,
  quality: 'medium',
  fps: 2,
  loopCount: 0, // 0 = infinite
})

// File handling
function handleFileDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length > 0) {
      addImageFiles(imageFiles)
    } else {
      error(t('tools.imageToGifConverter.errors.noImages'))
    }
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length > 0) {
      addImageFiles(imageFiles)
    } else {
      error(t('tools.imageToGifConverter.errors.noImages'))
    }
  }

  // Reset input to allow selecting the same file again
  if (target) {
    target.value = ''
  }
}

async function addImageFiles(files: File[]) {
  try {
    for (const file of files) {
      const url = URL.createObjectURL(file)
      selectedImages.value.push({
        file,
        url,
        name: file.name,
        delay: 1.0, // Default 1 second delay
      })
    }

    success(t('tools.imageToGifConverter.messages.filesAdded', { count: files.length }))
  } catch (err) {
    console.error('Error adding image files:', err)
    error(t('tools.imageToGifConverter.errors.fileProcessing'))
  }
}

function removeImage(index: number) {
  const image = selectedImages.value[index]
  if (image) {
    URL.revokeObjectURL(image.url)
    selectedImages.value.splice(index, 1)
  }
}

function clearAll() {
  // Revoke all object URLs
  selectedImages.value.forEach((image) => {
    URL.revokeObjectURL(image.url)
  })
  selectedImages.value = []

  if (generatedGif.value) {
    URL.revokeObjectURL(generatedGif.value)
    generatedGif.value = ''
  }

  success(t('tools.imageToGifConverter.messages.cleared'))
}

function updateImageDelay(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const delay = parseFloat(target.value)
  if (!isNaN(delay) && delay > 0) {
    selectedImages.value[index].delay = delay
  }
}

// Image ordering functions
function moveImageUp() {
  if (selectedImages.value.length <= 1) return

  const first = selectedImages.value[0]
  selectedImages.value.shift()
  selectedImages.value.push(first)
}

function moveImageDown() {
  if (selectedImages.value.length <= 1) return

  const last = selectedImages.value.pop()
  if (last) {
    selectedImages.value.unshift(last)
  }
}

function reverseImages() {
  if (selectedImages.value.length <= 1) return

  selectedImages.value.reverse()
}

function shuffleImages() {
  if (selectedImages.value.length <= 1) return

  // Fisher-Yates shuffle algorithm
  for (let i = selectedImages.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[selectedImages.value[i], selectedImages.value[j]] = [
        selectedImages.value[j],
        selectedImages.value[i],
      ]
  }
}

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// GIF generation
async function generateGif() {
  if (selectedImages.value.length === 0) {
    error(t('tools.imageToGifConverter.errors.noImagesSelected'))
    return
  }

  isProcessing.value = true
  processingProgress.value = 0

  try {
    await createGifFromImages()
    success(t('tools.imageToGifConverter.messages.gifGenerated'))
  } catch (err) {
    console.error('Error generating GIF:', err)
    error(t('tools.imageToGifConverter.errors.processingFailed') + ': ' + (err as Error).message)
  } finally {
    isProcessing.value = false
  }
}

async function createGifFromImages() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Unable to get canvas context. Your browser may not support this feature.')
  }

  // Set canvas dimensions
  canvas.width = gifSettings.width
  canvas.height = gifSettings.width // Square by default, will adjust based on images

  // Configure GIF quality based on settings
  const qualityMap = {
    high: 1,
    medium: 10,
    low: 20,
  }

  // Create GIF
  const gif = new GIF({
    workers: 2,
    quality: qualityMap[gifSettings.quality],
    width: canvas.width,
    height: canvas.height,
    workerScript: '/gif.worker.js',
  })

  const totalImages = selectedImages.value.length
  let processedImages = 0

  // Process each image
  for (const image of selectedImages.value) {
    try {
      const img = new Image()
      const imageLoaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = image.url
      })

      // Wait for image to load
      await imageLoaded

      // Adjust canvas height based on image aspect ratio
      const aspectRatio = img.height / img.width
      canvas.height = Math.round(canvas.width * aspectRatio)

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Add frame to GIF with delay in milliseconds
      const delayMs = Math.round(image.delay * 1000)
      gif.addFrame(canvas, { copy: true, delay: delayMs })

      processedImages++
      processingProgress.value = Math.round((processedImages / totalImages) * 100)
    } catch (err) {
      console.error('Error processing image:', image.name, err)
      // Continue with next image instead of stopping the whole process
    }
  }

  // Render GIF
  return new Promise<void>((resolve, reject) => {
    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob)
      generatedGif.value = url
      processingProgress.value = 100
      resolve()
    })

    gif.on('abort', () => {
      reject(new Error('GIF generation was aborted'))
    })

    gif.on('error', (error: Error) => {
      reject(new Error('GIF generation error: ' + error.message))
    })

    try {
      gif.render()
    } catch (error) {
      reject(new Error('Failed to start GIF rendering: ' + (error as Error).message))
    }
  })
}

function downloadGif() {
  if (!generatedGif.value) return

  const link = document.createElement('a')
  link.href = generatedGif.value
  link.download = `image-to-gif-${Date.now()}.gif`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function resetTool() {
  clearAll()
  processingProgress.value = 0

  // Reset settings to defaults
  gifSettings.width = 300
  gifSettings.quality = 'medium'
  gifSettings.fps = 2
  gifSettings.loopCount = 0

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
/* Custom styles */
img {
  background-color: #1e293b;
}

/* Loading animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Text gradient effect */
.text-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Hover lift effect */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

/* Glass effect utilities */
.glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.glass:hover {
  background: rgba(15, 23, 42, 0.8);
}

/* Shadow utilities */
.shadow-dark-lg {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 5px 10px rgba(0, 0, 0, 0.2);
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
</style>
