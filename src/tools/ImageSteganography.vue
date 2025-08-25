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

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔒</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.imageSteganography.features.encryption.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageSteganography.features.encryption.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🖼️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.imageSteganography.features.steganography.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageSteganography.features.steganography.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📥</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.imageSteganography.features.export.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageSteganography.features.export.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Canvas Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.imageSteganography.canvasTitle') }}
            </h3>
          </div>

          <div class="flex justify-center">
            <div
              class="relative border-2 border-dashed border-gray-300 rounded-lg bg-white flex items-center justify-center w-full"
              style="min-height: 500px"
              :class="{ 'cursor-pointer hover:border-blue-500': !state.isLoading }"
            >
              <canvas
                ref="canvasRef"
                id="steganography-canvas"
                class="rounded-lg max-w-full max-h-full"
                style="width: 100%; height: 100%; object-fit: contain"
              ></canvas>
              <div
                v-if="!canvasInitialized || !state.targetImageData"
                class="absolute inset-0 flex flex-col items-center justify-center text-gray-500"
              >
                <div class="text-4xl mb-2">🖼️</div>
                <p>{{ $t('tools.imageSteganography.canvasPlaceholder') }}</p>
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-center">
            <button
              @click="exportCanvas"
              :disabled="!canvasInitialized || state.isLoading || !state.targetImageData"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ $t('tools.imageSteganography.exportImage') }}
            </button>
          </div>
        </div>

        <!-- Operations Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.imageSteganography.operationsTitle') }}
            </h3>
          </div>

          <div class="space-y-6">
            <!-- Step 1: Select image to hide -->
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">
                {{ $t('tools.imageSteganography.step1') }}
              </h4>
              <p class="text-sm text-gray-600">
                {{ $t('tools.imageSteganography.step1Desc') }}
              </p>
              <div class="flex space-x-2">
                <button
                  @click="selectHiddenImage"
                  :disabled="state.isLoading"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {{ $t('tools.imageSteganography.selectHiddenImage') }}
                </button>
                <button
                  v-if="state.hiddenImageData"
                  @click="previewHiddenImage"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  {{ $t('common.preview') }}
                </button>
              </div>

              <!-- Hidden image preview -->
              <div v-if="state.hiddenImageData" class="mt-2">
                <p class="text-sm text-gray-600 mb-1">{{ $t('common.preview') }}:</p>
                <div class="border rounded p-2 bg-gray-50">
                  <img
                    :src="hiddenImagePreviewUrl"
                    alt="Hidden image preview"
                    class="max-w-full max-h-32 object-contain"
                  />
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
              <button
                @click="saveHiddenImageData"
                :disabled="!hiddenImageSelected || state.isLoading"
                class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
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
                <button
                  @click="selectTargetImage"
                  :disabled="state.isLoading"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {{ $t('tools.imageSteganography.selectTargetImage') }}
                </button>
                <button
                  v-if="state.targetImageData"
                  @click="previewTargetImage"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  {{ $t('common.preview') }}
                </button>
              </div>

              <!-- Target image preview -->
              <div v-if="targetImagePreviewUrl" class="mt-2">
                <p class="text-sm text-gray-600 mb-1">{{ $t('common.preview') }}:</p>
                <div class="border rounded p-2 bg-gray-50">
                  <img
                    :src="targetImagePreviewUrl"
                    alt="Target image preview"
                    class="max-w-full max-h-32 object-contain"
                  />
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
              <button
                @click="drawHiddenData"
                :disabled="!canStartEncryption"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {{ $t('tools.imageSteganography.startEncryption') }}
              </button>
            </div>

            <!-- Reset button -->
            <button
              @click="resetCanvas"
              :disabled="state.isLoading"
              class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
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
import { Canvas, Image } from 'fabric'

const { t } = useI18n()
const { success, error: showError } = useToast()

// Refs
const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvas = ref<Canvas | null>(null)
const canvasInitialized = ref(false)
const hiddenImagePreviewUrl = ref<string | null>(null)
const targetImagePreviewUrl = ref<string | null>(null)

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

