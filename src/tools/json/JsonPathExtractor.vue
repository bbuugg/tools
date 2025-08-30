<template>
  <ToolLayout
    :title="$t('tools.jsonPathExtractor.title')"
    :description="$t('tools.jsonPathExtractor.description')"
    icon="🎯"
    :features="[
      $t('tools.jsonPathExtractor.features.pathExtraction.title'),
      $t('tools.jsonPathExtractor.features.filtering.title'),
      $t('tools.jsonPathExtractor.features.export.title'),
    ]"
  >
    <!-- Tab Navigation -->
    <div class="flex justify-center mb-6">
      <div class="inline-flex rounded-md shadow-sm" role="group">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="[
            activeTab === tab.id
              ? 'text-white bg-primary-600'
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-slate-600',
            index === 0 ? 'rounded-l-lg' : '',
            index === tabs.length - 1 ? 'rounded-r-lg' : '',
            index !== 0 ? 'border-l border-slate-700' : '',
          ]"
        >
          {{ $t(tab.label) }}
        </button>
      </div>
    </div>

    <!-- Dynamic Tab Content -->
    <component :is="getCurrentTabComponent()" />
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ToolLayout from '../../components/ToolLayout.vue'
import PathExtractor from './components/PathExtractor.vue'
import JsonFormatter from './components/JsonFormatter.vue'
import JsonMerge from './components/JsonMerge.vue'
import JsonToExcel from './components/JsonToExcel.vue'
import UnifiedExcelToJson from './components/UnifiedExcelToJson.vue'

type TabId = 'path' | 'formatter' | 'unifiedExcelToJson' | 'jsonMerge' | 'jsonToExcel'

// Tab management
const activeTab = ref<TabId>('path')

// Tab configuration object (removed separate Excel tabs, added unified one)
const tabs = reactive([
  {
    id: 'path' as TabId,
    label: 'tools.jsonPathExtractor.tabs.path',
    component: PathExtractor,
  },
  {
    id: 'formatter' as TabId,
    label: 'tools.jsonPathExtractor.tabs.formatter',
    component: JsonFormatter,
  },
  {
    id: 'unifiedExcelToJson' as TabId,
    label: 'tools.jsonPathExtractor.tabs.unifiedExcelToJson',
    component: UnifiedExcelToJson,
  },
  {
    id: 'jsonMerge' as TabId,
    label: 'tools.jsonPathExtractor.tabs.jsonMerge',
    component: JsonMerge,
  },
  {
    id: 'jsonToExcel' as TabId,
    label: 'tools.jsonPathExtractor.tabs.jsonToExcel',
    component: JsonToExcel,
  },
])

// Function to get current tab component
function getCurrentTabComponent() {
  const currentTab = tabs.find((tab) => tab.id === activeTab.value)
  return currentTab ? currentTab.component : PathExtractor
}
</script>

<style scoped>
.glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.hover-lift {
  transition: all 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
