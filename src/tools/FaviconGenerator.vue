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
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('tools.faviconGenerator.pasteHint') }}
              </p>
            </div>
            <button
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ $t('tools.faviconGenerator.selectImage') }}
            </button>
          </div>
        </div>

        <!-- Image Cropper and Settings -->
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

          <!-- Professional Image Cropper -->
          <div class="flex flex-col xl:flex-row gap-6">
            <!-- Vue Advanced Cropper - Responsive -->
            <div class="flex-1 min-w-0">
              <h5 class="text-sm font-medium text-gray-700 mb-3">
                {{ $t('tools.faviconGenerator.cropPreview') }}
              </h5>
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="cropper-container w-full" style="height: 600px">
                  <Cropper
                    ref="cropperRef"
                    :src="originalImageUrl"
                    :stencil-props="{
                      aspectRatio: 1,
                      movable: true,
                      resizable: true,
                    }"
                    :resize-image="{
                      adjustStencil: false,
                    }"
                    :default-size="{ width: 200, height: 200 }"
                    @change="onCropChange"
                    class="rounded border border-gray-300 w-full h-full"
                  />
                </div>
              </div>
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('tools.faviconGenerator.cropInstructionAdvanced') }}
              </p>
            </div>

            <!-- Settings Panel - Fixed Width -->
            <div class="xl:w-80 w-full xl:flex-shrink-0 space-y-6">
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
                :style="{
                  width: Math.min(favicon.size, 48) + 'px',
                  height: Math.min(favicon.size, 48) + 'px',
                }"
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
              <pre
                class="bg-gray-100 p-3 rounded text-xs overflow-x-auto"
              ><code>&lt;!-- Basic favicon --&gt;
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

interface FaviconResult {
  size: number
  format: string
  dataUrl: string
  blob: Blob
  filename: string
}

interface CropperCoordinates {
  left: number
  top: number
  width: number
  height: number
}

interface CropData {
  coordinates: CropperCoordinates
  canvas: HTMLCanvasElement | null
}

const { t } = useI18n()
const { success, error: showError } = useToast()

const fileInput = ref<HTMLInputElement>()
const cropperRef = ref<InstanceType<typeof Cropper>>()
const selectedImage = ref<HTMLImageElement | null>(null)
const originalImageUrl = ref<string>('')
const originalImageSize = ref({ width: 0, height: 0 })
const isDragging = ref(false)
const isGenerating = ref(false)
const currentCropData = ref<CropData | null>(null)

const outputFormat = ref('ico')
const availableSizes = [16, 32, 48, 64, 128]
const selectedSizes = ref([16, 32, 48])
const generatedFavicons = ref<FaviconResult[]>([])

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

// Handle paste event for clipboard images
function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        loadImage(file)
        success(t('tools.faviconGenerator.messages.pasteSuccess'))
        return
      }
    }
  }
}

function loadImage(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const imageUrl = e.target?.result as string
    const img = new Image()
    img.onload = () => {
      selectedImage.value = img
      originalImageUrl.value = imageUrl
      originalImageSize.value = { width: img.width, height: img.height }

      success(t('tools.faviconGenerator.success.imageLoaded'))
    }
    img.onerror = () => {
      showError(t('tools.faviconGenerator.errors.imageLoadFailed'))
    }
    img.src = imageUrl
  }
  reader.onerror = () => {
    showError(t('tools.faviconGenerator.errors.fileReadFailed'))
  }
  reader.readAsDataURL(file)
}

function resetImage() {
  selectedImage.value = null
  originalImageUrl.value = ''
  originalImageSize.value = { width: 0, height: 0 }
  currentCropData.value = null
  generatedFavicons.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Vue Advanced Cropper event handlers
function onCropChange({ coordinates, canvas }: CropData) {
  currentCropData.value = { coordinates, canvas }
}

// Favicon generation with Vue Advanced Cropper data
async function generateFavicons() {
  if (!selectedImage.value || selectedSizes.value.length === 0 || !currentCropData.value) return

  isGenerating.value = true
  generatedFavicons.value = []

  try {
    for (const size of selectedSizes.value) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) continue

      canvas.width = size
      canvas.height = size

      // Use the cropped canvas from Vue Advanced Cropper
      if (currentCropData.value.canvas) {
        // Draw the already cropped canvas to our target size
        ctx.drawImage(currentCropData.value.canvas, 0, 0, size, size)
      } else {
        // Fallback: use coordinates to crop manually
        const coords = currentCropData.value.coordinates
        ctx.drawImage(
          selectedImage.value,
          coords.left,
          coords.top,
          coords.width,
          coords.height,
          0,
          0,
          size,
          size,
        )
      }

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
  // Add paste event listener
  document.addEventListener('paste', handlePaste)

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
  // Remove paste event listener
  document.removeEventListener('paste', handlePaste)

  // Cleanup
  if (originalImageUrl.value) {
    URL.revokeObjectURL(originalImageUrl.value)
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