// Initialize canvas
function initCanvas() {
  if (!canvasRef.value) return

  // Set canvas dimensions based on container
  const container = canvasRef.value.parentElement
  if (container) {
    canvasRef.value.width = container.clientWidth
    canvasRef.value.height = container.clientHeight
  }

  canvas.value = new Canvas(canvasRef.value, {
    isDrawingMode: false,
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
      const img = new Image()
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

// Draw target image
function drawTargetImage(url: string) {
  if (!canvas.value) return

  state.isLoading = true
  Image.fromURL(url, { crossOrigin: 'anonymous' }, (img) => {
    try {
      // Calculate scale to fit canvas while maintaining aspect ratio
      const canvasWidth = canvas.value!.width
      const canvasHeight = canvas.value!.height
      const imgWidth = img.width
      const imgHeight = img.height

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
              <img src="${tempCanvas.toDataURL()}" style="max-width: 90vw; max-height: 80vh;" />
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
            <img src="${dataURL}" style="max-width: 90vw; max-height: 80vh;" />
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
    // Process hidden image data to binary
    state.hiddenDataBinary = Array.from(state.hiddenImageData.data, (color: number) => {
      color = color.toString(2).padStart(8, '0').split('')
      return color
    })

    state.isLoading = false
    success(t('tools.imageSteganography.messages.dataSaved'))
  } catch (err) {
    state.isLoading = false
    showError(t('tools.imageSteganography.errors.dataSaveFailed'))
    console.error(err)
  }
}

// Draw hidden data
function drawHiddenData() {
  if (!state.hiddenDataBinary || !state.targetImageData || !canvas.value) return

  state.isLoading = true

  try {
    // Put hidden data binary into one array
    const bigHiddenList: string[] = []
    for (let i = 0; i < state.hiddenDataBinary.length; i++) {
      bigHiddenList.push(...state.hiddenDataBinary[i])
    }

    // Process target image data
    const targetDataCopy = new Uint8ClampedArray(state.targetImageData.data)
    const targetDataBinary: string[][] = Array.from(targetDataCopy, (color: number) => {
      // Make numbers even
      color = color > 254 ? color - 1 : color
      color = color % 2 == 1 ? color - 1 : color
      return color.toString(2).padStart(8, '0').split('')
    })

    // Embed hidden data into target data
    targetDataBinary.forEach((item: string[], index: number) => {
      if (bigHiddenList[index]) {
        item[7] = bigHiddenList[index]
      }
    })

    // Convert binary back to pixel data
    const processedData = new Uint8ClampedArray(targetDataBinary.length)
    targetDataBinary.forEach((item: string[], index: number) => {
      processedData[index] = parseInt(item.join(''), 2)
    })

    // Create new image data
    const newImageData = new ImageData(
      processedData,
      state.targetImageData.width,
      state.targetImageData.height,
    )

    // Draw processed image to canvas
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = state.targetImageData.width
    tempCanvas.height = state.targetImageData.height
    const tempCtx = tempCanvas.getContext('2d')

    if (tempCtx) {
      tempCtx.putImageData(newImageData, 0, 0)
      Image.fromURL(tempCanvas.toDataURL(), {}, (img) => {
        if (canvas.value) {
          // Calculate scale to fit canvas while maintaining aspect ratio
          const canvasWidth = canvas.value.width
          const canvasHeight = canvas.value.height
          const imgWidth = img.width
          const imgHeight = img.height

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
        state.isLoading = false
        success(t('tools.imageSteganography.messages.encryptionComplete'))
      })
    } else {
      state.isLoading = false
    }
  } catch (err) {
    state.isLoading = false
    showError(t('tools.imageSteganography.errors.encryptionFailed'))
    console.error(err)
  }
}

// Export canvas
function exportCanvas() {
  if (!canvas.value) return

  try {
    const dataURL = canvas.value.toDataURL({
      format: 'png',
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
})

// Handle window resize
function handleResize() {
  if (canvasRef.value && canvas.value) {
    const container = canvasRef.value.parentElement
    if (container) {
      // Update canvas dimensions
      canvasRef.value.width = container.clientWidth
      canvasRef.value.height = container.clientHeight
      canvas.value.setWidth(container.clientWidth)
      canvas.value.setHeight(container.clientHeight)
      canvas.value.renderAll()
    }
  }
}
</script>
