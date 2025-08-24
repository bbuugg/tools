<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ $t('tools.qrCodeTool.title') }}
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('tools.qrCodeTool.description') }}
        </p>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              @click="activeTab = 'generate'"
              :class="[
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              ]"
            >
              {{ $t('tools.qrCodeTool.tabs.generate') }}
            </button>
            <button
              @click="activeTab = 'recognize'"
              :class="[
                activeTab === 'recognize'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              ]"
            >
              {{ $t('tools.qrCodeTool.tabs.recognize') }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Generate Tab -->
      <div v-show="activeTab === 'generate'" class="space-y-8">
        <!-- Text Input Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ $t('tools.qrCodeTool.generate.inputTitle') }}
          </h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.qrCodeTool.generate.textInputLabel') }}
            </label>
            <textarea
              v-model="generateText"
              :placeholder="$t('tools.qrCodeTool.generate.textInputPlaceholder')"
              class="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div class="flex flex-wrap gap-4">
            <button
              @click="generateSingleQR"
              :disabled="!generateText.trim()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('tools.qrCodeTool.generate.generateButton') }}
            </button>
            <button
              @click="clearGenerated"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <!-- Batch Generate Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ $t('tools.qrCodeTool.generate.batchTitle') }}
          </h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.qrCodeTool.generate.batchInputLabel') }}
            </label>
            <textarea
              v-model="batchText"
              :placeholder="$t('tools.qrCodeTool.generate.batchInputPlaceholder')"
              class="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
            <p class="mt-2 text-sm text-gray-500">
              {{ $t('tools.qrCodeTool.generate.batchInputHint') }}
            </p>
          </div>
          <div class="flex flex-wrap gap-4">
            <button
              @click="generateBatchQR"
              :disabled="!batchText.trim()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('tools.qrCodeTool.generate.batchGenerateButton') }}
            </button>
            <button
              @click="clearBatch"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <!-- Generated QR Codes -->
        <div v-if="generatedQRCodes.length > 0" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.qrCodeTool.generate.generatedTitle') }} ({{ generatedQRCodes.length }})
            </h3>
            <button
              @click="downloadAllGenerated"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {{ $t('tools.qrCodeTool.generate.downloadAll') }}
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              v-for="(qr, index) in generatedQRCodes"
              :key="index"
              class="border border-gray-200 rounded-lg p-4 text-center"
            >
              <div class="mb-3">
                <img :src="qr.dataUrl" :alt="qr.text" class="w-full h-auto mx-auto" />
              </div>
              <p class="text-sm text-gray-600 truncate mb-3">{{ qr.text }}</p>
              <div class="flex flex-wrap justify-center gap-2">
                <button
                  @click="downloadQR(index)"
                  class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {{ $t('common.download') }}
                </button>
                <button
                  @click="copyQR(index)"
                  class="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
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
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ $t('tools.qrCodeTool.recognize.uploadTitle') }}
          </h3>
          <div
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
            @click="openFileSelector"
            :class="[
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
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
              <div class="text-4xl text-gray-400">📷</div>
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  {{ $t('tools.qrCodeTool.recognize.uploadInstruction') }}
                </h3>
                <p class="text-gray-600">
                  {{ $t('tools.qrCodeTool.recognize.uploadDescription') }}
                </p>
              </div>
              <button
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {{ $t('tools.qrCodeTool.recognize.selectFiles') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Recognized Results -->
        <div v-if="recognizedResults.length > 0" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.qrCodeTool.recognize.resultsTitle') }} ({{ recognizedResults.length }})
            </h3>
            <div class="flex flex-wrap gap-3">
              <button
                @click="copyAllResults"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {{ $t('tools.qrCodeTool.recognize.copyAll') }}
              </button>
              <button
                @click="clearRecognized"
                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>
          <div class="space-y-4">
            <div
              v-for="(result, index) in recognizedResults"
              :key="index"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start space-x-4">
                <div v-if="result.preview" class="flex-shrink-0">
                  <img
                    :src="result.preview"
                    :alt="result.fileName"
                    class="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate">{{ result.fileName }}</h4>
                  <div class="mt-2">
                    <p v-if="result.status === 'success'" class="text-sm text-gray-600 break-all">
                      {{ result.data }}
                    </p>
                    <p v-else class="text-sm text-red-600">
                      {{ result.error || $t('tools.qrCodeTool.recognize.recognitionFailed') }}
                    </p>
                  </div>
                </div>
                <div class="flex-shrink-0">
                  <div
                    :class="[
                      'w-3 h-3 rounded-full',
                      result.status === 'success' ? 'bg-green-400' : 'bg-red-400',
                    ]"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Descriptions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🔄 {{ $t('tools.qrCodeTool.features.batch.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.qrCodeTool.features.batch.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            📱 {{ $t('tools.qrCodeTool.features.generate.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.qrCodeTool.features.generate.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🔍 {{ $t('tools.qrCodeTool.features.recognize.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.qrCodeTool.features.recognize.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
const batchText = ref('')
const generatedQRCodes = ref<GeneratedQR[]>([])

// Recognize tab
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const recognizedResults = ref<RecognizedResult[]>([])

// Generate single QR code
async function generateSingleQR() {
  if (!generateText.value.trim()) return

  try {
    const dataUrl = await QRCode.toDataURL(generateText.value.trim(), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    generatedQRCodes.value.unshift({
      text: generateText.value.trim(),
      dataUrl,
    })

    success(t('tools.qrCodeTool.messages.generateSuccess'))
  } catch (err) {
    console.error('QR Code generation error:', err)
    showError(t('tools.qrCodeTool.errors.generateFailed'))
  }
}

// Generate batch QR codes
async function generateBatchQR() {
  if (!batchText.value.trim()) return

  const lines = batchText.value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    showError(t('tools.qrCodeTool.errors.emptyBatch'))
    return
  }

  try {
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

    generatedQRCodes.value = [...newQRCodes, ...generatedQRCodes.value]
    batchText.value = ''
    success(t('tools.qrCodeTool.messages.batchGenerateSuccess', { count: lines.length }))
  } catch (err) {
    console.error('Batch QR Code generation error:', err)
    showError(t('tools.qrCodeTool.errors.batchGenerateFailed'))
  }
}

// Clear generated QR codes
function clearGenerated() {
  generatedQRCodes.value = []
  generateText.value = ''
}

// Clear batch input
function clearBatch() {
  batchText.value = ''
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
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
