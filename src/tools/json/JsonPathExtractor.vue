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
    <div class="mb-6">
      <div class="border-b border-slate-700/30">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="{
              'border-primary-500 text-primary-400': activeTab === tab.id,
              'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500':
                activeTab !== tab.id,
            }"
          >
            {{ $t(tab.label) }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Dynamic Tab Content -->
    <component :is="getCurrentTabComponent()" />
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ToolLayout from '../../components/ToolLayout.vue'
import JsonExtractor from './components/JsonExtractor.vue'
import JsonFormatter from './components/JsonFormatter.vue'
import PathExtractor from './components/PathExtractor.vue'
import ExcelToJson from './components/ExcelToJson.vue'

const { t } = useI18n()

// Tab management
const activeTab = ref<'path' | 'extractor' | 'formatter' | 'excelTojson'>('path')

// Tab configuration object
const tabs = reactive([
  {
    id: 'path',
    label: 'tools.jsonPathExtractor.tabs.path',
    component: PathExtractor,
  },
  {
    id: 'extractor',
    label: 'tools.jsonPathExtractor.tabs.extractor',
    component: JsonExtractor,
  },
  {
    id: 'formatter',
    label: 'tools.jsonPathExtractor.tabs.formatter',
    component: JsonFormatter,
  },
  {
    id: 'excelTojson',
    label: 'tools.jsonPathExtractor.tabs.excelTojson',
    component: ExcelToJson,
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
