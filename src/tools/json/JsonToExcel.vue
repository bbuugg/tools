<template>
  <ToolLayout
    :title="$t('tools.jsonToExcel.title')"
    :description="$t('tools.jsonToExcel.description')"
    icon="📊"
    :features="[
      $t('tools.jsonToExcel.features.conversion.title'),
      $t('tools.jsonToExcel.features.formatting.title'),
      $t('tools.jsonToExcel.features.batch.title'),
    ]"
  >
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Input Section -->
      <div class="glass rounded-xl border border-slate-700/30 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.jsonToExcel.inputTitle') }}
          </h3>
          <div class="flex space-x-2">
            <button
              @click="loadExample"
              class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700/30"
            >
              {{ $t('common.loadExample') }}
            </button>
            <button
              @click="clearInput"
              class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700/30"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <textarea
          v-model="inputJson"
          :placeholder="$t('tools.jsonToExcel.inputPlaceholder')"
          class="w-full h-80 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono text-sm text-slate-100 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        ></textarea>

        <div class="mt-4 space-y-3">
          <!-- Conversion Type Selection -->
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-slate-300">
              {{ $t('tools.jsonToExcel.options.conversionType') }}:
            </label>
            <select
              v-model="options.conversionType"
              class="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
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
                class="mr-2 rounded border-slate-600 text-primary-500 focus:ring-primary-500 bg-slate-800/50"
                :disabled="options.conversionType === 'sql'"
              />
              <span class="text-slate-300">{{
                $t('tools.jsonToExcel.options.includeHeaders')
              }}</span>
            </label>
            <label class="flex items-center" v-if="options.conversionType === 'excel'">
              <input
                v-model="options.autoFitColumns"
                type="checkbox"
                class="mr-2 rounded border-slate-600 text-primary-500 focus:ring-primary-500 bg-slate-800/50"
              />
              <span class="text-slate-300">{{
                $t('tools.jsonToExcel.options.autoFitColumns')
              }}</span>
            </label>
          </div>

          <!-- Excel Options -->
          <div v-if="options.conversionType === 'excel'" class="flex items-center space-x-4">
            <label class="text-sm font-medium text-slate-300">
              {{ $t('tools.jsonToExcel.options.sheetName') }}:
            </label>
            <input
              v-model="options.sheetName"
              type="text"
              class="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
              :placeholder="$t('tools.jsonToExcel.options.sheetNamePlaceholder')"
            />
          </div>

          <!-- CSV Options -->
          <div v-if="options.conversionType === 'csv'" class="space-y-3">
            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-slate-300">
                {{ $t('tools.jsonToExcel.options.delimiter') }}:
              </label>
              <select
                v-model="options.delimiter"
                class="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
              >
                <option value=",">, ({{ $t('tools.jsonToExcel.options.comma') }})</option>
                <option value=";">; ({{ $t('tools.jsonToExcel.options.semicolon') }})</option>
                <option value="\t">\t ({{ $t('tools.jsonToExcel.options.tab') }})</option>
                <option value="|">| ({{ $t('tools.jsonToExcel.options.pipe') }})</option>
              </select>
            </div>

            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-slate-300">
                {{ $t('tools.jsonToExcel.options.quoteChar') }}:
              </label>
              <select
                v-model="options.quoteChar"
                class="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
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
                  class="mr-2 rounded border-slate-600 text-primary-500 focus:ring-primary-500 bg-slate-800/50"
                />
                <span class="text-slate-300">{{
                  $t('tools.jsonToExcel.options.flattenNested')
                }}</span>
              </label>
            </div>
          </div>

          <!-- SQL Options -->
          <div v-if="options.conversionType === 'sql'" class="space-y-4">
            <h4 class="font-medium text-slate-100">
              {{ $t('tools.jsonToExcel.options.sqlOptions') }}
            </h4>

            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-slate-300 w-24">
                  {{ $t('tools.jsonToExcel.options.tableName') }}:
                </label>
                <input
                  v-model="options.tableName"
                  type="text"
                  class="flex-1 px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
                  :placeholder="$t('tools.jsonToExcel.options.tableNamePlaceholder')"
                />
              </div>

              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-slate-300 w-24">
                  {{ $t('tools.jsonToExcel.options.sqlType') }}:
                </label>
                <select
                  v-model="options.sqlType"
                  class="flex-1 px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
                >
                  <option value="INSERT">INSERT</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="CREATE_TABLE">CREATE TABLE</option>
                </select>
              </div>

              <div v-if="options.sqlType === 'UPDATE'" class="flex items-center space-x-4">
                <label class="text-sm font-medium text-slate-300 w-24">
                  {{ $t('tools.jsonToExcel.options.whereField') }}:
                </label>
                <input
                  v-model="options.whereField"
                  type="text"
                  class="flex-1 px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
                  :placeholder="$t('tools.jsonToExcel.options.whereFieldPlaceholder')"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-center">
                <input
                  v-model="options.escapeValues"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600 text-primary-500 focus:ring-primary-500 bg-slate-800/50"
                />
                <span class="text-slate-300">{{
                  $t('tools.jsonToExcel.options.escapeValues')
                }}</span>
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.batchInsert"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600 text-primary-500 focus:ring-primary-500 bg-slate-800/50"
                />
                <span class="text-slate-300">{{
                  $t('tools.jsonToExcel.options.batchInsert')
                }}</span>
              </label>
            </div>
          </div>
        </div>

        <button
          @click="convert"
          :disabled="
            !inputJson.trim() || (options.conversionType === 'sql' && !options.tableName.trim())
          "
          class="w-full mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-medium border border-primary-500/30 hover-lift"
        >
          {{ getConvertButtonText() }}
        </button>
      </div>

      <!-- Output Section -->
      <div class="glass rounded-xl border border-slate-700/30 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ getOutputTitle() }}
          </h3>
          <div class="flex space-x-2">
            <button
              v-if="excelBlob && options.conversionType === 'excel'"
              @click="downloadExcel"
              class="px-3 py-1 text-sm bg-green-500/10 text-green-300 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30"
            >
              {{ $t('common.download') }}
            </button>
            <button
              v-if="csvOutput && options.conversionType === 'csv'"
              @click="copyToClipboard"
              class="px-3 py-1 text-sm bg-blue-500/10 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/30"
            >
              {{ $t('common.copy') }}
            </button>
            <button
              v-if="csvOutput && options.conversionType === 'csv'"
              @click="downloadCsv"
              class="px-3 py-1 text-sm bg-green-500/10 text-green-300 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30"
            >
              {{ $t('common.download') }}
            </button>
            <button
              v-if="sqlOutput && options.conversionType === 'sql'"
              @click="copyToClipboard"
              class="px-3 py-1 text-sm bg-blue-500/10 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/30"
            >
              {{ $t('common.copy') }}
            </button>
            <button
              v-if="sqlOutput && options.conversionType === 'sql'"
              @click="downloadSql"
              class="px-3 py-1 text-sm bg-green-500/10 text-green-300 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30"
            >
              {{ $t('common.download') }}
            </button>
          </div>
        </div>

        <div
          v-if="!excelBlob && !csvOutput && !sqlOutput && !errorMessage"
          class="h-80 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-lg"
        >
          <div class="text-center">
            <div class="text-3xl mb-2">📊</div>
            <p>{{ $t('tools.jsonToExcel.noResults') }}</p>
          </div>
        </div>

        <div v-if="errorMessage" class="h-80 flex items-center justify-center">
          <div class="text-center text-red-400">
            <div class="text-3xl mb-2">❌</div>
            <p class="font-medium">{{ $t('toast.error') }}</p>
            <p class="text-sm">{{ errorMessage }}</p>
          </div>
        </div>

        <div v-if="(excelBlob || csvOutput || sqlOutput) && !errorMessage" class="space-y-4">
          <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div class="flex items-center">
              <div class="text-green-400 text-2xl mr-3">✅</div>
              <div>
                <p class="font-medium text-green-300">
                  {{ $t('tools.jsonToExcel.conversionComplete') }}
                </p>
                <p class="text-sm text-green-400">
                  {{ getReadyForDownloadText() }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="previewData.length > 0 && options.conversionType !== 'sql'"
            class="border rounded-lg overflow-hidden border-slate-700/50"
          >
            <div class="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50">
              <h4 class="font-medium text-slate-100">
                {{ $t('tools.jsonToExcel.previewTitle') }}
              </h4>
            </div>
            <div class="overflow-x-auto max-h-64">
              <table class="w-full text-sm">
                <thead class="bg-slate-800/30">
                  <tr>
                    <th
                      v-for="header in previewHeaders"
                      :key="header"
                      class="px-3 py-2 text-left font-medium text-slate-300 border-r border-slate-700/50"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in previewData.slice(0, 10)"
                    :key="index"
                    class="border-b border-slate-700/50"
                  >
                    <td
                      v-for="header in previewHeaders"
                      :key="header"
                      class="px-3 py-2 border-r border-slate-700/50 text-slate-300"
                    >
                      {{ row[header] || '' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              v-if="previewData.length > 10"
              class="bg-slate-800/50 px-4 py-2 text-sm text-slate-400 text-center border-t border-slate-700/50"
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
              class="w-full h-64 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono text-sm text-slate-100 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- SQL Output Preview -->
          <div v-if="sqlOutput && options.conversionType === 'sql'">
            <textarea
              :value="sqlOutput"
              readonly
              class="w-full h-64 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono text-sm text-slate-100 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import * as XLSX from 'xlsx'
import ToolLayout from '@/components/ToolLayout.vue'

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
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const flattened: Record<string, unknown> = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (Array.isArray(obj[key])) {
        flattened[newKey] = obj[key].join('; ')
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (options.flattenNested) {
          Object.assign(flattened, flattenObject(obj[key] as Record<string, unknown>, newKey))
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
function escapeValue(value: unknown): string {
  let str = String(value ?? '')

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
function convertToCsv(data: Record<string, unknown>[]) {
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
    const row = headers.map((header) => escapeValue(item[header] ?? ''))
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
  const fieldTypes: Record<string, string> = {}

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

    let data: unknown
    try {
      data = JSON.parse(inputJson.value)
    } catch (err) {
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
      previewData.value = data as Record<string, unknown>[]
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
        csvOutput.value = convertToCsv(data as Record<string, unknown>[])
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
            sql = generateCreateTableSql(data as Record<string, unknown>[])
            break
          case 'INSERT':
            sql = generateInsertSql(data as Record<string, unknown>[])
            break
          case 'UPDATE':
            sql = generateUpdateSql(data as Record<string, unknown>[])
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

<style scoped>
.glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.hover-lift {
  transition: all 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>