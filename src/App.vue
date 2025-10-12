<template>
  <div class="h-screen flex bg-dark-950 text-slate-100">
    <!-- Electron Title Bar -->
    <ElectronTitleBar />

    <!-- Mobile Menu Button -->
    <div class="custom-mobile:hidden fixed bottom-6 left-6 z-20">
      <button
        @click="toggleSidebar"
        class="p-3 rounded-xl glass hover:glass-light shadow-dark-lg text-slate-300 hover:text-white transition-all duration-300 cursor-pointer hover-lift group"
      >
        <svg
          class="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 custom-mobile:hidden transition-all duration-300"
      ></div>

      <!-- Sidebar -->
      <aside
        :class="[
          'glass border-r border-slate-700/50 flex flex-col transition-all duration-300 ease-in-out z-40 shadow-dark-xl',
          'custom-mobile:relative custom-mobile:translate-x-0',
          isMobile
            ? ['fixed inset-y-0 left-0 w-80', isSidebarOpen ? 'translate-x-0' : '-translate-x-full']
            : 'w-64 xl:w-72', // More compact width
        ]"
      >
        <!-- Category Navigation -->
        <div class="p-4 border-b border-slate-700/30">
          <div class="flex items-center justify-between">
            <!-- Category Title - Clickable with arrow when in tool view -->
            <div
              v-if="!showCategoryView"
              @click="backToCategories"
              class="flex items-center justify-between cursor-pointer hover:text-primary-400 transition-all duration-200 group"
            >
              <div class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2 text-slate-400 group-hover:text-primary-400 group-hover:-translate-x-1 transition-all duration-200"
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
                <h2
                  class="text-lg font-semibold text-slate-100 group-hover:text-primary-400 transition-colors duration-200"
                >
                  {{ $t(`categories.${selectedCategory}.name`) }}
                </h2>
              </div>
              <span class="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
                {{ filteredTools.length }}/{{ currentCategoryTools.length }}
              </span>
            </div>
            <!-- Regular title when in category view -->
            <h2 v-else class="text-lg font-semibold text-slate-100 text-gradient">
              {{ $t('navigation.tools') }}
            </h2>
            <button
              v-if="isMobile"
              @click="closeSidebar"
              class="custom-mobile:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
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
        </div>
        <!-- Category List (shown in category view) -->
        <nav
          v-if="showCategoryView"
          class="flex-1 flex flex-col min-h-0 px-4 space-y-3 overflow-y-auto"
        >
          <button
            v-for="category in menuConfig"
            :key="category.id"
            @click="enterCategory(category.id)"
            class="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer hover:bg-slate-800/50 border border-slate-700/30 hover:border-primary-500/50 hover-lift group"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span
                  class="text-lg mr-3 group-hover:scale-110 transition-transform duration-200"
                  >{{ category.icon }}</span
                >
                <div>
                  <div
                    class="font-medium text-slate-100 group-hover:text-primary-400 transition-colors duration-200"
                  >
                    {{ $t(`categories.${category.id}.name`) }}
                  </div>
                  <div class="text-xs text-slate-400 mt-1 line-clamp-2">
                    {{ $t(`categories.${category.id}.description`) }}
                  </div>
                </div>
              </div>
              <div class="flex items-center">
                <span
                  class="text-xs bg-slate-800/50 text-slate-300 px-2 py-1 rounded-full mr-2 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-all duration-200"
                >
                  {{ category.children?.length || 0 }}
                </span>
                <svg
                  class="w-4 h-4 text-slate-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-200"
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

        <!-- Tools List (shown in tool view) -->
        <nav v-if="!showCategoryView" class="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <div class="p-4 border-b border-slate-700/30">
            <!-- Search Box -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-4 w-4 text-slate-400"
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
                class="block w-full pl-10 pr-10 py-3 text-sm bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer group"
              >
                <svg
                  class="h-4 w-4 text-slate-400 hover:text-slate-200 group-hover:scale-110 transition-all duration-200"
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
            <div v-if="filteredTools.length === 0" class="text-center py-12">
              <div class="text-slate-400 text-5xl mb-4 animate-bounce-subtle">🔍</div>
              <p class="text-slate-400 text-sm">
                {{ searchQuery ? $t('navigation.noResults') : $t('navigation.noToolsInCategory') }}
              </p>
            </div>

            <div v-else class="space-y-3">
              <router-link
                v-for="tool in filteredTools"
                :key="tool.id"
                :to="tool.path"
                @click="onToolClick"
                :class="[
                  'block p-4 rounded-xl border transition-all duration-200 cursor-pointer hover-lift group',
                  $route.path === tool.path
                    ? 'bg-primary-500/10 border-primary-500/50 shadow-glow'
                    : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/50',
                ]"
              >
                <div class="flex items-start">
                  <span
                    class="text-lg mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-200"
                    >{{ tool.icon }}</span
                  >
                  <div class="flex-1 min-w-0">
                    <h4
                      class="text-sm font-medium text-slate-100 truncate group-hover:text-primary-400 transition-colors duration-200"
                    >
                      {{ $t(`tools.${tool.id}.title`) }}
                    </h4>
                    <p class="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {{ $t(`tools.${tool.id}.description`) }}
                    </p>
                    <div v-if="tool.status" class="mt-2">
                      <span
                        :class="[
                          'inline-block px-2 py-1 text-xs rounded-full font-medium transition-all duration-200',
                          tool.status === 'active'
                            ? 'bg-success-500/20 text-success-400 group-hover:bg-success-500/30'
                            : 'bg-warning-500/20 text-warning-400 group-hover:bg-warning-500/30',
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
        </nav>

        <!-- Language Switcher at Bottom -->
        <div class="p-4 border-t border-slate-700/30 mt-auto">
          <div class="relative space-y-2">
            <!-- Home Button -->
            <router-link
              to="/"
              @click="closeSidebar"
              class="w-full bg-slate-800/50 p-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all duration-200 flex items-center space-x-3 cursor-pointer hover-lift group"
            >
              <svg
                class="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span class="text-sm font-medium">{{ $t('navigation.home') }}</span>
            </router-link>

            <button
              @click="showLanguageMenu = !showLanguageMenu"
              class="w-full bg-slate-800/50 p-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all duration-200 flex items-center space-x-3 cursor-pointer hover-lift group"
            >
              <span class="group-hover:scale-110 transition-transform duration-200">🌐</span>
              <span class="text-sm font-medium">{{ currentLanguage.name }}</span>
              <svg
                class="w-4 h-4 ml-auto group-hover:rotate-180 transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
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
              class="absolute bottom-full left-0 mb-2 w-full glass rounded-xl shadow-dark-xl z-50 border border-slate-600/50 animate-slide-up"
            >
              <div class="py-2">
                <button
                  v-for="lang in languages"
                  :key="lang.code"
                  @click="changeLanguage(lang.code)"
                  :class="[
                    'block w-full text-left px-4 py-3 text-sm transition-all duration-200 cursor-pointer hover-lift',
                    currentLocale === lang.code
                      ? 'bg-primary-500/20 text-primary-400 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white',
                  ]"
                >
                  <span class="mr-3">{{ lang.flag }}</span>
                  {{ lang.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main
        class="flex-1 overflow-auto relative bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800"
        :class="{
          'pt-8': isElectron,
          'electron-scrollbar': isElectron,
        }"
      >
        <!-- Loading Overlay -->
        <transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isLoading"
            class="absolute inset-0 glass flex items-center justify-center z-50"
          >
            <div class="flex flex-col items-center">
              <!-- Modern Spinner Animation -->
              <div class="relative">
                <div
                  class="w-16 h-16 border-4 border-slate-700 border-t-primary-500 rounded-full animate-spin"
                ></div>
                <div
                  class="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary-400 rounded-full animate-spin"
                  style="animation-direction: reverse; animation-duration: 1s"
                ></div>
              </div>
              <!-- Loading Text -->
              <p class="text-slate-300 text-sm font-medium mt-6 animate-pulse">
                {{ $t('common.loading') }}<span class="loading-dots"></span>
              </p>
            </div>
          </div>
        </transition>

        <!-- Content with Enhanced Transition -->
        <transition
          enter-active-class="transition-all duration-500 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="opacity-0 transform translate-y-8 scale-95"
          enter-to-class="opacity-100 transform translate-y-0 scale-100"
          leave-from-class="opacity-100 transform translate-y-0 scale-100"
          leave-to-class="opacity-0 transform translate-y-4 scale-98"
          mode="out-in"
        >
          <div
            :key="$route.path"
            :class="[
              'transition-all duration-300',
              isLoading ? 'opacity-30 blur-sm' : 'opacity-100 blur-0',
            ]"
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
