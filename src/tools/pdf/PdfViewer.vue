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
      <div class="mb-8">
        <PdfUpload
          :is-loading="pdfViewer.isLoading.value"
          :error="pdfViewer.error.value"
          :file-name="pdfViewer.fileName.value"
          :file-size="pdfViewer.fileSize.value"
          :max-size-m-b="50"
          :can-load-from-url="true"
          @file-selected="handleFileSelected"
          @url-selected="handleUrlSelected"
          @clear-file="handleClearFile"
          @clear-error="handleClearError"
        />
      </div>

      <!-- PDF Viewer Section -->
      <div v-if="pdfViewer.hasDocument.value" class="space-y-6">
        <!-- Toolbar -->
        <PdfToolbar
          :has-document="pdfViewer.hasDocument.value"
          :current-page="pdfViewer.currentPage.value"
          :page-count="pdfViewer.pageCount.value"
          :can-navigate-previous="pdfViewer.canNavigatePrevious.value"
          :can-navigate-next="pdfViewer.canNavigateNext.value"
          :scale="pdfViewer.scale.value"
          :zoom-levels="pdfViewer.zoomLevels"
          :show-annotation-tools="true"
          :current-tool="pdfEditor.currentTool.value"
          :current-color="pdfEditor.currentColor.value"
          :current-stroke-width="pdfEditor.currentStrokeWidth.value"
          :annotation-tools="pdfEditor.availableTools"
          :stroke-widths="pdfEditor.strokeWidths"
          @download="pdfViewer.downloadPdf"
          @reset="handleReset"
          @first-page="pdfViewer.firstPage"
          @previous-page="pdfViewer.previousPage"
          @next-page="pdfViewer.nextPage"
          @last-page="pdfViewer.lastPage"
          @go-to-page="pdfViewer.goToPage"
          @zoom-in="pdfViewer.zoomIn"
          @zoom-out="pdfViewer.zoomOut"
          @set-zoom="pdfViewer.setZoom"
          @fit-width="pdfViewer.fitToWidth"
          @rotate-left="pdfViewer.rotateLeft"
          @rotate-right="pdfViewer.rotateRight"
          @select-tool="pdfEditor.setTool"
          @set-color="pdfEditor.setColor"
          @set-stroke-width="pdfEditor.setStrokeWidth"
          @clear-annotations="pdfEditor.clearAnnotations"
          @export-annotations="handleExportAnnotations"
          @import-annotations="handleImportAnnotations"
        />

        <!-- Canvas -->
        <PdfCanvas
          :is-loading="isRendering"
          :error="renderError"
          :current-page="pdfViewer.currentPage.value"
          :scale="pdfViewer.scale.value"
          :rotation="pdfViewer.rotation.value"
          :current-tool="pdfEditor.currentTool.value"
          :show-annotations="true"
          :page-annotations="currentPageAnnotations"
          :selected-annotation="pdfEditor.selectedAnnotation.value"
          @canvas-ready="handleCanvasReady"
          @start-drawing="handleStartDrawing"
          @continue-drawing="handleContinueDrawing"
          @finish-drawing="handleFinishDrawing"
          @select-annotation="pdfEditor.selectAnnotation"
          @edit-annotation="handleEditAnnotation"
          @canvas-click="handleCanvasClick"
        />
      </div>

      <!-- PDF Information -->
      <div v-if="pdfViewer.hasDocument.value" class="mt-8">
        <PdfInfo
          :file-name="pdfViewer.fileName.value"
          :file-size="pdfViewer.fileSize.value"
          :page-count="pdfViewer.pageCount.value"
          :current-page="pdfViewer.currentPage.value"
          :scale="pdfViewer.scale.value"
          :rotation="pdfViewer.rotation.value"
          :has-document="pdfViewer.hasDocument.value"
          :show-annotation-stats="true"
          :annotation-stats="pdfEditor.getAnnotationStats()"
          :metadata="pdfMetadata"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { usePdfViewer } from '../../composables/usePdfViewer'
import { usePdfEditor } from '../../composables/usePdfEditor'
import PdfUpload from '../../components/pdf/PdfUpload.vue'
import PdfToolbar from '../../components/pdf/PdfToolbar.vue'
import PdfCanvas from '../../components/pdf/PdfCanvas.vue'
import PdfInfo from '../../components/pdf/PdfInfo.vue'

