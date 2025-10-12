<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <!-- Left Section: File Actions -->
      <div class="flex items-center gap-2">
        <button
          @click="$emit('download')"
          :disabled="!hasDocument"
          class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :title="$t('tools.pdfViewer.download')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </button>
        
        <button
          @click="$emit('reset')"
          :disabled="!hasDocument"
          class="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :title="$t('tools.pdfViewer.selectAnother')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>

      <!-- Center Section: Navigation -->
      <div class="flex items-center gap-3">
        <button
          @click="$emit('first-page')"
          :disabled="!canNavigatePrevious"
          class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="$t('tools.pdfViewer.firstPage')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button
          @click="$emit('previous-page')"
          :disabled="!canNavigatePrevious"
          class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="$t('tools.pdfViewer.previousPage')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        <div class="flex items-center gap-2">
          <input
            :value="currentPage"
            @input="handlePageInput"
            @keyup.enter="goToPage"
            type="number"
            :min="1"
            :max="pageCount"
            class="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span class="text-gray-600">/ {{ pageCount }}</span>
        </div>

        <button
          @click="$emit('next-page')"
          :disabled="!canNavigateNext"
          class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="$t('tools.pdfViewer.nextPage')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <button
          @click="$emit('last-page')"
          :disabled="!canNavigateNext"
          class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="$t('tools.pdfViewer.lastPage')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- Right Section: View Controls -->
      <div class="flex items-center gap-3">
        <!-- Zoom Controls -->
        <div class="flex items-center gap-2">
          <button
            @click="$emit('zoom-out')"
            :disabled="!hasDocument"
            class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :title="$t('tools.pdfViewer.zoomOut')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
            </svg>
          </button>

          <select
            :value="scale"
            @change="handleZoomChange"
            :disabled="!hasDocument"
            class="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option v-for="level in zoomLevels" :key="level" :value="level">
              {{ Math.round(level * 100) }}%
            </option>
          </select>

          <button
            @click="$emit('zoom-in')"
            :disabled="!hasDocument"
            class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :title="$t('tools.pdfViewer.zoomIn')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
            </svg>
          </button>

          <button
            @click="$emit('fit-width')"
            :disabled="!hasDocument"
            class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            :title="$t('tools.pdfViewer.fitWidth')"
          >
            Fit
          </button>
        </div>

        <!-- Rotation Controls -->
        <div class="flex items-center gap-1 border-l border-gray-300 pl-3">
          <button
            @click="$emit('rotate-left')"
            :disabled="!hasDocument"
            class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :title="$t('tools.pdfViewer.rotateLeft')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
            </svg>
          </button>

          <button
            @click="$emit('rotate-right')"
            :disabled="!hasDocument"
            class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :title="$t('tools.pdfViewer.rotateRight')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"></path>
            </svg>
          </button>
        </div>

        <!-- Annotation Tools (if enabled) -->
        <div v-if="showAnnotationTools" class="flex items-center gap-1 border-l border-gray-300 pl-3">
          <button
            v-for="tool in annotationTools"
            :key="tool.type"
            @click="$emit('select-tool', tool.type)"
            :class="[
              'px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm',
              currentTool === tool.type 
                ? 'bg-blue-100 border-blue-300 text-blue-700' 
                : 'bg-white border-gray-300'
            ]"
            :disabled="!hasDocument"
            :title="tool.label"
          >
            {{ tool.icon }}
          </button>

          <div class="flex items-center gap-1 ml-2">
            <input
              :value="currentColor"
              @input="handleColorChange"
              type="color"
              class="w-6 h-6 border border-gray-300 rounded cursor-pointer"
              :disabled="!hasDocument"
            />
            
            <select
              :value="currentStrokeWidth"
              @change="handleStrokeWidthChange"
              :disabled="!hasDocument"
              class="px-1 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option v-for="width in strokeWidths" :key="width" :value="width">
                {{ width }}px
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Second Row: Annotation Actions (if enabled and tool selected) -->
    <div v-if="showAnnotationTools && currentTool" class="mt-3 pt-3 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">{{ $t('tools.pdfViewer.selectedTool') }}:</span>
          <span class="text-sm font-medium text-gray-900">
            {{ annotationTools.find(t => t.type === currentTool)?.label }}
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <button
            @click="$emit('clear-annotations')"
            class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            {{ $t('tools.pdfViewer.clearAll') }}
          </button>
          
          <button
            @click="$emit('export-annotations')"
            class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            {{ $t('tools.pdfViewer.export') }}
          </button>
          
          <button
            @click="$emit('import-annotations')"
            class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            {{ $t('tools.pdfViewer.import') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  hasDocument?: boolean
  currentPage?: number
  pageCount?: number
  canNavigatePrevious?: boolean
  canNavigateNext?: boolean
  scale?: number
  zoomLevels?: number[]
  showAnnotationTools?: boolean
  currentTool?: string | null
  currentColor?: string
  currentStrokeWidth?: number
  annotationTools?: Array<{
    type: string
    label: string
    icon: string
  }>
  strokeWidths?: number[]
}

interface Emits {
  (e: 'download'): void
  (e: 'reset'): void
  (e: 'first-page'): void
  (e: 'previous-page'): void
  (e: 'next-page'): void
  (e: 'last-page'): void
  (e: 'go-to-page', page: number): void
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'set-zoom', scale: number): void
  (e: 'fit-width'): void
  (e: 'rotate-left'): void
  (e: 'rotate-right'): void
  (e: 'select-tool', tool: string): void
  (e: 'set-color', color: string): void
  (e: 'set-stroke-width', width: number): void
  (e: 'clear-annotations'): void
  (e: 'export-annotations'): void
  (e: 'import-annotations'): void
}

const props = withDefaults(defineProps<Props>(), {
  hasDocument: false,
  currentPage: 1,
  pageCount: 0,
  canNavigatePrevious: false,
  canNavigateNext: false,
  scale: 1,
  zoomLevels: () => [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3],
  showAnnotationTools: false,
  currentTool: null,
  currentColor: '#ff0000',
  currentStrokeWidth: 2,
  annotationTools: () => [
    { type: 'text', label: 'Text', icon: 'T' },
    { type: 'highlight', label: 'Highlight', icon: '🖍️' },
    { type: 'rectangle', label: 'Rectangle', icon: '⬜' },
    { type: 'circle', label: 'Circle', icon: '⭕' },
    { type: 'line', label: 'Line', icon: '📏' },
    { type: 'freehand', label: 'Freehand', icon: '✏️' }
  ],
  strokeWidths: () => [1, 2, 3, 4, 5, 8, 10]
})

const emit = defineEmits<Emits>()

// Local state for input handling
const pageInput = ref(props.currentPage)

function handlePageInput(event: Event): void {
  const target = event.target as HTMLInputElement
  pageInput.value = parseInt(target.value) || 1
}

function goToPage(): void {
  const page = Math.max(1, Math.min(pageInput.value, props.pageCount))
  pageInput.value = page
  emit('go-to-page', page)
}

function handleZoomChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  const scale = parseFloat(target.value)
  emit('set-zoom', scale)
}

function handleColorChange(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('set-color', target.value)
}

function handleStrokeWidthChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  const width = parseInt(target.value)
  emit('set-stroke-width', width)
}

// Watch for prop changes to update local state
watch(() => props.currentPage, (newPage) => {
  pageInput.value = newPage
})
</script>

<style scoped>
/* Custom styles for better visual hierarchy */
.border-l {
  border-left-width: 1px;
}

/* Ensure consistent button sizing */
button {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Color input styling */
input[type="color"] {
  -webkit-appearance: none;
  border: none;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 3px;
}
</style>
