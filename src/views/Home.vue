<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <Header @toggle-sidebar="toggleSidebar" :is-sidebar-open="isSidebarOpen" />

    <div class="flex flex-1 relative">
      <!-- Mobile Overlay -->
      <div
        v-if="isSidebarOpen && isMobile"
        @click="closeSidebar"
        class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
      ></div>

      <!-- Sidebar -->
      <aside
        :class="[
          'bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-40',
          'lg:relative lg:translate-x-0',
          isMobile
            ? ['fixed inset-y-0 left-0 w-80', isSidebarOpen ? 'translate-x-0' : '-translate-x-full']
            : 'w-64',
        ]"
      >
        <!-- Category Navigation -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('navigation.categories') }}</h2>
            <button
              v-if="isMobile"
              @click="closeSidebar"
              class="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav class="space-y-2">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="selectCategory(category.id)"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100',
              ]"
            >
              <span class="mr-2">{{ category.icon }}</span>
              {{ $t(`categories.${category.id}.name`) }}
              <span class="ml-auto text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {{ category.tools.length }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Tools List -->
        <div class="flex-1 p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-medium text-gray-900">
              {{ $t(`categories.${selectedCategory}.name`) }}
            </h3>
            <span class="text-xs text-gray-500">
              {{ paginatedTools.length }}/{{ currentCategoryTools.length }}
            </span>
          </div>

          <!-- Tool Items -->
          <div class="space-y-2">
            <router-link
              v-for="tool in paginatedTools"
              :key="tool.id"
              :to="tool.path"
              @click="onToolClick"
              :class="[
                'block p-3 rounded-lg border transition-all hover:shadow-md',
                $route.name === tool.id
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300',
              ]"
            >
              <div class="flex items-start">
                <span class="text-lg mr-3 mt-0.5">{{ tool.icon }}</span>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ $t(`tools.${tool.id.replace('-', '')}.title`) }}
                  </h4>
                  <p class="text-xs text-gray-500 mt-1 leading-relaxed">
                    {{ $t(`tools.${tool.id.replace('-', '')}.description`) }}
                  </p>
                  <div v-if="tool.status" class="mt-2">
                    <span
                      :class="[
                        'inline-block px-2 py-1 text-xs rounded-full font-medium',
                        tool.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700',
                      ]"
                    >
                      {{ $t(`status.${tool.status}`) }}
                    </span>
                  </div>
                </div>
              </div>
            </router-link>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-6 border-t border-gray-200 pt-4">
            <div class="flex items-center justify-between">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ $t('pagination.previous') }}
              </button>

              <div class="flex space-x-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'w-8 h-8 text-sm rounded-md transition-colors',
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
                  ]"
                >
                  {{ page }}
                </button>
              </div>

              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ $t('pagination.next') }}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main
        :class="[
          'flex-1 overflow-auto transition-all duration-300 ease-in-out',
          isMobile && isSidebarOpen ? 'lg:ml-0' : '',
        ]"
      >
        <router-view />
      </main>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Header from '@/layouts/Header.vue'
import Footer from '@/layouts/Footer.vue'

interface Tool {
  id: string
  name: string
  icon: string
  path: string
  status?: 'active' | 'coming-soon'
}

interface Category {
  id: string
  name: string
  icon: string
  tools: Tool[]
}

const route = useRoute()
const router = useRouter()
const {} = useI18n()

const selectedCategory = ref('web-tools')
const currentPage = ref(1)
const toolsPerPage = 6
const isSidebarOpen = ref(false)
const isMobile = ref(false)

