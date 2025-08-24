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
            <!-- Conversion Type Selection -->
            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700">
                {{ $t('tools.jsonToExcel.options.conversionType') }}:
              </label>
              <select
                v-model="options.conversionType"
                class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="sql">SQL</option>
              </select>
            </div>

            <!-- Common Options -->
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input
                  v-model="options.includeHeaders"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :disabled="options.conversionType === 'sql'"
                />
                {{ $t('tools.jsonToExcel.options.includeHeaders') }}
              </label>
              <label class="flex items-center" v-if="options.conversionType === 'excel'">
                <input
                  v-model="options.autoFitColumns"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonToExcel.options.autoFitColumns') }}
              </label>
            </div>

            <!-- Excel Options -->
            <div v-if="options.conversionType === 'excel'" class="flex items-center space-x-4">
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

            <!-- CSV Options -->
            <div v-if="options.conversionType === 'csv'" class="space-y-3">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700">
                  {{ $t('tools.jsonToExcel.options.delimiter') }}:
                </label>
                <select
                  v-model="options.delimiter"
                  class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value=",">, ({{ $t('tools.jsonToExcel.options.comma') }})</option>
                  <option value=";">; ({{ $t('tools.jsonToExcel.options.semicolon') }})</option>
                  <option value="\t">\t ({{ $t('tools.jsonToExcel.options.tab') }})</option>
                  <option value="|">| ({{ $t('tools.jsonToExcel.options.pipe') }})</option>
                </select>
              </div>

              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700">
                  {{ $t('tools.jsonToExcel.options.quoteChar') }}:
                </label>
                <select
                  v-model="options.quoteChar"
                  class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value='"'>" ({{ $t('tools.jsonToExcel.options.doubleQuote') }})</option>
                  <option value="'">' ({{ $t('tools.jsonToExcel.options.singleQuote') }})</option>
                  <option value="">{{ $t('tools.jsonToExcel.options.none') }}</option>
                </select>
              </div>

              <div class="flex items-center">
                <label class="flex items-center">
                  <input
                    v-model="options.flattenNested"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {{ $t('tools.jsonToExcel.options.flattenNested') }}
                </label>
              </div>
            </div>

            <!-- SQL Options -->
            <div v-if="options.conversionType === 'sql'" class="space-y-4">
              <h4 class="font-medium text-gray-900">
                {{ $t('tools.jsonToExcel.options.sqlOptions') }}
              </h4>

              <div class="space-y-3">
                <div class="flex items-center space-x-4">
                  <label class="text-sm font-medium text-gray-700 w-24">
                    {{ $t('tools.jsonToExcel.options.tableName') }}:
                  </label>
                  <input
                    v-model="options.tableName"
                    type="text"
                    class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :placeholder="$t('tools.jsonToExcel.options.tableNamePlaceholder')"
                  />
                </div>

                <div class="flex items-center space-x-4">
                  <label class="text-sm font-medium text-gray-700 w-24">
                    {{ $t('tools.jsonToExcel.options.sqlType') }}:
                  </label>
                  <select
                    v-model="options.sqlType"
                    class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="INSERT">INSERT</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="CREATE_TABLE">CREATE TABLE</option>
                  </select>
                </div>

                <div v-if="options.sqlType === 'UPDATE'" class="flex items-center space-x-4">
                  <label class="text-sm font-medium text-gray-700 w-24">
                    {{ $t('tools.jsonToExcel.options.whereField') }}:
                  </label>
                  <input
                    v-model="options.whereField"
                    type="text"
                    class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :placeholder="$t('tools.jsonToExcel.options.whereFieldPlaceholder')"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <label class="flex items-center">
                  <input
                    v-model="options.escapeValues"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {{ $t('tools.jsonToExcel.options.escapeValues') }}
                </label>

                <label class="flex items-center">
                  <input
                    v-model="options.batchInsert"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {{ $t('tools.jsonToExcel.options.batchInsert') }}
                </label>
              </div>
            </div>
          </div>

          <button
            @click="convert"
            :disabled="
              !inputJson.trim() || (options.conversionType === 'sql' && !options.tableName.trim())
            "
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ getConvertButtonText() }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ getOutputTitle() }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="excelBlob && options.conversionType === 'excel'"
                @click="downloadExcel"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
              <button
                v-if="csvOutput && options.conversionType === 'csv'"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="csvOutput && options.conversionType === 'csv'"
                @click="downloadCsv"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
              <button
                v-if="sqlOutput && options.conversionType === 'sql'"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="sqlOutput && options.conversionType === 'sql'"
                @click="downloadSql"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!excelBlob && !csvOutput && !sqlOutput && !errorMessage"
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

          <div v-if="(excelBlob || csvOutput || sqlOutput) && !errorMessage" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">
                    {{ $t('tools.jsonToExcel.conversionComplete') }}
                  </p>
                  <p class="text-sm text-green-600">
                    {{ getReadyForDownloadText() }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="previewData.length > 0 && options.conversionType !== 'sql'"
              class="border rounded-lg overflow-hidden"
            >
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

            <!-- CSV Output Preview -->
            <div v-if="csvOutput && options.conversionType === 'csv'">
              <textarea
                :value="csvOutput"
                readonly
                class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <!-- SQL Output Preview -->
            <div v-if="sqlOutput && options.conversionType === 'sql'">
              <textarea
                :value="sqlOutput"
                readonly
                class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
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
import * as XLSX from 'xlsx'

const { t } = useI18n()
const { success, error: showError, copySuccess, copyError } = useToast()

const inputJson = ref('')
const excelBlob = ref<Blob | null>(null)
const csvOutput = ref('')
const sqlOutput = ref('')
const errorMessage = ref('')
const previewData = ref<Record<string, unknown>[]>([])
const previewHeaders = ref<string[]>([])

const options = reactive({
  conversionType: 'excel', // 'excel', 'csv', or 'sql'
  includeHeaders: true,
  autoFitColumns: true,
  sheetName: 'Sheet1',
  delimiter: ',',
  quoteChar: '"',
  flattenNested: true,
  tableName: 'my_table',
  sqlType: 'INSERT',
  escapeValues: true,
  batchInsert: false,
  whereField: 'id',
})

// Watch for conversion type changes to reset outputs
watch(
  () => options.conversionType,
  () => {
    excelBlob.value = null
    csvOutput.value = ''
    sqlOutput.value = ''
    errorMessage.value = ''
  },
)

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
  csvOutput.value = ''
  sqlOutput.value = ''
  errorMessage.value = ''
  previewData.value = []
  previewHeaders.value = []
}

