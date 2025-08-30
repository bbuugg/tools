<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Mode Toggle -->
    <div class="flex justify-start">
      <div class="inline-flex rounded-md shadow-sm" role="group">
        <button
          @click="mode = 'file'"
          class="px-4 py-2 text-sm font-medium transition-colors rounded-l-lg"
          :class="[
            mode === 'file'
              ? 'text-white bg-primary-600'
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-slate-600',
            'border border-slate-700',
          ]"
        >
          {{ $t('tools.unifiedExcelToJson.modes.file') }}
        </button>
        <button
          @click="mode = 'text'"
          class="px-4 py-2 text-sm font-medium transition-colors rounded-r-lg"
          :class="[
            mode === 'text'
              ? 'text-white bg-primary-600'
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-slate-600',
            'border border-slate-700 border-l-0',
          ]"
        >
          {{ $t('tools.unifiedExcelToJson.modes.text') }}
        </button>
      </div>
    </div>

    <!-- File Mode -->
    <div v-show="mode === 'file'">
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.excelToJson.inputTitle') }}
            </h3>
            <button
              @click="clearFileInput"
              class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/30"
            >
              {{ $t('common.clear') }}
            </button>
          </div>

          <!-- File Upload -->
          <div
            class="border-2 border-dashed border-slate-700/50 rounded-xl p-8 text-center mb-4 bg-slate-800/30"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls,.csv,.ods,.txt"
              @change="handleFileSelect"
              class="hidden"
            />
            <div class="text-4xl text-slate-400 mb-4">📁</div>
            <p class="text-slate-300 mb-2">{{ $t('tools.excelToJson.uploadDescription') }}</p>
            <button
              @click="($refs.fileInput as HTMLInputElement)?.click()"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {{ $t('tools.excelToJson.selectFile') }}
            </button>
            <p class="text-sm text-slate-400 mt-2">
              {{ $t('tools.excelToJson.supportedFormats') }}
            </p>
          </div>

          <!-- Options -->
          <div class="space-y-4">
            <h4 class="font-medium text-slate-100">{{ $t('tools.excelToJson.options.title') }}</h4>

            <div class="grid grid-cols-2 gap-4">
              <label
                class="flex items-center text-slate-300 hover:text-slate-100 transition-colors"
              >
                <input
                  v-model="fileOptions.firstRowAsHeaders"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                />
                {{ $t('tools.excelToJson.options.firstRowAsHeaders') }}
              </label>

              <label
                class="flex items-center text-slate-300 hover:text-slate-100 transition-colors"
              >
                <input
                  v-model="fileOptions.skipEmptyRows"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                />
                {{ $t('tools.excelToJson.options.skipEmptyRows') }}
              </label>
            </div>

            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-slate-200">
                {{ $t('tools.excelToJson.options.sheetIndex') }}:
              </label>
              <select
                v-model="fileOptions.sheetIndex"
                class="px-3 py-1 bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option v-for="(sheet, index) in availableSheets" :key="index" :value="index">
                  {{ sheet.name || `Sheet ${index + 1}` }}
                </option>
              </select>
            </div>
          </div>

          <button
            @click="convertFileToJson"
            :disabled="!selectedFile || isLoading"
            class="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ $t('common.loading') }}
            </span>
            <span v-else>
              {{ $t('tools.excelToJson.convert') }}
            </span>
          </button>
        </div>

        <!-- Output Section -->
        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.excelToJson.outputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="outputJson"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-500/10 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/30"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="outputJson"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-500/10 text-green-300 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!outputJson && !error"
            class="h-80 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/30 rounded-xl"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">📄</div>
              <p>{{ $t('tools.excelToJson.noResults') }}</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-400">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">{{ $t('toast.error') }}</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="outputJson && !error" class="space-y-4">
            <div class="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div class="flex items-center">
                <div class="text-green-400 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-400">
                    {{ $t('tools.excelToJson.conversionComplete') }}
                  </p>
                  <p class="text-sm text-green-500/80">
                    {{
                      $t('tools.excelToJson.recordsCount', {
                        count: JSON.parse(outputJson).length,
                      })
                    }}
                  </p>
                </div>
              </div>
            </div>

            <textarea
              :value="outputJson"
              readonly
              class="w-full h-64 p-4 border border-slate-700/30 rounded-xl font-mono text-sm resize-none bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Text Mode -->
    <div v-show="mode === 'text'">
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.excelTextToJson.input.title') }}
            </h3>
            <div class="flex space-x-2">
              <button
                @click="loadExample"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 cursor-pointer hover-lift"
              >
                {{ $t('common.loadExample') }}
              </button>
              <button
                @click="clearTextInput"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 cursor-pointer hover-lift"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>

          <!-- File Upload -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.excelTextToJson.input.fileUpload') }}
            </label>
            <input
              type="file"
              accept=".txt,.csv"
              @change="handleTextFileUpload"
              class="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30 hover:file:text-primary-300 transition-all duration-200 cursor-pointer"
            />
          </div>

          <textarea
            v-model="inputText"
            :placeholder="$t('tools.excelTextToJson.input.placeholder')"
            class="w-full h-64 p-4 bg-slate-800/30 border border-slate-600/50 rounded-lg font-mono text-sm text-slate-100 placeholder-slate-500 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            @input="previewData"
          ></textarea>

          <!-- Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-slate-100">
              {{ $t('tools.excelTextToJson.options.title') }}
            </h4>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-slate-300">
                  {{ $t('tools.excelTextToJson.options.delimiter') }}:
                </label>
                <select
                  v-model="textOptions.delimiter"
                  @change="previewData"
                  class="px-2 py-1 bg-slate-800/30 border border-slate-600/50 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="\t">{{ $t('tools.excelTextToJson.delimiters.tab') }}</option>
                  <option value=",">{{ $t('tools.excelTextToJson.delimiters.comma') }}</option>
                  <option value=";">{{ $t('tools.excelTextToJson.delimiters.semicolon') }}</option>
                  <option value="|">{{ $t('tools.excelTextToJson.delimiters.pipe') }}</option>
                  <option value=" ">{{ $t('tools.excelTextToJson.delimiters.space') }}</option>
                </select>
              </div>

              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-slate-300">
                  {{ $t('tools.excelTextToJson.options.outputFormat') }}:
                </label>
                <select
                  v-model="textOptions.outputFormat"
                  class="px-2 py-1 bg-slate-800/30 border border-slate-600/50 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="object">
                    {{ $t('tools.excelTextToJson.formats.jsonObject') }}
                  </option>
                  <option value="array">
                    {{ $t('tools.excelTextToJson.formats.jsonArray') }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-center text-sm text-slate-300">
                <input
                  v-model="textOptions.hasHeaders"
                  @change="previewData"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600/50 bg-slate-800/30 text-primary-500 focus:ring-primary-500 transition-all duration-200"
                />
                {{ $t('tools.excelTextToJson.options.hasHeaders') }}
              </label>

              <label class="flex items-center text-sm text-slate-300">
                <input
                  v-model="textOptions.skipEmptyLines"
                  @change="previewData"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600/50 bg-slate-800/30 text-primary-500 focus:ring-primary-500 transition-all duration-200"
                />
                {{ $t('tools.excelTextToJson.options.skipEmptyLines') }}
              </label>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-center text-sm text-slate-300">
                <input
                  v-model="textOptions.autoDetectNumbers"
                  @change="previewData"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600/50 bg-slate-800/30 text-primary-500 focus:ring-primary-500 transition-all duration-200"
                />
                {{ $t('tools.excelTextToJson.options.autoDetectNumbers') }}
              </label>

              <label class="flex items-center text-sm text-slate-300">
                <input
                  v-model="textOptions.autoDetectBooleans"
                  @change="previewData"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600/50 bg-slate-800/30 text-primary-500 focus:ring-primary-500 transition-all duration-200"
                />
                {{ $t('tools.excelTextToJson.options.autoDetectBooleans') }}
              </label>
            </div>
          </div>

          <!-- Preview Table -->
          <div v-if="previewRows.length > 0" class="mt-4">
            <h4 class="font-medium text-slate-100 mb-2">
              {{ $t('tools.excelTextToJson.preview.title') }} ({{
                $t('tools.excelTextToJson.preview.firstRows', { count: 5 })
              }})
            </h4>
            <div class="overflow-x-auto border border-slate-700/50 rounded-lg">
              <table class="w-full text-sm">
                <thead class="bg-slate-800/50">
                  <tr>
                    <th
                      v-for="(header, index) in headers"
                      :key="index"
                      class="px-3 py-2 text-left font-medium text-slate-300 border-r border-slate-700/50"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in previewRows.slice(0, 5)"
                    :key="index"
                    class="border-b border-slate-700/50"
                  >
                    <td
                      v-for="(value, colIndex) in row"
                      :key="colIndex"
                      class="px-3 py-2 border-r border-slate-700/50 text-slate-300"
                    >
                      {{ value }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="text-sm text-slate-400 mt-2">
              {{ $t('tools.excelTextToJson.preview.rowsDetected', { count: previewRows.length }) }}
            </p>
          </div>

          <button
            @click="convertTextToJson"
            :disabled="!inputText.trim() || previewRows.length === 0"
            class="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 font-medium cursor-pointer hover-lift"
          >
            {{ $t('tools.excelTextToJson.convert') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.excelTextToJson.output.title') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="jsonOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 hover:text-primary-300 transition-all duration-200 cursor-pointer hover-lift"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="jsonOutput"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-success-500/20 text-success-400 rounded-lg hover:bg-success-500/30 hover:text-success-300 transition-all duration-200 cursor-pointer hover-lift"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!jsonOutput"
            class="h-80 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/30 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">📄</div>
              <p>{{ $t('tools.excelTextToJson.output.noOutput') }}</p>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="bg-success-500/20 border border-success-500/30 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-success-400 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-success-300">
                    {{ $t('tools.excelTextToJson.output.complete') }}
                  </p>
                  <p class="text-sm text-success-400">
                    {{
                      $t('tools.excelTextToJson.output.recordsConverted', {
                        count: outputRecordCount,
                      })
                    }}
                  </p>
                </div>
              </div>
            </div>

            <textarea
              :value="jsonOutput"
              readonly
              class="w-full h-64 p-4 bg-slate-800/30 border border-slate-600/50 rounded-lg font-mono text-sm text-slate-100 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
import * as XLSX from 'xlsx'

const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

// Mode state
const mode = ref<'file' | 'text'>('file')

// File mode state
const selectedFile = ref<File | null>(null)
const outputJson = ref('')
const error = ref('')
const isLoading = ref(false)
const availableSheets = ref<Array<{ name: string }>>([])

const fileOptions = reactive({
  firstRowAsHeaders: true,
  skipEmptyRows: true,
  sheetIndex: 0,
})

// Text mode state
const inputText = ref('')
const jsonOutput = ref('')
const previewRows = ref<string[][]>([])
const headers = ref<string[]>([])

const textOptions = reactive({
  delimiter: '\t',
  outputFormat: 'object',
  hasHeaders: true,
  skipEmptyLines: true,
  autoDetectNumbers: true,
  autoDetectBooleans: true,
})

// Computed properties
const outputRecordCount = computed(() => {
  if (!jsonOutput.value) return 0
  try {
    const parsed = JSON.parse(jsonOutput.value)
    return Array.isArray(parsed) ? parsed.length : 1
  } catch {
    return 0
  }
})

// File mode functions
async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]

    // Validate file type
    const validExtensions = ['.xlsx', '.xls', '.csv', '.ods', '.txt']
    const fileName = file.name.toLowerCase()
    const isValidFile = validExtensions.some((ext) => fileName.endsWith(ext))

    if (!isValidFile) {
      error.value = 'Please select a valid file (.xlsx, .xls, .csv, .ods, .txt)'
      showError(error.value)
      return
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      error.value = 'File size must be less than 50MB'
      showError(error.value)
      return
    }

    selectedFile.value = file
    error.value = ''
    outputJson.value = ''

    try {
      // For text files, switch to text mode and load content
      if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
        mode.value = 'text'
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          inputText.value = content
          previewData()
        }
        reader.readAsText(file, 'UTF-8')
        return
      }

      // For Excel files, read the file to get sheet information
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      // Update available sheets
      availableSheets.value = workbook.SheetNames.map((name) => ({ name }))
      fileOptions.sheetIndex = 0

      success('File selected successfully!')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process the file'
      error.value = errorMessage
      showError(error.value)
      selectedFile.value = null
      availableSheets.value = []
    }
  }
}