// Tool categories configuration
const categories = ref<Category[]>([
  {
    id: 'web-tools',
    name: 'Web Tools',
    icon: '🌐',
    tools: [
      {
        id: 'html-extractor',
        name: 'HTML Content Extractor',
        icon: '🖼️',
        path: '/web-tools/html-extractor',
        status: 'active',
      },
    ],
  },
  {
    id: 'json-tools',
    name: 'JSON Tools',
    icon: '📋',
    tools: [
      {
        id: 'json-to-excel',
        name: 'JSON to Excel Converter',
        icon: '📊',
        path: '/json-tools/json-to-excel',
        status: 'active',
      },
      {
        id: 'excel-to-json',
        name: 'Excel to JSON Converter',
        icon: '📈',
        path: '/json-tools/excel-to-json',
        status: 'active',
      },
      {
        id: 'json-to-csv',
        name: 'JSON to CSV Converter',
        icon: '📄',
        path: '/json-tools/json-to-csv',
        status: 'active',
      },
      {
        id: 'json-formatter',
        name: 'JSON Formatter',
        icon: '🎨',
        path: '/json-tools/json-formatter',
        status: 'active',
      },
      {
        id: 'json-field-extractor',
        name: 'JSON Field Extractor',
        icon: '🔍',
        path: '/json-tools/json-field-extractor',
        status: 'active',
      },
      {
        id: 'excel-text-to-json',
        name: 'Excel Text to JSON',
        icon: '📋',
        path: '/json-tools/excel-text-to-json',
        status: 'active',
      },
      {
        id: 'json-merge',
        name: 'JSON File Merger',
        icon: '🔗',
        path: '/json-tools/json-merge',
        status: 'active',
      },
      {
        id: 'get-to-json',
        name: 'GET Parameters to JSON',
        icon: '🌐',
        path: '/json-tools/get-to-json',
        status: 'active',
      },
      {
        id: 'cookie-to-json',
        name: 'Cookie to JSON',
        icon: '🍪',
        path: '/json-tools/cookie-to-json',
        status: 'active',
      },
      {
        id: 'list-to-json',
        name: 'Text List to JSON',
        icon: '📝',
        path: '/json-tools/list-to-json',
        status: 'active',
      },
      {
        id: 'json-keys-extractor',
        name: 'JSON Keys Extractor',
        icon: '🔑',
        path: '/json-tools/json-keys-extractor',
        status: 'active',
      },
      {
        id: 'header-to-json',
        name: 'HTTP Headers to JSON',
        icon: '📡',
        path: '/json-tools/header-to-json',
        status: 'active',
      },
      {
        id: 'json-to-sql',
        name: 'JSON to SQL Converter',
        icon: '🗄️',
        path: '/json-tools/json-to-sql',
        status: 'active',
      },
      {
        id: 'json-splitter',
        name: 'JSON File Splitter',
        icon: '✂️',
        path: '/json-tools/json-splitter',
        status: 'active',
      },
      {
        id: 'json-to-list',
        name: 'JSON Array to Text List',
        icon: '📋',
        path: '/json-tools/json-to-list',
        status: 'active',
      },
      {
        id: 'json-to-get',
        name: 'JSON to GET Parameters',
        icon: '🔗',
        path: '/json-tools/json-to-get',
        status: 'active',
      },
      {
        id: 'json-field-value-extractor',
        name: 'JSON Field Value Extractor',
        icon: '🎯',
        path: '/json-tools/json-field-value-extractor',
        status: 'active',
      },
      {
        id: 'json-minifier',
        name: 'JSON Minifier',
        icon: '📦',
        path: '/json-tools/json-minifier',
        status: 'active',
      },
      {
        id: 'json-unicode-fixer',
        name: 'JSON Unicode Fixer',
        icon: '🛠️',
        path: '/json-tools/json-unicode-fixer',
        status: 'active',
      },
      {
        id: 'json-number-to-text',
        name: 'JSON Number to Text',
        icon: '🔢',
        path: '/json-tools/json-number-to-text',
        status: 'active',
      },
      {
        id: 'json-array-to-lines',
        name: 'JSON Array to Lines',
        icon: '📄',
        path: '/json-tools/json-array-to-lines',
        status: 'active',
      },
      {
        id: 'json-array-extractor',
        name: 'JSON Array Extractor',
        icon: '🔍',
        path: '/json-tools/json-array-extractor',
        status: 'active',
      },
      {
        id: 'json-lines-to-array',
        name: 'JSON Lines to Array',
        icon: '📊',
        path: '/json-tools/json-lines-to-array',
        status: 'active',
      },
      {
        id: 'json-field-remover',
        name: 'JSON Field Remover',
        icon: '🗑️',
        path: '/json-tools/json-field-remover',
        status: 'active',
      },
      {
        id: 'json-array-shuffler',
        name: 'JSON Array Shuffler',
        icon: '🎲',
        path: '/json-tools/json-array-shuffler',
        status: 'active',
      },
      {
        id: 'json-unicode-encoder',
        name: 'JSON Unicode Encoder',
        icon: '🔒',
        path: '/json-tools/json-unicode-encoder',
        status: 'active',
      },
      {
        id: 'json-to-cookie',
        name: 'JSON to Cookie',
        icon: '🍪',
        path: '/json-tools/json-to-cookie',
        status: 'active',
      },
      {
        id: 'json-field-adder',
        name: 'JSON Field Adder',
        icon: '➕',
        path: '/json-tools/json-field-adder',
        status: 'active',
      },
      {
        id: 'json-text-to-number',
        name: 'JSON Text to Number',
        icon: '🔢',
        path: '/json-tools/json-text-to-number',
        status: 'active',
      },
      {
        id: 'json-value-resetter',
        name: 'JSON Value Resetter',
        icon: '🔄',
        path: '/json-tools/json-value-resetter',
        status: 'active',
      },
      {
        id: 'json-missing-key-finder',
        name: 'JSON Missing Key Finder',
        icon: '🔍',
        path: '/json-tools/json-missing-key-finder',
        status: 'active',
      },
      {
        id: 'json-object-slicer',
        name: 'JSON Object Slicer',
        icon: '✂️',
        path: '/json-tools/json-object-slicer',
        status: 'active',
      },
      {
        id: 'json-array-slicer',
        name: 'JSON Array Slicer',
        icon: '📊',
        path: '/json-tools/json-array-slicer',
        status: 'active',
      },
      {
        id: 'json-object-key-extractor',
        name: 'JSON Object Key Extractor',
        icon: '🔑',
        path: '/json-tools/json-object-key-extractor',
        status: 'active',
      },
      {
        id: 'json-object-value-extractor',
        name: 'JSON Object Value Extractor',
        icon: '💎',
        path: '/json-tools/json-object-value-extractor',
        status: 'active',
      },
      {
        id: 'json-key-value-extractor',
        name: 'JSON Key-Value Extractor',
        icon: '🔍',
        path: '/json-tools/json-key-value-extractor',
        status: 'active',
      },
      {
        id: 'csv-to-json',
        name: 'CSV to JSON Converter',
        icon: '📄',
        path: '/json-tools/csv-to-json',
        status: 'active',
      },
      {
        id: 'list-to-json-object',
        name: 'List to JSON Object',
        icon: '📋',
        path: '/json-tools/list-to-json-object',
        status: 'active',
      },
      {
        id: 'json-case-converter',
        name: 'JSON Case Converter',
        icon: '🔤',
        path: '/json-tools/json-case-converter',
        status: 'active',
      },
      {
        id: 'json-path-extractor',
        name: 'JSON Path Extractor',
        icon: '🛤️',
        path: '/json-tools/json-path-extractor',
        status: 'active',
      },
      {
        id: 'json-text-parser',
        name: 'JSON Text Parser',
        icon: '🔍',
        path: '/json-tools/json-text-parser',
        status: 'active',
      },
      {
        id: 'json-array-deduplicator',
        name: 'JSON Array Deduplicator',
        icon: '🔄',
        path: '/json-tools/json-array-deduplicator',
        status: 'active',
      },
      {
        id: 'json-line-splitter',
        name: 'JSON Line Splitter',
        icon: '📄',
        path: '/json-tools/json-line-splitter',
        status: 'active',
      },
      {
        id: 'json-field-replacer',
        name: 'JSON Field Replacer',
        icon: '🔄',
        path: '/json-tools/json-field-replacer',
        status: 'active',
      },
      {
        id: 'js-to-json',
        name: 'JavaScript to JSON',
        icon: '⚡',
        path: '/json-tools/js-to-json',
        status: 'active',
      },
      {
        id: 'json-text-formatter',
        name: 'JSON Text Formatter',
        icon: '🎨',
        path: '/json-tools/json-text-formatter',
        status: 'active',
      },
      {
        id: 'json-field-mapper',
        name: 'JSON Field Mapper',
        icon: '🗺️',
        path: '/json-tools/json-field-mapper',
        status: 'active',
      },
      {
        id: 'json-field-searcher',
        name: 'JSON Field Searcher',
        icon: '🔍',
        path: '/json-tools/json-field-searcher',
        status: 'active',
      },
      {
        id: 'list-deduplicator',
        name: 'List Deduplicator',
        icon: '📋',
        path: '/json-tools/list-deduplicator',
        status: 'active',
      },
      {
        id: 'json-duplicate-detector',
        name: 'JSON Duplicate Detector',
        icon: '🔍',
        path: '/json-tools/json-duplicate-detector',
        status: 'active',
      },
    ],
  },
  {
    id: 'data-tools',
    name: 'Data Tools',
    icon: '📊',
    tools: [
      {
        id: 'json-extractor',
        name: 'JSON Field Extractor',
        icon: '📋',
        path: '/data-tools/json-extractor',
        status: 'active',
      },
    ],
  },
  {
    id: 'image-tools',
    name: 'Image Tools',
    icon: '🖼️',
    tools: [
      {
        id: 'image-list-processor',
        name: 'Image List Processor',
        icon: '🖼️',
        path: '/image-tools/image-list-processor',
        status: 'active',
      },
      {
        id: 'image-compressor',
        name: 'Image Compressor Master',
        icon: '🗂',
        path: '/image-tools/image-compressor',
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
        id: 'file-renamer',
        name: 'Batch File Renamer',
        icon: '📝',
        path: '/converters/file-renamer',
        status: 'active',
      },
      {
        id: 'url-encoder',
        name: 'URL Encoder',
        icon: '🔗',
        path: '/converters/url-encoder',
        status: 'coming-soon',
      },
      {
        id: 'base64-converter',
        name: 'Base64 Converter',
        icon: '🔄',
        path: '/converters/base64-converter',
        status: 'coming-soon',
      },
    ],
  },
  {
    id: 'generators',
    name: 'Generators',
    icon: '⚡',
    tools: [
      {
        id: 'favicon-generator',
        name: 'Favicon Generator',
        icon: '🎯',
        path: '/generators/favicon-generator',
        status: 'active',
      },
      {
        id: 'color-picker',
        name: 'Color Picker',
        icon: '🎨',
        path: '/generators/color-picker',
        status: 'coming-soon',
      },
      {
        id: 'qr-generator',
        name: 'QR Generator',
        icon: '📱',
        path: '/generators/qr-generator',
        status: 'coming-soon',
      },
    ],
  },
])

