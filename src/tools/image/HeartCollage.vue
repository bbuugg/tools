<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ $t('tools.heartCollage.title') }}
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('tools.heartCollage.description') }}
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
            <div class="text-6xl text-gray-400">❤️</div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ $t('tools.heartCollage.uploadTitle') }}
              </h3>
              <p class="text-gray-600">
                {{ $t('tools.heartCollage.uploadDescription') }}
              </p>
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('tools.heartCollage.supportedFormats') }}: JPG, PNG, WebP, GIF
              </p>
            </div>
            <button
              class="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              {{ $t('tools.heartCollage.selectFiles') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Panel -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.heartCollage.settings') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Canvas Size -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.heartCollage.canvasSize') }}
            </label>
            <select
              v-model="canvasSize"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="small">{{ $t('tools.heartCollage.small') }} (800×800)</option>
              <option value="medium" selected>
                {{ $t('tools.heartCollage.medium') }} (1200×1200)
              </option>
              <option value="large">{{ $t('tools.heartCollage.large') }} (1600×1600)</option>
            </select>
          </div>

          <!-- Image Shape -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.heartCollage.imageShape') }}
            </label>
            <select
              v-model="imageShape"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="square">{{ $t('tools.heartCollage.square') }}</option>
              <option value="circle">{{ $t('tools.heartCollage.circle') }}</option>
              <option value="rounded">{{ $t('tools.heartCollage.rounded') }}</option>
            </select>
          </div>

          <!-- Spacing -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.heartCollage.spacing') }}: {{ spacing }}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              v-model="spacing"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        <!-- Heart Shape Options -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <h4 class="text-md font-medium text-gray-900 mb-4">
            {{ $t('tools.heartCollage.heartShapeOptions') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Heart Size -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('tools.heartCollage.heartSize') }}
              </label>
              <select
                v-model="heartSize"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="small">{{ $t('tools.heartCollage.small') }}</option>
                <option value="medium" selected>{{ $t('tools.heartCollage.medium') }}</option>
                <option value="large">{{ $t('tools.heartCollage.large') }}</option>
              </select>
            </div>

            <!-- Background Color -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('tools.heartCollage.backgroundColor') }}
              </label>
              <div class="flex items-center space-x-2">
                <input
                  type="color"
                  v-model="backgroundColor"
                  class="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span class="text-sm text-gray-600">{{ backgroundColor }}</span>
              </div>
            </div>

            <!-- Border Options -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('tools.heartCollage.borderOptions') }}
              </label>
              <div class="flex items-center space-x-4">
                <label class="inline-flex items-center">
                  <input
                    type="checkbox"
                    v-model="showBorder"
                    class="rounded border-gray-300 text-pink-600 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{
                    $t('tools.heartCollage.showBorder')
                  }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview and Action Buttons -->
      <div v-if="images.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        >
          <h3 class="text-lg font-semibold text-gray-900">
            {{ $t('tools.heartCollage.preview') }} ({{ images.length }}
            {{ $t('tools.heartCollage.images') }})
          </h3>
          <div class="flex flex-wrap gap-3">
            <button
              @click="generateCollage"
              :disabled="isGenerating"
              class="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                {{ $t('tools.heartCollage.generating') }}
              </span>
              <span v-else>{{ $t('tools.heartCollage.generateCollage') }}</span>
            </button>
            <button
              v-if="collageResult"
              @click="downloadCollage"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {{ $t('tools.heartCollage.downloadCollage') }}
            </button>
            <button
              @click="clearAll"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <!-- Preview Canvas -->
        <div class="flex flex-col items-center">
          <div
            ref="previewContainer"
            class="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-100"
            :style="{
              width: `${previewSize.width}px`,
              height: `${previewSize.height}px`,
            }"
          >
            <canvas
              ref="previewCanvas"
              class="w-full h-full"
              :width="previewSize.width"
              :height="previewSize.height"
            ></canvas>
            <div
              v-if="!collageResult && !isGenerating"
              class="absolute inset-0 flex items-center justify-center text-gray-500"
            >
              {{ $t('tools.heartCollage.previewPlaceholder') }}
            </div>
          </div>

          <div v-if="collageResult" class="mt-4 text-sm text-gray-600">
            {{ $t('tools.heartCollage.collageSize') }}: {{ collageResult.width }} ×
            {{ collageResult.height }} px
          </div>
        </div>
      </div>

      <!-- Images List -->
      <div v-if="images.length > 0" class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ $t('tools.heartCollage.selectedImages') }}
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="relative group border border-gray-200 rounded-lg overflow-hidden"
          >
            <div class="aspect-square flex items-center justify-center bg-gray-100">
              <img :src="image.previewUrl" :alt="image.name" class="object-cover w-full h-full" />
            </div>
            <div
              class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                @click="removeImage(index)"
                class="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div class="p-2 text-xs text-gray-600 truncate">
              {{ image.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { success, error: showError } = useToast()

// Refs
const fileInput = ref<HTMLInputElement | null>(null)
const previewCanvas = ref<HTMLCanvasElement | null>(null)
const previewContainer = ref<HTMLDivElement | null>(null)

// State
const isDragging = ref(false)
const isGenerating = ref(false)
const images = ref<
  Array<{
    file: File
    name: string
    previewUrl: string
    width: number
    height: number
  }>
>([])
const collageResult = ref<string | null>(null)

// Settings
const canvasSize = ref<'small' | 'medium' | 'large'>('medium')
const imageShape = ref<'square' | 'circle' | 'rounded'>('square')
const spacing = ref(2)
const heartSize = ref<'small' | 'medium' | 'large'>('medium')
const backgroundColor = ref('#ffffff')
const showBorder = ref(false)

// Computed
const previewSize = reactive({
  width: 600,
  height: 600,
})

// Watch for canvas size changes
watch(canvasSize, () => {
  updatePreviewSize()
})

// Update preview size based on canvas size setting
function updatePreviewSize() {
  switch (canvasSize.value) {
    case 'small':
      previewSize.width = 400
      previewSize.height = 400
      break
    case 'medium':
      previewSize.width = 600
      previewSize.height = 600
      break
    case 'large':
      previewSize.width = 800
      previewSize.height = 800
      break
  }
}

// File handling functions
function openFileSelector() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    addFiles(Array.from(input.files))
    // Reset input to allow selecting the same file again
    input.value = ''
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  if (event.dataTransfer?.files) {
    const imageFiles = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/'),
    )
    if (imageFiles.length > 0) {
      addFiles(imageFiles)
    } else {
      showError(t('tools.heartCollage.errors.noImages'))
    }
  }
}

