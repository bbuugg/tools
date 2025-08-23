<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">JSON Field Extractor</h1>
        <p class="text-gray-600">
          Extract specific fields from JSON array data with flexible selection options
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🎯</div>
          <h3 class="text-lg font-semibold mb-2">Selective Extraction</h3>
          <p class="text-gray-600 text-sm">
            Choose specific fields to extract from complex JSON structures
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔍</div>
          <h3 class="text-lg font-semibold mb-2">Auto Discovery</h3>
          <p class="text-gray-600 text-sm">
            Automatically discover and list all available fields in your JSON data
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">Flexible Options</h3>
          <p class="text-gray-600 text-sm">
            Preserve structure, handle nested objects, and remove empty values
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Input JSON Array</h3>
            <div class="flex space-x-2">
              <button
                @click="loadExample"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Load Example
              </button>
              <button
                @click="clearInput"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            v-model="inputJson"
            placeholder="Paste your JSON array here..."
            class="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="analyzeFields"
          ></textarea>

          <!-- Available Fields -->
          <div v-if="availableFields.length > 0" class="mt-4">
            <h4 class="font-medium text-gray-900 mb-3">Available Fields</h4>
            <div class="max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
              <div class="grid grid-cols-2 gap-2">
                <label
                  v-for="field in availableFields"
                  :key="field"
                  class="flex items-center text-sm"
                >
                  <input
                    v-model="selectedFields"
                    :value="field"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {{ field }}
                </label>
              </div>
            </div>
            <div class="flex justify-between mt-2">
              <button @click="selectAllFields" class="text-sm text-blue-600 hover:text-blue-800">
                Select All
              </button>
              <button @click="clearSelection" class="text-sm text-gray-600 hover:text-gray-800">
                Clear Selection
              </button>
            </div>
          </div>

          <!-- Options -->
          <div class="mt-4 space-y-3">
            <h4 class="font-medium text-gray-900">Extraction Options</h4>

            <div class="grid grid-cols-1 gap-3">
              <label class="flex items-center">
                <input
                  v-model="options.preserveStructure"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Preserve Object Structure
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.removeEmpty"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remove Empty Values
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.flattenNested"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Flatten Nested Objects
              </label>
            </div>
          </div>

          <button
            @click="extractFields"
            :disabled="!inputJson.trim() || selectedFields.length === 0"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Extract Fields
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Extracted Data</h3>
            <div class="flex space-x-2">
              <button
                v-if="extractedData"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Copy
              </button>
              <button
                v-if="extractedData"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          <div
            v-if="!extractedData && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">🎯</div>
              <p>No extraction results yet. Select fields and click extract.</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">Error</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="extractedData && !error" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">Extraction Complete</p>
                  <p class="text-sm text-green-600">
                    {{ extractionStats }}
                  </p>
                </div>
              </div>
            </div>

            <textarea
              :value="extractedData"
              readonly
              class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useToast } from '@/composables/useToast'

const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const inputJson = ref('')
const extractedData = ref('')
const error = ref('')
const availableFields = ref<string[]>([])
const selectedFields = ref<string[]>([])
const extractionStats = ref('')

const options = reactive({
  preserveStructure: true,
  removeEmpty: false,
  flattenNested: false,
})

function loadExample() {
  inputJson.value = JSON.stringify(
    [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        department: 'Engineering',
        salary: 75000,
        address: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
        },
        skills: ['JavaScript', 'Vue.js', 'Node.js'],
        active: true,
        joinDate: '2023-01-15',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 28,
        department: 'Marketing',
        salary: 65000,
        address: {
          street: '456 Oak Ave',
          city: 'San Francisco',
          zipCode: '94102',
        },
        skills: ['Marketing', 'Analytics', 'Social Media'],
        active: false,
        joinDate: '2023-03-20',
      },
    ],
    null,
    2,
  )
  analyzeFields()
}

function clearInput() {
  inputJson.value = ''
  extractedData.value = ''
  error.value = ''
  availableFields.value = []
  selectedFields.value = []
  extractionStats.value = ''
}

function getAllKeys(obj: any, prefix = ''): Set<string> {
  const keys = new Set<string>()

  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      getAllKeys(item, prefix).forEach((key) => keys.add(key))
    })
  } else if (obj !== null && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.add(fullKey)

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        getAllKeys(obj[key], fullKey).forEach((nestedKey) => keys.add(nestedKey))
      }
    })
  }

  return keys
}

function analyzeFields() {
  error.value = ''
  availableFields.value = []
  selectedFields.value = []

  if (!inputJson.value.trim()) {
    return
  }

  try {
    const data = JSON.parse(inputJson.value)

    if (!Array.isArray(data)) {
      error.value = 'Input must be a JSON array'
      return
    }

    if (data.length === 0) {
      error.value = 'JSON array cannot be empty'
      return
    }

    const allKeys = new Set<string>()
    data.forEach((item) => {
      getAllKeys(item).forEach((key) => allKeys.add(key))
    })

    availableFields.value = Array.from(allKeys).sort()
  } catch (err: any) {
    error.value = 'Invalid JSON format: ' + err.message
  }
}

function selectAllFields() {
  selectedFields.value = [...availableFields.value]
}

function clearSelection() {
  selectedFields.value = []
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

function extractFields() {
  try {
    error.value = ''
    extractedData.value = ''

    if (!inputJson.value.trim()) {
      throw new Error('Please provide JSON data to extract from')
    }

    if (selectedFields.value.length === 0) {
      throw new Error('Please select at least one field to extract')
    }

    const data = JSON.parse(inputJson.value)

    const result = data.map((item: any) => {
      if (options.preserveStructure) {
        const extracted: any = {}

        selectedFields.value.forEach((field) => {
          const value = getNestedValue(item, field)

          if (options.removeEmpty && (value === null || value === undefined || value === '')) {
            return
          }

          if (options.flattenNested) {
            extracted[field] = value
          } else {
            // Rebuild nested structure
            const keys = field.split('.')
            let current = extracted

            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) {
                current[keys[i]] = {}
              }
              current = current[keys[i]]
            }

            current[keys[keys.length - 1]] = value
          }
        })

        return extracted
      } else {
        // Return array of values
        return selectedFields.value.map((field) => getNestedValue(item, field))
      }
    })

    extractedData.value = JSON.stringify(result, null, 2)

    // Generate extraction stats
    const originalFields = availableFields.value.length
    const extractedFields = selectedFields.value.length
    const totalRecords = data.length

    extractionStats.value = `${extractedFields} of ${originalFields} fields extracted from ${totalRecords} records`

    success('Fields extracted successfully!')
  } catch (err: any) {
    error.value = err.message || 'Failed to extract fields'
    showError(error.value)
  }
}

function copyToClipboard() {
  if (!extractedData.value) return

  navigator.clipboard
    .writeText(extractedData.value)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function downloadJson() {
  if (!extractedData.value) return

  const blob = new Blob([extractedData.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `extracted_fields_${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
