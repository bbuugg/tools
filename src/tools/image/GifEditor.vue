<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">🎞️ {{ $t('tools.gifEditor.title') }}</h1>
        <p class="text-gray-600 text-lg">
          {{ $t('tools.gifEditor.description') }}
        </p>
        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 class="font-semibold text-blue-800 mb-2">
            {{ $t('tools.gifEditor.howToUse.title') }}
          </h3>
          <ol class="list-decimal list-inside space-y-1 text-blue-700">
            <li>{{ $t('tools.gifEditor.howToUse.step1') }}</li>
            <li>{{ $t('tools.gifEditor.howToUse.step2') }}</li>
            <li>{{ $t('tools.gifEditor.howToUse.step3') }}</li>
            <li>{{ $t('tools.gifEditor.howToUse.step4') }}</li>
          </ol>
        </div>
      </div>

      <!-- Upload Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.gifEditor.upload.title') }}
        </h3>

        <!-- File Upload -->
        <div class="mb-6">
          <div
            @drop="handleFileDrop"
            @dragover.prevent
            @dragenter.prevent
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            :class="{ 'border-blue-400 bg-blue-50': isDragging }"
            @click="fileInput!.click()"
          >
            <div class="text-gray-400 text-4xl mb-4">🎞️</div>
            <p class="text-gray-600 mb-4">
              {{ $t('tools.gifEditor.upload.dragDrop') }}
            </p>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/gif"
              class="hidden"
            />
            <button
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ $t('tools.gifEditor.upload.selectFile') }}
            </button>
            <p class="text-xs text-gray-500 mt-2">
              {{ $t('tools.gifEditor.upload.supportedFormats') }}
            </p>
          </div>
        </div>

        <!-- GIF Settings -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.gifEditor.settings.width') }}
            </label>
            <input
              v-model.number="gifSettings.width"
              type="number"
              min="100"
              max="800"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled
            />
            <p class="text-xs text-gray-500 mt-1">
              {{ $t('tools.gifEditor.settings.preserveOriginal') }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.gifEditor.settings.quality') }}
            </label>
            <select
              v-model="gifSettings.quality"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="high">
                {{ $t('tools.gifEditor.settings.qualityOptions.high') }}
              </option>
              <option value="medium">
                {{ $t('tools.gifEditor.settings.qualityOptions.medium') }}
              </option>
              <option value="low">
                {{ $t('tools.gifEditor.settings.qualityOptions.low') }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.gifEditor.settings.fps') }}
            </label>
            <input
              v-model.number="gifSettings.fps"
              type="number"
              min="1"
              max="30"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- GIF Preview Section -->
      <div v-if="selectedGif" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.gifEditor.preview.title') }}
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- GIF Preview -->
          <div>
            <h4 class="text-md font-semibold text-gray-800 mb-3">
              {{ $t('tools.gifEditor.preview.originalGif') }}
            </h4>
            <div class="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg">
              <img
                v-if="selectedGif.url"
                :src="selectedGif.url"
                :alt="selectedGif.name"
                class="max-h-full max-w-full object-contain"
              />
              <div v-else class="text-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
                ></div>
                <p class="mt-2 text-gray-600">{{ $t('tools.gifEditor.loadingGif') }}</p>
              </div>
            </div>
            <div class="mt-2 text-sm text-gray-500">
              {{ $t('tools.gifEditor.preview.dimensions') }}: {{ selectedGif.width }} ×
              {{ selectedGif.height }} {{ $t('tools.gifEditor.preview.pixels') }}
            </div>
          </div>

          <!-- Frame Controls -->
          <div>
            <h4 class="text-md font-semibold text-gray-800 mb-3">
              {{ $t('tools.gifEditor.preview.frames') }} ({{ frames.length }})
            </h4>

            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="(frame, index) in frames"
                :key="index"
                class="flex items-center p-3 border border-gray-200 rounded-lg"
              >
                <div class="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    :src="frame.dataUrl"
                    :alt="`Frame ${index + 1}`"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="ml-3 flex-grow min-w-0">
                  <p class="text-sm font-medium text-gray-900">
                    {{ $t('tools.gifEditor.preview.frame') }} {{ index + 1 }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ $t('tools.gifEditor.preview.delay') }}: {{ frame.delay }}ms
                  </p>
                </div>
                <div class="flex items-center">
                  <input
                    v-model.number="frame.delay"
                    type="number"
                    min="20"
                    max="5000"
                    step="10"
                    class="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                    @input="updateFrameDelay(index, $event)"
                  />
                  <span class="ml-1 text-xs text-gray-500">ms</span>
                  <button @click="removeFrame(index)" class="ml-2 text-red-500 hover:text-red-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <button
                @click="moveFrameUp"
                :disabled="frames.length <= 1"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
              >
                {{ $t('tools.gifEditor.preview.moveUp') }}
              </button>
              <button
                @click="moveFrameDown"
                :disabled="frames.length <= 1"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
              >
                {{ $t('tools.gifEditor.preview.moveDown') }}
              </button>
              <button
                @click="reverseFrames"
                :disabled="frames.length <= 1"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
              >
                {{ $t('tools.gifEditor.preview.reverse') }}
              </button>
              <button
                @click="shuffleFrames"
                :disabled="frames.length <= 1"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
              >
                {{ $t('tools.gifEditor.preview.shuffle') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex flex-wrap gap-3">
          <button
            @click="generateGif"
            :disabled="isProcessing || frames.length === 0"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isProcessing ? $t('common.loading') : $t('tools.gifEditor.actions.generateGif') }}
          </button>
          <button
            @click="clearAll"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {{ $t('common.clear') }}
          </button>
        </div>
      </div>

      <!-- Processing Status -->
      <div v-if="isProcessing" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          ></div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ $t('tools.gifEditor.processing.title') }}
          </h3>
          <p class="text-gray-600">
            {{ $t('tools.gifEditor.processing.description') }}
          </p>
          <div class="mt-4 bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: processingProgress + '%' }"
            ></div>
          </div>
          <p class="text-sm text-gray-500 mt-2">{{ processingProgress }}%</p>

          <!-- Preview of generated GIF -->
          <div v-if="generatedGif" class="mt-6">
            <h4 class="text-md font-medium text-gray-800 mb-2">
              {{ $t('tools.gifEditor.processing.preview') }}
            </h4>
            <img
              :src="generatedGif"
              alt="GIF Preview"
              class="max-w-full h-auto mx-auto rounded-lg shadow-lg"
              style="max-height: 200px"
            />
          </div>
        </div>
      </div>

      <!-- Result Section -->
      <div v-if="generatedGif" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.gifEditor.result.title') }}
        </h3>

        <div class="text-center">
          <img
            :src="generatedGif"
            alt="Generated GIF"
            class="max-w-full h-auto mx-auto rounded-lg shadow-lg mb-4"
          />

          <div class="flex justify-center gap-4">
            <button
              @click="downloadGif"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {{ $t('tools.gifEditor.result.download') }}
            </button>
            <button
              @click="resetTool"
              class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {{ $t('tools.gifEditor.result.createNew') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">
              {{ $t('tools.gifEditor.tips.title') }}
            </h3>
            <div class="mt-2 text-sm text-yellow-700">
              <ul class="list-disc list-inside space-y-1">
                <li>{{ $t('tools.gifEditor.tips.tip1') }}</li>
                <li>{{ $t('tools.gifEditor.tips.tip2') }}</li>
                <li>{{ $t('tools.gifEditor.tips.tip3') }}</li>
                <li>{{ $t('tools.gifEditor.tips.tip4') }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🎞️ {{ $t('tools.gifEditor.features.frameEditing.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.gifEditor.features.frameEditing.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            ⚙️ {{ $t('tools.gifEditor.features.customization.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.gifEditor.features.customization.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🔄 {{ $t('tools.gifEditor.features.animation.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.gifEditor.features.animation.description') }}
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
import { parseGIF, decompressFrames } from 'gifuct-js'

interface GifSettings {
  width: number
  quality: 'high' | 'medium' | 'low'
  fps: number
}

interface SelectedGif {
  file: File
  url: string
  name: string
  width: number
  height: number
}

interface GifFrame {
  dataUrl: string
  delay: number
  imageData: ImageData
}

// Type definitions for gifuct-js
interface FrameDims {
  width: number
  height: number
}

interface Frame {
  dims: FrameDims
  delay: number
  dispose: number
  transparentIndex: number
  patch: Uint8ClampedArray
  palette: number[][]
}

// Type guard function to check if an object is a Frame
function isFrame(obj: unknown): obj is Frame {
  return obj != null && typeof obj === 'object' && 'dims' in obj && 'delay' in obj
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
  if (selectedGif.value?.url) {
    URL.revokeObjectURL(selectedGif.value.url)
  }
  if (generatedGif.value) {
    URL.revokeObjectURL(generatedGif.value)
  }
})

async function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type === 'image/gif') {
      const blob = item.getAsFile()
      if (blob) {
        // Create a File object from the blob
        const file = new File([blob], `pasted-gif-${Date.now()}.gif`, {
          type: blob.type,
        })
        await handleGifFile(file)
        success(t('tools.gifEditor.messages.filePasted'))
        break
      }
    }
  }
}

// Reactive data
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const isProcessing = ref(false)
const processingProgress = ref(0)
const generatedGif = ref('')
const selectedGif = ref<SelectedGif | null>(null)
const frames = ref<GifFrame[]>([])

const gifSettings = reactive<GifSettings>({
  width: 300,
  quality: 'medium',
  fps: 10,
})

// File handling
function handleFileDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const gifFiles = Array.from(files).filter((file) => file.type === 'image/gif')
    if (gifFiles.length > 0) {
      handleGifFile(gifFiles[0])
    } else {
      error(t('tools.gifEditor.errors.noGif'))
    }
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    const gifFiles = Array.from(files).filter((file) => file.type === 'image/gif')
    if (gifFiles.length > 0) {
      handleGifFile(gifFiles[0])
    } else {
      error(t('tools.gifEditor.errors.noGif'))
    }
  }

  // Reset input to allow selecting the same file again
  if (target) {
    target.value = ''
  }
}

