<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Tool Introduction -->
    <div class="glass p-6 rounded-xl border border-slate-700/50">
      <h2 class="text-lg font-semibold text-slate-100 mb-3">
        {{ $t('tools.excelTextToJson.introduction.title') }}
      </h2>
      <div class="text-slate-400 space-y-2 text-sm">
        <p>{{ $t('tools.excelTextToJson.introduction.description') }}</p>
        <p>{{ $t('tools.excelTextToJson.introduction.usage') }}</p>
      </div>

      <!-- Example -->
      <div class="mt-4">
        <h3 class="text-sm font-medium text-slate-300 mb-2">
          {{ $t('tools.excelTextToJson.example.title') }}
        </h3>
        <div class="grid lg:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-slate-500 mb-1">
              {{ $t('tools.excelTextToJson.example.input') }}
            </p>
            <pre class="bg-slate-800/50 p-3 rounded-lg text-xs font-mono text-slate-300 border border-slate-700/30">name	age	score
李华	25	89
小明	22	85</pre>
          </div>
          <div>
            <p class="text-xs text-slate-500 mb-1">
              {{ $t('tools.excelTextToJson.example.output') }}
            </p>
            <pre class="bg-slate-800/50 p-3 rounded-lg text-xs font-mono text-slate-300 border border-slate-700/30">[
  {"name": "李华", "age": "25", "score": "89"},
  {"name": "小明", "age": "22", "score": "85"}
]</pre>
          </div>
        </div>
      </div>
    </div>

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
              @click="clearInput"
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
            @change="handleFileUpload"
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
                v-model="options.delimiter"
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
                v-model="options.outputFormat"
                class="px-2 py-1 bg-slate-800/30 border border-slate-600/50 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="object">
                  {{ $t('tools.excelTextToJson.formats.jsonObject') }}
                </option>
                <option value="array">{{ $t('tools.excelTextToJson.formats.jsonArray') }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <label class="flex items-center text-sm text-slate-300">
              <input
                v-model="options.hasHeaders"
                @change="previewData"
                type="checkbox"
                class="mr-2 rounded border-slate-600/50 bg-slate-800/30 text-primary-500 focus:ring-primary-500 transition-all duration-200"
              />
              {{ $t('tools.excelTextToJson.options.hasHeaders') }}
            </label>

            <label class="flex items-center text-sm text-slate-300">
              <input
                v-model="options.skipEmptyLines"
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
                v-model="options.autoDetectNumbers"
                @change="previewData"
                type="checkbox"
                class="mr-2 rounded border-slate-600/50 bg-slate-800/30 text-primary-500 focus:ring-primary-500 transition-all duration-200"
              />
              {{ $t('tools.excelTextToJson.options.autoDetectNumbers') }}
            </label>

            <label class="flex items-center text-sm text-slate-300">
              <input
                v-model="options.autoDetectBooleans"
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
                <tr v-for="(row, index) in previewRows.slice(0, 5)" :key="index" class="border-b border-slate-700/50">
                  <td v-for="(value, colIndex) in row" :key="colIndex" class="px-3 py-2 border-r border-slate-700/50 text-slate-300">
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
          @click="convertToJson"
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
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useToast } from '@/composables/useToast'

const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const inputText = ref('')
const jsonOutput = ref('')
const previewRows = ref<string[][]>([])
const headers = ref<string[]>([])

const options = reactive({
  delimiter: '\t',
  outputFormat: 'object',
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
  inputText.value = `name\tage\tscore
李华\t25\t89
小明\t22\t85
张三\t30\t92
李四\t28\t78`
  previewData()
}

function clearInput() {
  inputText.value = ''
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
    } else if (char === options.delimiter && !inQuotes) {
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

  if (options.autoDetectBooleans) {
    const lower = value.toLowerCase()
    if (lower === 'true') return true
    if (lower === 'false') return false
  }

  if (options.autoDetectNumbers) {
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
      .filter((line) => (options.skipEmptyLines ? line : true))

    if (lines.length === 0) {
      previewRows.value = []
      headers.value = []
      return
    }

    const parsedLines = lines.map((line) => parseLine(line))

    if (options.hasHeaders && parsedLines.length > 0) {
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

function convertToJson() {
  try {
    if (!inputText.value.trim() || previewRows.value.length === 0) {
      showError('Please provide valid data to convert')
      return
    }

    let result: (string | number | boolean)[][] | Record<string, string | number | boolean>[]

    if (options.outputFormat === 'object' && options.hasHeaders) {
      result = previewRows.value.map((row) => {
        const obj: Record<string, string | number | boolean> = {}
        headers.value.forEach((header, index) => {
          const value = row[index] || ''
          obj[header] = convertValue(value)
        })
        return obj
      })
    } else {
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
    success('Data converted to JSON successfully!')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    showError('Failed to convert data to JSON: ' + errorMessage)
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
  link.download = `excel-text-to-json-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>