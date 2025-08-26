<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ $t('tools.pdfViewer.title') }}
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('tools.pdfViewer.description') }}
        </p>
      </div>

      <!-- Upload Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.pdfViewer.uploadSection') }}
        </h3>

        <div
          v-if="!pdfFile"
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
            accept=".pdf"
            @change="handleFileSelect"
            class="hidden"
          />
          <div class="space-y-4">
            <div class="text-6xl text-gray-400">📄</div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ $t('tools.pdfViewer.uploadTitle') }}
              </h3>
              <p class="text-gray-600">
                {{ $t('tools.pdfViewer.uploadDescription') }}
              </p>
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('tools.pdfViewer.supportedFormats') }}: PDF
              </p>
            </div>
            <button
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ $t('tools.pdfViewer.selectPdf') }}
            </button>
          </div>
        </div>

        <!-- PDF Viewer and Controls -->
        <div v-else class="space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <h4 class="text-md font-medium text-gray-900">
              {{ $t('tools.pdfViewer.preview') }}
            </h4>
            <div class="flex flex-wrap gap-2">
              <button
                @click="downloadPdf"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {{ $t('tools.pdfViewer.download') }}
              </button>
              <button
                @click="resetPdf"
                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {{ $t('tools.pdfViewer.selectAnother') }}
              </button>
            </div>
          </div>

          <!-- PDF Controls -->
          <div class="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-2">
              <button
                @click="previousPage"
                :disabled="currentPage <= 1"
                class="px-3 py-1 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
              >
                ←
              </button>
              <span class="text-gray-700">
                {{ currentPage }} / {{ pageCount }}
              </span>
              <button
                @click="nextPage"
                :disabled="currentPage >= pageCount"
                class="px-3 py-1 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
              >
                →
              </button>
            </div>
            
            <div class="flex items-center gap-2">
              <label class="text-gray-700">{{ $t('tools.pdfViewer.zoom') }}:</label>
              <select
                v-model="scale"
                class="px-3 py-1 border border-gray-300 rounded-lg"
              >
                <option value="0.5">50%</option>
                <option value="0.75">75%</option>
                <option value="1">100%</option>
                <option value="1.25">125%</option>
                <option value="1.5">150%</option>
                <option value="2">200%</option>
              </select>
            </div>
            
            <button
              @click="rotateLeft"
              class="px-3 py-1 bg-white border border-gray-300 rounded-lg"
            >
              ↶
            </button>
            <button
              @click="rotateRight"
              class="px-3 py-1 bg-white border border-gray-300 rounded-lg"
            >
              ↷
            </button>
          </div>

          <!-- PDF Canvas Container -->
          <div class="flex justify-center">
            <div ref="pdfContainer" class="overflow-auto max-w-full">
              <canvas ref="pdfCanvas" class="shadow-lg border border-gray-300"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- PDF Information -->
      <div v-if="pdfDocument" class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.pdfViewer.documentInfo') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">{{ $t('tools.pdfViewer.fileName') }}</h4>
            <p class="text-gray-600">{{ fileName }}</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">{{ $t('tools.pdfViewer.fileSize') }}</h4>
            <p class="text-gray-600">{{ fileSize }}</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">{{ $t('tools.pdfViewer.pageCount') }}</h4>
            <p class="text-gray-600">{{ pageCount }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf'
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'

// Set the worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

// Reactive references
const pdfFile = ref<File | null>(null)
const pdfDocument = ref<any>(null)
const pdfContainer = ref<HTMLDivElement | null>(null)
const pdfCanvas = ref<HTMLCanvasElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const currentPage = ref(1)
const pageCount = ref(0)
const scale = ref(1)
const rotation = ref(0)
const fileName = ref('')
const fileSize = ref('')

// Initialize PDF.js
onMounted(() => {
  // PDF.js is initialized when a file is loaded
})

// Watch for changes in scale, page, or rotation to re-render
watch([scale, currentPage, rotation], () => {
  if (pdfDocument.value && pdfCanvas.value) {
    renderPage()
  }
})

// File handling methods
function openFileSelector() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    loadPdf(target.files[0])
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  
  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0]
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      loadPdf(file)
    }
  }
}

function loadPdf(file: File) {
  pdfFile.value = file
  fileName.value = file.name
  fileSize.value = formatFileSize(file.size)
  
  const fileReader = new FileReader()
  fileReader.onload = function() {
    const typedarray = new Uint8Array(this.result as ArrayBuffer)
    pdfjsLib.getDocument(typedarray).promise.then((pdfDoc: any) => {
      pdfDocument.value = pdfDoc
      pageCount.value = pdfDoc.numPages
      currentPage.value = 1
      renderPage()
    }).catch((error: any) => {
      console.error('Error loading PDF:', error)
      // Reset on error
      pdfFile.value = null
      pdfDocument.value = null
    })
  }
  fileReader.readAsArrayBuffer(file)
}

function renderPage() {
  if (!pdfDocument.value || !pdfCanvas.value) return
  
  pdfDocument.value.getPage(currentPage.value).then((page: any) => {
    const viewport = page.getViewport({ scale: scale.value, rotation: rotation.value })
    
    const canvas = pdfCanvas.value!
    const context = canvas.getContext('2d')!
    
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    
    page.render(renderContext)
  })
}

// Navigation methods
function previousPage() {
  if (currentPage.value <= 1) return
  currentPage.value--
}

function nextPage() {
  if (currentPage.value >= pageCount.value) return
  currentPage.value++
}

// Zoom and rotation methods
function rotateLeft() {
  rotation.value = (rotation.value - 90) % 360
}

function rotateRight() {
  rotation.value = (rotation.value + 90) % 360
}

// Utility methods
function resetPdf() {
  pdfFile.value = null
  pdfDocument.value = null
  currentPage.value = 1
  pageCount.value = 0
  scale.value = 1
  rotation.value = 0
  fileName.value = ''
  fileSize.value = ''
}

function downloadPdf() {
  if (!pdfFile.value) return
  
  const url = URL.createObjectURL(pdfFile.value)
  const a = document.createElement('a')
  a.href = url
  a.download = pdfFile.value.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>