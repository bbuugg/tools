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

          <!-- Shape Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.heartCollage.shape') }}
            </label>
            <select
              v-model="selectedShape"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="heart">{{ $t('tools.heartCollage.heart') }}</option>
              <option value="square">{{ $t('tools.heartCollage.square') }}</option>
              <option value="rectangle">{{ $t('tools.heartCollage.rectangle') }}</option>
              <option value="circle">{{ $t('tools.heartCollage.circle') }}</option>
              <option value="star">{{ $t('tools.heartCollage.star') }}</option>
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
        </div>

        <!-- Additional Options -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <h4 class="text-md font-medium text-gray-900 mb-4">
            {{ $t('tools.heartCollage.additionalOptions') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <!-- Canvas and Controls -->
      <div v-if="images.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        >
          <h3 class="text-lg font-semibold text-gray-900">
            {{ $t('tools.heartCollage.canvas') }} ({{ images.length }}
            {{ $t('tools.heartCollage.images') }})
          </h3>
          <div class="flex flex-wrap gap-3">
            <button
              @click="autoArrange"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ $t('tools.heartCollage.autoArrange') }}
            </button>
            <button
              @click="downloadCollage"
              :disabled="!collageResult"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        <!-- Interactive Canvas -->
        <div class="flex flex-col items-center">
          <div
            ref="canvasContainer"
            class="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-100"
            :style="{
              width: `${canvasDimensions.width}px`,
              height: `${canvasDimensions.height}px`,
            }"
          >
            <canvas
              ref="mainCanvas"
              class="absolute inset-0 w-full h-full"
              @mousedown="startDrag"
              @mousemove="drag"
              @mouseup="endDrag"
              @mouseleave="endDrag"
            ></canvas>

            <!-- Draggable images -->
            <div
              v-for="(image, index) in positionedImages"
              :key="index"
              :class="['absolute cursor-move', draggingImage === index ? 'z-10' : 'z-0']"
              :style="{
                left: `${image.x}px`,
                top: `${image.y}px`,
                width: `${image.width}px`,
                height: `${image.height}px`,
              }"
              @mousedown="startImageDrag($event, index)"
            >
              <div
                :class="[
                  'w-full h-full overflow-hidden',
                  imageShape === 'circle'
                    ? 'rounded-full'
                    : imageShape === 'rounded'
                      ? 'rounded-xl'
                      : 'rounded-none',
                ]"
                :style="{
                  border: showBorder ? '2px solid white' : 'none',
                  boxShadow: draggingImage === index ? '0 0 0 2px #3b82f6' : 'none',
                }"
              >
                <img :src="image.src" :alt="image.name" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div class="mt-4 text-sm text-gray-600">
            {{ $t('tools.heartCollage.dragInstructions') }}
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
const mainCanvas = ref<HTMLCanvasElement | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)

// State
const isDragging = ref(false)
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

// Interactive state
const positionedImages = ref<
  Array<{
    src: string
    name: string
    x: number
    y: number
    width: number
    height: number
  }>
>([])
const draggingImage = ref<number | null>(null)
const dragOffset = reactive({ x: 0, y: 0 })

// Settings
const canvasSize = ref<'small' | 'medium' | 'large'>('medium')
const selectedShape = ref<'heart' | 'square' | 'rectangle' | 'circle' | 'star'>('heart')
const imageShape = ref<'square' | 'circle' | 'rounded'>('square')
const spacing = ref(2)
const backgroundColor = ref('#ffffff')
const showBorder = ref(false)

// Computed
const canvasDimensions = reactive({
  width: 600,
  height: 600,
})

// Watch for canvas size changes
watch(canvasSize, () => {
  updateCanvasDimensions()
})

