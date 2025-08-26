import { ref, computed, readonly } from 'vue'

export interface Annotation {
  id: string
  type: 'text' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'freehand'
  pageNumber: number
  x: number
  y: number
  width?: number
  height?: number
  text?: string
  color: string
  strokeWidth: number
  points?: { x: number; y: number }[]
  created: Date
  modified: Date
}

export interface DrawingState {
  isDrawing: boolean
  currentTool: Annotation['type'] | null
  currentColor: string
  currentStrokeWidth: number
  startPoint: { x: number; y: number } | null
  tempAnnotation: Annotation | null
}

export function usePdfEditor() {
  // Annotations storage
  const annotations = ref<Annotation[]>([])
  const selectedAnnotation = ref<Annotation | null>(null)
  
  // Drawing state
  const isDrawing = ref(false)
  const currentTool = ref<Annotation['type'] | null>(null)
  const currentColor = ref('#ff0000')
  const currentStrokeWidth = ref(2)
  const startPoint = ref<{ x: number; y: number } | null>(null)
  const tempAnnotation = ref<Annotation | null>(null)
  
  // Available tools and colors
  const availableTools = [
    { type: 'text' as const, label: 'Text', icon: 'T' },
    { type: 'highlight' as const, label: 'Highlight', icon: '🖍️' },
    { type: 'rectangle' as const, label: 'Rectangle', icon: '⬜' },
    { type: 'circle' as const, label: 'Circle', icon: '⭕' },
    { type: 'line' as const, label: 'Line', icon: '📏' },
    { type: 'freehand' as const, label: 'Freehand', icon: '✏️' }
  ]
  
  const availableColors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
    '#ff00ff', '#00ffff', '#000000', '#ffffff',
    '#ffa500', '#800080', '#008000', '#000080'
  ]
  
  const strokeWidths = [1, 2, 3, 4, 5, 8, 10]

  // Computed properties
  const annotationsByPage = computed(() => {
    const byPage: Record<number, Annotation[]> = {}
    annotations.value.forEach(annotation => {
      if (!byPage[annotation.pageNumber]) {
        byPage[annotation.pageNumber] = []
      }
      byPage[annotation.pageNumber].push(annotation)
    })
    return byPage
  })

  const annotationCount = computed(() => annotations.value.length)

  // Tool management
  function setTool(tool: Annotation['type'] | null): void {
    currentTool.value = tool
    selectedAnnotation.value = null
  }

  function setColor(color: string): void {
    currentColor.value = color
    if (selectedAnnotation.value) {
      updateAnnotation(selectedAnnotation.value.id, { color })
    }
  }

  function setStrokeWidth(width: number): void {
    currentStrokeWidth.value = width
    if (selectedAnnotation.value) {
      updateAnnotation(selectedAnnotation.value.id, { strokeWidth: width })
    }
  }

  // Annotation CRUD operations
  function createAnnotation(
    type: Annotation['type'],
    pageNumber: number,
    x: number,
    y: number,
    options: Partial<Annotation> = {}
  ): Annotation {
    const annotation: Annotation = {
      id: generateId(),
      type,
      pageNumber,
      x,
      y,
      color: currentColor.value,
      strokeWidth: currentStrokeWidth.value,
      created: new Date(),
      modified: new Date(),
      ...options
    }
    
    annotations.value.push(annotation)
    return annotation
  }

  function updateAnnotation(id: string, updates: Partial<Annotation>): void {
    const index = annotations.value.findIndex(a => a.id === id)
    if (index !== -1) {
      annotations.value[index] = {
        ...annotations.value[index],
        ...updates,
        modified: new Date()
      }
    }
  }

  function deleteAnnotation(id: string): void {
    const index = annotations.value.findIndex(a => a.id === id)
    if (index !== -1) {
      annotations.value.splice(index, 1)
      if (selectedAnnotation.value?.id === id) {
        selectedAnnotation.value = null
      }
    }
  }

  function selectAnnotation(annotation: Annotation | null): void {
    selectedAnnotation.value = annotation
    if (annotation) {
      currentColor.value = annotation.color
      currentStrokeWidth.value = annotation.strokeWidth
    }
  }

  function getAnnotationsForPage(pageNumber: number): Annotation[] {
    return annotations.value.filter(a => a.pageNumber === pageNumber)
  }

  // Drawing operations
  function startDrawing(pageNumber: number, x: number, y: number): void {
    if (!currentTool.value) return
    
    isDrawing.value = true
    startPoint.value = { x, y }
    
    if (currentTool.value === 'freehand') {
      tempAnnotation.value = createAnnotation(currentTool.value, pageNumber, x, y, {
        points: [{ x, y }]
      })
    } else if (currentTool.value === 'text') {
      // For text, create immediately and allow editing
      const annotation = createAnnotation(currentTool.value, pageNumber, x, y, {
        text: 'New Text',
        width: 100,
        height: 20
      })
      selectAnnotation(annotation)
      isDrawing.value = false
    }
  }

  function continueDrawing(pageNumber: number, x: number, y: number): void {
    if (!isDrawing.value || !startPoint.value || !currentTool.value) return
    
    if (currentTool.value === 'freehand' && tempAnnotation.value) {
      // Add point to freehand drawing
      const points = tempAnnotation.value.points || []
      points.push({ x, y })
      updateAnnotation(tempAnnotation.value.id, { points })
    } else if (tempAnnotation.value) {
      // Update shape dimensions
      const width = Math.abs(x - startPoint.value.x)
      const height = Math.abs(y - startPoint.value.y)
      const minX = Math.min(x, startPoint.value.x)
      const minY = Math.min(y, startPoint.value.y)
      
      updateAnnotation(tempAnnotation.value.id, {
        x: minX,
        y: minY,
        width,
        height
      })
    } else if (currentTool.value !== 'text' && currentTool.value !== 'freehand') {
      // Create temporary annotation for shapes
      const width = Math.abs(x - startPoint.value.x)
      const height = Math.abs(y - startPoint.value.y)
      const minX = Math.min(x, startPoint.value.x)
      const minY = Math.min(y, startPoint.value.y)
      
      tempAnnotation.value = createAnnotation(currentTool.value, pageNumber, minX, minY, {
        width,
        height
      })
    }
  }

  function finishDrawing(): void {
    isDrawing.value = false
    startPoint.value = null
    
    if (tempAnnotation.value) {
      selectAnnotation(tempAnnotation.value)
      tempAnnotation.value = null
    }
  }

  function cancelDrawing(): void {
    if (tempAnnotation.value) {
      deleteAnnotation(tempAnnotation.value.id)
      tempAnnotation.value = null
    }
    isDrawing.value = false
    startPoint.value = null
  }

  // Annotation management
  function clearAnnotations(): void {
    annotations.value = []
    selectedAnnotation.value = null
  }

  function clearPageAnnotations(pageNumber: number): void {
    annotations.value = annotations.value.filter(a => a.pageNumber !== pageNumber)
    if (selectedAnnotation.value?.pageNumber === pageNumber) {
      selectedAnnotation.value = null
    }
  }

  // Import/Export functionality
  function exportAnnotations(): string {
    return JSON.stringify({
      version: '1.0',
      annotations: annotations.value,
      exported: new Date().toISOString()
    }, null, 2)
  }

  function importAnnotations(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)
      if (data.annotations && Array.isArray(data.annotations)) {
        annotations.value = data.annotations.map((a: Partial<Annotation>) => ({
          ...a,
          created: new Date(a.created!),
          modified: new Date(a.modified!)
        })) as Annotation[]
      }
    } catch {
      throw new Error('Invalid annotation data format')
    }
  }

  function downloadAnnotations(filename = 'pdf-annotations.json'): void {
    const data = exportAnnotations()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Utility functions
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function getAnnotationStats() {
    const stats = {
      total: annotations.value.length,
      byType: {} as Record<string, number>,
      byPage: {} as Record<number, number>
    }
    
    annotations.value.forEach(annotation => {
      // Count by type
      stats.byType[annotation.type] = (stats.byType[annotation.type] || 0) + 1
      
      // Count by page
      stats.byPage[annotation.pageNumber] = (stats.byPage[annotation.pageNumber] || 0) + 1
    })
    
    return stats
  }

  return {
    // State
    annotations: readonly(annotations),
    selectedAnnotation: readonly(selectedAnnotation),
    isDrawing: readonly(isDrawing),
    currentTool: readonly(currentTool),
    currentColor: readonly(currentColor),
    currentStrokeWidth: readonly(currentStrokeWidth),
    tempAnnotation: readonly(tempAnnotation),
    
    // Constants
    availableTools,
    availableColors,
    strokeWidths,
    
    // Computed
    annotationsByPage,
    annotationCount,
    
    // Tool management
    setTool,
    setColor,
    setStrokeWidth,
    
    // Annotation operations
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
    getAnnotationsForPage,
    
    // Drawing operations
    startDrawing,
    continueDrawing,
    finishDrawing,
    cancelDrawing,
    
    // Management
    clearAnnotations,
    clearPageAnnotations,
    
    // Import/Export
    exportAnnotations,
    importAnnotations,
    downloadAnnotations,
    
    // Utilities
    getAnnotationStats
  }
}