function clearFileInput() {
  selectedFile.value = null
  outputJson.value = ''
  error.value = ''
  isLoading.value = false
  availableSheets.value = []
  fileOptions.sheetIndex = 0
}

async function convertFileToJson() {
  if (isLoading.value) return

  isLoading.value = true

  try {
    error.value = ''
    outputJson.value = ''

    if (!selectedFile.value) {
      throw new Error('No file selected')
    }

    // Check if we have any sheets available
    if (availableSheets.value.length === 0) {
      throw new Error('No sheets found in the Excel file')
    }

    // Read the Excel file
    const arrayBuffer = await selectedFile.value.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    // Get the selected sheet
    const sheetName = workbook.SheetNames[fileOptions.sheetIndex]
    if (!sheetName) {
      throw new Error('Selected sheet not found')
    }

    const worksheet = workbook.Sheets[sheetName]

    // Check if worksheet is empty
    if (!worksheet || Object.keys(worksheet).length === 0) {
      throw new Error('Selected sheet is empty')
    }

    // Convert sheet to JSON with options
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: fileOptions.firstRowAsHeaders ? 1 : 'A',
      defval: '',
      blankrows: !fileOptions.skipEmptyRows,
      raw: false,
    })

    // Check if we got any data
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error('No data found in the selected sheet')
    }

    // Format the JSON output
    outputJson.value = JSON.stringify(jsonData, null, 2)

    success('File converted to JSON successfully!')
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to convert file to JSON'
    error.value = errorMessage
    showError(error.value)
  } finally {
    isLoading.value = false
  }
}

