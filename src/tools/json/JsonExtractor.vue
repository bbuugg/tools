<template>
  <div class="h-full bg-dark-950 text-slate-100 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-100 mb-2">{{ $t('tools.jsonExtractor.title') }}</h1>
        <p class="text-slate-400">
          {{ $t('tools.jsonExtractor.description') }}
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg hover-lift transition-all duration-200">
          <div class="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200">🎯</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">{{ $t('tools.jsonExtractor.features.fieldExtraction.title') }}</h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.jsonExtractor.features.fieldExtraction.description') }}
          </p>
        </div>
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg hover-lift transition-all duration-200">
          <div class="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200">🔍</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">{{ $t('tools.jsonExtractor.features.smartFiltering.title') }}</h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.jsonExtractor.features.smartFiltering.description') }}
          </p>
        </div>
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg hover-lift transition-all duration-200">
          <div class="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200">⚙️</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">{{ $t('tools.jsonExtractor.features.exportOptions.title') }}</h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.jsonExtractor.features.exportOptions.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">{{ $t('tools.jsonExtractor.inputTitle') }}</h3>
            <div class="flex space-x-2">
              <button
                @click="loadExample"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 hover-lift"
              >
                {{ $t('common.loadExample') }}
              </button>
              <button
                @click="clearInput"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 hover-lift"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>

          <textarea
            v-model="inputJson"
            :placeholder="$t('tools.jsonExtractor.inputPlaceholder')"
            class="w-full h-48 p-4 border border-slate-700/30 rounded-xl font-mono text-sm resize-none bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            @input="analyzeFields"
          ></textarea>

          <!-- Available Fields -->
          <div v-if="availableFields.length > 0" class="mt-4">
            <h4 class="font-medium text-slate-100 mb-3">{{ $t('tools.jsonExtractor.availableFields') }}</h4>
            <div class="max-h-40 overflow-y-auto border border-slate-700/30 rounded-xl p-3 bg-slate-800/30">
              <div class="grid grid-cols-2 gap-2">
                <label
                  v-for="field in availableFields"
                  :key="field"
                  class="flex items-center text-sm text-slate-300 hover:text-slate-100 transition-colors duration-200"
                >
                  <input
                    v-model="selectedFields"
                    :value="field"
                    type="checkbox"
                    class="mr-2 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                  />
                  {{ field }}
                </label>
              </div>
            </div>
            <div class="flex justify-between mt-2">
              <button @click="selectAllFields" class="text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200">
                {{ $t('common.selectAll') }}
              </button>
              <button @click="clearSelection" class="text-sm text-slate-400 hover:text-slate-300 transition-colors duration-200">
                {{ $t('common.clearSelection') }}
              </button>
            </div>
          </div>

          <!-- Options -->
          <div class="mt-4 space-y-3">
            <h4 class="font-medium text-slate-100">{{ $t('common.options') }}</h4>

            <div class="grid grid-cols-1 gap-3">
              <label class="flex items-center text-slate-300 hover:text-slate-100 transition-colors duration-200">
                <input
                  v-model="options.preserveStructure"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                />
                {{ $t('tools.jsonExtractor.options.preserveStructure') }}
              </label>

              <label class="flex items-center text-slate-300 hover:text-slate-100 transition-colors duration-200">
                <input
                  v-model="options.removeEmpty"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                />
                {{ $t('tools.jsonExtractor.options.removeEmpty') }}
              </label>

              <label class="flex items-center text-slate-300 hover:text-slate-100 transition-colors duration-200">
                <input
                  v-model="options.flattenNested"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                />
                {{ $t('tools.jsonExtractor.options.flattenNested') }}
              </label>
            </div>
          </div>

          <button
            @click="extractFields"
            :disabled="!inputJson.trim() || selectedFields.length === 0"
            class="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 font-medium hover-lift"
          >
            {{ $t('common.extract') }} {{ $t('common.fields') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">{{ $t('tools.jsonExtractor.extractedData') }}</h3>
            <div class="flex space-x-2">
              <button
                v-if="extractedData"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-all duration-200 hover-lift"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="extractedData"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-success-500/20 text-success-400 rounded-lg hover:bg-success-500/30 transition-all duration-200 hover-lift"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!extractedData && !error"
            class="h-80 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/30 rounded-xl"
          >
            <div class="text-center">
              <div class="text-3xl mb-2 animate-bounce-subtle">🎯</div>
              <p>{{ $t('tools.jsonExtractor.noResults') }}</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-400">
              <div class="text-3xl mb-2 animate-bounce-subtle">❌</div>
              <p class="font-medium">{{ $t('toast.error') }}</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="extractedData && !error" class="space-y-4">
            <div class="bg-success-500/10 border border-success-500/30 rounded-xl p-4">
              <div class="flex items-center">
                <div class="text-success-400 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-success-400">{{ $t('toast.success') }}</p>
                  <p class="text-sm text-success-500/80">
                    {{ extractionStats }}
                  </p>
                </div>
              </div>
            </div>

            <textarea
              :value="extractedData"
              readonly
              class="w-full h-64 p-4 border border-slate-700/30 rounded-xl font-mono text-sm resize-none bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
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
      error.value = t('tools.jsonExtractor.errors.invalidFormat')
      return
    }

    if (data.length === 0) {
      error.value = t('tools.jsonExtractor.errors.emptyArray')
      return
    }

    const allKeys = new Set<string>()
    data.forEach((item) => {
      getAllKeys(item).forEach((key) => allKeys.add(key))
    })

    availableFields.value = Array.from(allKeys).sort()
  } catch (err: any) {
    error.value = t('tools.jsonExtractor.errors.invalidJson') + ' ' + err.message
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
      throw new Error(t('tools.jsonExtractor.errors.invalidFormat'))
    }

    if (selectedFields.value.length === 0) {
      throw new Error(t('tools.jsonExtractor.errors.noFields'))
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

    success(t('toast.success') + '!')
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