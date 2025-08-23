<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('tools.csvToJson.title') }}</h1>
        <p class="text-gray-600">
          {{ $t('tools.csvToJson.description') }}
        </p>
      </div>

      <!-- Tool Introduction -->
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <h2 class="text-lg font-semibold mb-3">{{ $t('tools.csvToJson.introduction.title') }}</h2>
        <div class="text-gray-600 space-y-2">
          <p>{{ $t('tools.csvToJson.introduction.description') }}</p>
          <p>{{ $t('tools.csvToJson.introduction.usage') }}</p>
        </div>

        <!-- Example -->
        <div class="mt-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">
            {{ $t('tools.csvToJson.example.title') }}
          </h3>
          <div class="grid lg:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 mb-1">{{ $t('tools.csvToJson.example.input') }}</p>
              <pre class="bg-gray-50 p-3 rounded text-xs font-mono">
name,age,score
李华,25,89
小明,22,85</pre
              >
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">{{ $t('tools.csvToJson.example.output') }}</p>
              <pre class="bg-gray-50 p-3 rounded text-xs font-mono">
[
  {"name": "李华", "age": "25", "score": "89"},
  {"name": "小明", "age": "22", "score": "85"}
]</pre
              >
            </div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.csvToJson.input.title') }}
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

          <!-- File Upload -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.csvToJson.input.fileUpload') }}
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              @change="handleFileUpload"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <textarea
            v-model="inputCsv"
            :placeholder="$t('tools.csvToJson.input.placeholder')"
            class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="previewData"
          ></textarea>

          <!-- CSV Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">{{ $t('tools.csvToJson.options.title') }}</h4>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700"
                  >{{ $t('tools.csvToJson.options.delimiter') }}:</label
                >
                <select
                  v-model="options.delimiter"
                  @change="previewData"
                  class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value=",">{{ $t('tools.csvToJson.delimiters.comma') }}</option>
                  <option value=";">{{ $t('tools.csvToJson.delimiters.semicolon') }}</option>
                  <option value="\t">{{ $t('tools.csvToJson.delimiters.tab') }}</option>
                  <option value="|">{{ $t('tools.csvToJson.delimiters.pipe') }}</option>
                  <option value=" ">{{ $t('tools.csvToJson.delimiters.space') }}</option>
                </select>
              </div>

              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700"
                  >{{ $t('tools.csvToJson.options.outputFormat') }}:</label
                >
                <select
                  v-model="options.outputFormat"
                  class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="object">{{ $t('tools.csvToJson.formats.jsonObject') }}</option>
                  <option value="array">{{ $t('tools.csvToJson.formats.jsonArray') }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-center">
                <input
                  v-model="options.hasHeaders"
                  @change="previewData"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.csvToJson.options.hasHeaders') }}
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.skipEmptyLines"
                  @change="previewData"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.csvToJson.options.skipEmptyLines') }}
              </label>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-center">
                <input
                  v-model="options.autoDetectNumbers"
                  @change="previewData"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.csvToJson.options.autoDetectNumbers') }}
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.autoDetectBooleans"
                  @change="previewData"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.csvToJson.options.autoDetectBooleans') }}
              </label>
            </div>
          </div>

          <!-- Preview Table -->
          <div v-if="previewRows.length > 0" class="mt-4">
            <h4 class="font-medium text-gray-900 mb-2">
              {{ $t('tools.csvToJson.preview.title') }} ({{
                $t('tools.csvToJson.preview.firstRows', { count: 5 })
              }})
            </h4>
            <div class="overflow-x-auto border rounded-lg">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      v-for="(header, index) in headers"
                      :key="index"
                      class="px-3 py-2 text-left font-medium text-gray-900 border-r"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in previewRows.slice(0, 5)" :key="index" class="border-b">
                    <td v-for="(value, colIndex) in row" :key="colIndex" class="px-3 py-2 border-r">
                      {{ value }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="text-sm text-gray-600 mt-2">
              {{ $t('tools.csvToJson.preview.rowsDetected', { count: previewRows.length }) }}
            </p>
          </div>

          <button
            @click="convertToJson"
            :disabled="!inputCsv.trim() || previewRows.length === 0"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ $t('tools.csvToJson.convert') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.csvToJson.output.title') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="jsonOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="jsonOutput"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!jsonOutput"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">📄</div>
              <p>{{ $t('tools.csvToJson.output.noOutput') }}</p>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">
                    {{ $t('tools.csvToJson.output.complete') }}
                  </p>
                  <p class="text-sm text-green-600">
                    {{
                      $t('tools.csvToJson.output.recordsConverted', { count: outputRecordCount })
                    }}
                  </p>
                </div>
              </div>
            </div>

            <textarea
              :value="jsonOutput"
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
import { ref, reactive, computed } from 'vue'
import { useToast } from '@/composables/useToast'

const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const inputCsv = ref('')
const jsonOutput = ref('')
const previewRows = ref<any[][]>([])
const headers = ref<string[]>([])

const options = reactive({
  delimiter: '\t', // Default to tab as mentioned in reference website
  outputFormat: 'object', // Default to object format
  hasHeaders: true,
  skipEmptyLines: true,
  autoDetectNumbers: true,
  autoDetectBooleans: true,
})

const outputRecordCount = computed(() => {
  if (!jsonOutput.value) return 0
  try {
    const parsed = JSON.parse(jsonOutput.value)
    return Array.isArray(parsed) ? parsed.length : 1
  } catch {
    return 0
  }
})

function loadExample() {
  inputCsv.value = `name,age,score
李华,25,89
小明,22,85
张三,30,92
李四,28,78`
  previewData()
}

function clearInput() {
  inputCsv.value = ''
  jsonOutput.value = ''
  previewRows.value = []
  headers.value = []
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      inputCsv.value = content
      previewData()
    }
    reader.readAsText(file, 'UTF-8')
  }
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    const nextChar = line[i + 1]

    if ((char === '"' || char === "'") && !inQuotes) {
      // Start of quoted field
      inQuotes = true
      i++
    } else if ((char === '"' || char === "'") && inQuotes) {
      if (nextChar === char) {
        // Escaped quote
        current += char
        i += 2
      } else {
        // End of quoted field
        inQuotes = false
        i++
      }
    } else if (char === options.delimiter && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ''
      i++
    } else {
      current += char
      i++
    }
  }

  // Add the last field
  result.push(current.trim())
  return result
}