// Text mode functions
function loadExample() {
  inputText.value = `name\tage\tscore
李华\t25\t89
小明\t22\t85
张三\t30\t92
李四\t28\t78`
  previewData()
}

function clearTextInput() {
  inputText.value = ''
  jsonOutput.value = ''
  previewRows.value = []
  headers.value = []
}

function handleTextFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      inputText.value = content
      previewData()
    }
    reader.readAsText(file, 'UTF-8')
  }
}

function parseLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    const nextChar = line[i + 1]

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true
      i++
    } else if ((char === '"' || char === "'") && inQuotes) {
      if (nextChar === char) {
        current += char
        i += 2
      } else {
        inQuotes = false
        i++
      }
    } else if (char === textOptions.delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
      i++
    } else {
      current += char
      i++
    }
  }

  result.push(current.trim())
  return result
}

function convertValue(value: string): string | number | boolean {
  if (value === '') return ''

  if (textOptions.autoDetectBooleans) {
    const lower = value.toLowerCase()
    if (lower === 'true') return true
    if (lower === 'false') return false
  }

  if (textOptions.autoDetectNumbers) {
    const num = Number(value)
    if (!isNaN(num) && isFinite(num) && value.trim() !== '') {
      return num
    }
  }

  return value
}

function previewData() {
  if (!inputText.value.trim()) {
    previewRows.value = []
    headers.value = []
    return
  }

  try {
    const lines = inputText.value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => (textOptions.skipEmptyLines ? line : true))

    if (lines.length === 0) {
      previewRows.value = []
      headers.value = []
      return
    }

    const parsedLines = lines.map((line) => parseLine(line))

    if (textOptions.hasHeaders && parsedLines.length > 0) {
      headers.value = parsedLines[0]
      previewRows.value = parsedLines.slice(1)
    } else {
      const maxCols = Math.max(...parsedLines.map((row) => row.length))
      headers.value = Array.from({ length: maxCols }, (_, i) => `Column${i + 1}`)
      previewRows.value = parsedLines
    }
  } catch (error: unknown) {
    console.error('Error parsing text:', error)
    previewRows.value = []
    headers.value = []
  }
}