// Initialize composables
const pdfViewer = usePdfViewer()
const pdfEditor = usePdfEditor()

// Component state
const isRendering = ref(false)
const renderError = ref<string | null>(null)
const pdfMetadata = ref<Record<string, any> | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)

// Computed properties
const currentPageAnnotations = computed(() => {
  return pdfEditor.getAnnotationsForPage(pdfViewer.currentPage.value)
})

// Event handlers
async function handleFileSelected(file: File): Promise<void> {
  try {
    await pdfViewer.loadPdfFromFile(file)
    await loadPdfMetadata()
  } catch (error) {
    console.error('Error loading PDF file:', error)
  }
}

async function handleUrlSelected(url: string): Promise<void> {
  try {
    await pdfViewer.loadPdfFromUrl(url)
    await loadPdfMetadata()
  } catch (error) {
    console.error('Error loading PDF from URL:', error)
  }
}

function handleClearFile(): void {
  pdfViewer.reset()
  pdfEditor.clearAnnotations()
  pdfMetadata.value = null
  renderError.value = null
}

function handleClearError(): void {
  // Clear error in parent component if needed
}

function handleReset(): void {
  handleClearFile()
}

async function handleCanvasReady(canvas: HTMLCanvasElement): Promise<void> {
  canvasElement.value = canvas
  // If document is already loaded, render immediately
  if (pdfViewer.hasDocument.value) {
    await nextTick()
    setTimeout(async () => {
      await renderCurrentPage()
    }, 50)
  }
}

async function renderCurrentPage(): Promise<void> {
  if (!canvasElement.value) return

  isRendering.value = true
  renderError.value = null

  try {
    await pdfViewer.renderPage(canvasElement.value)
  } catch (error) {
    renderError.value = error instanceof Error ? error.message : 'Failed to render page'
    console.error('Error rendering page:', error)
  } finally {
    isRendering.value = false
  }
}

// Drawing event handlers
function handleStartDrawing(event: { pageNumber: number; x: number; y: number }): void {
  pdfEditor.startDrawing(event.pageNumber, event.x, event.y)
}

function handleContinueDrawing(event: { pageNumber: number; x: number; y: number }): void {
  pdfEditor.continueDrawing(event.pageNumber, event.x, event.y)
}

function handleFinishDrawing(): void {
  pdfEditor.finishDrawing()
}

function handleEditAnnotation(annotation: any): void {
  // Handle annotation editing (could open a modal or inline editor)
  console.log('Edit annotation:', annotation)
}

function handleCanvasClick(event: { x: number; y: number }): void {
  // Handle canvas clicks when no tool is selected
  console.log('Canvas clicked:', event)
}

// Annotation import/export handlers
function handleExportAnnotations(): void {
  pdfEditor.downloadAnnotations(`${pdfViewer.fileName.value}-annotations.json`)
}

function handleImportAnnotations(): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const text = await file.text()
        pdfEditor.importAnnotations(text)
      } catch (error) {
        console.error('Error importing annotations:', error)
      }
    }
  }
  input.click()
}

// Load PDF metadata
async function loadPdfMetadata(): Promise<void> {
  if (!pdfViewer.pdfDocument) return

  try {
    const metadata = await pdfViewer.pdfDocument.getMetadata()
    pdfMetadata.value = metadata.info
  } catch (error) {
    console.error('Error loading PDF metadata:', error)
    pdfMetadata.value = null
  }
}

// Watch for document loading to trigger initial render
watch(
  () => pdfViewer.hasDocument.value,
  async (hasDoc) => {
    if (hasDoc && canvasElement.value) {
      // Add small delay to ensure canvas is properly mounted
      await nextTick()
      setTimeout(async () => {
        await renderCurrentPage()
      }, 100)
    }
  }
)

// Watch for page, scale, or rotation changes to re-render
watch(
  [() => pdfViewer.currentPage.value, () => pdfViewer.scale.value, () => pdfViewer.rotation.value],
  async () => {
    if (pdfViewer.hasDocument.value && canvasElement.value) {
      await renderCurrentPage()
    }
  },
)

// Cleanup on unmount
onUnmounted(() => {
  pdfViewer.cleanup()
})
</script>

<style scoped>
/* Component-specific styles */
.min-h-screen {
  min-height: 100vh;
}

/* Ensure proper spacing between sections */
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .max-w-7xl {
    max-width: 100%;
  }

  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
