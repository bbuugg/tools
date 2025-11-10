<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('tools.imageSteganography.title') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('tools.imageSteganography.description') }}
        </p>
      </div>

      <!-- Toggle Switch -->
      <div class="flex justify-center mb-6">
        <div class="inline-flex rounded-md shadow-sm" role="group">
          <button type="button" @click="mode = 'encode'" :class="[
            'px-4 py-2 text-sm font-medium rounded-l-lg',
            mode === 'encode'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100',
          ]">
            {{ $t('tools.imageSteganography.modeToggle.encode') }}
          </button>
          <button type="button" @click="mode = 'decode'" :class="[
            'px-4 py-2 text-sm font-medium rounded-r-lg border-l border-gray-200',
            mode === 'decode'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100',
          ]">
            {{ $t('tools.imageSteganography.modeToggle.decode') }}
          </button>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">{{ mode === 'encode' ? '🔒' : '🔓' }}</div>
          <h3 class="text-lg font-semibold mb-2">
            {{
              mode === 'encode'
                ? $t('tools.imageSteganography.features.encryption.title')
                : $t('tools.imageSteganography.features.decryption.title')
            }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{
              mode === 'encode'
                ? $t('tools.imageSteganography.features.encryption.description')
                : $t('tools.imageSteganography.features.decryption.description')
            }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">{{ mode === 'encode' ? '🖼️' : '🔍' }}</div>
          <h3 class="text-lg font-semibold mb-2">
            {{
              mode === 'encode'
                ? $t('tools.imageSteganography.features.steganography.title')
                : $t('tools.imageSteganography.features.extraction.title')
            }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{
              mode === 'encode'
                ? $t('tools.imageSteganography.features.steganography.description')
                : $t('tools.imageSteganography.features.extraction.description')
            }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">{{ mode === 'encode' ? '📥' : '📤' }}</div>
          <h3 class="text-lg font-semibold mb-2">
            {{
              mode === 'encode'
                ? $t('tools.imageSteganography.features.export.title')
                : $t('tools.imageSteganography.features.result.title')
            }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{
              mode === 'encode'
                ? $t('tools.imageSteganography.features.export.description')
                : $t('tools.imageSteganography.features.result.description')
            }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Canvas Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{
                mode === 'encode'
                  ? $t('tools.imageSteganography.canvasTitle')
                  : $t('tools.imageSteganography.decodedImageTitle')
              }}
            </h3>
          </div>

          <div class="flex justify-center">
            <div
              class="relative border-2 border-dashed border-gray-300 rounded-lg bg-white flex items-center justify-center w-full"
              style="min-height: 500px" :class="{ 'cursor-pointer hover:border-blue-500': !state.isLoading }">
              <canvas ref="canvasRef" id="steganography-canvas" class="rounded-lg max-w-full max-h-full"
                style="width: 100%; height: 100%; object-fit: contain"></canvas>
              <div v-if="
                !canvasInitialized ||
                (mode === 'encode' ? !state.targetImageData : !decodedImageDataUrl)
              " class="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                <div class="text-4xl mb-2">{{ mode === 'encode' ? '🖼️' : '🔍' }}</div>
                <p>
                  {{
                    mode === 'encode'
                      ? $t('tools.imageSteganography.canvasPlaceholder')
                      : $t('tools.imageSteganography.decodedImagePlaceholder')
                  }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-center">
            <button v-if="mode === 'encode'" @click="exportCanvas"
              :disabled="!canvasInitialized || state.isLoading || !state.targetImageData"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">
              {{ $t('tools.imageSteganography.exportImage') }}
            </button>
            <button v-else @click="exportDecodedImage" :disabled="!decodedImageDataUrl || state.isLoading"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">
              {{ $t('tools.imageSteganography.exportDecodedImage') }}
            </button>
          </div>
        </div>

        <!-- Operations Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{
                mode === 'encode'
                  ? $t('tools.imageSteganography.operationsTitle')
                  : $t('tools.imageSteganography.decodingTitle')
              }}
            </h3>
          </div>

          <!-- Encoding Mode -->
          <div v-if="mode === 'encode'" class="space-y-6">
            <!-- Step 1: Select image to hide -->
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">
                {{ $t('tools.imageSteganography.step1') }}
              </h4>
              <p class="text-sm text-gray-600">
                {{ $t('tools.imageSteganography.step1Desc') }}
              </p>
              <div class="flex space-x-2">
                <button @click="selectHiddenImage" :disabled="state.isLoading"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">
                  {{ $t('tools.imageSteganography.selectHiddenImage') }}
                </button>
                <button v-if="state.hiddenImageData" @click="previewHiddenImage"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                  {{ $t('common.preview') }}
                </button>
              </div>

              <!-- Hidden image preview -->
              <div v-if="state.hiddenImageData" class="mt-2">
                <p class="text-sm text-gray-600 mb-1">{{ $t('common.preview') }}:</p>
                <div class="border rounded p-2 bg-gray-50">
                  <img referrerpolicy="no-referrer" :src="hiddenImagePreviewUrl || ''" alt="Hidden image preview"
                    class="max-w-full max-h-32 object-contain" />
                </div>
              </div>
            </div>

            <!-- Step 2: Save hidden image data -->
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">
                {{ $t('tools.imageSteganography.step2') }}
              </h4>
              <p class="text-sm text-gray-600">
                {{ $t('tools.imageSteganography.step2Desc') }}
              </p>
              <button @click="saveHiddenImageData" :disabled="!hiddenImageSelected || state.isLoading"
                class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">
                {{ $t('tools.imageSteganography.saveHiddenData') }}
              </button>
            </div>

            <!-- Step 3: Select target image -->
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">
                {{ $t('tools.imageSteganography.step3') }}
              </h4>
              <p class="text-sm text-gray-600">
                {{ $t('tools.imageSteganography.step3Desc') }}
              </p>
              <div class="flex space-x-2">
                <button @click="selectTargetImage" :disabled="state.isLoading"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">
                  {{ $t('tools.imageSteganography.selectTargetImage') }}
                </button>
                <button v-if="state.targetImageData" @click="previewTargetImage"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                  {{ $t('common.preview') }}
                </button>
              </div>

              <!-- Target image preview -->
              <div v-if="targetImagePreviewUrl" class="mt-2">
                <p class="text-sm text-gray-600 mb-1">{{ $t('common.preview') }}:</p>
                <div class="border rounded p-2 bg-gray-50">
                  <img referrerpolicy="no-referrer" :src="targetImagePreviewUrl || ''" alt="Target image preview"
                    class="max-w-full max-h-32 object-contain" />
                </div>
              </div>
            </div>

            <!-- Step 4: Start encryption -->
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">
                {{ $t('tools.imageSteganography.step4') }}
              </h4>
              <p class="text-sm text-gray-600">
                {{ $t('tools.imageSteganography.step4Desc') }}
              </p>
              <button @click="drawHiddenData" :disabled="!canStartEncryption"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">
                {{ $t('tools.imageSteganography.startEncryption') }}
              </button>
            </div>

            <!-- Reset button -->
            <button @click="resetCanvas" :disabled="state.isLoading"
              class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">
              {{ $t('common.clear') }}
            </button>
          </div>

          <!-- Decoding Mode -->
          <div v-else class="space-y-6">
            <!-- Step 1: Select image to decode -->
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">
                {{ $t('tools.imageSteganography.decodeStep1') }}
              </h4>
              <p class="text-sm text-gray-600">
                {{ $t('tools.imageSteganography.decodeStep1Desc') }}
              </p>
              <div class="flex space-x-2">
                <button @click="selectImageToDecode" :disabled="state.isLoading"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">
                  {{ $t('tools.imageSteganography.selectImageToDecode') }}
                </button>
              </div>
            </div>

            <!-- Step 2: Decode image -->
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">
                {{ $t('tools.imageSteganography.decodeStep2') }}
              </h4>
              <p class="text-sm text-gray-600">
                {{ $t('tools.imageSteganography.decodeStep2Desc') }}
              </p>
              <button @click="decodeImage" :disabled="!imageToDecodeData || state.isLoading"
                class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">
                {{ $t('tools.imageSteganography.startDecoding') }}
              </button>
            </div>

            <!-- Decoded image preview -->
            <div v-if="decodedImageDataUrl" class="space-y-2">
              <h4 class="font-medium text-gray-900">
                {{ $t('tools.imageSteganography.decodedImagePreview') }}
              </h4>
              <div class="border rounded p-2 bg-gray-50">
                <img referrerpolicy="no-referrer" :src="decodedImageDataUrl || ''" alt="Decoded image preview"
                  class="max-w-full max-h-64 object-contain" />
              </div>
            </div>

            <!-- Reset button -->
            <button @click="resetDecoding" :disabled="state.isLoading"
              class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import { Canvas, FabricImage as Image } from 'fabric'

const { t } = useI18n()
const { success, error: showError } = useToast()

// Mode state
const mode = ref<'encode' | 'decode'>('encode')

// Refs
const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvas = ref<Canvas | null>(null)
const canvasInitialized = ref(false)
const hiddenImagePreviewUrl = ref<string | null>(null)
const targetImagePreviewUrl = ref<string | null>(null)
const decodedImageDataUrl = ref<string | null>(null)
const imageToDecodeData = ref<ImageData | null>(null)

// State
const state = reactive({
  isLoading: false,
  targetImageData: null as ImageData | null,
  hiddenImageData: null as ImageData | null,
  hiddenDataBinary: null as string[][] | null,
  targetDataBinary: null as string[][] | null,
})

// Computed properties
const hiddenImageSelected = computed(() => state.hiddenImageData !== null)
const targetImageSelected = computed(() => state.targetImageData !== null)
const hiddenDataSaved = computed(() => state.hiddenDataBinary !== null)

// New computed property for the encryption button
const canStartEncryption = computed(() => {
  return targetImageSelected.value && hiddenDataSaved.value && !state.isLoading
})

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null)

// Initialize canvas - UPDATED to better handle sizing
function initCanvas() {
  if (!canvasRef.value) return

  // Set canvas dimensions based on container
  const container = canvasRef.value.parentElement
  if (container) {
    // FIXED: Better sizing to prevent cropping issues
    canvasRef.value.width = container.clientWidth - 20 // Account for padding/borders
    canvasRef.value.height = Math.min(container.clientHeight - 20, 600) // Max height constraint
  }

  canvas.value = new Canvas(canvasRef.value, {
    isDrawingMode: false,
    selectable: false,
    selection: false,
    hoverCursor: 'pointer',
    devicePixelRatio: true,
  })

  canvasInitialized.value = true
}

// Get file from input
function getFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: any) => {
      const file = e.target.files?.[0] || null
      resolve(file)
    }
    input.click()
  })
}