function convertTextToJson() {
  try {
    if (!inputText.value.trim() || previewRows.value.length === 0) {
      showError('Please provide valid data to convert')
      return
    }

    let result: (string | number | boolean)[][] | Record<string, string | number | boolean>[]

    if (textOptions.outputFormat === 'object' && textOptions.hasHeaders) {
      result = previewRows.value.map((row) => {
        const obj: Record<string, string | number | boolean> = {}
        headers.value.forEach((header, index) => {
          const value = row[index] || ''
          obj[header] = convertValue(value)
        })
        return obj
      })
    } else {
      if (textOptions.hasHeaders) {
        result = [
          headers.value,
          ...previewRows.value.map((row) => row.map((value) => convertValue(value))),
        ]
      } else {
        result = previewRows.value.map((row) => row.map((value) => convertValue(value)))
      }
    }

    jsonOutput.value = JSON.stringify(result, null, 2)
    success('Data converted to JSON successfully!')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    showError('Failed to convert data to JSON: ' + errorMessage)
  }
}

// Shared functions
function copyToClipboard() {
  const content = mode.value === 'file' ? outputJson.value : jsonOutput.value
  if (!content) return

  navigator.clipboard
    .writeText(content)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function downloadJson() {
  const content = mode.value === 'file' ? outputJson.value : jsonOutput.value
  if (!content) return

  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `excel-to-json-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
