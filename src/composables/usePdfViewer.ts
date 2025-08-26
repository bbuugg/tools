import { ref, computed, readonly } from 'vue'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

// Set the worker path
GlobalWorkerOptions.workerSrc = pdfjsWorker
let pdfDocument: PDFDocumentProxy | null

export interface PdfViewerState {
  pdfDocument: PDFDocumentProxy | null
  currentPage: number
  pageCount: number
  scale: number
  rotation: number
  isLoading: boolean
  error: string | null
}

export interface PdfFileInfo {
  file: File | null
  fileName: string
  fileSize: string
  url: string | null
}

export function usePdfViewer() {
  // Core state
  const currentPage = ref(1)
  const pageCount = ref(0)
  const scale = ref(1)
  const rotation = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // File info
  const pdfFile = ref<File | null>(null)
  const fileName = ref('')
  const fileSize = ref('')
  const pdfUrl = ref<string | null>(null)

  // Computed properties
  const hasDocument = computed(() => pdfDocument !== null)
  const canNavigatePrevious = computed(() => currentPage.value > 1)
  const canNavigateNext = computed(() => currentPage.value < pageCount.value)
  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]

  // Load PDF from file
  async function loadPdfFromFile(file: File): Promise<void> {
    if (!file) {
      throw new Error('No file provided')
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type. Please select a PDF file.')
    }

    isLoading.value = true
    error.value = null

    try {
      // Store file info
      pdfFile.value = file
      fileName.value = file.name
      fileSize.value = formatFileSize(file.size)

      // Create object URL for the file
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value)
      }
      pdfUrl.value = URL.createObjectURL(file)

      // Load PDF document
      const arrayBuffer = await file.arrayBuffer()
      const typedArray = new Uint8Array(arrayBuffer)

      const loadingTask = getDocument({ data: typedArray })
      pdfDocument = await loadingTask.promise
      pageCount.value = pdfDocument.numPages
      currentPage.value = 1

      // Reset view state
      scale.value = 1
      rotation.value = 0
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load PDF'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Load PDF from URL
  async function loadPdfFromUrl(url: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const loadingTask = getDocument(url)
      pdfDocument = await loadingTask.promise
      pageCount.value = pdfDocument.numPages
      currentPage.value = 1

      // Reset view state
      scale.value = 1
      rotation.value = 0

      // Clear file info since we're loading from URL
      pdfFile.value = null
      fileName.value = url.split('/').pop() || 'PDF Document'
      fileSize.value = ''
      pdfUrl.value = url
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load PDF from URL'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Render page to canvas with container width fitting and A4 aspect ratio
  async function renderPage(canvas: HTMLCanvasElement, pageNumber?: number): Promise<void> {
    if (!pdfDocument || !canvas) return

    const pageNum = pageNumber || currentPage.value

    try {
      const page = await pdfDocument.getPage(pageNum)
      
      // Get the container dimensions
      const container = canvas.parentElement
      if (!container) return
      
      // Wait for container to have proper dimensions
      if (container.clientWidth === 0) {
        // Retry after a short delay if container not ready
        setTimeout(() => renderPage(canvas, pageNumber), 50)
        return
      }
      
      console.log('Rendering PDF page:', pageNum, 'Container width:', container.clientWidth)
      
      const containerWidth = container.clientWidth
      
      // Calculate scale to fit container width while maintaining aspect ratio
      const originalViewport = page.getViewport({ scale: 1, rotation: rotation.value })
      const scaleToFitWidth = containerWidth / originalViewport.width
      const finalScale = scaleToFitWidth * scale.value
      
      const viewport = page.getViewport({ scale: finalScale, rotation: rotation.value })

      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Could not get canvas context')
      }

      // Set canvas dimensions to match viewport
      canvas.width = viewport.width
      canvas.height = viewport.height

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height)

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }

      await page.render(renderContext).promise
      console.log('PDF page rendered successfully:', pageNum, 'Canvas size:', canvas.width, 'x', canvas.height)
    } catch (err) {
      console.error('Error rendering page:', err)
      error.value = 'Failed to render page'
    }
  }

  // Get page for external use
  async function getPage(pageNumber: number): Promise<PDFPageProxy> {
    if (!pdfDocument) {
      throw new Error('PDF document not loaded')
    }

    if (pageNumber < 1 || pageNumber > pageCount.value) {
      throw new Error('Invalid page number')
    }

    return await pdfDocument.getPage(pageNumber)
  }

  // Navigation methods
  function goToPage(page: number): void {
    if (page >= 1 && page <= pageCount.value) {
      currentPage.value = page
    }
  }

  function nextPage(): void {
    if (canNavigateNext.value) {
      currentPage.value++
    }
  }

  function previousPage(): void {
    if (canNavigatePrevious.value) {
      currentPage.value--
    }
  }

  function firstPage(): void {
    currentPage.value = 1
  }

  function lastPage(): void {
    currentPage.value = pageCount.value
  }

  // Zoom methods
  function setZoom(newScale: number): void {
    if (newScale > 0 && newScale <= 5) {
      scale.value = newScale
    }
  }

  function zoomIn(): void {
    const currentIndex = zoomLevels.findIndex((level) => level >= scale.value)
    if (currentIndex < zoomLevels.length - 1) {
      scale.value = zoomLevels[currentIndex + 1]
    }
  }

  function zoomOut(): void {
    const currentIndex = zoomLevels.findIndex((level) => level >= scale.value)
    if (currentIndex > 0) {
      scale.value = zoomLevels[currentIndex - 1]
    }
  }

  function resetZoom(): void {
    scale.value = 1
  }

  function fitToWidth(): void {
    // This would need canvas dimensions to calculate proper scale
    // Implementation depends on container size
    scale.value = 1
  }

  // Rotation methods
  function rotateLeft(): void {
    rotation.value = (rotation.value - 90) % 360
  }

  function rotateRight(): void {
    rotation.value = (rotation.value + 90) % 360
  }

  function resetRotation(): void {
    rotation.value = 0
  }

  // Utility methods
  function reset(): void {
    if (pdfUrl.value && pdfFile.value) {
      URL.revokeObjectURL(pdfUrl.value)
    }

    pdfDocument = null
    pdfFile.value = null
    fileName.value = ''
    fileSize.value = ''
    pdfUrl.value = null
    currentPage.value = 1
    pageCount.value = 0
    scale.value = 1
    rotation.value = 0
    isLoading.value = false
    error.value = null
  }

  function downloadPdf(): void {
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
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Cleanup on unmount
  function cleanup(): void {
    if (pdfUrl.value && pdfFile.value) {
      URL.revokeObjectURL(pdfUrl.value)
    }
  }

  return {
    // State
    pdfDocument: pdfDocument,
    hasDocument,
    currentPage: readonly(currentPage),
    pageCount: readonly(pageCount),
    scale: readonly(scale),
    rotation: readonly(rotation),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // File info
    pdfFile: readonly(pdfFile),
    fileName: readonly(fileName),
    fileSize: readonly(fileSize),
    pdfUrl: readonly(pdfUrl),

    // Computed
    canNavigatePrevious,
    canNavigateNext,
    zoomLevels,

    // Methods
    loadPdfFromFile,
    loadPdfFromUrl,
    renderPage,
    getPage,

    // Navigation
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,

    // Zoom
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToWidth,

    // Rotation
    rotateLeft,
    rotateRight,
    resetRotation,

    // Utility
    reset,
    downloadPdf,
    cleanup,
  }
}
