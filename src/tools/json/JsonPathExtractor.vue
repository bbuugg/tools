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
            @click="activeTab = 'path'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="{
              'border-primary-500 text-primary-400': activeTab === 'path',
              'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500':
                activeTab !== 'path',
            }"
          >
            {{ $t('tools.jsonPathExtractor.tabs.path') }}
          </button>
          <button
            @click="activeTab = 'extractor'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="{
              'border-primary-500 text-primary-400': activeTab === 'extractor',
              'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500':
                activeTab !== 'extractor',
            }"
          >
            {{ $t('tools.jsonPathExtractor.tabs.extractor') }}
          </button>
          <button
            @click="activeTab = 'formatter'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="{
              'border-primary-500 text-primary-400': activeTab === 'formatter',
              'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500':
                activeTab !== 'formatter',
            }"
          >
            {{ $t('tools.jsonPathExtractor.tabs.formatter') }}
          </button>
          <button
            @click="activeTab = 'excelTojson'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="{
              'border-primary-500 text-primary-400': activeTab === 'excelTojson',
              'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500':
                activeTab !== 'excelTojson',
            }"
          >
            {{ $t('tools.jsonPathExtractor.tabs.excelTojson') }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Path Extractor Tab Content -->
    <div v-show="activeTab === 'path'">
      <PathExtractor />
    </div>

    <!-- Field Extractor Tab Content -->
    <div v-show="activeTab === 'extractor'">
      <JsonExtractor />
    </div>

    <!-- Formatter Tab Content -->
    <div v-show="activeTab === 'formatter'">
      <JsonFormatter />
    </div>

    <!-- Formatter Tab Content -->
    <div v-show="activeTab === 'excelTojson'">
      <ExcelToJson />
    </div>
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ToolLayout from '../../components/ToolLayout.vue'
import JsonExtractor from './components/JsonExtractor.vue'
import JsonFormatter from './components/JsonFormatter.vue'
import PathExtractor from './components/PathExtractor.vue'
import ExcelToJson from './components/ExcelToJson.vue'

const { t } = useI18n()

// Tab management
const activeTab = ref<'path' | 'extractor' | 'formatter' | 'excelTojson'>('path')
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