// Update canvas dimensions based on size setting
function updateCanvasDimensions() {
  switch (canvasSize.value) {
    case 'small':
      canvasDimensions.width = 600
      canvasDimensions.height = 600
      break
    case 'medium':
      canvasDimensions.width = 800
      canvasDimensions.height = 800
      break
    case 'large':
      canvasDimensions.width = 1000
      canvasDimensions.height = 1000
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
  positionedImages.value = []
  collageResult.value = null
  success(t('tools.heartCollage.messages.cleared'))
}

// Shape drawing functions
function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.beginPath()

  switch (shape) {
    case 'heart':
      // Heart shape using parametric equations
      const size = Math.min(width, height) * 0.4
      const centerX = x + width / 2
      const centerY = y + height / 2

      for (let t = 0; t <= Math.PI * 2; t += 0.01) {
        const heartX = 16 * Math.pow(Math.sin(t), 3)
        const heartY = -(
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        )

        const px = centerX + (heartX * size) / 16
        const py = centerY + (heartY * size) / 16

        if (t === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      break

    case 'square':
      ctx.rect(x + width * 0.1, y + height * 0.1, width * 0.8, height * 0.8)
      break

    case 'rectangle':
      ctx.rect(x + width * 0.05, y + height * 0.2, width * 0.9, height * 0.6)
      break

    case 'circle':
      ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) * 0.4, 0, Math.PI * 2)
      break

    case 'star':
      const cx = x + width / 2
      const cy = y + height / 2
      const outerRadius = Math.min(width, height) * 0.4
      const innerRadius = outerRadius * 0.5
      const spikes = 5

      let rot = (Math.PI / 2) * 3
      let x1 = cx
      let y1 = cy
      let x2 = cx
      let y2 = cy

      ctx.moveTo(cx, cy - outerRadius)

      for (let i = 0; i < spikes; i++) {
        x1 = cx + Math.cos(rot) * outerRadius
        y1 = cy + Math.sin(rot) * outerRadius
        ctx.lineTo(x1, y1)
        rot += Math.PI / spikes

        x2 = cx + Math.cos(rot) * innerRadius
        y2 = cy + Math.sin(rot) * innerRadius
        ctx.lineTo(x2, y2)
        rot += Math.PI / spikes
      }

      ctx.lineTo(cx, cy - outerRadius)
      break
  }

  ctx.closePath()
}

// Auto arrange images within the selected shape
function autoArrange() {
  if (images.value.length === 0) {
    showError(t('tools.heartCollage.errors.noImagesSelected'))
    return
  }

  positionedImages.value = []

  // Calculate grid dimensions based on number of images
  const gridSize = Math.ceil(Math.sqrt(images.value.length))
  const cellWidth = canvasDimensions.width / gridSize
  const cellHeight = canvasDimensions.height / gridSize

  // Create a mask for the selected shape
  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = canvasDimensions.width
  maskCanvas.height = canvasDimensions.height
  const maskCtx = maskCanvas.getContext('2d')

  if (maskCtx) {
    maskCtx.fillStyle = '#ffffff'
    drawShape(maskCtx, selectedShape.value, 0, 0, canvasDimensions.width, canvasDimensions.height)
    maskCtx.fill()

    // Get mask pixel data
    const maskData = maskCtx.getImageData(0, 0, canvasDimensions.width, canvasDimensions.height)

    // Find points within the shape
    const shapePoints: { x: number; y: number }[] = []
    for (let y = 0; y < canvasDimensions.height; y += 10) {
      for (let x = 0; x < canvasDimensions.width; x += 10) {
        const index = (y * canvasDimensions.width + x) * 4
        if (maskData.data[index] > 0) {
          shapePoints.push({ x, y })
        }
      }
    }

    // Shuffle points
    for (let i = shapePoints.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shapePoints[i], shapePoints[j]] = [shapePoints[j], shapePoints[i]]
    }

    // Position images
    const imageSize = Math.min(cellWidth, cellHeight) * 0.8

    for (let i = 0; i < Math.min(images.value.length, shapePoints.length); i++) {
      const point = shapePoints[i]
      const x = point.x - imageSize / 2
      const y = point.y - imageSize / 2

      // Ensure image is within canvas bounds
      const finalX = Math.max(0, Math.min(canvasDimensions.width - imageSize, x))
      const finalY = Math.max(0, Math.min(canvasDimensions.height - imageSize, y))

      positionedImages.value.push({
        src: images.value[i].previewUrl,
        name: images.value[i].name,
        x: finalX,
        y: finalY,
        width: imageSize,
        height: imageSize,
      })
    }
  }

  success(t('tools.heartCollage.messages.arranged'))
}

// Drag and drop functionality for images
function startImageDrag(event: MouseEvent, index: number) {
  event.preventDefault()
  draggingImage.value = index

  const image = positionedImages.value[index]
  dragOffset.x = event.clientX - image.x
  dragOffset.y = event.clientY - image.y
}

