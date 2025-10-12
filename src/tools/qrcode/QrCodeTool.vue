<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 text-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-slate-100 mb-4 text-gradient">
          {{ $t('tools.qrCodeTool.title') }}
        </h1>
        <p class="text-xl text-slate-300 max-w-3xl mx-auto">
          {{ $t('tools.qrCodeTool.description') }}
        </p>
      </div>

      <!-- Toggle Switch -->
      <div class="flex justify-center mb-8">
        <div class="inline-flex rounded-xl shadow-dark-lg" role="group">
          <button
            type="button"
            @click="activeTab = 'generate'"
            :class="[
              'px-6 py-3 text-sm font-medium rounded-l-xl transition-all duration-200 cursor-pointer hover-lift',
              activeTab === 'generate'
                ? 'bg-primary-600 text-white shadow-glow'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-r border-slate-600/50',
            ]"
          >
            {{ $t('tools.qrCodeTool.tabs.generate') }}
          </button>
          <button
            type="button"
            @click="activeTab = 'recognize'"
            :class="[
              'px-6 py-3 text-sm font-medium rounded-r-xl transition-all duration-200 cursor-pointer hover-lift',
              activeTab === 'recognize'
                ? 'bg-primary-600 text-white shadow-glow'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50',
            ]"
          >
            {{ $t('tools.qrCodeTool.tabs.recognize') }}
          </button>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="glass p-6 rounded-xl border border-slate-700/30 hover-lift transition-all duration-300">
          <div class="text-2xl mb-3 animate-bounce-subtle">🔄</div>
          <h3 class="text-lg font-semibold text-slate-100 mb-2">
            {{ $t('tools.qrCodeTool.features.batch.title') }}
          </h3>
          <p class="text-slate-300 text-sm">
            {{ $t('tools.qrCodeTool.features.batch.description') }}
          </p>
        </div>
        <div class="glass p-6 rounded-xl border border-slate-700/30 hover-lift transition-all duration-300">
          <div class="text-2xl mb-3 animate-bounce-subtle">📱</div>
          <h3 class="text-lg font-semibold text-slate-100 mb-2">
            {{ $t('tools.qrCodeTool.features.generate.title') }}
          </h3>
          <p class="text-slate-300 text-sm">
            {{ $t('tools.qrCodeTool.features.generate.description') }}
          </p>
        </div>
        <div class="glass p-6 rounded-xl border border-slate-700/30 hover-lift transition-all duration-300">
          <div class="text-2xl mb-3 animate-bounce-subtle">🔍</div>
          <h3 class="text-lg font-semibold text-slate-100 mb-2">
            {{ $t('tools.qrCodeTool.features.recognize.title') }}
          </h3>
          <p class="text-slate-300 text-sm">
            {{ $t('tools.qrCodeTool.features.recognize.description') }}
          </p>
        </div>
      </div>

      <!-- Generate Tab -->
      <div v-show="activeTab === 'generate'" class="space-y-8">
        <!-- Text Input Section -->
        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.qrCodeTool.generate.inputTitle') }}
          </h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.qrCodeTool.generate.textInputLabel') }}
            </label>
            <textarea
              v-model="generateText"
              :placeholder="$t('tools.qrCodeTool.generate.textInputPlaceholder')"
              class="w-full h-40 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            ></textarea>
          </div>

          <!-- Mode Toggle -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.qrCodeTool.generate.modeLabel') }}
            </label>
            <div class="flex items-center space-x-6">
              <label class="inline-flex items-center cursor-pointer group">
                <input
                  type="radio"
                  v-model="generateMode"
                  value="single"
                  class="rounded border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span class="ml-2 text-slate-300 group-hover:text-slate-100 transition-colors duration-200">
                  {{ $t('tools.qrCodeTool.generate.singleMode') }}
                </span>
              </label>
              <label class="inline-flex items-center cursor-pointer group">
                <input
                  type="radio"
                  v-model="generateMode"
                  value="batch"
                  class="rounded border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span class="ml-2 text-slate-300 group-hover:text-slate-100 transition-colors duration-200">
                  {{ $t('tools.qrCodeTool.generate.batchMode') }}
                </span>
              </label>
            </div>
            <p class="mt-2 text-sm text-slate-400">
              {{
                generateMode === 'single'
                  ? $t('tools.qrCodeTool.generate.singleModeHint')
                  : $t('tools.qrCodeTool.generate.batchModeHint')
              }}
            </p>
          </div>

          <div class="flex flex-wrap gap-4">
            <button
              @click="generateQR"
              :disabled="!generateText.trim()"
              class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 cursor-pointer hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{
                generateMode === 'single'
                  ? $t('tools.qrCodeTool.generate.generateSingleButton')
                  : $t('tools.qrCodeTool.generate.generateBatchButton')
              }}
            </button>
            <button
              @click="clearGenerated"
              class="px-6 py-3 bg-slate-700 text-slate-200 rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-200 cursor-pointer hover-lift"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <!-- Generated QR Codes -->
        <div v-if="generatedQRCodes.length > 0" class="glass rounded-xl border border-slate-700/30 p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-slate-100">
              {{
                generateMode === 'single'
                  ? $t('tools.qrCodeTool.generate.singleGeneratedTitle')
                  : $t('tools.qrCodeTool.generate.batchGeneratedTitle', {
                      count: generatedQRCodes.length,
                    })
              }}
            </h3>
            <button
              @click="downloadAllGenerated"
              class="px-6 py-3 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-all duration-200 cursor-pointer hover-lift"
            >
              {{ $t('tools.qrCodeTool.generate.downloadAll') }}
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              v-for="(qr, index) in generatedQRCodes"
              :key="index"
              class="glass border border-slate-700/30 rounded-xl p-4 text-center hover-lift transition-all duration-300"
            >
              <div class="mb-3">
                <img :src="qr.dataUrl" :alt="qr.text" class="w-full h-auto mx-auto rounded-lg" />
              </div>
              <p class="text-sm text-slate-300 truncate mb-3">{{ qr.text }}</p>
              <div class="flex flex-wrap justify-center gap-2">
                <button
                  @click="downloadQR(index)"
                  class="px-3 py-2 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 cursor-pointer hover-lift"
                >
                  {{ $t('common.download') }}
                </button>
                <button
                  @click="copyQR(index)"
                  class="px-3 py-2 text-xs bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 hover:text-white transition-all duration-200 cursor-pointer hover-lift"
                >
                  {{ $t('common.copy') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recognize Tab -->
      <div v-show="activeTab === 'recognize'" class="space-y-8">
        <!-- File Upload Section -->
        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.qrCodeTool.recognize.uploadTitle') }}
          </h3>
          <div
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
            @click="openFileSelector"
            :class="[
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover-lift',
              isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-slate-600/50 hover:border-slate-500/50',
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
              <div class="text-4xl text-slate-400 animate-bounce-subtle">📷</div>
              <div>
                <h3 class="text-lg font-medium text-slate-100 mb-2">
                  {{ $t('tools.qrCodeTool.recognize.uploadInstruction') }}
                </h3>
                <p class="text-slate-300">
                  {{ $t('tools.qrCodeTool.recognize.uploadDescription') }}
                </p>
                <p class="text-sm text-slate-400 mt-2">
                  {{ $t('tools.qrCodeTool.recognize.pasteHint') }}
                </p>
              </div>
              <button
                class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 cursor-pointer hover-lift"
              >
                {{ $t('tools.qrCodeTool.recognize.selectFiles') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Recognized Results -->
        <div v-if="recognizedResults.length > 0" class="glass rounded-xl border border-slate-700/30 p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.qrCodeTool.recognize.resultsTitle') }} ({{ recognizedResults.length }})
            </h3>
            <div class="flex flex-wrap gap-3">
              <button
                @click="copyAllResults"
                class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 cursor-pointer hover-lift"
              >
                {{ $t('tools.qrCodeTool.recognize.copyAll') }}
              </button>
              <button
                @click="clearRecognized"
                class="px-6 py-3 bg-slate-700 text-slate-200 rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-200 cursor-pointer hover-lift"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>
          <div class="space-y-4">
            <div
              v-for="(result, index) in recognizedResults"
              :key="index"
              class="glass border border-slate-700/30 rounded-xl p-4 transition-all duration-300 hover-lift"
            >
              <div class="flex items-start space-x-4">
                <div v-if="result.preview" class="flex-shrink-0">
                  <img
                    :src="result.preview"
                    :alt="result.fileName"
                    class="w-16 h-16 object-cover rounded-lg border border-slate-600/50"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-slate-100 truncate">{{ result.fileName }}</h4>
                  <div class="mt-2">
                    <p v-if="result.status === 'success'" class="text-sm text-slate-300 break-all">
                      {{ result.data }}
                    </p>
                    <p v-else class="text-sm text-red-400">
                      {{ result.error || $t('tools.qrCodeTool.recognize.recognitionFailed') }}
                    </p>
                  </div>
                </div>
                <div class="flex-shrink-0">
                  <div
                    :class="[
                      'w-3 h-3 rounded-full transition-all duration-200',
                      result.status === 'success' ? 'bg-success-400 shadow-success-glow' : 'bg-red-400 shadow-red-glow',
                    ]"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import QRCode from 'qrcode'
import jsQR from 'jsqr'

interface GeneratedQR {
  text: string
  dataUrl: string
}

interface RecognizedResult {
  fileName: string
  preview?: string
  data?: string
  error?: string
  status: 'success' | 'error'
}

const { t } = useI18n()
const { success, error: showError } = useToast()

// Tabs
const activeTab = ref<'generate' | 'recognize'>('generate')

// Generate tab
const generateText = ref('')
const generateMode = ref<'single' | 'batch'>('single')
const generatedQRCodes = ref<GeneratedQR[]>([])

// Recognize tab
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const recognizedResults = ref<RecognizedResult[]>([])

// Generate QR codes based on mode
async function generateQR() {
  if (!generateText.value.trim()) return

  try {
    if (generateMode.value === 'single') {
      // Generate single QR code
      const dataUrl = await QRCode.toDataURL(generateText.value.trim(), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })

      generatedQRCodes.value = [
        {
          text: generateText.value.trim(),
          dataUrl,
        },
      ]

      success(t('tools.qrCodeTool.messages.generateSuccess'))
    } else {
      // Generate batch QR codes
      const lines = generateText.value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      if (lines.length === 0) {
        showError(t('tools.qrCodeTool.errors.emptyBatch'))
        return
      }

      const newQRCodes: GeneratedQR[] = []

      for (const line of lines) {
        const dataUrl = await QRCode.toDataURL(line, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        })

        newQRCodes.push({
          text: line,
          dataUrl,
        })
      }

      generatedQRCodes.value = newQRCodes
      success(t('tools.qrCodeTool.messages.batchGenerateSuccess', { count: lines.length }))
    }
  } catch (err) {
    console.error('QR Code generation error:', err)
    showError(
      generateMode.value === 'single'
        ? t('tools.qrCodeTool.errors.generateFailed')
        : t('tools.qrCodeTool.errors.batchGenerateFailed'),
    )
  }
}

// Clear generated QR codes
function clearGenerated() {
  generatedQRCodes.value = []
  generateText.value = ''
}

// Download single QR code
function downloadQR(index: number) {
  const qr = generatedQRCodes.value[index]
  if (!qr) return

  const link = document.createElement('a')
  link.href = qr.dataUrl
  link.download = `qr-code-${index + 1}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Download all generated QR codes
async function downloadAllGenerated() {
  const { default: JSZip } = await import('jszip')

  try {
    const zip = new JSZip()

    for (let i = 0; i < generatedQRCodes.value.length; i++) {
      const qr = generatedQRCodes.value[i]
      const response = await fetch(qr.dataUrl)
      const blob = await response.blob()
      zip.file(`qr-code-${i + 1}.png`, blob)
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = `qr-codes-${new Date().toISOString().split('T')[0]}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    success(t('tools.qrCodeTool.messages.downloadAllSuccess'))
  } catch (err) {
    console.error('Download all error:', err)
    showError(t('tools.qrCodeTool.errors.downloadAllFailed'))
  }
}