async function addFiles(files: File[]) {
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    showError(t('tools.heartCollage.errors.noImages'))
    return
  }

  try {
    for (const file of imageFiles) {
      const previewUrl = URL.createObjectURL(file)

      // Get image dimensions
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = previewUrl
      })

      images.value.push({
        file,
        name: file.name,
        previewUrl,
        width: img.width,
        height: img.height,
      })
    }

    success(t('tools.heartCollage.messages.filesAdded', { count: imageFiles.length }))
  } catch (err) {
    showError(t('tools.heartCollage.errors.fileProcessing'))
    console.error(err)
  }
}

function removeImage(index: number) {
  const image = images.value[index]
  if (image) {
    URL.revokeObjectURL(image.previewUrl)
    images.value.splice(index, 1)
  }
}

function clearAll() {
  // Revoke all object URLs
  images.value.forEach((image) => {
    URL.revokeObjectURL(image.previewUrl)
  })

  images.value = []
  collageResult.value = null
  success(t('tools.heartCollage.messages.cleared'))
}

// Heart shape functions
function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  // Using parametric equations for a more precise heart shape
  const points: { x: number; y: number }[] = []
  for (let t = 0; t <= Math.PI * 2; t += 0.01) {
    const heartX = 16 * Math.pow(Math.sin(t), 3)
    const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))

    // Scale and position the heart
    const scaledX = x + (heartX * size) / 16
    const scaledY = y + (heartY * size) / 16

    points.push({ x: scaledX, y: scaledY })
  }

  // Draw the heart using the calculated points
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.closePath()
}

