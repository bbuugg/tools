<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
      {{ $t('tools.pdfViewer.documentInfo') }}
    </h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <!-- File Information -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h4 class="font-medium text-gray-900 mb-2 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          {{ $t('tools.pdfViewer.fileName') }}
        </h4>
        <p class="text-gray-600 break-all">{{ fileName || $t('tools.pdfViewer.unknown') }}</p>
      </div>
      
      <div class="border border-gray-200 rounded-lg p-4">
        <h4 class="font-medium text-gray-900 mb-2 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"></path>
          </svg>
          {{ $t('tools.pdfViewer.fileSize') }}
        </h4>
        <p class="text-gray-600">{{ fileSize || $t('tools.pdfViewer.unknown') }}</p>
      </div>
      
      <div class="border border-gray-200 rounded-lg p-4">
        <h4 class="font-medium text-gray-900 mb-2 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          {{ $t('tools.pdfViewer.pageCount') }}
        </h4>
        <p class="text-gray-600">{{ pageCount || 0 }}</p>
      </div>
    </div>

    <!-- Current View Information -->
    <div v-if="hasDocument" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-medium text-blue-900 mb-2">{{ $t('tools.pdfViewer.currentPage') }}</h4>
        <p class="text-blue-700 text-lg font-semibold">{{ currentPage }} / {{ pageCount }}</p>
      </div>
      
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 class="font-medium text-green-900 mb-2">{{ $t('tools.pdfViewer.zoomLevel') }}</h4>
        <p class="text-green-700 text-lg font-semibold">{{ Math.round(scale * 100) }}%</p>
      </div>
      
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 class="font-medium text-purple-900 mb-2">{{ $t('tools.pdfViewer.rotation') }}</h4>
        <p class="text-purple-700 text-lg font-semibold">{{ rotation }}°</p>
      </div>
      
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 class="font-medium text-orange-900 mb-2">{{ $t('tools.pdfViewer.viewMode') }}</h4>
        <p class="text-orange-700 text-lg font-semibold">
          {{ scale === 1 ? $t('tools.pdfViewer.actual') : scale > 1 ? $t('tools.pdfViewer.zoomed') : $t('tools.pdfViewer.reduced') }}
        </p>
      </div>
    </div>

    <!-- Annotation Statistics (if annotations are enabled) -->
    <div v-if="showAnnotationStats && annotationStats" class="border-t border-gray-200 pt-4">
      <h4 class="font-medium text-gray-900 mb-4 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
        {{ $t('tools.pdfViewer.annotations') }}
      </h4>
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <p class="text-2xl font-bold text-gray-700">{{ annotationStats.total }}</p>
          <p class="text-xs text-gray-500">{{ $t('tools.pdfViewer.total') }}</p>
        </div>
        
        <div 
          v-for="(count, type) in annotationStats.byType" 
          :key="type"
          class="bg-gray-50 rounded-lg p-3 text-center"
        >
          <p class="text-2xl font-bold text-gray-700">{{ count }}</p>
          <p class="text-xs text-gray-500 capitalize">{{ getAnnotationTypeLabel(type) }}</p>
        </div>
      </div>
      
      <!-- Pages with annotations -->
      <div v-if="Object.keys(annotationStats.byPage).length > 0" class="mt-4">
        <h5 class="font-medium text-gray-700 mb-2">{{ $t('tools.pdfViewer.pagesWithAnnotations') }}:</h5>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(count, page) in annotationStats.byPage"
            :key="page"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ $t('tools.pdfViewer.page') }} {{ page }} ({{ count }})
          </span>
        </div>
      </div>
    </div>

    <!-- PDF Metadata (if available) -->
    <div v-if="metadata && Object.keys(metadata).length > 0" class="border-t border-gray-200 pt-4 mt-4">
      <h4 class="font-medium text-gray-900 mb-4 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {{ $t('tools.pdfViewer.metadata') }}
      </h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="metadata.Title" class="border border-gray-200 rounded-lg p-3">
          <h5 class="font-medium text-gray-700 mb-1">{{ $t('tools.pdfViewer.title') }}</h5>
          <p class="text-gray-600 text-sm">{{ metadata.Title }}</p>
        </div>
        
        <div v-if="metadata.Author" class="border border-gray-200 rounded-lg p-3">
          <h5 class="font-medium text-gray-700 mb-1">{{ $t('tools.pdfViewer.author') }}</h5>
          <p class="text-gray-600 text-sm">{{ metadata.Author }}</p>
        </div>
        
        <div v-if="metadata.Subject" class="border border-gray-200 rounded-lg p-3">
          <h5 class="font-medium text-gray-700 mb-1">{{ $t('tools.pdfViewer.subject') }}</h5>
          <p class="text-gray-600 text-sm">{{ metadata.Subject }}</p>
        </div>
        
        <div v-if="metadata.Creator" class="border border-gray-200 rounded-lg p-3">
          <h5 class="font-medium text-gray-700 mb-1">{{ $t('tools.pdfViewer.creator') }}</h5>
          <p class="text-gray-600 text-sm">{{ metadata.Creator }}</p>
        </div>
        
        <div v-if="metadata.Producer" class="border border-gray-200 rounded-lg p-3">
          <h5 class="font-medium text-gray-700 mb-1">{{ $t('tools.pdfViewer.producer') }}</h5>
          <p class="text-gray-600 text-sm">{{ metadata.Producer }}</p>
        </div>
        
        <div v-if="metadata.CreationDate" class="border border-gray-200 rounded-lg p-3">
          <h5 class="font-medium text-gray-700 mb-1">{{ $t('tools.pdfViewer.creationDate') }}</h5>
          <p class="text-gray-600 text-sm">{{ formatDate(String(metadata.CreationDate)) }}</p>
        </div>
        
        <div v-if="metadata.ModDate" class="border border-gray-200 rounded-lg p-3">
          <h5 class="font-medium text-gray-700 mb-1">{{ $t('tools.pdfViewer.modificationDate') }}</h5>
          <p class="text-gray-600 text-sm">{{ formatDate(String(metadata.ModDate)) }}</p>
        </div>
        
        <div v-if="metadata.Keywords" class="border border-gray-200 rounded-lg p-3">
          <h5 class="font-medium text-gray-700 mb-1">{{ $t('tools.pdfViewer.keywords') }}</h5>
          <p class="text-gray-600 text-sm">{{ metadata.Keywords }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  fileName?: string
  fileSize?: string
  pageCount?: number
  currentPage?: number
  scale?: number
  rotation?: number
  hasDocument?: boolean
  showAnnotationStats?: boolean
  annotationStats?: {
    total: number
    byType: Record<string, number>
    byPage: Record<number, number>
  } | null
  metadata?: Record<string, unknown> | null
}

