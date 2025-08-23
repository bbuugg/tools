<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ $t('tools.apngGenerator.title') }}
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('tools.apngGenerator.description') }}
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
            <div class="text-6xl text-gray-400">🎬</div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ $t('tools.apngGenerator.uploadTitle') }}
              </h3>
              <p class="text-gray-600">
                {{ $t('tools.apngGenerator.uploadDescription') }}
              </p>
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('tools.apngGenerator.supportedFormats') }}: JPG, PNG, WebP, GIF
              </p>
            </div>
            <button
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ $t('tools.apngGenerator.selectFiles') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Animation Settings -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.apngGenerator.settings') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Frame Delay -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.apngGenerator.frameDelay') }}: {{ frameDelay }}ms
            </label>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              v-model="frameDelay"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>50ms</span>
              <span>2000ms</span>
            </div>
          </div>

          <!-- Loop Count -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.apngGenerator.loopCount') }}
            </label>
            <select
              v-model="loopCount"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0">{{ $t('tools.apngGenerator.infinite') }}</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </div>

          <!-- Output Width -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.apngGenerator.outputWidth') }} (px)
            </label>
            <input
              type="number"
              v-model="outputWidth"
              placeholder="Auto"
              min="100"
              max="2048"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Output Height -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.apngGenerator.outputHeight') }} (px)
            </label>
            <input
              type="number"
              v-model="outputHeight"
              placeholder="Auto"
              min="100"
              max="2048"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Advanced Options -->
        <div class="mt-6 pt-4 border-t border-gray-200">
          <h4 class="text-md font-medium text-gray-900 mb-3">
            {{ $t('tools.apngGenerator.advancedOptions') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="flex items-center">
              <input type="checkbox" v-model="maintainAspectRatio" class="mr-2" />
              <span class="text-sm text-gray-700">{{
                $t('tools.apngGenerator.maintainAspectRatio')
              }}</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="optimizeSize" class="mr-2" />
              <span class="text-sm text-gray-700">{{
                $t('tools.apngGenerator.optimizeSize')
              }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Frame List -->
      <div v-if="frames.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ $t('tools.apngGenerator.frameList') }} ({{ frames.length }})
          </h3>
          <div class="flex gap-3">
            <button
              @click="generateAPNG"
              :disabled="isGenerating || frames.length < 2"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isGenerating" class="flex items-center">
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
                {{ $t('tools.apngGenerator.generating') }}
              </span>
              <span v-else>{{ $t('tools.apngGenerator.generateAPNG') }}</span>
            </button>
            <button
              @click="previewAnimation"
              :disabled="frames.length < 2"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('tools.apngGenerator.preview') }}
            </button>
            <button
              @click="clearFrames"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <!-- Frame Items -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
            v-for="(frame, index) in frames"
            :key="index"
            class="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
          >
            <div class="aspect-square relative">
              <img
                :src="frame.preview"
                :alt="`Frame ${index + 1}`"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity"
              >
                <div
                  class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    @click="removeFrame(index)"
                    class="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="p-2 text-center">
              <div class="text-xs text-gray-500 truncate">{{ frame.name }}</div>
              <div class="text-xs text-gray-400">{{ index + 1 }}</div>
            </div>
          </div>
        </div>

        <!-- Reorder Instructions -->
        <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-sm text-blue-700">
            {{ $t('tools.apngGenerator.reorderHint') }}
          </p>
        </div>
      </div>

      <!-- Preview Area -->
      <div v-if="previewUrl" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ $t('tools.apngGenerator.animationPreview') }}
        </h3>
        <div class="text-center">
          <img
            :src="previewUrl"
            alt="APNG Preview"
            class="max-w-full max-h-96 mx-auto border border-gray-200 rounded-lg"
          />
          <div class="mt-4 flex justify-center gap-4">
            <button
              @click="downloadAPNG"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {{ $t('tools.apngGenerator.downloadAPNG') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="bg-white rounded-lg shadow-md p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ $t('tools.apngGenerator.features.title') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="text-4xl mb-4">🎨</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              {{ $t('tools.apngGenerator.features.highQuality.title') }}
            </h3>
            <p class="text-gray-600">
              {{ $t('tools.apngGenerator.features.highQuality.description') }}
            </p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-4">⚙️</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              {{ $t('tools.apngGenerator.features.customizable.title') }}
            </h3>
            <p class="text-gray-600">
              {{ $t('tools.apngGenerator.features.customizable.description') }}
            </p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-4">🚀</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              {{ $t('tools.apngGenerator.features.easyToUse.title') }}
            </h3>
            <p class="text-gray-600">
              {{ $t('tools.apngGenerator.features.easyToUse.description') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '../../composables/useToast'
import { ModernAPNGGenerator, CanvasAnimator } from '../../utils/apng'

interface Frame {
  file: File
  preview: string
  name: string
}

const { success, error: showError, info } = useToast()

// Reactive state
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const frames = ref<Frame[]>([])
const isGenerating = ref(false)
const previewUrl = ref<string>('')

// Animation settings
const frameDelay = ref(500)
const loopCount = ref(0)
const outputWidth = ref<number>()
const outputHeight = ref<number>()
const maintainAspectRatio = ref(true)
const optimizeSize = ref(true)

// Computed properties
const canGenerate = computed(() => frames.value.length >= 2 && !isGenerating.value)

// File handling
const openFileSelector = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = async (files: File[]) => {
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    showError('Please select valid image files')
    return
  }

  for (const file of imageFiles) {
    const preview = await createImagePreview(file)
    if (preview) {
      frames.value.push({
        file,
        preview,
        name: file.name,
      })
    }
  }

  success(`Added ${imageFiles.length} frames to animation`)
}

const createImagePreview = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

const removeFrame = (index: number) => {
  frames.value.splice(index, 1)
  info('Frame removed')
}

const clearFrames = () => {
  frames.value = []
  previewUrl.value = ''
  info('All frames cleared')
}

// APNG Generation
const generateAPNG = async () => {
  if (!canGenerate.value) return

  isGenerating.value = true

  try {
    const options = {
      frameDelay: frameDelay.value,
      loopCount: loopCount.value,
      width: outputWidth.value,
      height: outputHeight.value,
      maintainAspectRatio: maintainAspectRatio.value,
    }

    const blob = await ModernAPNGGenerator.generateFromImages(
      frames.value.map((f) => f.file),
      options,
    )

    // Clean up previous URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }

    previewUrl.value = URL.createObjectURL(blob)

    success('APNG generated successfully!')
  } catch (error) {
    console.error('Error generating APNG:', error)
    showError('Failed to generate APNG. Please try again.')
  } finally {
    isGenerating.value = false
  }
}

const previewAnimation = async () => {
  if (frames.value.length < 2) return

  try {
    // Create a canvas preview of the animation
    const canvas = document.createElement('canvas')
    const firstImage = new Image()

    firstImage.onload = async () => {
      canvas.width = outputWidth.value || firstImage.naturalWidth
      canvas.height = outputHeight.value || firstImage.naturalHeight

      const animator = new CanvasAnimator(canvas)
      animator.setFrameDelay(frameDelay.value)

      // Add all frames to animator
      for (const frame of frames.value) {
        await animator.addFrame(frame.preview)
      }

      // Start animation
      animator.start()

      // Convert canvas to blob for preview
      canvas.toBlob((blob) => {
        if (blob) {
          if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value)
          }
          previewUrl.value = URL.createObjectURL(blob)
        }
      })
    }

    firstImage.src = frames.value[0].preview
  } catch (error) {
    console.error('Error creating preview:', error)
    showError('Failed to create preview')
  }
}

const downloadAPNG = () => {
  if (!previewUrl.value) return

  const link = document.createElement('a')
  link.href = previewUrl.value
  link.download = `animation-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  success('APNG downloaded successfully!')
}

// Drag and drop handling
const handleDragEnter = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

onMounted(() => {
  document.addEventListener('dragenter', handleDragEnter)
  document.addEventListener('dragleave', handleDragLeave)
})

onUnmounted(() => {
  document.removeEventListener('dragenter', handleDragEnter)
  document.removeEventListener('dragleave', handleDragLeave)

  // Clean up object URLs
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped>
.slider {
  background: linear-gradient(to right, #ddd 0%, #ddd var(--value), #ccc var(--value), #ccc 100%);
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