// Get button text based on conversion type
function getConvertButtonText() {
  switch (options.conversionType) {
    case 'excel':
      return t('tools.jsonToExcel.convertToExcel')
    case 'csv':
      return t('tools.jsonToExcel.convertToCsv')
    case 'sql':
      return t('tools.jsonToExcel.convertToSql')
    default:
      return t('tools.jsonToExcel.convertToExcel')
  }
}

// Get output title based on conversion type
function getOutputTitle() {
  switch (options.conversionType) {
    case 'excel':
      return t('tools.jsonToExcel.outputTitle')
    case 'csv':
      return t('tools.jsonToExcel.csvOutputTitle')
    case 'sql':
      return t('tools.jsonToExcel.sqlOutputTitle')
    default:
      return t('tools.jsonToExcel.outputTitle')
  }
}

// Get ready for download text based on conversion type
function getReadyForDownloadText() {
  switch (options.conversionType) {
    case 'excel':
      return t('tools.jsonToExcel.readyForDownload')
    case 'csv':
      return t('tools.jsonToExcel.csvReadyForDownload')
    case 'sql':
      return t('tools.jsonToExcel.sqlReadyForDownload')
    default:
      return t('tools.jsonToExcel.readyForDownload')
  }
}

// Flatten nested objects for CSV conversion
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

// Escape CSV values
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

// Convert to CSV format
function convertToCsv(data: any[]) {
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

  return csv.trim()
}

// SQL conversion functions
function escapeSqlValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL'
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE'
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }

  let str = String(value)

  if (options.escapeValues) {
    // Escape single quotes for SQL
    str = str.replace(/'/g, "''")
    return `'${str}'`
  }

  return `'${str}'`
}

function getSqlDataType(value: unknown): string {
  if (value === null || value === undefined) {
    return 'VARCHAR(255)'
  }

  if (typeof value === 'boolean') {
    return 'BOOLEAN'
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'INT' : 'DECIMAL(10,2)'
  }

  if (typeof value === 'string') {
    if (value.length <= 50) {
      return 'VARCHAR(50)'
    } else if (value.length <= 255) {
      return 'VARCHAR(255)'
    } else {
      return 'TEXT'
    }
  }

  return 'TEXT'
}