// Generate heart-shaped collage
async function generateCollage() {
  if (images.value.length === 0) {
    showError(t('tools.heartCollage.errors.noImagesSelected'))
    return
  }

  isGenerating.value = true
  collageResult.value = null

  try {
    await nextTick()

    const canvas = previewCanvas.value
    if (!canvas) {
      throw new Error('Canvas not available')
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Set canvas dimensions based on selected size
    let canvasWidth: number, canvasHeight: number
    switch (canvasSize.value) {
      case 'small':
        canvasWidth = 800
        canvasHeight = 800
        break
      case 'medium':
        canvasWidth = 1200
        canvasHeight = 1200
        break
      case 'large':
        canvasWidth = 1600
        canvasHeight = 1600
        break
    }

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Clear canvas with background color
    ctx.fillStyle = backgroundColor.value
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Calculate heart parameters
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    let heartSizeValue: number

    switch (heartSize.value) {
      case 'small':
        heartSizeValue = Math.min(canvasWidth, canvasHeight) * 0.3
        break
      case 'medium':
        heartSizeValue = Math.min(canvasWidth, canvasHeight) * 0.4
        break
      case 'large':
        heartSizeValue = Math.min(canvasWidth, canvasHeight) * 0.5
        break
    }

    // Create a temporary canvas for the heart mask
    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = canvasWidth
    maskCanvas.height = canvasHeight
    const maskCtx = maskCanvas.getContext('2d')
    if (!maskCtx) {
      throw new Error('Could not get mask canvas context')
    }

    // Draw heart shape on mask
    maskCtx.fillStyle = '#ffffff'
    drawHeart(maskCtx, centerX - heartSizeValue / 2, centerY - heartSizeValue / 2, heartSizeValue)
    maskCtx.fill()

    // Get heart shape pixel data
    const maskData = maskCtx.getImageData(0, 0, canvasWidth, canvasHeight)

    // Find all points within the heart shape
    const heartPoints: { x: number; y: number }[] = []
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const index = (y * canvasWidth + x) * 4
        // Check if pixel is part of the heart (white in mask)
        if (maskData.data[index] > 0) {
          heartPoints.push({ x, y })
        }
      }
    }

    // If we don't have enough points, reduce the requirement
    if (heartPoints.length === 0) {
      showError(t('tools.heartCollage.errors.generationFailed'))
      return
    }

    // Shuffle points to distribute images randomly
    for (let i = heartPoints.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[heartPoints[i], heartPoints[j]] = [heartPoints[j], heartPoints[i]]
    }

    // Calculate image size based on number of images and available points
    const minImageSize = 20
    const maxImageSize = Math.min(canvasWidth, canvasHeight) * 0.1
    const imageSize = Math.max(
      minImageSize,
      Math.min(
        maxImageSize,
        Math.floor(Math.sqrt((heartPoints.length * 0.7) / images.value.length)),
      ),
    )

    // Place images at heart points
    const pointsToUse = Math.min(images.value.length, heartPoints.length)
    const step = Math.max(1, Math.floor(heartPoints.length / pointsToUse))

    for (let i = 0; i < pointsToUse; i++) {
      const pointIndex = i * step
      if (pointIndex >= heartPoints.length) break

      const point = heartPoints[pointIndex]
      const img = new Image()
      img.src = images.value[i].previewUrl

      // Wait for image to load
      await new Promise((resolve) => {
        img.onload = resolve
      })

      // Calculate position to center image at the point
      const x = point.x - imageSize / 2
      const y = point.y - imageSize / 2

      // Save context for clipping
      ctx.save()

      // Create clipping region based on selected shape
      if (imageShape.value === 'circle') {
        ctx.beginPath()
        ctx.arc(point.x, point.y, imageSize / 2, 0, Math.PI * 2)
        ctx.clip()
      } else if (imageShape.value === 'rounded') {
        const radius = imageSize * 0.1
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + imageSize - radius, y)
        ctx.quadraticCurveTo(x + imageSize, y, x + imageSize, y + radius)
        ctx.lineTo(x + imageSize, y + imageSize - radius)
        ctx.quadraticCurveTo(x + imageSize, y + imageSize, x + imageSize - radius, y + imageSize)
        ctx.lineTo(x + radius, y + imageSize)
        ctx.quadraticCurveTo(x, y + imageSize, x, y + imageSize - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.clip()
      }

      // Draw the image
      const scale = Math.max(imageSize / img.width, imageSize / img.height)
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const offsetX = x + (imageSize - scaledWidth) / 2
      const offsetY = y + (imageSize - scaledHeight) / 2

      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

      // Apply border if enabled
      if (showBorder.value) {
        ctx.restore()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        if (imageShape.value === 'circle') {
          ctx.beginPath()
          ctx.arc(point.x, point.y, imageSize / 2 - 1, 0, Math.PI * 2)
          ctx.stroke()
        } else if (imageShape.value === 'rounded') {
          const radius = imageSize * 0.1
          ctx.beginPath()
          ctx.moveTo(x + radius, y)
          ctx.lineTo(x + imageSize - radius, y)
          ctx.quadraticCurveTo(x + imageSize, y, x + imageSize, y + radius)
          ctx.lineTo(x + imageSize, y + imageSize - radius)
          ctx.quadraticCurveTo(x + imageSize, y + imageSize, x + imageSize - radius, y + imageSize)
          ctx.lineTo(x + radius, y + imageSize)
          ctx.quadraticCurveTo(x, y + imageSize, x, y + imageSize - radius)
          ctx.lineTo(x, y + radius)
          ctx.quadraticCurveTo(x, y, x + radius, y)
          ctx.closePath()
          ctx.stroke()
        } else {
          ctx.strokeRect(x + 1, y + 1, imageSize - 2, imageSize - 2)
        }
      } else {
        ctx.restore()
      }
    }

    // Convert to data URL
    collageResult.value = canvas.toDataURL('image/png')
    success(t('tools.heartCollage.messages.collageGenerated'))
  } catch (err) {
    showError(t('tools.heartCollage.errors.generationFailed'))
    console.error(err)
  } finally {
    isGenerating.value = false
  }
}

function downloadCollage() {
  if (!collageResult.value) return

  try {
    const link = document.createElement('a')
    link.download = `heart-collage-${new Date().getTime()}.png`
    link.href = collageResult.value
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success(t('tools.heartCollage.messages.downloadSuccess'))
  } catch (err) {
    showError(t('tools.heartCollage.errors.downloadFailed'))
    console.error(err)
  }
}

// Lifecycle
onMounted(() => {
  updatePreviewSize()
})

onUnmounted(() => {
  // Clean up object URLs
  images.value.forEach((image) => {
    URL.revokeObjectURL(image.previewUrl)
  })
})
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #ec4899;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #ec4899;
  cursor: pointer;
  border: none;
}
</style>