// Select hidden image
async function selectHiddenImage() {
  try {
    state.isLoading = true
    const file = await getFile()
    if (file) {
      const url = URL.createObjectURL(file)
      const img = new window.Image()
      img.onload = () => {
        // Create a canvas to get image data
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = img.width
        tempCanvas.height = img.height
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0)
          state.hiddenImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)

          // Create preview URL
          if (hiddenImagePreviewUrl.value) {
            URL.revokeObjectURL(hiddenImagePreviewUrl.value)
          }
          hiddenImagePreviewUrl.value = tempCanvas.toDataURL()

          success(t('tools.imageSteganography.messages.imageLoaded'))
        }
        URL.revokeObjectURL(url)
      }
      img.src = url
    }
  } catch (err) {
    showError(t('tools.imageSteganography.errors.imageLoadFailed'))
    console.error(err)
  } finally {
    state.isLoading = false
  }
}

// Select target image
async function selectTargetImage() {
  try {
    state.isLoading = true
    const file = await getFile()
    if (file) {
      const url = URL.createObjectURL(file)
      drawTargetImage(url)
    }
  } catch (err) {
    showError(t('tools.imageSteganography.errors.imageLoadFailed'))
    console.error(err)
  } finally {
    state.isLoading = false
  }
}

// Draw target image - FIXED to properly display images without cropping
function drawTargetImage(url: string) {
  if (!canvas.value) return

  state.isLoading = true
  Image.fromURL(url, { crossOrigin: 'anonymous' })
    .then((img) => {
      try {
        // Calculate scale to fit canvas while maintaining aspect ratio
        const canvasWidth = canvas.value!.width
        const canvasHeight = canvas.value!.height
        const imgWidth = img.width
        const imgHeight = img.height

        // Calculate scale to fit canvas while maintaining aspect ratio
        // FIXED: Using object-fit approach to contain the entire image
        const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)

        img.set({
          left: canvasWidth / 2,
          originX: 'center',
          originY: 'center',
          top: canvasHeight / 2,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
        })

        canvas.value!.clear()
        canvas.value!.add(img)
        canvas.value!.renderAll()

        // Get image data for steganography
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = imgWidth
        tempCanvas.height = imgHeight
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx) {
          // Draw the image to the temporary canvas to get image data
          tempCtx.drawImage(img.getElement(), 0, 0)
          state.targetImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)

          // Create preview URL
          if (targetImagePreviewUrl.value) {
            URL.revokeObjectURL(targetImagePreviewUrl.value)
          }
          targetImagePreviewUrl.value = tempCanvas.toDataURL()
        }

        success(t('tools.imageSteganography.messages.imageLoaded'))
      } catch (err) {
        showError(t('tools.imageSteganography.errors.imageLoadFailed'))
        console.error(err)
      } finally {
        state.isLoading = false
      }
    })
    .catch((err) => {
      state.isLoading = false
      showError(t('tools.imageSteganography.errors.imageLoadFailed'))
      console.error(err)
    })
}