function generateCreateTableSql(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ''

  const fields = new Set<string>()
  const fieldTypes: { [key: string]: string } = {}

  // Analyze all objects to get field types
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      fields.add(key)
      if (!fieldTypes[key]) {
        fieldTypes[key] = getSqlDataType(item[key])
      }
    })
  })

  const fieldDefinitions = Array.from(fields)
    .map((field) => {
      return `  ${field} ${fieldTypes[field]}`
    })
    .join(',\n')

  return `CREATE TABLE ${options.tableName} (\n${fieldDefinitions}\n);`
}

function generateInsertSql(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ''

  if (options.batchInsert) {
    // Generate single multi-row INSERT
    const fields = Object.keys(data[0])
    const fieldsList = fields.join(', ')

    const valuesList = data
      .map((item) => {
        const values = fields.map((field) => escapeSqlValue(item[field])).join(', ')
        return `(${values})`
      })
      .join(',\n  ')

    return `INSERT INTO ${options.tableName} (${fieldsList})\nVALUES\n  ${valuesList};`
  } else {
    // Generate individual INSERT statements
    return data
      .map((item) => {
        const fields = Object.keys(item)
        const fieldsList = fields.join(', ')
        const valuesList = fields.map((field) => escapeSqlValue(item[field])).join(', ')

        return `INSERT INTO ${options.tableName} (${fieldsList}) VALUES (${valuesList});`
      })
      .join('\n')
  }
}

function generateUpdateSql(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ''

  return data
    .map((item) => {
      const fields = Object.keys(item).filter((key) => key !== options.whereField)
      const setClause = fields
        .map((field) => `${field} = ${escapeSqlValue(item[field])}`)
        .join(', ')
      const whereValue = escapeSqlValue(item[options.whereField])

      return `UPDATE ${options.tableName} SET ${setClause} WHERE ${options.whereField} = ${whereValue};`
    })
    .join('\n')
}

// Convert based on selected type
function convert() {
  try {
    errorMessage.value = ''
    excelBlob.value = null
    csvOutput.value = ''
    sqlOutput.value = ''
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

    // Set preview data (only for Excel and CSV)
    if (options.conversionType !== 'sql') {
      previewData.value = data
      previewHeaders.value = data.length > 0 ? Object.keys(data[0]) : []
    }

    switch (options.conversionType) {
      case 'excel':
        // Excel conversion logic
        const workbook = XLSX.utils.book_new()
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

        success(t('tools.jsonToExcel.success.conversionComplete'))
        break

      case 'csv':
        // CSV conversion logic
        csvOutput.value = convertToCsv(data)
        success(t('tools.jsonToExcel.success.csvConversionComplete'))
        break

      case 'sql':
        // SQL conversion logic
        if (!options.tableName.trim()) {
          throw new Error(t('tools.jsonToExcel.errors.emptyTableName'))
        }

        if (options.sqlType === 'UPDATE' && !options.whereField.trim()) {
          throw new Error(t('tools.jsonToExcel.errors.emptyWhereField'))
        }

        let sql = ''

        switch (options.sqlType) {
          case 'CREATE_TABLE':
            sql = generateCreateTableSql(data)
            break
          case 'INSERT':
            sql = generateInsertSql(data)
            break
          case 'UPDATE':
            sql = generateUpdateSql(data)
            break
        }

        sqlOutput.value = sql
        success(t('tools.jsonToExcel.success.sqlConversionComplete'))
        break
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : t('tools.jsonToExcel.errors.conversionFailed')
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

function copyToClipboard() {
  let textToCopy = ''

  if (options.conversionType === 'csv' && csvOutput.value) {
    textToCopy = csvOutput.value
  } else if (options.conversionType === 'sql' && sqlOutput.value) {
    textToCopy = sqlOutput.value
  }

  if (!textToCopy) return

  navigator.clipboard
    .writeText(textToCopy)
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

  success(t('toast.downloadSuccess'))
}

function downloadSql() {
  if (!sqlOutput.value) return

  const blob = new Blob([sqlOutput.value], { type: 'application/sql' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${options.tableName}_${Date.now()}.sql`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  success(t('toast.downloadSuccess'))
}
</script>