async function handleGifFile(file: File) {
  if (file.type !== 'image/gif') {
    error(t('tools.gifEditor.errors.invalidFile'))
    return
  }

  if (file.size > 50 * 1024 * 1024) {
    // 50MB limit
    error(t('tools.gifEditor.errors.fileTooLarge'))
    return
  }

  try {
    // Clear previous data
    clearAll()

    // Set selected GIF
    const url = URL.createObjectURL(file)
    selectedGif.value = {
      file,
      url,
      name: file.name,
      width: 0,
      height: 0,
    }

    // Parse GIF frames
    await parseGifFrames(file)

    success(t('tools.gifEditor.messages.fileLoaded'))
  } catch (err) {
    console.error('Error handling GIF file:', err)
    error(t('tools.gifEditor.errors.fileProcessing'))
  }
}

async function parseGifFrames(file: File) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const gif = parseGIF(arrayBuffer)

    // Get dimensions from the GIF header
    if (gif && gif.lsd) {
      if (selectedGif.value) {
        selectedGif.value.width = gif.lsd.width
        selectedGif.value.height = gif.lsd.height
      }
    }

    // Decompress frames
    const decompressedFrames = decompressFrames(gif, true)

    // Convert frames to data URLs
    frames.value = []
    for (const frame of decompressedFrames) {
      // Validate frame dimensions
      if (frame.dims.width <= 0 || frame.dims.height <= 0) {
        console.warn('Skipping frame with invalid dimensions')
        continue
      }

      const canvas = document.createElement('canvas')
      canvas.width = frame.dims.width
      canvas.height = frame.dims.height

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        // Handle transparency properly
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Create ImageData from frame patch
        const imageData = ctx.createImageData(frame.dims.width, frame.dims.height)
        imageData.data.set(frame.patch)

        // Handle transparency - set alpha channel for transparent pixels
        if (frame.transparentIndex !== undefined && frame.transparentIndex >= 0) {
          // Find the transparent color from the palette if available
          let transparentR = 0,
            transparentG = 0,
            transparentB = 0

          if (frame.palette && frame.transparentIndex < frame.palette.length) {
            const transparentColor = frame.palette[frame.transparentIndex]
            transparentR = transparentColor[0]
            transparentG = transparentColor[1]
            transparentB = transparentColor[2]
          }

          // Set alpha to 0 for transparent pixels
          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i]
            const g = imageData.data[i + 1]
            const b = imageData.data[i + 2]

            // Check if this pixel matches the transparent color
            if (r === transparentR && g === transparentG && b === transparentB) {
              imageData.data[i + 3] = 0 // Make transparent
            } else {
              // Ensure non-transparent pixels have full opacity
              if (imageData.data[i + 3] === 0) {
                imageData.data[i + 3] = 255
              }
            }
          }
        } else {
          // If no transparent index, ensure all pixels are opaque
          for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] === 0) {
              imageData.data[i] = 255
            }
          }
        }

        // Draw the frame with transparency
        ctx.putImageData(imageData, 0, 0)

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png')

        frames.value.push({
          dataUrl,
          delay: frame.delay,
          imageData,
        })
      }
    }

    // If we still don't have GIF dimensions but have frames, set from first frame
    if (
      selectedGif.value &&
      (!selectedGif.value.width || !selectedGif.value.height) &&
      frames.value.length > 0
    ) {
      selectedGif.value.width = frames.value[0].imageData.width
      selectedGif.value.height = frames.value[0].imageData.height
    }
  } catch (err) {
    console.error('Error parsing GIF frames:', err)
    error(t('tools.gifEditor.errors.frameParsingFailed'))
  }
}

