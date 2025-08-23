<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <Header :tools="availableTools" :selectedTool="currentTool" @selectTool="selectTool" />

    <!-- Main Content -->
    <main class="flex-1">
      <component
        :is="currentToolComponent"
        :toolName="getCurrentToolName()"
        @goBack="selectTool('html-extractor')"
      />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Header from './layouts/Header.vue'
import Footer from './layouts/Footer.vue'
import HtmlExtractor from './tools/HtmlExtractor.vue'
import JsonExtractor from './tools/JsonExtractor.vue'
import ComingSoon from './tools/ComingSoon.vue'

interface Tool {
  id: string
  name: string
  icon: string
  component: string
}

const availableTools: Tool[] = [
  {
    id: 'html-extractor',
    name: 'HTML Extractor',
    icon: '🖼️',
    component: 'HtmlExtractor',
  },
  {
    id: 'json-extractor',
    name: 'JSON Extractor',
    icon: '📊',
    component: 'JsonExtractor',
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    icon: '🔗',
    component: 'ComingSoon',
  },
  {
    id: 'base64-converter',
    name: 'Base64 Converter',
    icon: '🔄',
    component: 'ComingSoon',
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    icon: '🎨',
    component: 'ComingSoon',
  },
  {
    id: 'qr-generator',
    name: 'QR Generator',
    icon: '📱',
    component: 'ComingSoon',
  },
]

const currentTool = ref('html-extractor')

const currentToolComponent = computed(() => {
  const tool = availableTools.find((t) => t.id === currentTool.value)
  if (!tool) return HtmlExtractor

  switch (tool.component) {
    case 'HtmlExtractor':
      return HtmlExtractor
    case 'JsonExtractor':
      return JsonExtractor
    case 'ComingSoon':
    default:
      return ComingSoon
  }
})

function selectTool(toolId: string) {
  currentTool.value = toolId
}

function getCurrentToolName(): string {
  const tool = availableTools.find((t) => t.id === currentTool.value)
  return tool?.name || 'Unknown Tool'
}
</script>
