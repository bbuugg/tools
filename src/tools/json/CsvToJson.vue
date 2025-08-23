<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">CSV to JSON Converter</h1>
        <p class="text-gray-600">
          Convert CSV data to JSON format with customizable parsing options
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔄</div>
          <h3 class="text-lg font-semibold mb-2">Smart Parsing</h3>
          <p class="text-gray-600 text-sm">
            Intelligent CSV parsing with support for various delimiters and quote styles
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">Flexible Options</h3>
          <p class="text-gray-600 text-sm">
            Configure delimiters, headers, data types, and output format
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📊</div>
          <h3 class="text-lg font-semibold mb-2">Data Preview</h3>
          <p class="text-gray-600 text-sm">
            Preview parsed data with statistics and validation before conversion
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Input CSV Data</h3>
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
            v-model="inputCsv"
            placeholder="Paste your CSV data here..."
            class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="previewData"
          ></textarea>

          <!-- CSV Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">Parsing Options</h4>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Delimiter:</label>
                <select
                  v-model="options.delimiter"
                  @change="previewData"
                  class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value=",">,</option>
                  <option value=";">;</option>
                  <option value="\t">Tab</option>
                  <option value="|">|</option>
                  <option value=" ">Space</option>
                </select>
              </div>

              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Quote:</label>
                <select
                  v-model="options.quote"
                  @change="previewData"
                  class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value='"'>"</option>
                  <option value="'">'</option>
                  <option value="">None</option>
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
                First Row as Headers
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.skipEmptyLines"
                  @change="previewData"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Skip Empty Lines
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
                Auto-detect Numbers
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.autoDetectBooleans"
                  @change="previewData"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Auto-detect Booleans
              </label>
            </div>
          </div>

          <!-- Preview Table -->
          <div v-if="previewRows.length > 0" class="mt-4">
            <h4 class="font-medium text-gray-900 mb-2">Data Preview (first 5 rows)</h4>
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
            <p class="text-sm text-gray-600 mt-2">{{ previewRows.length }} rows detected</p>
          </div>

          <button
            @click="convertToJson"
            :disabled="!inputCsv.trim() || previewRows.length === 0"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Convert to JSON
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">JSON Output</h3>
            <div class="flex space-x-2">
              <button
                v-if="jsonOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Copy
              </button>
              <button
                v-if="jsonOutput"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          <div
            v-if="!jsonOutput"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">📄</div>
              <p>No JSON output yet. Please input CSV data to convert.</p>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">Conversion Complete</p>
                  <p class="text-sm text-green-600">
                    {{ JSON.parse(jsonOutput).length }} records converted
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
import { ref, reactive } from 'vue'
import { useToast } from '@/composables/useToast'

const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const inputCsv = ref('')
const jsonOutput = ref('')
const previewRows = ref<any[][]>([])
const headers = ref<string[]>([])

const options = reactive({
  delimiter: ',',
  quote: '"',
  hasHeaders: true,
  skipEmptyLines: true,
  autoDetectNumbers: true,
  autoDetectBooleans: true,
})

function loadExample() {
  inputCsv.value = `Name,Age,City,Salary,Active
John Doe,30,New York,75000,true
Jane Smith,28,London,65000,false
Bob Johnson,35,Tokyo,80000,true
Alice Brown,32,Paris,70000,true
Charlie Wilson,29,Sydney,68000,false`
  previewData()
}

function clearInput() {
  inputCsv.value = ''
  jsonOutput.value = ''
  previewRows.value = []
  headers.value = []
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === options.quote && options.quote) {
      if (inQuotes && nextChar === options.quote) {
        // Escaped quote
        current += options.quote
        i += 2
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
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

    const result = previewRows.value.map((row) => {
      const obj: any = {}
      headers.value.forEach((header, index) => {
        const value = row[index] || ''
        obj[header] = convertValue(value)
      })
      return obj
    })

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
  link.download = `converted_${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
