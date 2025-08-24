<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('tools.jsonKeysExtractor.title') }}
        </h1>
        <p class="text-gray-600">{{ $t('tools.jsonKeysExtractor.description') }}</p>
      </div>

      <!-- Toggle Switch -->
      <div class="flex justify-center mb-6">
        <div class="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            @click="extractionMode = 'keys'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-l-lg',
              extractionMode === 'keys'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100',
            ]"
          >
            {{ $t('tools.jsonKeysExtractor.modeToggle.keys') }}
          </button>
          <button
            type="button"
            @click="extractionMode = 'values'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-r-lg border-l border-gray-200',
              extractionMode === 'values'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100',
            ]"
          >
            {{ $t('tools.jsonKeysExtractor.modeToggle.values') }}
          </button>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔑</div>
          <h3 class="text-lg font-semibold mb-2">
            {{
              extractionMode === 'keys'
                ? $t('tools.jsonKeysExtractor.features.keyDiscovery.title')
                : $t('tools.jsonKeysExtractor.features.valueExtraction.title')
            }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{
              extractionMode === 'keys'
                ? $t('tools.jsonKeysExtractor.features.keyDiscovery.description')
                : $t('tools.jsonKeysExtractor.features.valueExtraction.description')
            }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">{{ extractionMode === 'keys' ? '🌳' : '💎' }}</div>
          <h3 class="text-lg font-semibold mb-2">
            {{
              extractionMode === 'keys'
                ? $t('tools.jsonKeysExtractor.features.nestedSupport.title')
                : $t('tools.jsonKeysExtractor.features.valueTypes.title')
            }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{
              extractionMode === 'keys'
                ? $t('tools.jsonKeysExtractor.features.nestedSupport.description')
                : $t('tools.jsonKeysExtractor.features.valueTypes.description')
            }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📋</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonKeysExtractor.features.exportOptions.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonKeysExtractor.features.exportOptions.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonKeysExtractor.inputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                @click="loadExample"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {{ $t('common.loadExample') }}
              </button>
              <button
                @click="clearInput"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>

          <textarea
            v-model="inputJson"
            :placeholder="$t('tools.jsonKeysExtractor.inputPlaceholder')"
            class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="extractData"
          ></textarea>

          <!-- Options -->
          <div class="mt-4 space-y-3">
            <h4 class="font-medium text-gray-900">
              {{ $t('tools.jsonKeysExtractor.extractionOptions') }}
            </h4>

            <div class="grid grid-cols-1 gap-3">
              <label v-if="extractionMode === 'keys'" class="flex items-center">
                <input
                  v-model="options.includeNested"
                  @change="extractData"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonKeysExtractor.includeNested') }}
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.sortKeys"
                  @change="extractData"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonKeysExtractor.sortResults') }}
              </label>

              <label v-if="extractionMode === 'keys'" class="flex items-center">
                <input
                  v-model="options.includeArrayIndices"
                  @change="extractData"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonKeysExtractor.includeArrayIndices') }}
              </label>
            </div>

            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700"
                >{{ $t('tools.jsonKeysExtractor.outputFormat') }}:</label
              >
              <select
                v-model="options.outputFormat"
                @change="extractData"
                class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="array">
                  {{ $t('tools.jsonKeysExtractor.formatOptions.array') }}
                </option>
                <option value="list">{{ $t('tools.jsonKeysExtractor.formatOptions.list') }}</option>
                <option v-if="extractionMode === 'keys'" value="tree">
                  {{ $t('tools.jsonKeysExtractor.formatOptions.tree') }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{
                extractionMode === 'keys'
                  ? $t('tools.jsonKeysExtractor.extractedKeys')
                  : $t('tools.jsonKeysExtractor.extractedValues')
              }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="extractedData"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="extractedData"
                @click="downloadData"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!extractedData && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">{{ extractionMode === 'keys' ? '🔑' : '💎' }}</div>
              <p>
                {{ $t('tools.jsonKeysExtractor.noResults') }}
              </p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">{{ $t('toast.error') }}</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="extractedData && !error" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">
                    {{
                      extractionMode === 'keys'
                        ? $t('tools.jsonKeysExtractor.extractedKeys')
                        : $t('tools.jsonKeysExtractor.extractedValues')
                    }}
                  </p>
                  <p class="text-sm text-green-600">{{ dataStats }}</p>
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
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const inputJson = ref('')
const extractedData = ref('')
const error = ref('')
const dataStats = ref('')
const extractionMode = ref<'keys' | 'values'>('keys')

const options = reactive({
  includeNested: true,
  sortKeys: true,
  includeArrayIndices: false,
  outputFormat: 'array',
})

// Watch for mode changes and re-extract data
watch(extractionMode, () => {
  extractData()
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
  extractData()
}

function clearInput() {
  inputJson.value = ''
  extractedData.value = ''
  error.value = ''
  dataStats.value = ''
}

// Function to extract all keys from JSON
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

// Function to extract all values from JSON
function getAllValues(obj: any, values: any[] = []): any[] {
  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        getAllValues(item, values)
      } else {
        values.push(item)
      }
    })
  } else if (obj !== null && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        getAllValues(obj[key], values)
      } else {
        values.push(obj[key])
      }
    })
  }

  return values
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

function extractData() {
  error.value = ''
  extractedData.value = ''
  dataStats.value = ''

  if (!inputJson.value.trim()) {
    return
  }

  try {
    const data = JSON.parse(inputJson.value)
    let output = ''
    let stats = ''

    if (extractionMode.value === 'keys') {
      // Extract keys
      const keysSet = getAllKeys(data)
      const keys = Array.from(keysSet)

      if (options.sortKeys) {
        keys.sort()
      }

      // Generate output based on format
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

      // Generate stats
      const uniqueKeys = keys.length
      const topLevelKeys = keys.filter((key) => !key.includes('.')).length
      const nestedKeys = keys.filter((key) => key.includes('.')).length
      stats = `${uniqueKeys} total keys (${topLevelKeys} top-level, ${nestedKeys} nested)`
    } else {
      // Extract values
      const valuesArray = getAllValues(data)
      const uniqueValues = [...new Set(valuesArray)] // Remove duplicates

      if (options.sortKeys) {
        uniqueValues.sort()
      }

      // Generate output based on format
      switch (options.outputFormat) {
        case 'array':
          output = JSON.stringify(uniqueValues, null, 2)
          break
        case 'list':
          output = uniqueValues.join('\n')
          break
        case 'tree':
          // Tree format only available for keys, fallback to array
          output = JSON.stringify(uniqueValues, null, 2)
          break
      }

      // Generate stats
      const totalValues = valuesArray.length
      const uniqueCount = uniqueValues.length
      stats = `${totalValues} total values (${uniqueCount} unique)`
    }

    extractedData.value = output
    dataStats.value = stats
  } catch (err: any) {
    error.value = t('tools.jsonKeysExtractor.errors.invalidJson') + ' ' + err.message
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

function downloadData() {
  if (!extractedData.value) return

  const extension = options.outputFormat === 'list' ? 'txt' : 'json'
  const mimeType = options.outputFormat === 'list' ? 'text/plain' : 'application/json'

  const blob = new Blob([extractedData.value], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `extracted_${extractionMode.value}_${Date.now()}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
