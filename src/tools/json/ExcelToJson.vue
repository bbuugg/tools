<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('tools.excelToJson.title') }}</h1>
        <p class="text-gray-600">{{ $t('tools.excelToJson.description') }}</p>
      </div>

      <!-- Installation Notice -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <div class="text-yellow-600 text-xl mr-3">⚠️</div>
          <div>
            <p class="font-medium text-yellow-800">Installation Required</p>
            <p class="text-sm text-yellow-700">
              To use Excel conversion features, please install the XLSX library:
              <code class="bg-yellow-100 px-2 py-1 rounded text-sm">npm install xlsx</code>
            </p>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📊</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.excelToJson.features.parsing.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.excelToJson.features.parsing.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔄</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.excelToJson.features.conversion.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.excelToJson.features.conversion.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.excelToJson.features.options.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.excelToJson.features.options.description') }}
          </p>
        </div>
      </div>

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
              accept=".xlsx,.xls,.csv"
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
            :disabled="!selectedFile"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ $t('tools.excelToJson.convert') }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const selectedFile = ref<File | null>(null)
const outputJson = ref('')
const error = ref('')
const availableSheets = ref<Array<{ name: string }>>([])

const options = reactive({
  firstRowAsHeaders: true,
  skipEmptyRows: true,
  sheetIndex: 0,
})

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    error.value = ''
    outputJson.value = ''

    // For demonstration, show that we would parse the file
    availableSheets.value = [{ name: 'Sheet1' }, { name: 'Sheet2' }]

    success(t('tools.excelToJson.fileSelected'))
  }
}

function clearInput() {
  selectedFile.value = null
  outputJson.value = ''
  error.value = ''
  availableSheets.value = []
  options.sheetIndex = 0
}

function convertToJson() {
  try {
    error.value = ''
    outputJson.value = ''

    if (!selectedFile.value) {
      throw new Error(t('tools.excelToJson.errors.noFileSelected'))
    }

    // This would require the XLSX library to actually parse Excel files
    // For now, show an informational message
    throw new Error(t('tools.excelToJson.errors.xlsxRequired'))
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : t('tools.excelToJson.errors.conversionFailed')
    error.value = errorMessage
    showError(error.value)
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