function removeFrame(index: number) {
  frames.value.splice(index, 1)
}

function clearAll() {
  // Revoke object URLs
  if (selectedGif.value?.url) {
    URL.revokeObjectURL(selectedGif.value.url)
  }
  if (generatedGif.value) {
    URL.revokeObjectURL(generatedGif.value)
  }

  selectedGif.value = null
  frames.value = []
  generatedGif.value = ''
  processingProgress.value = 0
}

function updateFrameDelay(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const delay = parseInt(target.value)
  if (!isNaN(delay) && delay >= 20) {
    frames.value[index].delay = delay
  }
}

// Frame ordering functions
function moveFrameUp() {
  if (frames.value.length <= 1) return

  const first = frames.value[0]
  frames.value.shift()
  frames.value.push(first)
}

function moveFrameDown() {
  if (frames.value.length <= 1) return

  const last = frames.value.pop()
  if (last) {
    frames.value.unshift(last)
  }
}

function reverseFrames() {
  if (frames.value.length <= 1) return

  frames.value.reverse()
}

function shuffleFrames() {
  if (frames.value.length <= 1) return

  // Fisher-Yates shuffle algorithm
  for (let i = frames.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[frames.value[i], frames.value[j]] = [frames.value[j], frames.value[i]]
  }
}

