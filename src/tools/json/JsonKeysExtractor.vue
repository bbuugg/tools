<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">JSON Keys Extractor</h1>
        <p class="text-gray-600">Extract all unique keys from JSON objects and arrays</p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔑</div>
          <h3 class="text-lg font-semibold mb-2">Key Discovery</h3>
          <p class="text-gray-600 text-sm">
            Automatically discover all keys from complex JSON structures
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🌳</div>
          <h3 class="text-lg font-semibold mb-2">Nested Support</h3>
          <p class="text-gray-600 text-sm">
            Handle nested objects with path notation for deep structures
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📋</div>
          <h3 class="text-lg font-semibold mb-2">Multiple Formats</h3>
          <p class="text-gray-600 text-sm">Export keys as array, list, or tree structure</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Input JSON</h3>
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
            placeholder="Paste your JSON here..."
            class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="extractKeys"
          ></textarea>

          <!-- Options -->
          <div class="mt-4 space-y-3">
            <h4 class="font-medium text-gray-900">Extraction Options</h4>

            <div class="grid grid-cols-1 gap-3">
              <label class="flex items-center">
                <input
                  v-model="options.includeNested"
                  @change="extractKeys"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Include Nested Keys (with dot notation)
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.sortKeys"
                  @change="extractKeys"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Sort Keys Alphabetically
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.includeArrayIndices"
                  @change="extractKeys"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Include Array Indices
              </label>
            </div>

            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700">Output Format:</label>
              <select
                v-model="options.outputFormat"
                @change="extractKeys"
                class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="array">JSON Array</option>
                <option value="list">Line-separated List</option>
                <option value="tree">Tree Structure</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Extracted Keys</h3>
            <div class="flex space-x-2">
              <button
                v-if="extractedKeys"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Copy
              </button>
              <button
                v-if="extractedKeys"
                @click="downloadKeys"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          <div
            v-if="!extractedKeys && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">🔑</div>
              <p>No keys extracted yet. Please input JSON to analyze.</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">Error</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="extractedKeys && !error" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">Keys Extracted</p>
                  <p class="text-sm text-green-600">{{ keyStats }}</p>
                </div>
              </div>
            </div>

            <textarea
              :value="extractedKeys"
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
const extractedKeys = ref('')
const error = ref('')
const keyStats = ref('')

const options = reactive({
  includeNested: true,
  sortKeys: true,
  includeArrayIndices: false,
  outputFormat: 'array',
})

function loadExample() {
  inputJson.value = JSON.stringify(
    {
      user: {
        id: 1,
        profile: {
          name: 'John Doe',
          contact: {
            email: 'john@example.com',
            phones: ['123-456-7890', '098-765-4321'],
          },
        },
        preferences: {
          theme: 'dark',
          notifications: {
            email: true,
            push: false,
          },
        },
        history: [
          { action: 'login', timestamp: '2023-01-01' },
          { action: 'logout', timestamp: '2023-01-02' },
        ],
      },
    },
    null,
    2,
  )
  extractKeys()
}

function clearInput() {
  inputJson.value = ''
  extractedKeys.value = ''
  error.value = ''
  keyStats.value = ''
}

function getAllKeys(obj: any, path = '', keys: Set<string> = new Set(), level = 0): Set<string> {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const arrayPath = options.includeArrayIndices ? `${path}[${index}]` : path
      if (typeof item === 'object' && item !== null) {
        getAllKeys(item, arrayPath, keys, level + 1)
      }
    })
  } else if (obj !== null && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      const fullPath = path ? `${path}.${key}` : key

      if (options.includeNested) {
        keys.add(fullPath)
      } else {
        keys.add(key)
      }

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        getAllKeys(obj[key], fullPath, keys, level + 1)
      }
    })
  }

  return keys
}

function createTreeStructure(keys: string[]): any {
  const tree: any = {}

  keys.forEach((key) => {
    const parts = key.split('.')
    let current = tree

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {}
      }
      if (current[part] !== null) {
        current = current[part]
      }
    })
  })

  return tree
}

function extractKeys() {
  error.value = ''
  extractedKeys.value = ''
  keyStats.value = ''

  if (!inputJson.value.trim()) {
    return
  }

  try {
    const data = JSON.parse(inputJson.value)
    const keysSet = getAllKeys(data)
    const keys = Array.from(keysSet)

    if (options.sortKeys) {
      keys.sort()
    }

    // Generate output based on format
    let output = ''

    switch (options.outputFormat) {
      case 'array':
        output = JSON.stringify(keys, null, 2)
        break
      case 'list':
        output = keys.join('\n')
        break
      case 'tree':
        const tree = createTreeStructure(keys)
        output = JSON.stringify(tree, null, 2)
        break
    }

    extractedKeys.value = output

    // Generate stats
    const uniqueKeys = keys.length
    const topLevelKeys = keys.filter((key) => !key.includes('.')).length
    const nestedKeys = keys.filter((key) => key.includes('.')).length

    keyStats.value = `${uniqueKeys} total keys (${topLevelKeys} top-level, ${nestedKeys} nested)`

    success('Keys extracted successfully!')
  } catch (err: any) {
    error.value = 'Invalid JSON format: ' + err.message
    showError(error.value)
  }
}

function copyToClipboard() {
  if (!extractedKeys.value) return

  navigator.clipboard
    .writeText(extractedKeys.value)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function downloadKeys() {
  if (!extractedKeys.value) return

  const extension = options.outputFormat === 'list' ? 'txt' : 'json'
  const mimeType = options.outputFormat === 'list' ? 'text/plain' : 'application/json'

  const blob = new Blob([extractedKeys.value], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `extracted_keys_${Date.now()}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
