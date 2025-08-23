<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ $t('tools.jsonExtractor.title') }}</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('tools.jsonExtractor.description') }}
        </p>
      </div>

      <!-- Input Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          Input JSON Array
        </h2>
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">
            📋 Please paste JSON data in the format:
            <code class="bg-gray-100 px-1 rounded">[{},{},...]</code>
          </p>
          <p class="text-sm text-gray-500">
            The tool will automatically parse the JSON and list all available fields for selection.
          </p>
        </div>
        <textarea
          v-model="jsonInput"
          @input="parseJson"
          :placeholder="$t('tools.jsonExtractor.inputPlaceholder')"
          class="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
        ></textarea>
        <div v-if="parseError" class="mt-2 text-red-600 text-sm">⚠️ {{ parseError }}</div>
      </div>

      <!-- Field Selection -->
      <div v-if="availableFields.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.jsonExtractor.availableFields') }}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          <label
            v-for="field in availableFields"
            :key="field"
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              :value="field"
              v-model="selectedFields"
              @change="extractFields"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700">{{ field }}</span>
          </label>
        </div>
        <div class="flex gap-3">
          <button
            @click="selectAllFields"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {{ $t('common.selectAll') }}
          </button>
          <button
            @click="clearSelection"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            {{ $t('common.clearSelection') }}
          </button>
        </div>
      </div>

      <!-- Options -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('common.options') }}
        </h3>
        <div class="flex flex-wrap items-center gap-6">
          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              v-model="options.preserveStructure"
              @change="extractFields"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700">🏗️ Preserve Object Structure</span>
          </label>
          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              v-model="options.removeEmpty"
              @change="extractFields"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700"
              >🧹 {{ $t('tools.jsonExtractor.options.removeEmpty') }}</span
            >
          </label>
          <div class="flex gap-3 ml-auto">
            <button
              @click="copyResults"
              :disabled="extractedData.length === 0"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('common.copy') }} {{ $t('common.results') }}
            </button>
            <button
              @click="downloadResults"
              :disabled="extractedData.length === 0"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('common.download') }} JSON
            </button>
            <button
              @click="loadExample"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              {{ $t('common.loadExample') }}
            </button>
            <button
              @click="clearContent"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.jsonExtractor.extractionResults') }}
        </h2>
        <div class="mb-3 px-3 py-2 bg-blue-50 rounded-md border-l-4 border-blue-400">
          <span class="text-blue-800 font-medium text-sm">
            {{ extractedData.length }} {{ $t('common.items') }} {{ $t('common.extracted') }}
            {{ $t('common.with') }} {{ selectedFields.length }} {{ $t('common.fields') }}
          </span>
        </div>

        <div v-if="extractedData.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-lg mb-2">📊</div>
          <p class="text-gray-500">
            No extraction results yet. Please input JSON array data and select fields to extract.
          </p>
        </div>

        <div v-else class="space-y-4">
          <!-- Results Preview -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <h3 class="bg-gray-800 text-white px-3 py-2 font-medium flex items-center text-sm">
              <span class="mr-2">📊</span>
              EXTRACTED DATA ({{ extractedData.length }} items)
            </h3>
            <div class="p-4">
              <pre
                class="bg-gray-50 p-3 rounded border text-sm overflow-x-auto max-h-96 overflow-y-auto"
                >{{ JSON.stringify(extractedData, null, 2) }}</pre
              >
            </div>
          </div>

          <!-- Field Statistics -->
          <div
            v-if="fieldStats.length > 0"
            class="border border-gray-200 rounded-lg overflow-hidden"
          >
            <h3 class="bg-gray-800 text-white px-3 py-2 font-medium flex items-center text-sm">
              <span class="mr-2">📈</span>
              FIELD STATISTICS
            </h3>
            <div class="divide-y divide-gray-200">
              <div v-for="stat in fieldStats" :key="stat.field" class="px-3 py-2 hover:bg-gray-50">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-sm">{{ stat.field }}</span>
                  <div class="flex gap-4 text-xs text-gray-600">
                    <span>Total: {{ stat.total }}</span>
                    <span>Non-empty: {{ stat.nonEmpty }}</span>
                    <span>Unique: {{ stat.unique }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Descriptions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">📊 Field Extraction</h3>
          <p class="text-gray-600 text-sm">
            Automatically parse JSON array and extract selected fields. Supports nested objects and
            preserves data types for accurate extraction.
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">🎯 Smart Filtering</h3>
          <p class="text-gray-600 text-sm">
            Choose specific fields to include in the output. Option to remove empty values and
            preserve original object structure for clean results.
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">💾 Export Options</h3>
          <p class="text-gray-600 text-sm">
            Copy extracted data to clipboard or download as JSON file. Includes field statistics and
            data analysis for better understanding of your dataset.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

interface ExtractionOptions {
  preserveStructure: boolean
  removeEmpty: boolean
}

interface FieldStat {
  field: string
  total: number
  nonEmpty: number
  unique: number
}

const { t } = useI18n()
const { copySuccess, copyError, downloadSuccess } = useToast()

const jsonInput = ref('')
const parseError = ref('')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const originalData = ref<any[]>([])
const availableFields = ref<string[]>([])
const selectedFields = ref<string[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractedData = ref<any[]>([])
const options = ref<ExtractionOptions>({
  preserveStructure: true,
  removeEmpty: false,
})

// Parse JSON input and extract available fields
function parseJson() {
  parseError.value = ''
  availableFields.value = []
  selectedFields.value = []
  originalData.value = []
  extractedData.value = []

  if (!jsonInput.value.trim()) {
    return
  }

  try {
    const parsed = JSON.parse(jsonInput.value)

    if (!Array.isArray(parsed)) {
      parseError.value = t('tools.jsonExtractor.errors.invalidFormat')
      return
    }

    if (parsed.length === 0) {
      parseError.value = t('tools.jsonExtractor.errors.emptyArray')
      return
    }

    originalData.value = parsed

    // Extract all available fields from all objects
    const fieldSet = new Set<string>()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function extractFieldsFromObject(obj: any, prefix = '') {
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        Object.keys(obj).forEach((key) => {
          const fieldName = prefix ? `${prefix}.${key}` : key
          fieldSet.add(fieldName)

          // Recursively extract nested fields (limit depth to avoid infinite recursion)
          if (prefix.split('.').length < 3) {
            extractFieldsFromObject(obj[key], fieldName)
          }
        })
      }
    }

    parsed.forEach((item) => {
      extractFieldsFromObject(item)
    })

    availableFields.value = Array.from(fieldSet).sort()

    if (availableFields.value.length === 0) {
      parseError.value = t('tools.jsonExtractor.errors.noFields')
    }
  } catch (error) {
    parseError.value = `${t('tools.jsonExtractor.errors.invalidJson')} ${(error as Error).message}`
  }
}

// Extract selected fields from the data
function extractFields() {
  if (originalData.value.length === 0 || selectedFields.value.length === 0) {
    extractedData.value = []
    return
  }

  extractedData.value = originalData.value
    .map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extracted: any = {}

      selectedFields.value.forEach((field) => {
        const value = getNestedValue(item, field)

        if (!options.value.removeEmpty || (value !== null && value !== undefined && value !== '')) {
          if (options.value.preserveStructure) {
            setNestedValue(extracted, field, value)
          } else {
            extracted[field] = value
          }
        }
      })

      return extracted
    })
    .filter((item) => Object.keys(item).length > 0) // Remove completely empty objects
}

