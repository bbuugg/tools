<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ $t('tools.faviconGenerator.title') }}
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('tools.faviconGenerator.description') }}
        </p>
      </div>

      <!-- Upload Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.faviconGenerator.uploadSection') }}
        </h3>
        
        <div
          v-if="!selectedImage"
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
            accept="image/*"
            @change="handleFileSelect"
            class="hidden"
          />
          <div class="space-y-4">
            <div class="text-6xl text-gray-400">🖼️</div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ $t('tools.faviconGenerator.uploadTitle') }}
              </h3>
              <p class="text-gray-600">
                {{ $t('tools.faviconGenerator.uploadDescription') }}
              </p>
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('tools.faviconGenerator.supportedFormats') }}: JPG, PNG, GIF, WebP
              </p>
            </div>
            <button
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ $t('tools.faviconGenerator.selectImage') }}
            </button>
          </div>
        </div>

        <!-- Image Preview and Cropper -->
        <div v-if="selectedImage" class="space-y-6">
          <div class="flex justify-between items-center">
            <h4 class="text-md font-medium text-gray-900">
              {{ $t('tools.faviconGenerator.cropImage') }}
            </h4>
            <button
              @click="resetImage"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {{ $t('tools.faviconGenerator.selectAnother') }}
            </button>
          </div>

          <!-- Cropper Container -->
          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Image Cropper -->
            <div class="flex-1">
              <div class="relative bg-gray-100 rounded-lg overflow-hidden">
                <canvas
                  ref="cropCanvas"
                  @mousedown="startCrop"
                  @mousemove="updateCrop"
                  @mouseup="endCrop"
                  @touchstart="startCrop"
                  @touchmove="updateCrop"
                  @touchend="endCrop"
                  class="max-w-full h-auto cursor-crosshair border border-gray-300"
                  :width="canvasSize.width"
                  :height="canvasSize.height"
                />
              </div>
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('tools.faviconGenerator.cropInstruction') }}
              </p>
            </div>

            <!-- Settings Panel -->
            <div class="lg:w-80 space-y-6">
              <!-- Format Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('tools.faviconGenerator.outputFormat') }}
                </label>
                <select
                  v-model="outputFormat"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ico">ICO</option>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
              </div>

              <!-- Size Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('tools.faviconGenerator.sizes') }}
                </label>
                <div class="space-y-2">
                  <label
                    v-for="size in availableSizes"
                    :key="size"
                    class="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      v-model="selectedSizes"
                      :value="size"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">{{ size }}×{{ size }} px</span>
                  </label>
                </div>
              </div>

              <!-- Generate Button -->
              <button
                @click="generateFavicons"
                :disabled="selectedSizes.length === 0 || isGenerating"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isGenerating" class="flex items-center justify-center">
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
                  {{ $t('tools.faviconGenerator.generating') }}
                </span>
                <span v-else>{{ $t('tools.faviconGenerator.generate') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Generated Favicons -->
      <div v-if="generatedFavicons.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ $t('tools.faviconGenerator.generatedFavicons') }} ({{ generatedFavicons.length }})
          </h3>
          <button
            @click="downloadAll"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {{ $t('tools.faviconGenerator.downloadAll') }}
          </button>
        </div>

        <!-- Favicon Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            v-for="favicon in generatedFavicons"
            :key="`${favicon.size}-${favicon.format}`"
            class="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
          >
            <div class="flex justify-center items-center h-16 mb-3 bg-gray-50 rounded">
              <img
                :src="favicon.dataUrl"
                :alt="`${favicon.size}x${favicon.size} favicon`"
                class="max-w-full max-h-full"
                :style="{ width: Math.min(favicon.size, 48) + 'px', height: Math.min(favicon.size, 48) + 'px' }"
              />
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">
              {{ favicon.size }}×{{ favicon.size }}
            </div>
            <div class="text-xs text-gray-500 mb-3">
              {{ favicon.format.toUpperCase() }}
            </div>
            <button
              @click="downloadFavicon(favicon)"
              class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {{ $t('common.download') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Usage Instructions -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.faviconGenerator.usageInstructions') }}
        </h3>
        <div class="prose prose-sm max-w-none text-gray-700">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-gray-900 mb-2">
                {{ $t('tools.faviconGenerator.htmlUsage') }}
              </h4>
              <pre class="bg-gray-100 p-3 rounded text-xs overflow-x-auto"><code>&lt;!-- Basic favicon --&gt;
&lt;link rel="shortcut icon" href="/favicon.ico" /&gt;

&lt;!-- Multiple sizes --&gt;
&lt;link rel="icon" sizes="16x16" href="/favicon-16.png" /&gt;
&lt;link rel="icon" sizes="32x32" href="/favicon-32.png" /&gt;
&lt;link rel="icon" sizes="48x48" href="/favicon-48.png" /&gt;</code></pre>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 mb-2">
                {{ $t('tools.faviconGenerator.tips') }}
              </h4>
              <ul class="text-sm space-y-1 list-disc list-inside">
                <li>{{ $t('tools.faviconGenerator.tip1') }}</li>
                <li>{{ $t('tools.faviconGenerator.tip2') }}</li>
                <li>{{ $t('tools.faviconGenerator.tip3') }}</li>
                <li>{{ $t('tools.faviconGenerator.tip4') }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Descriptions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🎨 {{ $t('tools.faviconGenerator.features.cropping.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.faviconGenerator.features.cropping.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            📐 {{ $t('tools.faviconGenerator.features.multiSize.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.faviconGenerator.features.multiSize.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🔄 {{ $t('tools.faviconGenerator.features.formats.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.faviconGenerator.features.formats.description') }}
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

interface FaviconResult {
  size: number
  format: string
  dataUrl: string
  blob: Blob
  filename: string
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

const { t } = useI18n()
const { success, error: showError } = useToast()

const fileInput = ref<HTMLInputElement>()
const cropCanvas = ref<HTMLCanvasElement>()
const selectedImage = ref<HTMLImageElement | null>(null)
const isDragging = ref(false)
const isGenerating = ref(false)
const isCropping = ref(false)

const outputFormat = ref('ico')
const availableSizes = [16, 32, 48, 64, 128]
const selectedSizes = ref([16, 32, 48])
const generatedFavicons = ref<FaviconResult[]>([])

const canvasSize = ref({ width: 400, height: 400 })
const cropArea = ref<CropArea>({ x: 50, y: 50, width: 300, height: 300 })
const imageScale = ref(1)
const imageOffset = ref({ x: 0, y: 0 })

// Computed properties
const cropStyle = computed(() => ({
  left: `${cropArea.value.x}px`,
  top: `${cropArea.value.y}px`,
  width: `${cropArea.value.width}px`,
  height: `${cropArea.value.height}px`,
}))

// File handling
function openFileSelector() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    loadImage(file)
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    loadImage(file)
  } else {
    showError(t('tools.faviconGenerator.errors.invalidFile'))
  }
}

function loadImage(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      selectedImage.value = img
      setupCanvas()
      success(t('tools.faviconGenerator.success.imageLoaded'))
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function resetImage() {
  selectedImage.value = null
  generatedFavicons.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Canvas setup and drawing
function setupCanvas() {
  if (!selectedImage.value || !cropCanvas.value) return

  const canvas = cropCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const img = selectedImage.value
  
  // Calculate scale to fit image in canvas
  const maxSize = 400
  const scale = Math.min(maxSize / img.width, maxSize / img.height)
  
  canvasSize.value.width = img.width * scale
  canvasSize.value.height = img.height * scale
  
  canvas.width = canvasSize.value.width
  canvas.height = canvasSize.value.height

  imageScale.value = scale
  
  // Set initial crop area to center square
  const size = Math.min(canvasSize.value.width, canvasSize.value.height) * 0.8
  cropArea.value = {
    x: (canvasSize.value.width - size) / 2,
    y: (canvasSize.value.height - size) / 2,
    width: size,
    height: size,
  }

  drawCanvas()
}

function drawCanvas() {
  if (!selectedImage.value || !cropCanvas.value) return

  const canvas = cropCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Draw image
  ctx.drawImage(selectedImage.value, 0, 0, canvasSize.value.width, canvasSize.value.height)
  
  // Draw crop overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Clear crop area
  ctx.clearRect(cropArea.value.x, cropArea.value.y, cropArea.value.width, cropArea.value.height)
  
  // Redraw image in crop area
  ctx.drawImage(
    selectedImage.value,
    cropArea.value.x, cropArea.value.y, cropArea.value.width, cropArea.value.height,
    cropArea.value.x, cropArea.value.y, cropArea.value.width, cropArea.value.height
  )
  
  // Draw crop border
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.strokeRect(cropArea.value.x, cropArea.value.y, cropArea.value.width, cropArea.value.height)
  
  // Draw corner handles
  const handleSize = 8
  const handles = [
    { x: cropArea.value.x - handleSize/2, y: cropArea.value.y - handleSize/2 },
    { x: cropArea.value.x + cropArea.value.width - handleSize/2, y: cropArea.value.y - handleSize/2 },
    { x: cropArea.value.x - handleSize/2, y: cropArea.value.y + cropArea.value.height - handleSize/2 },
    { x: cropArea.value.x + cropArea.value.width - handleSize/2, y: cropArea.value.y + cropArea.value.height - handleSize/2 },
  ]
  
  ctx.fillStyle = '#3b82f6'
  handles.forEach(handle => {
    ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
  })
}

// Crop functionality
function startCrop(event: MouseEvent | TouchEvent) {
  isCropping.value = true
  const rect = cropCanvas.value?.getBoundingClientRect()
  if (!rect) return

  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  const x = clientX - rect.left
  const y = clientY - rect.top
  
  // Simple drag to move crop area
  cropArea.value.x = Math.max(0, Math.min(canvasSize.value.width - cropArea.value.width, x - cropArea.value.width / 2))
  cropArea.value.y = Math.max(0, Math.min(canvasSize.value.height - cropArea.value.height, y - cropArea.value.height / 2))
  
  drawCanvas()
}

function updateCrop(event: MouseEvent | TouchEvent) {
  if (!isCropping.value) return
  
  const rect = cropCanvas.value?.getBoundingClientRect()
  if (!rect) return

  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  const x = clientX - rect.left
  const y = clientY - rect.top
  
  cropArea.value.x = Math.max(0, Math.min(canvasSize.value.width - cropArea.value.width, x - cropArea.value.width / 2))
  cropArea.value.y = Math.max(0, Math.min(canvasSize.value.height - cropArea.value.height, y - cropArea.value.height / 2))
  
  drawCanvas()
}

function endCrop() {
  isCropping.value = false
}

// Favicon generation
async function generateFavicons() {
  if (!selectedImage.value || selectedSizes.value.length === 0) return

  isGenerating.value = true
  generatedFavicons.value = []

  try {
    for (const size of selectedSizes.value) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) continue

      canvas.width = size
      canvas.height = size

      // Calculate source crop area in original image coordinates
      const sourceX = cropArea.value.x / imageScale.value
      const sourceY = cropArea.value.y / imageScale.value
      const sourceSize = cropArea.value.width / imageScale.value

      // Draw cropped and resized image
      ctx.drawImage(
        selectedImage.value,
        sourceX, sourceY, sourceSize, sourceSize,
        0, 0, size, size
      )

      // Convert to blob
      const mimeType = outputFormat.value === 'ico' ? 'image/png' : `image/${outputFormat.value}`
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), mimeType, 0.9)
      })

      const dataUrl = canvas.toDataURL(mimeType, 0.9)
      const extension = outputFormat.value === 'ico' ? 'ico' : outputFormat.value
      const filename = `favicon-${size}.${extension}`

      generatedFavicons.value.push({
        size,
        format: outputFormat.value,
        dataUrl,
        blob,
        filename,
      })
    }

    success(t('tools.faviconGenerator.success.generationComplete'))
  } catch (err) {
    console.error('Generation error:', err)
    showError(t('tools.faviconGenerator.errors.generationFailed'))
  } finally {
    isGenerating.value = false
  }
}

// Download functionality
function downloadFavicon(favicon: FaviconResult) {
  const url = URL.createObjectURL(favicon.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = favicon.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function downloadAll() {
  if (generatedFavicons.value.length === 0) return

  try {
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()

    for (const favicon of generatedFavicons.value) {
      zip.file(favicon.filename, favicon.blob)
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = `favicons_${new Date().toISOString().split('T')[0]}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    success(t('tools.faviconGenerator.success.downloadComplete'))
  } catch (err) {
    console.error('Download error:', err)
    showError(t('tools.faviconGenerator.errors.downloadFailed'))
  }
}

// Lifecycle
onMounted(() => {
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

  document.addEventListener('dragover', (e) => {
    e.preventDefault()
  })

  document.addEventListener('drop', (e) => {
    e.preventDefault()
    isDragging.value = false
  })
})

onUnmounted(() => {
  // Cleanup
  if (selectedImage.value) {
    URL.revokeObjectURL(selectedImage.value.src)
  }
})
</script>

<style scoped>
canvas {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>