<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="max-w-2xl mx-auto text-center">
      <!-- 404 Illustration -->
      <div class="mb-8">
        <div class="text-8xl md:text-9xl mb-4">🔍</div>
        <h1 class="text-6xl md:text-7xl font-bold text-gray-900 mb-4">404</h1>
        <h2 class="text-2xl md:text-3xl font-semibold text-gray-700 mb-2">
          {{ $t('notFound.title') }}
        </h2>
        <p class="text-lg text-gray-600">
          {{ $t('notFound.description') }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <router-link
          to="/"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          {{ $t('notFound.backToHome') }}
        </router-link>

        <button
          @click="goBack"
          class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {{ $t('notFound.goBack') }}
        </button>
      </div>

      <!-- Popular Tools -->
      <div class="text-left">
        <h3 class="text-xl font-semibold text-gray-900 mb-6 text-center">
          {{ $t('notFound.popularTools') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <router-link
            v-for="tool in popularTools"
            :key="tool.id"
            :to="tool.path"
            class="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-4 group cursor-pointer"
          >
            <div class="flex items-center">
              <div class="text-2xl mr-3 group-hover:scale-110 transition-transform duration-200">
                {{ tool.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <h4
                  class="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors"
                >
                  {{ $t(`tools.${tool.id}.title`) }}
                </h4>
                <p class="text-xs text-gray-500 mt-1 truncate">
                  {{ $t(`tools.${tool.id}.description`) }}
                </p>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Help Text -->
      <div class="mt-12 text-center">
        <p class="text-sm text-gray-500">
          {{ $t('notFound.helpText') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

interface Tool {
  id: string
  name: string
  icon: string
  path: string
}

const router = useRouter()
const {} = useI18n()

// Popular tools to display as alternatives
const popularTools: Tool[] = [
  {
    id: 'jsonToExcel',
    name: 'JSON to Excel Converter',
    icon: '📊',
    path: '/json-tools/json-to-excel',
  },
  {
    id: 'htmlExtractor',
    name: 'HTML Content Extractor',
    icon: '🖼️',
    path: '/web-tools/html-extractor',
  },
  {
    id: 'imageListProcessor',
    name: 'Image List Processor',
    icon: '🖼️',
    path: '/image-tools/image-list-processor',
  },
  {
    id: 'jsonFormatter',
    name: 'JSON Formatter',
    icon: '🎨',
    path: '/json-tools/json-formatter',
  },
  {
    id: 'faviconGenerator',
    name: 'Favicon Generator',
    icon: '🎯',
    path: '/generators/favicon-generator',
  },
  {
    id: 'fileRenamer',
    name: 'File Renamer',
    icon: '📝',
    path: '/converters/file-renamer',
  },
]

// Methods
function goBack() {
  // Check if there's history to go back to
  if (window.history.length > 1) {
    router.back()
  } else {
    // If no history, go to home
    router.push('/')
  }
}
</script>
