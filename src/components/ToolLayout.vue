<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Tool Header -->
      <div class="mb-8 animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <!-- Tool Icon -->
            <div
              class="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-3xl animate-bounce-subtle"
            >
              {{ icon }}
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gradient mb-2">
                {{ title }}
              </h1>
              <p class="text-slate-400 text-lg">
                {{ description }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-3">
            <slot name="header-actions"></slot>
          </div>
        </div>

        <!-- Features/Tags -->
        <div v-if="features && features.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="feature in features"
            :key="feature"
            class="px-3 py-1 text-xs font-medium bg-slate-800/50 text-slate-300 rounded-full border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-200"
          >
            {{ feature }}
          </span>
        </div>
      </div>

      <!-- Main Content Area -->
      <slot></slot>

      <!-- Footer -->
      <div class="mt-12 text-center">
        <div class="glass rounded-xl border border-slate-700/30 p-4">
          <p class="text-slate-400 text-sm">
            <slot name="footer"> 💡 提示：此工具完全在浏览器中运行，您的数据不会上传到服务器 </slot>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon: string
  features?: string[]
}

withDefaults(defineProps<Props>(), {
  features: () => [],
})
</script>
