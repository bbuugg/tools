<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('tools.jsonToCsv.title') }}</h1>
        <p class="text-gray-600">{{ $t('tools.jsonToCsv.description') }}</p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔄</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonToCsv.features.conversion.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonToCsv.features.conversion.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonToCsv.features.customization.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonToCsv.features.customization.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📋</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonToCsv.features.nested.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonToCsv.features.nested.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonToCsv.inputTitle') }}
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
            :placeholder="$t('tools.jsonToCsv.inputPlaceholder')"
            class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>

          <!-- Options -->
          <div class="mt-4 space-y-3">
            <h4 class="font-medium text-gray-900">{{ $t('tools.jsonToCsv.options.title') }}</h4>

            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-center">
                <input
                  v-model="options.includeHeaders"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonToCsv.options.includeHeaders') }}
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.flattenNested"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonToCsv.options.flattenNested') }}
              </label>
            </div>

            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700">
                {{ $t('tools.jsonToCsv.options.delimiter') }}:
              </label>
              <select
                v-model="options.delimiter"
                class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value=",">,</option>
                <option value=";">;</option>
                <option value="\t">{{ $t('tools.jsonToCsv.options.tab') }}</option>
                <option value="|">|</option>
              </select>
            </div>

            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700">
                {{ $t('tools.jsonToCsv.options.quoteChar') }}:
              </label>
              <select
                v-model="options.quoteChar"
                class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value='"'>"</option>
                <option value="'">'</option>
                <option value="">{{ $t('tools.jsonToCsv.options.none') }}</option>
              </select>
            </div>
          </div>

          <button
            @click="convertToCsv"
            :disabled="!inputJson.trim()"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ $t('tools.jsonToCsv.convert') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonToCsv.outputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="csvOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="csvOutput"
                @click="downloadCsv"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!csvOutput && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">📄</div>
              <p>{{ $t('tools.jsonToCsv.noResults') }}</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">{{ $t('toast.error') }}</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="csvOutput && !error" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">
                    {{ $t('tools.jsonToCsv.conversionComplete') }}
                  </p>
                  <p class="text-sm text-green-600">
                    {{
                      $t('tools.jsonToCsv.linesGenerated', { count: csvOutput.split('\n').length })
                    }}
                  </p>
                </div>
              </div>
            </div>

            <textarea
              :value="csvOutput"
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
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const inputJson = ref('')
const csvOutput = ref('')
const error = ref('')

const options = reactive({
  includeHeaders: true,
  flattenNested: true,
  delimiter: ',',
  quoteChar: '"',
})

function loadExample() {
  inputJson.value = JSON.stringify(
    [
      {
        id: 1,
        name: 'John Doe',
        contact: {
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        skills: ['JavaScript', 'Vue.js', 'Node.js'],
        active: true,
      },
      {
        id: 2,
        name: 'Jane Smith',
        contact: {
          email: 'jane@example.com',
          phone: '098-765-4321',
        },
        skills: ['Python', 'Django', 'React'],
        active: false,
      },
    ],
    null,
    2,
  )
}

function clearInput() {
  inputJson.value = ''
  csvOutput.value = ''
  error.value = ''
}

function flattenObject(obj: any, prefix = ''): any {
  const flattened: any = {}

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (Array.isArray(obj[key])) {
        flattened[newKey] = obj[key].join('; ')
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (options.flattenNested) {
          Object.assign(flattened, flattenObject(obj[key], newKey))
        } else {
          flattened[newKey] = JSON.stringify(obj[key])
        }
      } else {
        flattened[newKey] = obj[key]
      }
    }
  }

  return flattened
}

function escapeValue(value: any): string {
  let str = String(value || '')

  if (
    options.quoteChar &&
    (str.includes(options.delimiter) ||
      str.includes('\n') ||
      str.includes('\r') ||
      str.includes(options.quoteChar))
  ) {
    // Escape quotes by doubling them
    str = str.replace(new RegExp(options.quoteChar, 'g'), options.quoteChar + options.quoteChar)
    str = options.quoteChar + str + options.quoteChar
  }

  return str
}

function convertToCsv() {
  try {
    error.value = ''
    csvOutput.value = ''

    if (!inputJson.value.trim()) {
      throw new Error(t('tools.jsonToCsv.errors.emptyInput'))
    }

    let data
    try {
      data = JSON.parse(inputJson.value)
    } catch (e) {
      throw new Error(t('tools.jsonToCsv.errors.invalidJson'))
    }

    if (!Array.isArray(data)) {
      throw new Error(t('tools.jsonToCsv.errors.notArray'))
    }

    if (data.length === 0) {
      throw new Error(t('tools.jsonToCsv.errors.emptyArray'))
    }

    // Flatten objects if needed
    const flattenedData = data.map((item) => flattenObject(item))

    // Get all unique headers
    const allHeaders = new Set<string>()
    flattenedData.forEach((item) => {
      Object.keys(item).forEach((key) => allHeaders.add(key))
    })

    const headers = Array.from(allHeaders)

    let csv = ''

    // Add headers if enabled
    if (options.includeHeaders) {
      csv += headers.map((header) => escapeValue(header)).join(options.delimiter) + '\n'
    }

    // Add data rows
    flattenedData.forEach((item) => {
      const row = headers.map((header) => escapeValue(item[header] || ''))
      csv += row.join(options.delimiter) + '\n'
    })

    csvOutput.value = csv.trim()
    success(t('tools.jsonToCsv.success.conversionComplete'))
  } catch (err: any) {
    error.value = err.message || t('tools.jsonToCsv.errors.conversionFailed')
    showError(error.value)
  }
}

function copyToClipboard() {
  if (!csvOutput.value) return

  navigator.clipboard
    .writeText(csvOutput.value)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function downloadCsv() {
  if (!csvOutput.value) return

  const blob = new Blob([csvOutput.value], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `converted_data_${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
