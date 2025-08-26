<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('tools.jsonNumberToText.title') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('tools.jsonNumberToText.description') }}
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔢</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonNumberToText.features.typeConversion.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonNumberToText.features.typeConversion.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonNumberToText.features.selectiveProcessing.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonNumberToText.features.selectiveProcessing.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🎯</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonNumberToText.features.formatOptions.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonNumberToText.features.formatOptions.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonNumberToText.inputTitle') }}
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
            :placeholder="$t('tools.jsonNumberToText.inputPlaceholder')"
            class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="analyzeJson"
          ></textarea>

          <!-- Conversion Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">
              {{ $t('tools.jsonNumberToText.conversionOptions') }}
            </h4>

            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-32"
                  >{{ $t('tools.jsonNumberToText.conversionMode') }}:</label
                >
                <select
                  v-model="options.mode"
                  @change="analyzeJson"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{{ $t('tools.jsonNumberToText.convertAll') }}</option>
                  <option value="fields">{{ $t('tools.jsonNumberToText.specificFields') }}</option>
                  <option value="integers">{{ $t('tools.jsonNumberToText.integersOnly') }}</option>
                  <option value="decimals">{{ $t('tools.jsonNumberToText.decimalsOnly') }}</option>
                </select>
              </div>

              <div v-if="options.mode === 'fields'" class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-32"
                  >{{ $t('tools.jsonNumberToText.targetFields') }}:</label
                >
                <input
                  v-model="options.targetFields"
                  @input="analyzeJson"
                  type="text"
                  :placeholder="$t('tools.jsonNumberToText.targetFields')"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div class="grid grid-cols-1 gap-3">
                <label class="flex items-center">
                  <input
                    v-model="options.preserveDecimals"
                    @change="analyzeJson"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {{ $t('tools.jsonNumberToText.preserveDecimals') }}
                </label>

                <div v-if="options.preserveDecimals" class="flex items-center space-x-4 ml-6">
                  <label class="text-sm font-medium text-gray-700 w-24"
                    >{{ $t('tools.jsonNumberToText.decimalPlaces') }}:</label
                  >
                  <input
                    v-model.number="options.decimalPlaces"
                    @input="analyzeJson"
                    type="number"
                    min="0"
                    max="10"
                    :placeholder="$t('tools.jsonNumberToText.decimalPlaces')"
                    class="w-20 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <label class="flex items-center">
                  <input
                    v-model="options.addQuotes"
                    @change="analyzeJson"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {{ $t('tools.jsonNumberToText.addQuotes') }}
                </label>
              </div>
            </div>
          </div>

          <!-- Analysis Results -->
          <div v-if="analysisResults" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 class="font-medium text-blue-900 mb-2">
              {{ $t('tools.jsonNumberToText.analysisResults') }}:
            </h5>
            <div class="text-sm text-blue-800 space-y-1">
              <p>
                • {{ $t('tools.jsonNumberToText.numbersFound') }}:
                {{ analysisResults.numbersFound }}
              </p>
              <p>
                • {{ $t('tools.jsonNumberToText.fieldsToConvert') }}:
                {{ analysisResults.fieldsToConvert }}
              </p>
              <p v-if="analysisResults.fieldNames.length > 0">
                • {{ $t('tools.jsonNumberToText.numericFields') }}:
                {{ analysisResults.fieldNames.join(', ') }}
              </p>
            </div>
          </div>

          <button
            @click="convertNumbers"
            :disabled="!inputJson.trim() || !isValidJson"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ $t('tools.jsonNumberToText.convertButton') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonNumberToText.convertedJson') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="convertedOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="convertedOutput"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!convertedOutput && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">🔢</div>
              <p>{{ $t('tools.jsonNumberToText.noResults') }}</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">{{ $t('toast.error') }}</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="convertedOutput && !error" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">
                    {{ $t('tools.jsonNumberToText.conversionComplete') }}
                  </p>
                  <p class="text-sm text-green-600">{{ conversionStats }}</p>
                </div>
              </div>
            </div>

            <textarea
              :value="convertedOutput"
              readonly
              class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 resize-none"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface ConversionOptions {
  mode: 'all' | 'fields' | 'integers' | 'decimals'
  targetFields: string
  preserveDecimals: boolean
  decimalPlaces: number
  addQuotes: boolean
}

const { success, error: showError, copySuccess } = useToast()

const inputJson = ref('')
const convertedOutput = ref('')
const error = ref('')
const isValidJson = ref(false)
const analysisResults = ref<any>(null)
const conversionStats = ref('')

