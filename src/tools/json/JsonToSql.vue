<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('tools.jsonToSql.title') }}</h1>
        <p class="text-gray-600">{{ $t('tools.jsonToSql.description') }}</p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🗃️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonToSql.features.insertion.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonToSql.features.insertion.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonToSql.features.customization.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonToSql.features.customization.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🛡️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonToSql.features.security.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonToSql.features.security.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonToSql.inputTitle') }}
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
            :placeholder="$t('tools.jsonToSql.inputPlaceholder')"
            class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>

          <!-- Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">{{ $t('tools.jsonToSql.options.title') }}</h4>

            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-24">
                  {{ $t('tools.jsonToSql.options.tableName') }}:
                </label>
                <input
                  v-model="options.tableName"
                  type="text"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :placeholder="$t('tools.jsonToSql.options.tableNamePlaceholder')"
                />
              </div>

              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-24">
                  {{ $t('tools.jsonToSql.options.sqlType') }}:
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
                  {{ $t('tools.jsonToSql.options.whereField') }}:
                </label>
                <input
                  v-model="options.whereField"
                  type="text"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :placeholder="$t('tools.jsonToSql.options.whereFieldPlaceholder')"
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
                {{ $t('tools.jsonToSql.options.escapeValues') }}
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.batchInsert"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonToSql.options.batchInsert') }}
              </label>
            </div>
          </div>

          <button
            @click="convertToSql"
            :disabled="!inputJson.trim() || !options.tableName.trim()"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ $t('tools.jsonToSql.convert') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonToSql.outputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="sqlOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="sqlOutput"
                @click="downloadSql"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!sqlOutput && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">🗃️</div>
              <p>{{ $t('tools.jsonToSql.noResults') }}</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">{{ $t('toast.error') }}</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="sqlOutput && !error" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">
                    {{ $t('tools.jsonToSql.conversionComplete') }}
                  </p>
                  <p class="text-sm text-green-600">
                    {{
                      $t('tools.jsonToSql.statementsGenerated', {
                        count: sqlOutput.split(';').filter((s) => s.trim()).length,
                      })
                    }}
                  </p>
                </div>
              </div>
            </div>

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
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const inputJson = ref('')
const sqlOutput = ref('')
const error = ref('')

const options = reactive({
  tableName: 'my_table',
  sqlType: 'INSERT',
  escapeValues: true,
  batchInsert: false,
  whereField: 'id',
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
        active: true,
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 28,
        department: 'Marketing',
        active: false,
      },
    ],
    null,
    2,
  )
}

function clearInput() {
  inputJson.value = ''
  sqlOutput.value = ''
  error.value = ''
}

function escapeValue(value: any): string {
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

function getSqlDataType(value: any): string {
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

function generateCreateTableSql(data: any[]): string {
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

function generateInsertSql(data: any[]): string {
  if (data.length === 0) return ''

  if (options.batchInsert) {
    // Generate single multi-row INSERT
    const fields = Object.keys(data[0])
    const fieldsList = fields.join(', ')

    const valuesList = data
      .map((item) => {
        const values = fields.map((field) => escapeValue(item[field])).join(', ')
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
        const valuesList = fields.map((field) => escapeValue(item[field])).join(', ')

        return `INSERT INTO ${options.tableName} (${fieldsList}) VALUES (${valuesList});`
      })
      .join('\n')
  }
}

function generateUpdateSql(data: any[]): string {
  if (data.length === 0) return ''

  return data
    .map((item) => {
      const fields = Object.keys(item).filter((key) => key !== options.whereField)
      const setClause = fields.map((field) => `${field} = ${escapeValue(item[field])}`).join(', ')
      const whereValue = escapeValue(item[options.whereField])

      return `UPDATE ${options.tableName} SET ${setClause} WHERE ${options.whereField} = ${whereValue};`
    })
    .join('\n')
}

function convertToSql() {
  try {
    error.value = ''
    sqlOutput.value = ''

    if (!inputJson.value.trim()) {
      throw new Error(t('tools.jsonToSql.errors.emptyInput'))
    }

    if (!options.tableName.trim()) {
      throw new Error(t('tools.jsonToSql.errors.emptyTableName'))
    }

    let data
    try {
      data = JSON.parse(inputJson.value)
    } catch (e) {
      throw new Error(t('tools.jsonToSql.errors.invalidJson'))
    }

    if (!Array.isArray(data)) {
      throw new Error(t('tools.jsonToSql.errors.notArray'))
    }

    if (data.length === 0) {
      throw new Error(t('tools.jsonToSql.errors.emptyArray'))
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
        if (!options.whereField.trim()) {
          throw new Error(t('tools.jsonToSql.errors.emptyWhereField'))
        }
        sql = generateUpdateSql(data)
        break
    }

    sqlOutput.value = sql
    success(t('tools.jsonToSql.success.conversionComplete'))
  } catch (err: any) {
    error.value = err.message || t('tools.jsonToSql.errors.conversionFailed')
    showError(error.value)
  }
}

function copyToClipboard() {
  if (!sqlOutput.value) return

  navigator.clipboard
    .writeText(sqlOutput.value)
    .then(() => {
      showToast(t('toast.copied'), 'success')
    })
    .catch(() => {
      showToast(t('toast.copyFailed'), 'error')
    })
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

  downloadSuccess()
}
</script>
