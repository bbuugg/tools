<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Input Section -->
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ $t('tools.excelToJson.inputTitle') }}
          </h3>
          <button
            @click="clearInput"
            class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            {{ $t('common.clear') }}
          </button>
        </div>

        <!-- File Upload -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv,.ods"
            @change="handleFileSelect"
            class="hidden"
          />
          <div class="text-4xl text-gray-400 mb-4">📁</div>
          <p class="text-gray-600 mb-2">{{ $t('tools.excelToJson.uploadDescription') }}</p>
          <button
            @click="($refs.fileInput as HTMLInputElement)?.click()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {{ $t('tools.excelToJson.selectFile') }}
          </button>
          <p class="text-sm text-gray-500 mt-2">{{ $t('tools.excelToJson.supportedFormats') }}</p>
        </div>

        <!-- Options -->
        <div class="space-y-3">
          <h4 class="font-medium text-gray-900">{{ $t('tools.excelToJson.options.title') }}</h4>

          <div class="grid grid-cols-2 gap-4">
            <label class="flex items-center">
              <input
                v-model="options.firstRowAsHeaders"
                type="checkbox"
                class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {{ $t('tools.excelToJson.options.firstRowAsHeaders') }}
            </label>

            <label class="flex items-center">
              <input
                v-model="options.skipEmptyRows"
                type="checkbox"
                class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {{ $t('tools.excelToJson.options.skipEmptyRows') }}
            </label>
          </div>

          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">
              {{ $t('tools.excelToJson.options.sheetIndex') }}:
            </label>
            <select
              v-model="options.sheetIndex"
              class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option v-for="(sheet, index) in availableSheets" :key="index" :value="index">
                {{ sheet.name || `Sheet ${index + 1}` }}
              </option>
            </select>
          </div>
        </div>

        <button
          @click="convertToJson"
          :disabled="!selectedFile || isLoading"
          class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
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
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ $t('tools.excelToJson.outputTitle') }}
          </h3>
          <div class="flex space-x-2">
            <button
              v-if="outputJson"
              @click="copyToClipboard"
              class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              {{ $t('common.copy') }}
            </button>
            <button
              v-if="outputJson"
              @click="downloadJson"
              class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              {{ $t('common.download') }}
            </button>
          </div>
        </div>

        <div
          v-if="!outputJson && !error"
          class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
        >
          <div class="text-center">
            <div class="text-3xl mb-2">📄</div>
            <p>{{ $t('tools.excelToJson.noResults') }}</p>
          </div>
        </div>

        <div v-if="error" class="h-80 flex items-center justify-center">
          <div class="text-center text-red-600">
            <div class="text-3xl mb-2">❌</div>
            <p class="font-medium">{{ $t('toast.error') }}</p>
            <p class="text-sm">{{ error }}</p>
          </div>
        </div>

        <div v-if="outputJson && !error" class="space-y-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center">
              <div class="text-green-600 text-2xl mr-3">✅</div>
              <div>
                <p class="font-medium text-green-800">
                  {{ $t('tools.excelToJson.conversionComplete') }}
                </p>
                <p class="text-sm text-green-600">
                  {{
                    $t('tools.excelToJson.recordsCount', { count: JSON.parse(outputJson).length })
                  }}
                </p>
              </div>
            </div>
          </div>

          <textarea
            :value="outputJson"
            readonly
            class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import * as XLSX from 'xlsx'

const { t } = useI18n()
const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const selectedFile = ref<File | null>(null)
const outputJson = ref('')
const error = ref('')
const isLoading = ref(false)
const availableSheets = ref<Array<{ name: string }>>([])

const options = reactive({
  firstRowAsHeaders: true,
  skipEmptyRows: true,
  sheetIndex: 0,
})

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]

    // Validate file type
    const validExtensions = ['.xlsx', '.xls', '.csv', '.ods']
    const fileName = file.name.toLowerCase()
    const isValidFile = validExtensions.some((ext) => fileName.endsWith(ext))

    if (!isValidFile) {
      error.value = 'Please select a valid Excel file (.xlsx, .xls, .csv, .ods)'
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
      // Read the file to get sheet information
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      // Update available sheets
      availableSheets.value = workbook.SheetNames.map((name) => ({ name }))
      options.sheetIndex = 0

      success(t('tools.excelToJson.fileSelected'))
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t('tools.excelToJson.errors.conversionFailed')
      error.value = errorMessage
      showError(error.value)
      selectedFile.value = null
      availableSheets.value = []
    }
  }
}

function clearInput() {
  selectedFile.value = null
  outputJson.value = ''
  error.value = ''
  isLoading.value = false
  availableSheets.value = []
  options.sheetIndex = 0
}

async function convertToJson() {
  if (isLoading.value) return

  isLoading.value = true

  try {
    error.value = ''
    outputJson.value = ''

    if (!selectedFile.value) {
      throw new Error(t('tools.excelToJson.errors.noFileSelected'))
    }

    // Check if we have any sheets available
    if (availableSheets.value.length === 0) {
      throw new Error('No sheets found in the Excel file')
    }

    // Read the Excel file
    const arrayBuffer = await selectedFile.value.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    // Get the selected sheet
    const sheetName = workbook.SheetNames[options.sheetIndex]
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
      header: options.firstRowAsHeaders ? 1 : 'A',
      defval: '',
      blankrows: !options.skipEmptyRows,
      raw: false,
    })

    // Check if we got any data
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error('No data found in the selected sheet')
    }

    // Format the JSON output
    outputJson.value = JSON.stringify(jsonData, null, 2)

    success(t('tools.excelToJson.conversionComplete'))
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : t('tools.excelToJson.errors.conversionFailed')
    error.value = errorMessage
    showError(error.value)
  } finally {
    isLoading.value = false
  }
}

function copyToClipboard() {
  if (!outputJson.value) return

  navigator.clipboard
    .writeText(outputJson.value)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function downloadJson() {
  if (!outputJson.value) return

  const blob = new Blob([outputJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `converted_data_${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
