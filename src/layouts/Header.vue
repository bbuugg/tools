<template>
  <header class="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo and Title -->
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span class="text-2xl font-bold text-blue-600">🔧</span>
            </div>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">{{ $t('navigation.tools') }}</h1>
            <p class="text-blue-100 text-sm">Professional web development utilities</p>
          </div>
        </div>

        <!-- Navigation and Language Switcher -->
        <div class="flex items-center space-x-4">
          <!-- Navigation Menu -->
          <nav class="hidden md:flex space-x-8">
            <button
              v-for="tool in tools"
              :key="tool.id"
              @click="$emit('selectTool', tool.id)"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                selectedTool === tool.id
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-blue-500',
              ]"
            >
              <span class="mr-2">{{ tool.icon }}</span>
              {{ tool.name }}
            </button>
          </nav>

          <!-- Language Switcher -->
          <div class="relative">
            <button
              @click="showLanguageMenu = !showLanguageMenu"
              class="bg-blue-500 p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-400 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>🌐</span>
              <span class="hidden sm:block text-sm">{{ currentLanguage.name }}</span>
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
            >
              <div class="py-1">
                <button
                  v-for="lang in languages"
                  :key="lang.code"
                  @click="changeLanguage(lang.code)"
                  :class="[
                    'block w-full text-left px-4 py-2 text-sm transition-colors',
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

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="bg-blue-500 p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-400 transition-colors duration-200"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden pb-4">
        <div class="space-y-2">
          <button
            v-for="tool in tools"
            :key="tool.id"
            @click="selectToolAndCloseMobile(tool.id)"
            :class="[
              'block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
              selectedTool === tool.id
                ? 'bg-white text-blue-600'
                : 'text-blue-100 hover:text-white hover:bg-blue-500',
            ]"
          >
            <span class="mr-2">{{ tool.icon }}</span>
            {{ tool.name }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

interface Tool {
  id: string
  name: string
  icon: string
}

defineProps<{
  tools: Tool[]
  selectedTool: string
}>()

const emit = defineEmits<{
  selectTool: [toolId: string]
}>()

const { locale, t } = useI18n()
const mobileMenuOpen = ref(false)
const showLanguageMenu = ref(false)

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
]

const currentLocale = computed(() => locale.value)
const currentLanguage = computed(
  () => languages.find((lang) => lang.code === currentLocale.value) || languages[0],
)

function changeLanguage(langCode: string) {
  locale.value = langCode
  localStorage.setItem('locale', langCode)
  showLanguageMenu.value = false
}

function selectToolAndCloseMobile(toolId: string) {
  emit('selectTool', toolId)
  mobileMenuOpen.value = false
}

// Close language menu when clicking outside
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showLanguageMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