function convertValue(value: string): any {
  if (value === '') return ''

  // Auto-detect booleans
  if (options.autoDetectBooleans) {
    const lower = value.toLowerCase()
    if (lower === 'true') return true
    if (lower === 'false') return false
  }

  // Auto-detect numbers
  if (options.autoDetectNumbers) {
    const num = Number(value)
    if (!isNaN(num) && isFinite(num) && value.trim() !== '') {
      return num
    }
  }

  return value
}

function previewData() {
  if (!inputCsv.value.trim()) {
    previewRows.value = []
    headers.value = []
    return
  }

  try {
    const lines = inputCsv.value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => (options.skipEmptyLines ? line : true))

    if (lines.length === 0) {
      previewRows.value = []
      headers.value = []
      return
    }

    const parsedLines = lines.map((line) => parseCsvLine(line))

    if (options.hasHeaders && parsedLines.length > 0) {
      headers.value = parsedLines[0]
      previewRows.value = parsedLines.slice(1)
    } else {
      // Generate column headers
      const maxCols = Math.max(...parsedLines.map((row) => row.length))
      headers.value = Array.from({ length: maxCols }, (_, i) => `Column${i + 1}`)
      previewRows.value = parsedLines
    }
  } catch (error) {
    console.error('Error parsing CSV:', error)
    previewRows.value = []
    headers.value = []
  }
}

function convertToJson() {
  try {
    if (!inputCsv.value.trim() || previewRows.value.length === 0) {
      showError('Please provide valid CSV data to convert')
      return
    }

    let result: any

    if (options.outputFormat === 'object' && options.hasHeaders) {
      // Convert to JSON objects
      result = previewRows.value.map((row) => {
        const obj: any = {}
        headers.value.forEach((header, index) => {
          const value = row[index] || ''
          obj[header] = convertValue(value)
        })
        return obj
      })
    } else {
      // Convert to JSON array
      if (options.hasHeaders) {
        result = [
          headers.value,
          ...previewRows.value.map((row) => row.map((value) => convertValue(value))),
        ]
      } else {
        result = previewRows.value.map((row) => row.map((value) => convertValue(value)))
      }
    }

    jsonOutput.value = JSON.stringify(result, null, 2)
    success('CSV converted to JSON successfully!')
  } catch (error: any) {
    showError('Failed to convert CSV to JSON: ' + error.message)
  }
}

function copyToClipboard() {
  if (!jsonOutput.value) return

  navigator.clipboard
    .writeText(jsonOutput.value)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function downloadJson() {
  if (!jsonOutput.value) return

  const blob = new Blob([jsonOutput.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `csv-to-json-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
