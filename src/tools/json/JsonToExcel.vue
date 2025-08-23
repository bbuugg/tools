<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('tools.jsonToExcel.title') }}</h1>
        <p class="text-gray-600">{{ $t('tools.jsonToExcel.description') }}</p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔄</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonToExcel.features.conversion.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonToExcel.features.conversion.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📊</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonToExcel.features.formatting.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonToExcel.features.formatting.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚡</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonToExcel.features.batch.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonToExcel.features.batch.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonToExcel.inputTitle') }}
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
            :placeholder="$t('tools.jsonToExcel.inputPlaceholder')"
            class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>

          <div class="mt-4 space-y-3">
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input
                  v-model="options.includeHeaders"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonToExcel.options.includeHeaders') }}
              </label>
              <label class="flex items-center">
                <input
                  v-model="options.autoFitColumns"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonToExcel.options.autoFitColumns') }}
              </label>
            </div>

            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700">
                {{ $t('tools.jsonToExcel.options.sheetName') }}:
              </label>
              <input
                v-model="options.sheetName"
                type="text"
                class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :placeholder="$t('tools.jsonToExcel.options.sheetNamePlaceholder')"
              />
            </div>
          </div>

          <button
            @click="convertToExcel"
            :disabled="!inputJson.trim()"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ $t('tools.jsonToExcel.convert') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonToExcel.outputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="excelBlob"
                @click="downloadExcel"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!excelBlob && !errorMessage"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">📊</div>
              <p>{{ $t('tools.jsonToExcel.noResults') }}</p>
            </div>
          </div>

          <div v-if="errorMessage" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">{{ $t('toast.error') }}</p>
              <p class="text-sm">{{ errorMessage }}</p>
            </div>
          </div>

          <div v-if="excelBlob && !errorMessage" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">
                    {{ $t('tools.jsonToExcel.conversionComplete') }}
                  </p>
                  <p class="text-sm text-green-600">
                    {{ $t('tools.jsonToExcel.readyForDownload') }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="previewData.length > 0" class="border rounded-lg overflow-hidden">
              <div class="bg-gray-50 px-4 py-2 border-b">
                <h4 class="font-medium text-gray-900">
                  {{ $t('tools.jsonToExcel.previewTitle') }}
                </h4>
              </div>
              <div class="overflow-x-auto max-h-64">
                <table class="w-full text-sm">
                  <thead class="bg-gray-100">
                    <tr>
                      <th
                        v-for="header in previewHeaders"
                        :key="header"
                        class="px-3 py-2 text-left font-medium text-gray-900 border-r"
                      >
                        {{ header }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, index) in previewData.slice(0, 10)"
                      :key="index"
                      class="border-b"
                    >
                      <td v-for="header in previewHeaders" :key="header" class="px-3 py-2 border-r">
                        {{ row[header] || '' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div
                v-if="previewData.length > 10"
                class="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center"
              >
                {{
                  $t('tools.jsonToExcel.showingRows', {
                    shown: Math.min(10, previewData.length),
                    total: previewData.length,
                  })
                }}
              </div>
            </div>
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
import * as XLSX from 'xlsx' // Will be needed when XLSX is installed

const { t } = useI18n()
const { success, error: showError } = useToast()

const inputJson = ref('')
const excelBlob = ref<Blob | null>(null)
const errorMessage = ref('')
const previewData = ref<Record<string, unknown>[]>([])
const previewHeaders = ref<string[]>([])

const options = reactive({
  includeHeaders: true,
  autoFitColumns: true,
  sheetName: 'Sheet1',
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
        joinDate: '2023-01-15',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 28,
        department: 'Marketing',
        salary: 65000,
        joinDate: '2023-03-20',
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        age: 35,
        department: 'Sales',
        salary: 70000,
        joinDate: '2022-11-10',
      },
    ],
    null,
    2,
  )
}

function clearInput() {
  inputJson.value = ''
  excelBlob.value = null
  errorMessage.value = ''
  previewData.value = []
  previewHeaders.value = []
}

function convertToExcel() {
  try {
    errorMessage.value = ''
    excelBlob.value = null
    previewData.value = []
    previewHeaders.value = []

    if (!inputJson.value.trim()) {
      throw new Error(t('tools.jsonToExcel.errors.emptyInput'))
    }

    let data
    try {
      data = JSON.parse(inputJson.value)
    } catch {
      throw new Error(t('tools.jsonToExcel.errors.invalidJson'))
    }

    if (!Array.isArray(data)) {
      throw new Error(t('tools.jsonToExcel.errors.notArray'))
    }

    if (data.length === 0) {
      throw new Error(t('tools.jsonToExcel.errors.emptyArray'))
    }

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: options.includeHeaders ? undefined : [],
    })

    // Auto-fit columns if enabled
    if (options.autoFitColumns) {
      const columnWidths: Array<{ wch: number }> = []
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')

      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ c: C, r: R })
          const cell = worksheet[cellAddress]
          if (cell && cell.v) {
            const cellValue = cell.v.toString()
            maxWidth = Math.max(maxWidth, Math.min(cellValue.length + 2, 50))
          }
        }
        columnWidths.push({ wch: maxWidth })
      }
      worksheet['!cols'] = columnWidths
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1')

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    excelBlob.value = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Set preview data
    previewData.value = data
    previewHeaders.value = data.length > 0 ? Object.keys(data[0]) : []

    // showToast(t('tools.jsonToExcel.success.conversionComplete'), 'success')
    success(t('tools.jsonToExcel.success.conversionComplete'))
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : t('tools.jsonToExcel.errors.conversionFailed')
    errorMessage.value = message
    showError(message)
  }
}

function downloadExcel() {
  if (!excelBlob.value) return

  const url = URL.createObjectURL(excelBlob.value)
  const link = document.createElement('a')
  link.href = url
  link.download = `converted_data_${Date.now()}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  success(t('toast.downloadSuccess'))
}
</script>