const options = ref<ConversionOptions>({
  mode: 'all',
  targetFields: '',
  preserveDecimals: true,
  decimalPlaces: 2,
  addQuotes: false,
})

function loadExample() {
  const example = {
    user: {
      id: 123,
      name: 'John Doe',
      balance: 1500.75,
      age: 30,
    },
    products: [
      { id: 1, price: 29.99, quantity: 5 },
      { id: 2, price: 15.5, quantity: 3 },
    ],
    metadata: {
      version: 1.2,
      count: 8,
      rating: 4.5,
    },
  }
  inputJson.value = JSON.stringify(example, null, 2)
  analyzeJson()
}

function clearInput() {
  inputJson.value = ''
  convertedOutput.value = ''
  error.value = ''
  isValidJson.value = false
  analysisResults.value = null
}

function analyzeJson() {
  error.value = ''
  analysisResults.value = null

  if (!inputJson.value.trim()) {
    isValidJson.value = false
    return
  }

  try {
    const parsed = JSON.parse(inputJson.value)
    isValidJson.value = true

    const analysis = analyzeNumbers(parsed)
    analysisResults.value = analysis
  } catch (e) {
    error.value = t('tools.jsonNumberToText.errors.invalidJson') + ' ' + (e as Error).message
    isValidJson.value = false
  }
}

function analyzeNumbers(obj: any, path = ''): any {
  let numbersFound = 0
  let fieldsToConvert = 0
  const fieldNames: string[] = []

  function traverse(item: any, currentPath: string) {
    if (Array.isArray(item)) {
      item.forEach((element, index) => {
        traverse(element, `${currentPath}[${index}]`)
      })
    } else if (typeof item === 'object' && item !== null) {
      Object.entries(item).forEach(([key, value]) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key

        if (typeof value === 'number') {
          numbersFound++

          if (shouldConvertField(newPath, value)) {
            fieldsToConvert++
            if (!fieldNames.includes(key)) {
              fieldNames.push(key)
            }
          }
        }

        traverse(value, newPath)
      })
    }
  }

  traverse(obj, path)

  return {
    numbersFound,
    fieldsToConvert,
    fieldNames,
  }
}

function shouldConvertField(fieldPath: string, value: number): boolean {
  const { mode, targetFields } = options.value

  switch (mode) {
    case 'all':
      return true
    case 'fields':
      if (!targetFields.trim()) return false
      const fields = targetFields.split(',').map((f) => f.trim())
      return fields.some((field) => fieldPath.includes(field))
    case 'integers':
      return Number.isInteger(value)
    case 'decimals':
      return !Number.isInteger(value)
    default:
      return false
  }
}

function convertNumbers() {
  if (!isValidJson.value) return

  try {
    const parsed = JSON.parse(inputJson.value)
    let convertedCount = 0

    const converted = convertNumbersInObject(parsed, '', (count) => {
      convertedCount = count
    })

    convertedOutput.value = JSON.stringify(converted, null, 2)
    conversionStats.value = `Converted ${convertedCount} numeric values to text`
    error.value = ''
    success(t('toast.success'))
  } catch (e) {
    error.value = t('tools.jsonNumberToText.errors.invalidJson') + ' ' + (e as Error).message
  }
}

function convertNumbersInObject(obj: any, path = '', onConvert?: (count: number) => void): any {
  let convertedCount = 0

  function convert(item: any, currentPath: string): any {
    if (Array.isArray(item)) {
      return item.map((element, index) => convert(element, `${currentPath}[${index}]`))
    } else if (typeof item === 'object' && item !== null) {
      const result: any = {}

      Object.entries(item).forEach(([key, value]) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key

        if (typeof value === 'number' && shouldConvertField(newPath, value)) {
          convertedCount++

          let textValue: string
          if (options.value.preserveDecimals && !Number.isInteger(value)) {
            textValue = value.toFixed(options.value.decimalPlaces)
          } else {
            textValue = value.toString()
          }

          result[key] = options.value.addQuotes ? `"${textValue}"` : textValue
        } else {
          result[key] = convert(value, newPath)
        }
      })

      return result
    }

    return item
  }

  const result = convert(obj, path)
  if (onConvert) onConvert(convertedCount)
  return result
}

function copyToClipboard() {
  if (convertedOutput.value) {
    navigator.clipboard.writeText(convertedOutput.value)
    copySuccess()
  }
}

function downloadJson() {
  if (convertedOutput.value) {
    const blob = new Blob([convertedOutput.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'converted-numbers.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success(t('toast.downloadSuccess'))
  }
}
</script>