// Computed properties
const currentCategoryTools = computed(() => {
  const category = categories.value.find((cat) => cat.id === selectedCategory.value)
  return category?.tools || []
})

const totalPages = computed(() => {
  return Math.ceil(currentCategoryTools.value.length / toolsPerPage)
})

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * toolsPerPage
  const end = start + toolsPerPage
  return currentCategoryTools.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2

  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)

  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(total, start + 4)
    } else {
      start = Math.max(1, end - 4)
    }
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function checkMobile() {
  isMobile.value = window.innerWidth < 1024 // lg breakpoint
  if (!isMobile.value) {
    isSidebarOpen.value = false
  }
}

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId
  currentPage.value = 1

  // Navigate to first tool of the category
  const category = categories.value.find((cat) => cat.id === categoryId)
  if (category && category.tools.length > 0) {
    router.push(category.tools[0].path)
  }

  // Close sidebar on mobile after selection
  if (isMobile.value) {
    closeSidebar()
  }
}

function onToolClick() {
  // Close sidebar on mobile when tool is clicked
  if (isMobile.value) {
    closeSidebar()
  }
}

function goToPage(page: number) {
  currentPage.value = page
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Watch for route changes to update selected category
watch(
  () => route.path,
  (newPath) => {
    // Find category based on current route
    for (const category of categories.value) {
      for (const tool of category.tools) {
        if (tool.path === newPath) {
          selectedCategory.value = category.id
          return
        }
      }
    }
  },
  { immediate: true },
)

onMounted(() => {
  // Set initial category based on current route
  const currentPath = route.path
  for (const category of categories.value) {
    for (const tool of category.tools) {
      if (tool.path === currentPath) {
        selectedCategory.value = category.id
        break
      }
    }
  }

  // Check mobile state
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>
