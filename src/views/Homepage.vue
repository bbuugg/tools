<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {{ $t('homepage.title') }}
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('homepage.subtitle') }}
        </p>
      </div>

      <!-- Recommended Tools Section -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-900">{{ $t('homepage.recommendedTools') }}</h2>
          <span class="text-sm text-gray-500"
            >{{ recommendedTools.length }} {{ $t('common.items') }}</span
          >
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <router-link
            v-for="tool in recommendedTools"
            :key="tool.id"
            :to="tool.path"
            class="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-6 group cursor-pointer"
          >
            <div class="flex items-start">
              <div class="text-3xl mr-4 group-hover:scale-110 transition-transform duration-200">
                {{ tool.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <h3
                  class="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
                >
                  {{ $t(`tools.${tool.id}.title`) }}
                </h3>
                <p class="text-sm text-gray-600 leading-relaxed">
                  {{ $t(`tools.${tool.id}.description`) }}
                </p>
                <div class="mt-3">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ $t(`categories.${tool.category}.name`) }}
                  </span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Categories Overview -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-900">{{ $t('homepage.exploreCategories') }}</h2>
          <span class="text-sm text-gray-500"
            >{{ categories.length }} {{ $t('navigation.categories') }}</span
          >
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="category in categories"
            :key="category.id"
            @click="navigateToCategory(category.id)"
            class="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-6 cursor-pointer group"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="text-3xl group-hover:scale-110 transition-transform duration-200">
                {{ category.icon }}
              </div>
              <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {{ category.tools.length }}
              </span>
            </div>
            <h3
              class="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
            >
              {{ $t(`categories.${category.id}.name`) }}
            </h3>
            <p class="text-sm text-gray-600">
              {{ $t(`categories.${category.id}.description`) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="bg-white rounded-lg border border-gray-200 p-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ totalTools }}</div>
            <div class="text-sm text-gray-600">{{ $t('homepage.stats.totalTools') }}</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-green-600 mb-2">{{ activeTools }}</div>
            <div class="text-sm text-gray-600">{{ $t('homepage.stats.activeTools') }}</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ categories.length }}</div>
            <div class="text-sm text-gray-600">{{ $t('homepage.stats.categories') }}</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-orange-600 mb-2">{{ comingSoonTools }}</div>
            <div class="text-sm text-gray-600">{{ $t('homepage.stats.comingSoon') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

interface Tool {
  id: string
  name: string
  icon: string
  path: string
  category: string
  status?: 'active' | 'coming-soon'
}

interface Category {
  id: string
  name: string
  icon: string
  tools: Tool[]
}

const router = useRouter()
const { t } = useI18n()

// Tool categories configuration (same as Home.vue)
const categories: Category[] = [
  {
    id: 'webTools',
    name: 'Web Tools',
    icon: '🌐',
    tools: [
      {
        id: 'htmlExtractor',
        name: 'HTML Content Extractor',
        icon: '🖼️',
        path: '/web-tools/html-extractor',
        category: 'web-tools',
        status: 'active',
      },
    ],
  },
  {
    id: 'jsonTools',
    name: 'JSON Tools',
    icon: '📋',
    tools: [
      {
        id: 'jsonToExcel',
        name: 'JSON to Excel Converter',
        icon: '📊',
        path: '/json-tools/json-to-excel',
        category: 'json-tools',
        status: 'active',
      },
      {
        id: 'excelToJson',
        name: 'Excel to JSON Converter',
        icon: '📈',
        path: '/json-tools/excel-to-json',
        category: 'json-tools',
        status: 'active',
      },
      {
        id: 'jsonFormatter',
        name: 'JSON Formatter',
        icon: '🎨',
        path: '/json-tools/json-formatter',
        category: 'json-tools',
        status: 'active',
      },
      {
        id: 'jsonExtractor',
        name: 'JSON Extractor',
        icon: '🔍',
        path: '/json-tools/json-extractor',
        category: 'json-tools',
        status: 'active',
      },
      {
        id: 'jsonPathExtractor',
        name: 'JSON Path Extractor',
        icon: '🛤️',
        path: '/json-tools/json-path-extractor',
        category: 'json-tools',
        status: 'active',
      },
    ],
  },
  {
    id: 'imageTools',
    name: 'Image Tools',
    icon: '🖼️',
    tools: [
      {
        id: 'imageListProcessor',
        name: 'Image List Processor',
        icon: '🖼️',
        path: '/image-tools/image-list-processor',
        category: 'image-tools',
        status: 'active',
      },
      {
        id: 'imageCompressor',
        name: 'Image Compressor',
        icon: '🗂',
        path: '/image-tools/image-compressor',
        category: 'image-tools',
        status: 'active',
      },
      {
        id: 'apngGenerator',
        name: 'APNG Generator',
        icon: '🎬',
        path: '/image-tools/apng-generator',
        category: 'image-tools',
        status: 'active',
      },
    ],
  },
  {
    id: 'converters',
    name: 'Converters',
    icon: '🔄',
    tools: [
      {
        id: 'fileRenamer',
        name: 'File Renamer',
        icon: '📝',
        path: '/converters/file-renamer',
        category: 'converters',
        status: 'active',
      },
    ],
  },
  {
    id: 'generators',
    name: 'Generators',
    icon: '⚡',
    tools: [
      {
        id: 'faviconGenerator',
        name: 'Favicon Generator',
        icon: '🎯',
        path: '/generators/favicon-generator',
        category: 'generators',
        status: 'active',
      },
    ],
  },
]

// Recommended tools - select the most popular/useful ones
const recommendedTools = computed(() => {
  const allTools = categories.flatMap((cat) => cat.tools.filter((tool) => tool.status === 'active'))

  // Select specific recommended tools
  const recommendedIds = [
    'jsonToExcel',
    'htmlExtractor',
    'imageListProcessor',
    'jsonFormatter',
    'faviconGenerator',
    'fileRenamer',
    'jsonExtractor',
    'imageCompressor',
  ]

  return allTools.filter((tool) => recommendedIds.includes(tool.id))
})

// Computed stats
const totalTools = computed(() => {
  return categories.reduce((total, cat) => total + cat.tools.length, 0)
})

const activeTools = computed(() => {
  return categories.reduce((total, cat) => {
    return total + cat.tools.filter((tool) => tool.status === 'active').length
  }, 0)
})

const comingSoonTools = computed(() => {
  return categories.reduce((total, cat) => {
    return total + cat.tools.filter((tool) => tool.status === 'coming-soon').length
  }, 0)
})

// Methods
function navigateToCategory(categoryId: string) {
  // Find the first tool in the category to navigate to
  const category = categories.find((cat) => cat.id === categoryId)
  if (category && category.tools.length > 0) {
    const firstActiveTool = category.tools.find((tool) => tool.status === 'active')
    if (firstActiveTool) {
      router.push(firstActiveTool.path)
    }
  }
}
</script>
