<template>
  <ToolLayout
    :title="$t('tools.transformTools.title')"
    :description="$t('tools.transformTools.description')"
    :icon="'🔄'"
    :features="[
      $t('tools.transformTools.features.1'),
      $t('tools.transformTools.features.2'),
      $t('tools.transformTools.features.3'),
    ]"
  >
    <div class="glass rounded-xl p-6 border border-slate-700/50">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-slate-100">
          {{ $t('tools.transformTools.editor') }}
        </h2>
        <div class="flex gap-2">
          <button
            @click="refreshIframe"
            class="px-3 py-1.5 text-sm bg-primary-500/20 text-primary-400 rounded-md hover:bg-primary-500/30 transition-colors cursor-pointer hover-lift flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
            {{ $t('common.refresh') }}
          </button>
        </div>
      </div>

      <div class="relative rounded-lg overflow-hidden border border-slate-700/50 bg-slate-900">
        <iframe
          ref="iframeRef"
          :src="iframeSrc"
          class="w-full h-[70vh] border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          allow="clipboard-write"
          @load="onIframeLoad"
        ></iframe>

        <div
          v-if="loading"
          class="absolute inset-0 bg-slate-900/80 flex items-center justify-center"
        >
          <div class="text-center">
            <div
              class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-3"
            ></div>
            <p class="text-slate-300">{{ $t('tools.transformTools.loading') }}</p>
          </div>
        </div>
      </div>

      <div class="mt-4 text-sm text-slate-400">
        <p>{{ $t('tools.transformTools.note') }}</p>
      </div>
    </div>

    <template #footer>
      <p class="text-slate-400 text-sm">
        {{ $t('tools.transformTools.footer') }}
      </p>
    </template>
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'

const iframeSrc = 'https://transform.tools/'
const iframeRef = ref<HTMLIFrameElement | null>(null)
const loading = ref(true)

const refreshIframe = () => {
  loading.value = true
  if (iframeRef.value) {
    iframeRef.value.src = iframeSrc
  }
}

const onIframeLoad = () => {
  loading.value = false
}

onMounted(() => {
  // 初始化时设置加载状态
  loading.value = true
})
</script>

<style scoped>
.glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
