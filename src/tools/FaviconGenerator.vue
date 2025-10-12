<template>
  <ToolLayout
    :icon="'🖼️'"
    :title="$t('tools.faviconGenerator.title')"
    :description="$t('tools.faviconGenerator.description')"
    :features="[
      $t('tools.faviconGenerator.features.cropping.title'),
      $t('tools.faviconGenerator.features.multiSize.title'),
      $t('tools.faviconGenerator.features.formats.title'),
    ]"
  >
    <template #header-actions>
      <Button
        v-if="generatedFavicons.length > 0"
        @click="downloadAll"
        variant="success"
        size="md"
        :icon-left="DownloadIcon"
      >
        {{ $t('tools.faviconGenerator.downloadAll') }}
      </Button>
    </template>

    <template #default>
      <!-- Upload Section -->
      <div class="glass rounded-xl p-6 mb-8 border border-slate-700/50">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-2">
          {{ $t('tools.faviconGenerator.uploadSection') }}
        </h3>

        <div
          v-if="!selectedImage"
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          @click="openFileSelector"
          :class="[
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover-lift',
            isDragging
              ? 'border-primary-500 bg-primary-500/20 shadow-glow'
              : 'border-slate-600 hover:border-slate-500',
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
            <div class="text-5xl text-slate-400">🖼️</div>
            <div>
              <h3 class="text-lg font-medium text-slate-100 mb-2">
                {{ $t('tools.faviconGenerator.uploadTitle') }}
              </h3>
              <p class="text-slate-400">
                {{ $t('tools.faviconGenerator.uploadDescription') }}
              </p>
              <p class="text-sm text-slate-500 mt-2">
                {{ $t('tools.faviconGenerator.supportedFormats') }}: JPG, PNG, GIF, WebP
              </p>
              <p class="text-sm text-slate-500 mt-2">
                {{ $t('tools.faviconGenerator.pasteHint') }}
              </p>
            </div>
            <Button variant="primary" size="md">
              {{ $t('tools.faviconGenerator.selectImage') }}
            </Button>
          </div>
        </div>

        <!-- Image Cropper and Settings -->
        <div v-if="selectedImage" class="space-y-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h4 class="text-md font-medium text-slate-100">
              {{ $t('tools.faviconGenerator.cropImage') }}
            </h4>
            <Button @click="resetImage" variant="secondary" size="sm" :icon-left="RefreshIcon">
              {{ $t('tools.faviconGenerator.selectAnother') }}
            </Button>
          </div>

          <!-- Professional Image Cropper -->
          <div class="flex flex-col xl:flex-row gap-6">
            <!-- Vue Advanced Cropper - Responsive -->
            <div class="flex-1 min-w-0">
              <h5 class="text-sm font-medium text-slate-300 mb-3">
                {{ $t('tools.faviconGenerator.cropPreview') }}
              </h5>
              <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 glass">
                <div class="cropper-container w-full" style="height: 500px">
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
                    class="rounded-xl border border-slate-700 w-full h-full"
                  />
                </div>
              </div>
              <p class="text-sm text-slate-500 mt-2">
                {{ $t('tools.faviconGenerator.cropInstructionAdvanced') }}
              </p>
            </div>

            <!-- Settings Panel - Fixed Width -->
            <div class="xl:w-80 w-full xl:flex-shrink-0 space-y-6">
              <!-- Format Selection -->
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  {{ $t('tools.faviconGenerator.outputFormat') }}
                </label>
                <select
                  v-model="outputFormat"
                  class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-100 transition-all duration-200"
                >
                  <option value="ico">ICO</option>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
              </div>

              <!-- Size Selection -->
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  {{ $t('tools.faviconGenerator.sizes') }}
                </label>
                <div class="space-y-2">
                  <label
                    v-for="size in availableSizes"
                    :key="size"
                    class="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-slate-800/70 transition-colors duration-200 border border-slate-700/50"
                  >
                    <input
                      type="checkbox"
                      v-model="selectedSizes"
                      :value="size"
                      class="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-slate-600 bg-slate-800"
                    />
                    <span class="text-sm font-medium text-slate-300">{{ size }}×{{ size }} px</span>
                  </label>
                </div>
              </div>

              <!-- Generate Button -->
              <Button
                @click="generateFavicons"
                :disabled="selectedSizes.length === 0 || isGenerating"
                :loading="isGenerating"
                variant="primary"
                size="lg"
                class="w-full"
              >
                {{ $t('tools.faviconGenerator.generate') }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Generated Favicons -->
      <div
        v-if="generatedFavicons.length > 0"
        class="rounded-2xl p-6 mb-8 glass border border-slate-700/50"
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.faviconGenerator.generatedFavicons') }} ({{ generatedFavicons.length }})
          </h3>
        </div>

        <!-- Favicon Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card
            v-for="favicon in generatedFavicons"
            :key="`${favicon.size}-${favicon.format}`"
            class="text-center border border-slate-700/50 bg-slate-800/30"
          >
            <template #content>
              <div class="flex justify-center items-center h-20 mb-4 bg-slate-800/50 rounded-lg">
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
              <div class="text-sm font-medium text-slate-100 mb-1">
                {{ favicon.size }}×{{ favicon.size }}
              </div>
              <div class="text-xs text-slate-400 mb-4">
                {{ favicon.format.toUpperCase() }}
              </div>
              <Button @click="downloadFavicon(favicon)" variant="primary" size="sm" class="w-full">
                {{ $t('common.download') }}
              </Button>
            </template>
          </Card>
        </div>
      </div>

      <!-- Usage Instructions -->
      <div class="rounded-2xl p-6 mb-8 glass border border-slate-700/50">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-2">
          {{ $t('tools.faviconGenerator.usageInstructions') }}
        </h3>
        <div class="prose prose-sm max-w-none text-slate-300">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-slate-100 mb-2">
                {{ $t('tools.faviconGenerator.htmlUsage') }}
              </h4>
              <pre
                class="bg-slate-800/50 text-green-400 p-4 rounded-xl text-xs overflow-x-auto border border-slate-700/50"
              ><code>&lt;!-- Basic favicon --&gt;
&lt;link rel="shortcut icon" href="/favicon.ico" /&gt;

&lt;!-- Multiple sizes --&gt;
&lt;link rel="icon" sizes="16x16" href="/favicon-16.png" /&gt;
&lt;link rel="icon" sizes="32x32" href="/favicon-32.png" /&gt;
&lt;link rel="icon" sizes="48x48" href="/favicon-48.png" /&gt;</code></pre>
            </div>
            <div>
              <h4 class="font-medium text-slate-100 mb-2">
                {{ $t('tools.faviconGenerator.tips') }}
              </h4>
              <ul
                class="text-sm space-y-2 list-disc list-inside bg-blue-500/10 p-4 rounded-xl border border-blue-500/30"
              >
                <li class="text-blue-300">{{ $t('tools.faviconGenerator.tip1') }}</li>
                <li class="text-blue-300">{{ $t('tools.faviconGenerator.tip2') }}</li>
                <li class="text-blue-300">{{ $t('tools.faviconGenerator.tip3') }}</li>
                <li class="text-blue-300">{{ $t('tools.faviconGenerator.tip4') }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </template>
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import ToolLayout from '@/components/ToolLayout.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import { DownloadIcon, RefreshIcon } from '@/components/ui/icons'

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

/* Add glass effect classes */
.glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0f172a;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Hover lift effect */
.hover-lift {
  transition: all 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
}
</style>