function drag(event: MouseEvent) {
  if (draggingImage.value !== null) {
    const image = positionedImages.value[draggingImage.value]

    // Calculate new position
    let newX = event.clientX - dragOffset.x
    let newY = event.clientY - dragOffset.y

    // Constrain to canvas bounds
    newX = Math.max(0, Math.min(canvasDimensions.width - image.width, newX))
    newY = Math.max(0, Math.min(canvasDimensions.height - image.height, newY))

    // Update position
    image.x = newX
    image.y = newY
  }
}

function endDrag() {
  draggingImage.value = null
}

// Download collage
function downloadCollage() {
  if (!mainCanvas.value) return

  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvasDimensions.width
    canvas.height = canvasDimensions.height
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // Draw background
      ctx.fillStyle = backgroundColor.value
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw positioned images
      positionedImages.value.forEach((image) => {
        const img = new Image()
        img.src = image.src

        // We need to draw the image with the same clipping as in the UI
        ctx.save()

        if (imageShape.value === 'circle') {
          ctx.beginPath()
          ctx.arc(
            image.x + image.width / 2,
            image.y + image.height / 2,
            image.width / 2,
            0,
            Math.PI * 2,
          )
          ctx.clip()
        } else if (imageShape.value === 'rounded') {
          const radius = image.width * 0.1
          ctx.beginPath()
          ctx.moveTo(image.x + radius, image.y)
          ctx.lineTo(image.x + image.width - radius, image.y)
          ctx.quadraticCurveTo(
            image.x + image.width,
            image.y,
            image.x + image.width,
            image.y + radius,
          )
          ctx.lineTo(image.x + image.width, image.y + image.height - radius)
          ctx.quadraticCurveTo(
            image.x + image.width,
            image.y + image.height,
            image.x + image.width - radius,
            image.y + image.height,
          )
          ctx.lineTo(image.x + radius, image.y + image.height)
          ctx.quadraticCurveTo(
            image.x,
            image.y + image.height,
            image.x,
            image.y + image.height - radius,
          )
          ctx.lineTo(image.x, image.y + radius)
          ctx.quadraticCurveTo(image.x, image.y, image.x + radius, image.y)
          ctx.closePath()
          ctx.clip()
        }

        // Draw the image
        ctx.drawImage(img, image.x, image.y, image.width, image.height)

        // Draw border if enabled
        if (showBorder.value) {
          ctx.restore()
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2

          if (imageShape.value === 'circle') {
            ctx.beginPath()
            ctx.arc(
              image.x + image.width / 2,
              image.y + image.height / 2,
              image.width / 2 - 1,
              0,
              Math.PI * 2,
            )
            ctx.stroke()
          } else if (imageShape.value === 'rounded') {
            const radius = image.width * 0.1
            ctx.beginPath()
            ctx.moveTo(image.x + radius, image.y)
            ctx.lineTo(image.x + image.width - radius, image.y)
            ctx.quadraticCurveTo(
              image.x + image.width,
              image.y,
              image.x + image.width,
              image.y + radius,
            )
            ctx.lineTo(image.x + image.width, image.y + image.height - radius)
            ctx.quadraticCurveTo(
              image.x + image.width,
              image.y + image.height,
              image.x + image.width - radius,
              image.y + image.height,
            )
            ctx.lineTo(image.x + radius, image.y + image.height)
            ctx.quadraticCurveTo(
              image.x,
              image.y + image.height,
              image.x,
              image.y + image.height - radius,
            )
            ctx.lineTo(image.x, image.y + radius)
            ctx.quadraticCurveTo(image.x, image.y, image.x + radius, image.y)
            ctx.closePath()
            ctx.stroke()
          } else {
            ctx.strokeRect(image.x + 1, image.y + 1, image.width - 2, image.height - 2)
          }
        } else {
          ctx.restore()
        }
      })

      // Convert to data URL
      collageResult.value = canvas.toDataURL('image/png')

      // Trigger download
      const link = document.createElement('a')
      link.download = `collage-${selectedShape.value}-${new Date().getTime()}.png`
      link.href = collageResult.value
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      success(t('tools.heartCollage.messages.downloadSuccess'))
    }
  } catch (err) {
    showError(t('tools.heartCollage.errors.downloadFailed'))
    console.error(err)
  }
}

// Lifecycle
onMounted(() => {
  updateCanvasDimensions()
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
