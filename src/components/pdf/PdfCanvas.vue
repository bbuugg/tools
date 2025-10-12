<template>
  <div class="flex justify-center bg-gray-100 p-4 rounded-lg">
    <div 
      ref="canvasContainer" 
      class="relative w-full max-w-4xl bg-white rounded shadow-lg"
      :style="{ aspectRatio: '210/297' }"
    >
      <canvas
        ref="pdfCanvas"
        class="block cursor-crosshair w-full h-full"
        :class="{ 'cursor-pointer': !currentTool }"
        style="display: block;"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        @contextmenu.prevent
      />
      
      <!-- Annotation overlay -->
      <div
        v-if="showAnnotations"
        class="absolute inset-0 pointer-events-none"
      >
        <div
          v-for="annotation in pageAnnotations"
          :key="annotation.id"
          :class="[
            'absolute border-2 pointer-events-auto cursor-pointer',
            selectedAnnotation?.id === annotation.id 
              ? 'border-blue-500 bg-blue-100 bg-opacity-30' 
              : 'border-transparent hover:border-gray-400'
          ]"
          :style="getAnnotationStyle(annotation)"
          @click="selectAnnotation(annotation)"
          @dblclick="editAnnotation(annotation)"
        >
          <!-- Text annotations -->
          <div
            v-if="annotation.type === 'text'"
            class="p-1 text-sm bg-yellow-100 border border-yellow-300 rounded"
            :style="{ color: annotation.color }"
          >
            {{ annotation.text || 'Text' }}
          </div>
          
          <!-- Highlight annotations -->
          <div
            v-else-if="annotation.type === 'highlight'"
            class="w-full h-full opacity-50"
            :style="{ backgroundColor: annotation.color }"
          />
          
          <!-- Shape annotations -->
          <svg
            v-else-if="['rectangle', 'circle', 'line'].includes(annotation.type)"
            class="w-full h-full"
            :viewBox="`0 0 ${annotation.width || 0} ${annotation.height || 0}`"
          >
            <rect
              v-if="annotation.type === 'rectangle'"
              :width="annotation.width || 0"
              :height="annotation.height || 0"
              fill="none"
              :stroke="annotation.color"
              :stroke-width="annotation.strokeWidth"
            />
            <ellipse
              v-else-if="annotation.type === 'circle'"
              :cx="(annotation.width || 0) / 2"
              :cy="(annotation.height || 0) / 2"
              :rx="(annotation.width || 0) / 2"
              :ry="(annotation.height || 0) / 2"
              fill="none"
              :stroke="annotation.color"
              :stroke-width="annotation.strokeWidth"
            />
            <line
              v-else-if="annotation.type === 'line'"
              x1="0"
              y1="0"
              :x2="annotation.width || 0"
              :y2="annotation.height || 0"
              :stroke="annotation.color"
              :stroke-width="annotation.strokeWidth"
            />
          </svg>
          
          <!-- Freehand annotations -->
          <svg
            v-else-if="annotation.type === 'freehand' && annotation.points"
            class="w-full h-full absolute inset-0"
            :viewBox="`0 0 ${pdfCanvas?.width || 800} ${pdfCanvas?.height || 600}`"
          >
            <polyline
              :points="annotation.points.map(p => `${p.x},${p.y}`).join(' ')"
              fill="none"
              :stroke="annotation.color"
              :stroke-width="annotation.strokeWidth"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
      
      <!-- Loading overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center"
      >
        <div class="text-center">
          <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p class="text-gray-600">{{ $t('tools.pdfViewer.rendering') }}</p>
        </div>
      </div>
      
      <!-- Error overlay -->
      <div
        v-if="error"
        class="absolute inset-0 bg-red-50 flex items-center justify-center"
      >
        <div class="text-center p-4">
          <div class="text-red-500 text-4xl mb-2">⚠️</div>
          <p class="text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Annotation } from '../../composables/usePdfEditor'

interface Props {
  isLoading?: boolean
  error?: string | null
  currentPage?: number
  scale?: number
  rotation?: number
  currentTool?: string | null
  showAnnotations?: boolean
  pageAnnotations?: Annotation[]
  selectedAnnotation?: Annotation | null
}

interface Emits {
  (e: 'canvas-ready', canvas: HTMLCanvasElement): void
  (e: 'start-drawing', event: { pageNumber: number; x: number; y: number }): void
  (e: 'continue-drawing', event: { pageNumber: number; x: number; y: number }): void
  (e: 'finish-drawing'): void
  (e: 'select-annotation', annotation: Annotation): void
  (e: 'edit-annotation', annotation: Annotation): void
  (e: 'canvas-click', event: { x: number; y: number }): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  currentPage: 1,
  scale: 1,
  rotation: 0,
  currentTool: null,
  showAnnotations: true,
  pageAnnotations: () => [],
  selectedAnnotation: null
})

