<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
      {{ $t('tools.pdfViewer.uploadSection') }}
    </h3>

    <div
      v-if="!hasFile"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="openFileSelector"
      :class="[
        'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200',
        isDragging 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
        isLoading ? 'pointer-events-none opacity-50' : ''
      ]"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,application/pdf"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div class="space-y-4">
        <div v-if="isLoading" class="text-6xl">
          <div class="animate-spin inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <div v-else class="text-6xl text-gray-400">📄</div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ isLoading ? $t('tools.pdfViewer.loading') : $t('tools.pdfViewer.uploadTitle') }}
          </h3>
          <p class="text-gray-600">
            {{ isLoading ? $t('tools.pdfViewer.loadingDescription') : $t('tools.pdfViewer.uploadDescription') }}
          </p>
          <p class="text-sm text-gray-500 mt-2">
            {{ $t('tools.pdfViewer.supportedFormats') }}: PDF ({{ $t('tools.pdfViewer.maxSize') }}: {{ maxSizeMB }}MB)
          </p>
        </div>
        
        <button
          v-if="!isLoading"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          :disabled="isLoading"
        >
          {{ $t('tools.pdfViewer.selectPdf') }}
        </button>
      </div>
    </div>

    <!-- File Selected State -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center space-x-3">
          <div class="text-2xl">📄</div>
          <div>
            <p class="font-medium text-green-900">{{ fileName }}</p>
            <p class="text-sm text-green-700">{{ fileSize }} • {{ $t('tools.pdfViewer.ready') }}</p>
          </div>
        </div>
        <button
          @click="clearFile"
          class="text-green-700 hover:text-green-900 transition-colors"
          :title="$t('tools.pdfViewer.remove')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          @click="openFileSelector"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {{ $t('tools.pdfViewer.selectAnother') }}
        </button>
        <button
          v-if="canLoadFromUrl"
          @click="showUrlInput = !showUrlInput"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {{ $t('tools.pdfViewer.loadFromUrl') }}
        </button>
      </div>

      <!-- URL Input -->
      <div v-if="showUrlInput" class="p-4 bg-gray-50 rounded-lg">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('tools.pdfViewer.pdfUrl') }}
        </label>
        <div class="flex gap-2">
          <input
            v-model="urlInput"
            type="url"
            placeholder="https://example.com/document.pdf"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            @click="loadFromUrl"
            :disabled="!urlInput || isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ $t('tools.pdfViewer.load') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-start space-x-3">
        <div class="text-red-500 text-xl">⚠️</div>
        <div>
          <h4 class="font-medium text-red-900">{{ $t('tools.pdfViewer.error') }}</h4>
          <p class="text-red-700 mt-1">{{ error }}</p>
          <button
            @click="clearError"
            class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            {{ $t('tools.pdfViewer.dismiss') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  isLoading?: boolean
  error?: string | null
  fileName?: string
  fileSize?: string
  maxSizeMB?: number
  canLoadFromUrl?: boolean
}

interface Emits {
  (e: 'file-selected', file: File): void
  (e: 'url-selected', url: string): void
  (e: 'clear-file'): void
  (e: 'clear-error'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  fileName: '',
  fileSize: '',
  maxSizeMB: 50,
  canLoadFromUrl: true
})

const emit = defineEmits<Emits>()

// Component state
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const dragCounter = ref(0)
const showUrlInput = ref(false)
const urlInput = ref('')

// Computed properties
const hasFile = computed(() => props.fileName && props.fileSize)

// File handling methods
function openFileSelector(): void {
  if (props.isLoading) return
  fileInput.value?.click()
}

function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFile(target.files[0])
  }
}

function handleDragEnter(event: DragEvent): void {
  event.preventDefault()
  dragCounter.value++
  isDragging.value = true
}

function handleDragLeave(event: DragEvent): void {
  event.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragging.value = false
  }
}

function handleDrop(event: DragEvent): void {
  event.preventDefault()
  isDragging.value = false
  dragCounter.value = 0

  if (props.isLoading) return

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function processFile(file: File): void {
  // Validate file type
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    emit('clear-error')
    setTimeout(() => {
      // Use a more specific error message
      const errorMsg = 'Invalid file type. Please select a PDF file.'
      emit('clear-error') // This should be handled by parent to set error
    }, 0)
    return
  }

  // Validate file size
  const maxSizeBytes = props.maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    emit('clear-error')
    setTimeout(() => {
      const errorMsg = `File size exceeds ${props.maxSizeMB}MB limit.`
      // Parent should handle this error
    }, 0)
    return
  }

  // Clear any existing errors and emit file selection
  emit('clear-error')
  emit('file-selected', file)
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function loadFromUrl(): void {
  if (!urlInput.value || props.isLoading) return
  
  // Basic URL validation
  try {
    new URL(urlInput.value)
  } catch {
    return // Invalid URL
  }

  emit('clear-error')
  emit('url-selected', urlInput.value)
  urlInput.value = ''
  showUrlInput.value = false
}

function clearFile(): void {
  emit('clear-file')
  showUrlInput.value = false
  urlInput.value = ''
}

function clearError(): void {
  emit('clear-error')
}

// Expose methods for parent component
defineExpose({
  openFileSelector,
  clearFile
})
</script>

<style scoped>
/* Custom animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Drag and drop visual feedback */
.border-dashed {
  background-image: url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='a' patternUnits='userSpaceOnUse' width='20' height='20'%3e%3cpath d='M 20,0 L 0,0 0,20' fill='none' stroke='%23d1d5db' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23a)'/%3e%3c/svg%3e");
}
</style>