// Copy QR code to clipboard
async function copyQR(index: number) {
  const qr = generatedQRCodes.value[index]
  if (!qr) return

  try {
    const response = await fetch(qr.dataUrl)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ])
    success(t('tools.qrCodeTool.messages.copySuccess'))
  } catch (err) {
    console.error('Copy error:', err)
    showError(t('tools.qrCodeTool.errors.copyFailed'))
  }
}

// File handling
function openFileSelector() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    recognizeFiles(Array.from(files))
  }
  // Reset the input value to allow selecting the same file again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files) {
    recognizeFiles(Array.from(files))
  }
}

// Handle paste event for clipboard images
function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return

  const files: File[] = []
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) files.push(file)
    }
  }

  if (files.length > 0) {
    recognizeFiles(files)
    success(t('tools.qrCodeTool.messages.pasteSuccess'))
  }
}

// Recognize QR codes from files
async function recognizeFiles(files: File[]) {
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    showError(t('tools.qrCodeTool.errors.noValidImages'))
    return
  }

  for (const file of imageFiles) {
    const result: RecognizedResult = {
      fileName: file.name,
      status: 'error',
    }

    try {
      // Create preview
      const preview = await createImagePreview(file)
      result.preview = preview

      // Recognize QR code
      const imageData = await getImageData(file)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        result.data = code.data
        result.status = 'success'
      } else {
        result.error = t('tools.qrCodeTool.errors.noQRCodeFound')
      }
    } catch (err) {
      console.error('Recognition error:', err)
      result.error = t('tools.qrCodeTool.errors.recognitionFailed')
    }

    recognizedResults.value.push(result)
  }

  success(t('tools.qrCodeTool.messages.recognitionComplete'))
}

