<template>
  <div class="h-screen flex">
    <!-- Electron Title Bar -->
    <ElectronTitleBar />
    <!-- Mobile Menu Button Fixed at Top Left -->
    <div class="custom-mobile:hidden fixed bottom-4 left-4 z-20">
      <button
        @click="toggleSidebar"
        class="p-2 rounded-md bg-white shadow-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>

    <div class="flex flex-1 relative">
      <!-- Mobile Overlay -->
      <div
        v-if="isSidebarOpen && isMobile"
        @click="closeSidebar"
        class="fixed inset-0 bg-black bg-opacity-50 z-30 custom-mobile:hidden transition-opacity duration-300"
      ></div>

      <!-- Sidebar -->
      <aside
        :class="[
          'bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-40',
          'custom-mobile:relative custom-mobile:translate-x-0',
          isMobile
            ? ['fixed inset-y-0 left-0 w-80', isSidebarOpen ? 'translate-x-0' : '-translate-x-full']
            : 'w-72 xl:w-80', // Wider on large and extra-large screens
        ]"
      >
        <!-- Category Navigation -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <!-- Category Title - Clickable with arrow when in tool view -->
            <div
              v-if="!showCategoryView"
              @click="backToCategories"
              class="flex items-center justify-between cursor-pointer hover:text-blue-600 transition-colors"
            >
              <div class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <h2 class="text-lg font-semibold text-gray-900">
                  {{ $t(`categories.${selectedCategory}.name`) }}
                </h2>
              </div>
              <span class="text-xs text-gray-500">
                {{ filteredTools.length }}/{{ currentCategoryTools.length }}
              </span>
            </div>
            <!-- Regular title when in category view -->
            <h2 v-else class="text-lg font-semibold text-gray-900">
              {{ $t('navigation.tools') }}
            </h2>
            <button
              v-if="isMobile"
              @click="closeSidebar"
              class="custom-mobile:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
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

          <!-- Category List (shown in category view) -->
          <nav v-if="showCategoryView" class="space-y-2">
            <button
              v-for="category in menuConfig"
              :key="category.id"
              @click="enterCategory(category.id)"
              class="w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <span class="text-lg mr-3">{{ category.icon }}</span>
                  <div>
                    <div class="font-medium text-gray-900">
                      {{ $t(`categories.${category.id}.name`) }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ $t(`categories.${category.id}.description`) }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center">
                  <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full mr-2">
                    {{ category.children?.length || 0 }}
                  </span>
                  <svg
                    class="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </nav>
        </div>

        <!-- Tools List (shown in tool view) -->
        <div v-if="!showCategoryView" class="flex-1 flex flex-col min-h-0">
          <div class="p-4 border-b border-gray-200">
            <!-- Search Box -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('navigation.search')"
                class="block w-full pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                <svg
                  class="h-4 w-4 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Tool Items - Scrollable Area -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="filteredTools.length === 0" class="text-center py-8">
              <div class="text-gray-400 text-4xl mb-2">🔍</div>
              <p class="text-gray-500 text-sm">
                {{ searchQuery ? $t('navigation.noResults') : $t('navigation.noToolsInCategory') }}
              </p>
            </div>

            <div v-else class="space-y-2">
              <router-link
                v-for="tool in filteredTools"
                :key="tool.id"
                :to="tool.path"
                @click="onToolClick"
                :class="[
                  'block p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer',
                  $route.path === tool.path
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300',
                ]"
              >
                <div class="flex items-start">
                  <span class="text-lg mr-3 mt-0.5">{{ tool.icon }}</span>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 truncate">
                      {{ $t(`tools.${tool.id}.title`) }}
                    </h4>
                    <p class="text-xs text-gray-500 mt-1 leading-relaxed break-all">
                      {{ $t(`tools.${tool.id}.description`) }}
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
          </div>
        </div>

        <!-- Language Switcher at Bottom -->
        <div class="p-4 border-t border-gray-200 mt-auto">
          <div class="relative">
            <!-- Home Button -->
            <router-link
              to="/"
              @click="closeSidebar"
              class="w-full mb-2 bg-gray-100 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span class="text-sm">{{ $t('navigation.home') }}</span>
            </router-link>

            <button
              @click="showLanguageMenu = !showLanguageMenu"
              class="w-full bg-gray-100 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <span>🌐</span>
              <span class="text-sm">{{ currentLanguage.name }}</span>
              <svg class="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <!-- Language Dropdown -->
            <div
              v-if="showLanguageMenu"
              class="absolute bottom-full left-0 mb-2 w-full bg-white rounded-md shadow-lg z-50 border border-gray-200"
            >
              <div class="py-1">
                <button
                  v-for="lang in languages"
                  :key="lang.code"
                  @click="changeLanguage(lang.code)"
                  :class="[
                    'block w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer',
                    currentLocale === lang.code
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50',
                  ]"
                >
                  <span class="mr-2">{{ lang.flag }}</span>
                  {{ lang.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main
        class="flex-1 overflow-auto relative"
        :class="{
          'pt-8': isElectron,
          'electron-scrollbar': isElectron,
        }"
      >
        <!-- Loading Overlay -->
        <transition
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isLoading"
            class="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <div class="flex flex-col items-center">
              <!-- Spinner Animation -->
              <div
                class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"
              ></div>
              <!-- Loading Text -->
              <p class="text-gray-600 text-sm font-medium animate-pulse">
                {{ $t('common.loading') }}
              </p>
            </div>
          </div>
        </transition>

        <!-- Content with Transition -->
        <transition
          enter-active-class="transition-all duration-300 delay-100"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 transform translate-y-2"
          enter-to-class="opacity-100 transform translate-y-0"
          leave-from-class="opacity-100 transform translate-y-0"
          leave-to-class="opacity-0 transform translate-y-1"
          mode="out-in"
        >
          <div
            :key="$route.path"
            :class="['transition-opacity duration-300', isLoading ? 'opacity-50' : 'opacity-100']"
          >
            <router-view />
          </div>
        </transition>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { menuConfig } from '@/config/routes'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ElectronTitleBar from '@/components/ElectronTitleBar.vue'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()

const selectedCategory = ref('web-tools')
const isSidebarOpen = ref(false)
const isMobile = ref(false)
const searchQuery = ref('')
const isLoading = ref(false)
const showCategoryView = ref(true) // true: show categories, false: show tools
const showLanguageMenu = ref(false)
const isElectron = ref(false)

// Language switcher data
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
]