withDefaults(defineProps<Props>(), {
  fileName: '',
  fileSize: '',
  pageCount: 0,
  currentPage: 1,
  scale: 1,
  rotation: 0,
  hasDocument: false,
  showAnnotationStats: false,
  annotationStats: null,
  metadata: null
})

// Computed properties
const annotationTypeLabels = computed(() => ({
  text: 'Text',
  highlight: 'Highlight',
  rectangle: 'Rectangle',
  circle: 'Circle',
  line: 'Line',
  freehand: 'Freehand'
}))

// Methods
function getAnnotationTypeLabel(type: string): string {
  return annotationTypeLabels.value[type as keyof typeof annotationTypeLabels.value] || type
}

function formatDate(dateString: string): string {
  try {
    // PDF dates are in format D:YYYYMMDDHHmmSSOHH'mm'
    if (dateString.startsWith('D:')) {
      const cleanDate = dateString.substring(2, 16) // Extract YYYYMMDDHHMMSS
      const year = cleanDate.substring(0, 4)
      const month = cleanDate.substring(4, 6)
      const day = cleanDate.substring(6, 8)
      const hour = cleanDate.substring(8, 10)
      const minute = cleanDate.substring(10, 12)
      
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }
    
    // Fallback for other date formats
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  } catch {
    return dateString
  }
}
</script>

<style scoped>
/* Ensure consistent spacing and alignment */
.grid {
  gap: 1rem;
}

/* Custom styling for info cards */
.border {
  transition: all 0.2s ease;
}

.border:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive text sizing */
@media (max-width: 768px) {
  .text-2xl {
    font-size: 1.5rem;
  }
  
  .text-lg {
    font-size: 1.125rem;
  }
}

/* Break long text appropriately */
.break-all {
  word-break: break-all;
}

/* Ensure annotation type labels are readable */
.capitalize {
  text-transform: capitalize;
}
</style>