// Image processing utilities
function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getImageData(
  file: File,
): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      resolve({
        data: imageData.data,
        width: imageData.width,
        height: imageData.height,
      })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// Copy all recognition results
function copyAllResults() {
  const successfulResults = recognizedResults.value
    .filter((result) => result.status === 'success')
    .map((result) => result.data)
    .join('\n')

  if (!successfulResults) {
    showError(t('tools.qrCodeTool.errors.noResultsToCopy'))
    return
  }

  navigator.clipboard
    .writeText(successfulResults)
    .then(() => {
      success(t('tools.qrCodeTool.messages.copyAllSuccess'))
    })
    .catch(() => {
      showError(t('tools.qrCodeTool.errors.copyAllFailed'))
    })
}

// Clear recognized results
function clearRecognized() {
  recognizedResults.value = []
}

// Lifecycle hooks
onMounted(() => {
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
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
})
</script>

<style scoped>
/* Glass effect utility */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.glass-light {
  background: rgba(255, 255, 255, 0.1);
}

/* Text gradient */
.text-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Shadow utilities */
.shadow-dark-lg {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.shadow-dark-xl {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.shadow-success-glow {
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
}

.shadow-red-glow {
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
}

/* Hover effects */
.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

/* Animations */
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}

@keyframes bounce-subtle {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading dots animation */
.loading-dots::after {
  content: '';
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% {
    content: '.';
  }
  40% {
    content: '..';
  }
  60%, 100% {
    content: '...';
  }
}

/* Custom scrollbar for electron */
.electron-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.electron-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.electron-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.electron-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