const currentLocale = computed(() => locale.value)
const currentLanguage = computed(
  () => languages.find((lang) => lang.code === currentLocale.value) || languages[0],
)

// Computed properties
const currentCategoryTools = computed(() => {
  const category = menuConfig.find((cat) => cat.id === selectedCategory.value)
  return category?.children || []
})

const filteredTools = computed(() => {
  const tools = currentCategoryTools.value
  if (!searchQuery.value.trim()) {
    return tools
  }

  const query = searchQuery.value.toLowerCase().trim()
  return tools.filter((tool) => {
    const name = tool.name.toLowerCase()
    const id = tool.id.toLowerCase()
    return name.includes(query) || id.includes(query)
  })
})

// Methods
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function checkMobile() {
  isMobile.value = window.innerWidth < 1000 // 自定义断点：1000px
  if (!isMobile.value) {
    isSidebarOpen.value = false
  }
}

function enterCategory(categoryId: string) {
  selectedCategory.value = categoryId
  showCategoryView.value = false
  searchQuery.value = '' // Clear search when entering category

  // Don't close sidebar on mobile when entering category - keep it open for tool selection
}

function backToCategories() {
  showCategoryView.value = true
  searchQuery.value = '' // Clear search when going back
  router.replace('/')
}

function clearSearch() {
  searchQuery.value = ''
}

function onToolClick(event: Event) {
  // Get the target path from the router-link
  const target = event.currentTarget as HTMLElement
  const link = target.closest('a[href]') as HTMLAnchorElement
  if (!link) return

  const targetPath = link.getAttribute('href')

  // If we're already on the target route, prevent default navigation and don't set loading state
  if (targetPath === route.path) {
    event.preventDefault()
    // Close sidebar on mobile but don't trigger loading or navigation
    if (isMobile.value) {
      closeSidebar()
    }
    return
  }

  // Set loading state when navigating to a different tool
  isLoading.value = true

  // Close sidebar on mobile when tool is clicked
  if (isMobile.value) {
    closeSidebar()
  }
}

function changeLanguage(langCode: string) {
  locale.value = langCode
  localStorage.setItem('locale', langCode)
  document.title = t('navigation.title')
  showLanguageMenu.value = false
}

// Close language menu when clicking outside
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showLanguageMenu.value = false
  }
}

// Watch for route changes to update selected category
watch(
  () => route.path,
  (newPath, oldPath) => {
    // Find category based on current route
    for (const category of menuConfig) {
      if (category.children) {
        for (const tool of category.children) {
          if (tool.path === newPath) {
            selectedCategory.value = category.id
            // If we're on a tool page, show tool view
            if (newPath !== '/') {
              showCategoryView.value = false
            }
            break
          }
        }
      }
    }

    // If on homepage, show category view
    if (newPath === '/') {
      showCategoryView.value = true
    }

    // Always reset loading state after a short delay to ensure smooth transition
    // Only delay if we're actually changing routes
    if (newPath !== oldPath) {
      setTimeout(() => {
        isLoading.value = false
      }, 300)
    } else {
      // If it's the same path, immediately reset loading state
      isLoading.value = false
    }
  },
  { immediate: true },
)

onMounted(() => {
  // Set initial category based on current route
  const currentPath = route.path
  let foundTool = false

  for (const category of menuConfig) {
    if (category.children) {
      for (const tool of category.children) {
        if (tool.path === currentPath) {
          selectedCategory.value = category.id
          showCategoryView.value = false // Show tool view if on a tool page
          foundTool = true
          break
        }
      }
      if (foundTool) break
    }
  }

  // If not on a tool page, show category view
  if (!foundTool || currentPath === '/') {
    showCategoryView.value = true
  }

  // Check mobile state
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('click', handleClickOutside)

  // Check if running in Electron
  isElectron.value = !!(window as any).electronAPI

  // Fix for mobile sidebar appearing on refresh
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('click', handleClickOutside)
})
</script>
