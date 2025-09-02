<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-16 relative">
        <!-- Background decoration -->
        <div class="absolute inset-0 -z-10">
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-glow"
          ></div>
          <div
            class="absolute top-1/3 left-1/4 w-64 h-64 bg-success-500/5 rounded-full blur-2xl animate-float"
          ></div>
          <div
            class="absolute bottom-1/3 right-1/4 w-48 h-48 bg-warning-500/5 rounded-full blur-2xl animate-float"
            style="animation-delay: 1s"
          ></div>
        </div>

        <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-gradient mb-6 animate-fade-in">
          {{ $t('homepage.title') }}
        </h1>
        <p
          class="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed animate-slide-up"
        >
          {{ $t('homepage.subtitle') }}
        </p>

        <!-- Floating elements -->
        <div class="absolute -top-4 left-1/4 text-2xl animate-bounce-subtle opacity-60">⚡</div>
        <div
          class="absolute top-8 right-1/4 text-2xl animate-bounce-subtle opacity-60"
          style="animation-delay: 0.5s"
        >
          🚀
        </div>
        <div
          class="absolute -bottom-4 left-1/3 text-2xl animate-bounce-subtle opacity-60"
          style="animation-delay: 1s"
        >
          ✨
        </div>
      </div>

      <!-- Recommended Tools Section -->
      <div class="mb-16">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h2 class="text-3xl font-bold text-slate-100 mb-2">
              {{ $t('homepage.recommendedTools') }}
            </h2>
            <p class="text-slate-400">{{ $t('homepage.recommendedToolsDesc') }}</p>
          </div>
          <span class="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
            {{ recommendedTools.length }} {{ $t('common.items') }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <router-link
            v-for="(tool, index) in recommendedTools"
            :key="tool.id"
            :to="tool.path"
            class="glass rounded-2xl border border-slate-700/30 hover:border-primary-500/50 hover:shadow-glow transition-all duration-300 p-6 group cursor-pointer hover-lift animate-slide-up"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div class="flex items-start">
              <div
                class="text-3xl mr-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300"
              >
                {{ tool.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <h3
                  class="text-lg font-semibold text-slate-100 mb-2 group-hover:text-primary-400 transition-colors duration-200"
                >
                  {{ $t(`tools.${tool.id}.title`) }}
                </h3>
                <p
                  class="text-sm text-slate-400 leading-relaxed line-clamp-3 group-hover:text-slate-300 transition-colors duration-200"
                >
                  {{ $t(`tools.${tool.id}.description`) }}
                </p>
                <div class="mt-4">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400 group-hover:bg-primary-500/30 transition-all duration-200"
                  >
                    {{ $t(`categories.${tool.categoryId}.name`) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Hover effect overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
            ></div>
          </router-link>
        </div>
      </div>

      <!-- Categories Overview -->
      <div class="mb-16">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h2 class="text-3xl font-bold text-slate-100 mb-2">
              {{ $t('homepage.exploreCategories') }}
            </h2>
            <p class="text-slate-400">{{ $t('homepage.exploreCategoriesDesc') }}</p>
          </div>
          <span class="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
            {{ menuConfig.length }} {{ $t('navigation.categories') }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(category, index) in menuConfig"
            :key="category.id"
            @click="navigateToCategory(category.id)"
            class="glass rounded-2xl border border-slate-700/30 hover:border-primary-500/50 hover:shadow-glow transition-all duration-300 p-6 cursor-pointer group hover-lift animate-slide-up"
            :style="{ animationDelay: `${index * 150}ms` }"
          >
            <div class="flex items-center justify-between mb-6">
              <div
                class="text-4xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300"
              >
                {{ category.icon }}
              </div>
              <span
                class="text-xs bg-slate-800/50 text-slate-300 px-3 py-1.5 rounded-full group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-all duration-200"
              >
                {{ category.children?.length || 0 }}
              </span>
            </div>
            <h3
              class="text-xl font-semibold text-slate-100 mb-3 group-hover:text-primary-400 transition-colors duration-200"
            >
              {{ $t(`categories.${category.id}.name`) }}
            </h3>
            <p
              class="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-200"
            >
              {{ $t(`categories.${category.id}.description`) }}
            </p>

            <!-- Arrow indicator -->
            <div class="mt-4 flex justify-end">
              <svg
                class="w-5 h-5 text-slate-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-200"
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

            <!-- Hover effect overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
            ></div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div
        class="glass rounded-3xl border border-slate-700/30 p-8 md:p-10 relative overflow-hidden"
      >
        <!-- Background decoration -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-success-500/5"
        ></div>

        <div class="relative">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-slate-100 mb-2">{{ $t('homepage.stats.title') }}</h3>
            <p class="text-slate-400">{{ $t('homepage.stats.description') }}</p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div class="text-center group">
              <div
                class="bg-primary-500/10 rounded-2xl p-4 mb-4 group-hover:bg-primary-500/20 transition-all duration-300"
              >
                <div
                  class="text-4xl font-bold text-primary-400 mb-2 group-hover:scale-110 transition-transform duration-300"
                >
                  {{ totalTools }}
                </div>
                <div
                  class="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-200"
                >
                  {{ $t('homepage.stats.totalTools') }}
                </div>
              </div>
            </div>
            <div class="text-center group">
              <div
                class="bg-success-500/10 rounded-2xl p-4 mb-4 group-hover:bg-success-500/20 transition-all duration-300"
              >
                <div
                  class="text-4xl font-bold text-success-400 mb-2 group-hover:scale-110 transition-transform duration-300"
                >
                  {{ activeTools }}
                </div>
                <div
                  class="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-200"
                >
                  {{ $t('homepage.stats.activeTools') }}
                </div>
              </div>
            </div>
            <div class="text-center group">
              <div
                class="bg-purple-500/10 rounded-2xl p-4 mb-4 group-hover:bg-purple-500/20 transition-all duration-300"
              >
                <div
                  class="text-4xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300"
                >
                  {{ menuConfig.length }}
                </div>
                <div
                  class="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-200"
                >
                  {{ $t('homepage.stats.categories') }}
                </div>
              </div>
            </div>
            <div class="text-center group">
              <div
                class="bg-warning-500/10 rounded-2xl p-4 mb-4 group-hover:bg-warning-500/20 transition-all duration-300"
              >
                <div
                  class="text-4xl font-bold text-warning-400 mb-2 group-hover:scale-110 transition-transform duration-300"
                >
                  {{ comingSoonTools }}
                </div>
                <div
                  class="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-200"
                >
                  {{ $t('homepage.stats.comingSoon') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer spacing -->
      <div class="h-16"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { menuConfig } from '@/config/routes'

interface Tool {
  id: string
  categoryId: string
  name: string
  icon: string
  path: string
  status?: 'active' | 'coming-soon'
}

const router = useRouter()
const { t } = useI18n()

// Recommended tools - select the most popular/useful ones
const recommendedTools = computed<Tool[]>(() => {
  // Flatten all tools from menuConfig
  const allTools = menuConfig
    .flatMap((category) =>
      (category.children || []).map((tool) => ({
        id: tool.id,
        categoryId: category.id,
        name: tool.name || '',
        icon: tool.icon || '🔧',
        path: tool.path,
        status: tool.status,
      })),
    )
    .filter((tool) => tool.status === 'active')

  // Select specific recommended tools
  const recommendedIds = [
    'jsonPathExtractor',
    'htmlExtractor',
    'imageListProcessor',
    'universalConverter',
    'faviconGenerator',
    'fileRenamer',
    'qrCodeTool',
    'wsTool',
  ]

  return allTools.filter((tool) => recommendedIds.includes(tool.id))
})

// Computed stats
const totalTools = computed(() => {
  return menuConfig.reduce((total, category) => total + (category.children?.length || 0), 0)
})

const activeTools = computed(() => {
  return menuConfig.reduce((total, category) => {
    return total + (category.children?.filter((tool) => tool.status === 'active').length || 0)
  }, 0)
})

const comingSoonTools = computed(() => {
  return menuConfig.reduce((total, category) => {
    return total + (category.children?.filter((tool) => tool.status === 'coming-soon').length || 0)
  }, 0)
})

// Methods
function navigateToCategory(categoryId: string) {
  router.push(`/categories/${categoryId}`)
}
</script>