const emit = defineEmits<Emits>()

// Template refs
const canvasContainer = ref<HTMLDivElement | null>(null)
const pdfCanvas = ref<HTMLCanvasElement | null>(null)

// Component state
const isDrawing = ref(false)
const canvasWidth = ref(0)
const canvasHeight = ref(0)

// Computed properties - removed unused containerMaxWidth

// Mouse event handling
function handleMouseDown(event: MouseEvent): void {
  if (!pdfCanvas.value || props.isLoading) return
  
  const rect = pdfCanvas.value.getBoundingClientRect()
  // Calculate coordinates relative to the actual canvas size
  const scaleX = pdfCanvas.value.width / rect.width
  const scaleY = pdfCanvas.value.height / rect.height
  const x = (event.clientX - rect.left) * scaleX
  const y = (event.clientY - rect.top) * scaleY
  
  if (props.currentTool) {
    isDrawing.value = true
    emit('start-drawing', { 
      pageNumber: props.currentPage, 
      x, 
      y 
    })
  } else {
    emit('canvas-click', { x, y })
  }
}

function handleMouseMove(event: MouseEvent): void {
  if (!isDrawing.value || !pdfCanvas.value || !props.currentTool) return
  
  const rect = pdfCanvas.value.getBoundingClientRect()
  // Calculate coordinates relative to the actual canvas size
  const scaleX = pdfCanvas.value.width / rect.width
  const scaleY = pdfCanvas.value.height / rect.height
  const x = (event.clientX - rect.left) * scaleX
  const y = (event.clientY - rect.top) * scaleY
  
  emit('continue-drawing', { 
    pageNumber: props.currentPage, 
    x, 
    y 
  })
}

function handleMouseUp(): void {
  if (isDrawing.value) {
    isDrawing.value = false
    emit('finish-drawing')
  }
}

function handleMouseLeave(): void {
  if (isDrawing.value) {
    isDrawing.value = false
    emit('finish-drawing')
  }
}

// Annotation handling
function selectAnnotation(annotation: Annotation): void {
  emit('select-annotation', annotation)
}

function editAnnotation(annotation: Annotation): void {
  emit('edit-annotation', annotation)
}

function getAnnotationStyle(annotation: Annotation) {
  if (!pdfCanvas.value) return {}
  
  const rect = pdfCanvas.value.getBoundingClientRect()
  const scaleX = rect.width / pdfCanvas.value.width
  const scaleY = rect.height / pdfCanvas.value.height
  
  return {
    left: `${annotation.x * scaleX}px`,
    top: `${annotation.y * scaleY}px`,
    width: `${(annotation.width || 0) * scaleX}px`,
    height: `${(annotation.height || 0) * scaleY}px`,
  }
}

// Canvas management
function updateCanvasDimensions(): void {
  if (pdfCanvas.value) {
    canvasWidth.value = pdfCanvas.value.width
    canvasHeight.value = pdfCanvas.value.height
  }
}

// Watchers
watch(() => pdfCanvas.value, (canvas) => {
  if (canvas) {
    emit('canvas-ready', canvas)
    updateCanvasDimensions()
  }
}, { immediate: true })

watch([() => props.scale, () => props.rotation], () => {
  updateCanvasDimensions()
})

// Lifecycle
onMounted(() => {
  // Add keyboard event listeners for annotation shortcuts
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
  
  // Add resize listener to re-render on container size change
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('resize', handleResize)
})

// Handle window resize
function handleResize(): void {
  if (pdfCanvas.value) {
    updateCanvasDimensions()
    // Emit canvas ready to trigger re-render
    emit('canvas-ready', pdfCanvas.value)
  }
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent): void {
  // Delete selected annotation with Delete key
  if (event.key === 'Delete' && props.selectedAnnotation) {
    // Parent component should handle deletion
    event.preventDefault()
  }
  
  // Escape to cancel current tool
  if (event.key === 'Escape') {
    if (isDrawing.value) {
      isDrawing.value = false
      emit('finish-drawing')
    }
  }
}

function handleKeyUp(): void {
  // Handle key releases if needed
}

// Expose methods for parent component
defineExpose({
  updateCanvasDimensions,
  getCanvasElement: () => pdfCanvas.value,
  getCanvasContainer: () => canvasContainer.value
})
</script>

<style scoped>
.cursor-crosshair {
  cursor: crosshair;
}

/* Ensure canvas maintains aspect ratio */
canvas {
  max-width: 100%;
  height: auto;
}

/* Smooth transitions for annotations */
.absolute {
  transition: all 0.2s ease;
}

/* Custom scrollbar for canvas container */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