// Helper function to get nested value from object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined
  }, obj)
}

// Helper function to set nested value in object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!

  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    return current[key]
  }, obj)

  target[lastKey] = value
}

// Select all available fields
function selectAllFields() {
  selectedFields.value = [...availableFields.value]
  extractFields()
}

// Clear field selection
function clearSelection() {
  selectedFields.value = []
  extractFields()
}

// Computed field statistics
const fieldStats = computed((): FieldStat[] => {
  if (originalData.value.length === 0 || selectedFields.value.length === 0) {
    return []
  }

  return selectedFields.value.map((field) => {
    const values = originalData.value.map((item) => getNestedValue(item, field))
    const nonEmptyValues = values.filter((v) => v !== null && v !== undefined && v !== '')
    const uniqueValues = new Set(nonEmptyValues)

    return {
      field,
      total: originalData.value.length,
      nonEmpty: nonEmptyValues.length,
      unique: uniqueValues.size,
    }
  })
})

// Load example data
function loadExample() {
  jsonInput.value = `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "age": 30,
    "department": "Engineering",
    "salary": 75000,
    "address": {
      "city": "New York",
      "country": "USA"
    },
    "skills": ["JavaScript", "Python", "React"]
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "age": 28,
    "department": "Marketing",
    "salary": 65000,
    "address": {
      "city": "London",
      "country": "UK"
    },
    "skills": ["SEO", "Content Marketing", "Analytics"]
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "email": "bob.johnson@example.com",
    "age": 35,
    "department": "Engineering",
    "salary": 85000,
    "address": {
      "city": "San Francisco",
      "country": "USA"
    },
    "skills": ["Java", "Spring", "Microservices"]
  }
]`
  parseJson()
}

// Clear all content
function clearContent() {
  jsonInput.value = ''
  parseError.value = ''
  originalData.value = []
  availableFields.value = []
  selectedFields.value = []
  extractedData.value = []
}

// Copy results to clipboard
function copyResults() {
  if (extractedData.value.length === 0) return

  const text = JSON.stringify(extractedData.value, null, 2)
  navigator.clipboard
    .writeText(text)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

// Download results as JSON file
function downloadResults() {
  if (extractedData.value.length === 0) return

  const data = JSON.stringify(extractedData.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `extracted-fields-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
  downloadSuccess()
}
</script>