// GIF generation
async function generateGif() {
  if (!selectedGif.value || frames.value.length === 0) {
    error(t('tools.gifEditor.errors.noFrames'))
    return
  }

  // Additional validation to ensure we have valid frames
  if (!frames.value.some((frame) => frame.dataUrl && frame.delay > 0)) {
    error(t('tools.gifEditor.errors.noFrames'))
    return
  }

  isProcessing.value = true
  processingProgress.value = 0

  try {
    await createGifFromFrames()
    success(t('tools.gifEditor.messages.gifGenerated'))
  } catch (err) {
    console.error('Error generating GIF:', err)
    error(t('tools.gifEditor.errors.processingFailed') + ': ' + (err as Error).message)
  } finally {
    isProcessing.value = false
  }
}

async function createGifFromFrames() {
  if (!selectedGif.value) return

  // Validate that we have frames to process
  if (frames.value.length === 0) {
    throw new Error('No frames to process. Please try another GIF file.')
  }

  // Use original GIF dimensions
  const gifWidth = selectedGif.value.width
  const gifHeight = selectedGif.value.height

  // Validate dimensions
  if (!gifWidth || !gifHeight || gifWidth <= 0 || gifHeight <= 0) {
    throw new Error('Invalid GIF dimensions. Please try another GIF file.')
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) {
    throw new Error('Unable to get canvas context. Your browser may not support this feature.')
  }

  // Set canvas dimensions to match original GIF exactly
  canvas.width = gifWidth
  canvas.height = gifHeight

  // Configure GIF quality based on settings
  const qualityMap = {
    high: 1,
    medium: 10,
    low: 20,
  }

  // Create GIF with original dimensions
  const gif = new GIF({
    workers: 2,
    quality: qualityMap[gifSettings.quality],
    width: gifWidth,
    height: gifHeight,
    workerScript: '/gif.worker.js',
  })

  const totalFrames = frames.value.length
  let processedFrames = 0

  // Process each frame
  for (const frame of frames.value) {
    try {
      // Draw frame on canvas
      const img = new Image()
      const imageLoaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load frame image'))
        img.src = frame.dataUrl
      })

      // Wait for image to load
      await imageLoaded

      // Validate that the image has valid dimensions
      if (img.width <= 0 || img.height <= 0) {
        console.warn('Skipping frame with invalid dimensions')
        continue
      }

      // Clear canvas and draw image at original size
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the image maintaining original GIF dimensions
      // This ensures we don't scale the image and preserve the original size
      ctx.drawImage(img, 0, 0, gifWidth, gifHeight)

      // Add frame to GIF with delay in milliseconds
      gif.addFrame(canvas, { copy: true, delay: frame.delay })

      processedFrames++
      processingProgress.value = Math.round((processedFrames / totalFrames) * 100)
    } catch (err) {
      console.error('Error processing frame:', err)
      // Continue with next frame instead of stopping the whole process
    }
  }

  // If no frames were processed, throw an error
  if (processedFrames === 0) {
    throw new Error('No frames could be processed. Please try another GIF file.')
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
  link.download = `edited-gif-${Date.now()}.gif`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function resetTool() {
  clearAll()

  // Reset settings to defaults
  gifSettings.width = 300
  gifSettings.quality = 'medium'
  gifSettings.fps = 10

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
/* Custom styles */
img {
  background-color: #f0f0f0;
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
</style>
