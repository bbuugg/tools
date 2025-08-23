<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">JSON Array to Text List</h1>
        <p class="text-gray-600">Convert JSON arrays to text lists</p>
      </div>

      <div class="bg-white p-8 rounded-lg border text-center">
        <div class="text-6xl mb-4">🚧</div>
        <h3 class="text-xl font-semibold mb-2">Coming Soon</h3>
        <button
          @click="$router.go(-1)"
          class="px-6 py-2 bg-gray-600 text-white rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Tool configuration based on route name
const toolConfig: Record<string, any> = {
  'excel-text-to-json': {
    title: 'Excel Text to JSON',
    description: 'Convert Excel clipboard data directly to JSON format',
    features: [
      'Paste Excel data directly',
      'Auto-detect data types',
      'Header recognition',
      'Real-time conversion',
    ],
  },
  'json-merge': {
    title: 'JSON File Merger',
    description: 'Merge multiple JSON files into a single file',
    features: [
      'Merge multiple files',
      'Conflict resolution',
      'Deep merging',
      'Custom merge strategies',
    ],
  },
  'get-to-json': {
    title: 'GET Parameters to JSON',
    description: 'Convert URL query parameters to JSON format',
    features: [
      'URL parsing',
      'Parameter extraction',
      'Type conversion',
      'Nested parameter support',
    ],
  },
  'cookie-to-json': {
    title: 'Cookie to JSON',
    description: 'Convert cookie strings to JSON objects',
    features: [
      'Cookie string parsing',
      'Automatic decoding',
      'Expiry date handling',
      'Secure flag detection',
    ],
  },
  'list-to-json': {
    title: 'Text List to JSON',
    description: 'Convert text lists to JSON arrays',
    features: ['Line-by-line conversion', 'Custom separators', 'Auto-trimming', 'Type detection'],
  },
  'header-to-json': {
    title: 'HTTP Headers to JSON',
    description: 'Convert HTTP headers to JSON format',
    features: [
      'Header parsing',
      'Case handling',
      'Multi-value support',
      'Standard header recognition',
    ],
  },
  'json-splitter': {
    title: 'JSON File Splitter',
    description: 'Split large JSON files into smaller chunks',
    features: [
      'Size-based splitting',
      'Record-based splitting',
      'Preserve structure',
      'Custom naming',
    ],
  },
  'json-to-list': {
    title: 'JSON Array to Text List',
    description: 'Convert JSON arrays to text lists',
    features: ['Array flattening', 'Custom separators', 'Field selection', 'Formatting options'],
  },
  'json-to-get': {
    title: 'JSON to GET Parameters',
    description: 'Convert JSON objects to URL query parameters',
    features: [
      'URL encoding',
      'Nested object handling',
      'Array serialization',
      'Custom formatting',
    ],
  },
  'json-field-value-extractor': {
    title: 'JSON Field Value Extractor',
    description: 'Extract values from specific JSON fields',
    features: [
      'Path-based extraction',
      'Bulk value extraction',
      'Type filtering',
      'Duplicate removal',
    ],
  },
  'json-unicode-fixer': {
    title: 'JSON Unicode Fixer',
    description: 'Fix Unicode encoding issues in JSON',
    features: [
      'Unicode normalization',
      'Encoding detection',
      'Character replacement',
      'Validation',
    ],
  },
  'json-number-to-text': {
    title: 'JSON Number to Text',
    description: 'Convert numeric values to text in JSON',
    features: [
      'Type conversion',
      'Precision handling',
      'Formatting options',
      'Selective conversion',
    ],
  },
}

const config = computed(() => {
  const routeName = route.name as string
  return (
    toolConfig[routeName] || {
      title: 'JSON Tool',
      description: 'Advanced JSON processing tool',
      features: ['JSON processing', 'Data conversion', 'Format validation', 'Export options'],
    }
  )
})

const title = computed(() => config.value.title)
const description = computed(() => config.value.description)
const plannedFeatures = computed(() => config.value.features || [])

function goBack() {
  router.go(-1)
}

function viewAvailableTools() {
  router.push('/json-tools/json-formatter')
}
</script>