// Preview hidden image
function previewHiddenImage() {
  if (!state.hiddenImageData) return

  // Create a temporary canvas to display the image
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = state.hiddenImageData.width
  tempCanvas.height = state.hiddenImageData.height
  const tempCtx = tempCanvas.getContext('2d')

  if (tempCtx) {
    tempCtx.putImageData(state.hiddenImageData, 0, 0)

    // Create a new window to display the image
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${t('tools.imageSteganography.hiddenImagePreview')}</title>
          </head>
          <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5;">
            <div>
              <h2 style="text-align: center; font-family: Arial, sans-serif;">${t('tools.imageSteganography.hiddenImagePreview')}</h2>
              <img referrerpolicy="no-referrer" src="${tempCanvas.toDataURL()}" style="max-width: 90vw; max-height: 80vh;" />
            </div>
          </body>
        </html>
      `)
      newWindow.document.close()
    }
  }
}

// Preview target image
function previewTargetImage() {
  if (!canvas.value) return

  // Get the canvas data URL
  const dataURL = canvas.value.toDataURL()

  // Create a new window to display the image
  const newWindow = window.open('', '_blank')
  if (newWindow) {
    newWindow.document.write(`
      <html>
        <head>
          <title>${t('tools.imageSteganography.targetImagePreview')}</title>
        </head>
        <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5;">
          <div>
            <h2 style="text-align: center; font-family: Arial, sans-serif;">${t('tools.imageSteganography.targetImagePreview')}</h2>
            <img referrerpolicy="no-referrer" src="${dataURL}" style="max-width: 90vw; max-height: 80vh;" />
          </div>
        </body>
      </html>
    `)
    newWindow.document.close()
  }
}

// Save hidden image data
function saveHiddenImageData() {
  if (!state.hiddenImageData) return

  state.isLoading = true

  try {
    // Create a temporary canvas to process the hidden image data
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')

    if (!tempCtx) {
      throw new Error('Could not get canvas context')
    }

    // Calculate dimensions for the hidden image
    // Small canvas dimensions = large canvas pixels / 8 then square root
    // Because we need 8 pixels' LSB to represent one pixel's RGBA value in the small canvas
    const totalPixels = state.hiddenImageData.width * state.hiddenImageData.height
    const sqrtPixels = Math.sqrt(totalPixels / 8)
    tempCanvas.width = Math.floor(sqrtPixels)
    tempCanvas.height = Math.floor(sqrtPixels)

    // Draw the hidden image data to the temporary canvas
    tempCtx.putImageData(state.hiddenImageData, 0, 0)

    // Resize the image to fit the smaller canvas if needed
    const resizedCanvas = document.createElement('canvas')
    resizedCanvas.width = tempCanvas.width
    resizedCanvas.height = tempCanvas.height
    const resizedCtx = resizedCanvas.getContext('2d')

    if (resizedCtx) {
      // If the hidden image is larger than the calculated size, resize it
      if (
        state.hiddenImageData.width > tempCanvas.width ||
        state.hiddenImageData.height > tempCanvas.height
      ) {
        resizedCtx.drawImage(
          tempCanvas,
          0,
          0,
          state.hiddenImageData.width,
          state.hiddenImageData.height,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
        )
      } else {
        // Otherwise, just draw it as is
        resizedCtx.drawImage(tempCanvas, 0, 0)
      }

      // Get the resized image data
      const resizedImageData = resizedCtx.getImageData(
        0,
        0,
        resizedCanvas.width,
        resizedCanvas.height,
      )

      // Process hidden image data to binary
      state.hiddenDataBinary = Array.from(resizedImageData.data, (color: number) => {
        return color.toString(2).padStart(8, '0').split('')
      })

      success(t('tools.imageSteganography.messages.dataSaved'))
    }
  } catch (err) {
    showError(t('tools.imageSteganography.errors.dataSaveFailed'))
    console.error(err)
  } finally {
    state.isLoading = false
  }
}

// Process target image data
// Make numbers even (LSB approach from reference implementation)
function evenNum(num: number) {
  num = num > 254 ? num - 1 : num
  num = num % 2 == 1 ? num - 1 : num
  return num
}

// Draw hidden data - REWRITTEN to match the provided algorithm
function drawHiddenData() {
  if (!state.hiddenDataBinary || !state.targetImageData || !canvas.value) return

  state.isLoading = true

  try {
    // REWRITTEN: Put hidden data binary into one array
    const bigHiddenList: string[] = []
    for (let i = 0; i < state.hiddenDataBinary.length; i++) {
      bigHiddenList.push(...state.hiddenDataBinary[i])
    }

    // REWRITTEN: Create a copy of target image data for processing
    const targetDataCopy = new Uint8ClampedArray(state.targetImageData.data)

    // REWRITTEN: Process target image data to ensure even numbers (for LSB)
    for (let i = 0; i < targetDataCopy.length; i++) {
      targetDataCopy[i] = evenNum(targetDataCopy[i])
    }

    // REWRITTEN: Get binary representation of target data
    const targetDataBinary: string[][] = Array.from(targetDataCopy, (color: number) => {
      return color.toString(2).padStart(8, '0').split('')
    })

    // REWRITTEN: Embed hidden data into target data by modifying the LSB (Least Significant Bit)
    for (let i = 0; i < targetDataBinary.length && i < bigHiddenList.length; i++) {
      // Only modify if we have hidden data for this position
      if (bigHiddenList[i]) {
        targetDataBinary[i][7] = bigHiddenList[i]
      }
    }

    // REWRITTEN: Convert binary back to pixel data
    for (let i = 0; i < targetDataCopy.length; i++) {
      targetDataCopy[i] = parseInt(targetDataBinary[i].join(''), 2)
    }

    // REWRITTEN: Create new image data
    const newImageData = new ImageData(
      targetDataCopy,
      state.targetImageData.width,
      state.targetImageData.height,
    )

    // REWRITTEN: Draw processed image to canvas
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = state.targetImageData.width
    tempCanvas.height = state.targetImageData.height
    const tempCtx = tempCanvas.getContext('2d')

    if (tempCtx) {
      tempCtx.putImageData(newImageData, 0, 0)
      Image.fromURL(tempCanvas.toDataURL())
        .then((img) => {
          if (canvas.value) {
            // FIXED: Properly scale the image to fit the canvas without cropping
            const canvasWidth = canvas.value.width
            const canvasHeight = canvas.value.height
            const imgWidth = img.width
            const imgHeight = img.height

            // FIXED: Use the correct scaling approach to contain the entire image
            const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)

            img.set({
              left: canvasWidth / 2,
              originX: 'center',
              originY: 'center',
              top: canvasHeight / 2,
              scaleX: scale,
              scaleY: scale,
              selectable: false,
            })

            canvas.value.clear()
            canvas.value.add(img)
            canvas.value.renderAll()
          }
          success(t('tools.imageSteganography.messages.encryptionComplete'))
        })
        .catch((err) => {
          showError(t('tools.imageSteganography.errors.encryptionFailed'))
          console.error(err)
        })
    }
  } catch (err) {
    showError(t('tools.imageSteganography.errors.encryptionFailed'))
    console.error(err)
  } finally {
    state.isLoading = false
  }
}

// Decode image - implementing the functionality from the provided code
function decodeImage() {
  if (!imageToDecodeData.value) return

  state.isLoading = true

  try {
    // Get image data binary representation
    const targetDataBinary = Array.from(imageToDecodeData.value.data, (color) => {
      return color.toString(2).padStart(8, '0').split('')
    })

    // Extract hidden data by getting the LSB from each byte
    const decryptImageData: number[] = []

    // Calculate the expected size of the hidden image
    const totalPixels = imageToDecodeData.value.width * imageToDecodeData.value.height
    const sqrtPixels = Math.sqrt(totalPixels / 8)
    const maxSize = Math.floor(sqrtPixels)
    const expectedSize = maxSize * maxSize * 4 // 4 channels (RGBA)

    // Extract LSB from each byte to reconstruct the hidden image
    for (let i = 0; i < targetDataBinary.length && decryptImageData.length < expectedSize; i++) {
      // Extract the least significant bit (index 7) from each color channel
      const lsb = parseInt(targetDataBinary[i][7], 2)
      decryptImageData.push(lsb)
    }

    // Convert to Uint8ClampedArray
    const decryptedData = new Uint8ClampedArray(decryptImageData)

    // Create ImageData with the decrypted data
    const decodedImageData = new ImageData(decryptedData, maxSize, maxSize)

    // Draw decoded image to canvas and get data URL
    const decodeCanvas = document.createElement('canvas')
    decodeCanvas.width = maxSize
    decodeCanvas.height = maxSize
    const decodeCtx = decodeCanvas.getContext('2d')

    if (decodeCtx) {
      decodeCtx.putImageData(decodedImageData, 0, 0)

      // Store the decoded image data URL
      if (decodedImageDataUrl.value) {
        URL.revokeObjectURL(decodedImageDataUrl.value)
      }
      decodedImageDataUrl.value = decodeCanvas.toDataURL()

      // Display the decoded image on the main canvas
      if (canvas.value) {
        Image.fromURL(decodedImageDataUrl.value)
          .then((img) => {
            // FIXED: Properly scale the image to fit the canvas without cropping
            const canvasWidth = canvas.value!.width
            const canvasHeight = canvas.value!.height
            const imgWidth = img.width
            const imgHeight = img.height

            // FIXED: Use the correct scaling approach to contain the entire image
            const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)

            img.set({
              left: canvasWidth / 2,
              originX: 'center',
              originY: 'center',
              top: canvasHeight / 2,
              scaleX: scale,
              scaleY: scale,
              selectable: false,
            })

            canvas.value!.clear()
            canvas.value!.add(img)
            canvas.value!.renderAll()

            success(t('tools.imageSteganography.messages.decryptionComplete'))
          })
          .catch((err) => {
            showError(t('tools.imageSteganography.errors.decryptionFailed'))
            console.error(err)
          })
      } else {
        success(t('tools.imageSteganography.messages.decryptionComplete'))
      }
    } else {
      throw new Error('Could not get decoding canvas context')
    }
  } catch (err) {
    showError(t('tools.imageSteganography.errors.decryptionFailed'))
    console.error(err)
  } finally {
    state.isLoading = false
  }
}

// Export canvas - FIXED TypeScript error
function exportCanvas() {
  if (!canvas.value) return

  try {
    const dataURL = canvas.value.toDataURL({
      format: 'png',
      multiplier: 1, // Added required multiplier property
    })

    const link = document.createElement('a')
    link.download = 'steganography-image.png'
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    success(t('tools.imageSteganography.messages.imageExported'))
  } catch (err) {
    showError(t('tools.imageSteganography.errors.exportFailed'))
    console.error(err)
  }
}

// Reset canvas
function resetCanvas() {
  if (canvas.value) {
    canvas.value.clear()
  }
  state.targetImageData = null
  state.hiddenImageData = null
  state.hiddenDataBinary = null
  state.targetDataBinary = null

  // Revoke preview URLs
  if (hiddenImagePreviewUrl.value) {
    URL.revokeObjectURL(hiddenImagePreviewUrl.value)
    hiddenImagePreviewUrl.value = null
  }
  if (targetImagePreviewUrl.value) {
    URL.revokeObjectURL(targetImagePreviewUrl.value)
    targetImagePreviewUrl.value = null
  }

  success(t('tools.imageSteganography.messages.canvasCleared'))
}

// Decoding functions
// Select image to decode
async function selectImageToDecode() {
  try {
    state.isLoading = true
    const file = await getFile()
    if (file) {
      const url = URL.createObjectURL(file)
      const img = new window.Image()
      img.onload = () => {
        // Create a canvas to get image data
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = img.width
        tempCanvas.height = img.height
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0)
          imageToDecodeData.value = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
          success(t('tools.imageSteganography.messages.imageLoaded'))
        }
        URL.revokeObjectURL(url)
      }
      img.src = url
    }
  } catch (err) {
    showError(t('tools.imageSteganography.errors.imageLoadFailed'))
    console.error(err)
  } finally {
    state.isLoading = false
  }
}

// Export decoded image
function exportDecodedImage() {
  if (!decodedImageDataUrl.value) return

  try {
    const link = document.createElement('a')
    link.download = 'decoded-image.png'
    link.href = decodedImageDataUrl.value
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    success(t('tools.imageSteganography.messages.imageExported'))
  } catch (err) {
    showError(t('tools.imageSteganography.errors.exportFailed'))
    console.error(err)
  }
}

// Reset decoding
function resetDecoding() {
  imageToDecodeData.value = null

  if (decodedImageDataUrl.value) {
    URL.revokeObjectURL(decodedImageDataUrl.value)
    decodedImageDataUrl.value = null
  }

  if (canvas.value) {
    canvas.value.clear()
  }

  success(t('tools.imageSteganography.messages.canvasCleared'))
}

// Lifecycle
onMounted(() => {
  // Initialize canvas when component is mounted
  initCanvas()

  // Create file input element
  fileInputRef.value = document.createElement('input')
  fileInputRef.value.type = 'file'
  fileInputRef.value.accept = 'image/*'

  // Handle window resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('resize', handleResize)

  // Revoke preview URLs
  if (hiddenImagePreviewUrl.value) {
    URL.revokeObjectURL(hiddenImagePreviewUrl.value)
  }
  if (targetImagePreviewUrl.value) {
    URL.revokeObjectURL(targetImagePreviewUrl.value)
  }
  if (decodedImageDataUrl.value) {
    URL.revokeObjectURL(decodedImageDataUrl.value)
  }
})

// Handle window resize - UPDATED to better handle sizing
function handleResize() {
  if (canvasRef.value && canvas.value) {
    const container = canvasRef.value.parentElement
    if (container) {
      // FIXED: Better sizing to prevent cropping issues
      const newWidth = container.clientWidth - 20 // Account for padding/borders
      const newHeight = Math.min(container.clientHeight - 20, 600) // Max height constraint

      // Update canvas dimensions
      canvasRef.value.width = newWidth
      canvasRef.value.height = newHeight
      canvas.value.setWidth(newWidth)
      canvas.value.setHeight(newHeight)
      canvas.value.renderAll()
    }
  }
}
</script>
