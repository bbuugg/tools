<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">JSON Text to Number Converter</h1>
        <p class="text-gray-600">
          Convert text strings to numeric values in JSON objects and arrays
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔢</div>
          <h3 class="text-lg font-semibold mb-2">Smart Detection</h3>
          <p class="text-gray-600 text-sm">
            Automatically detect numeric text and convert to numbers
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">Validation</h3>
          <p class="text-gray-600 text-sm">
            Validate numeric strings before conversion with error handling
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🎯</div>
          <h3 class="text-lg font-semibold mb-2">Type Preservation</h3>
          <p class="text-gray-600 text-sm">
            Maintain appropriate numeric types (integer vs decimal)
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Input JSON</h3>
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
            v-model="inputJson"
            placeholder="Paste your JSON here..."
            class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="analyzeJson"
          ></textarea>

          <!-- Conversion Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">Conversion Options</h4>

            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-32">Conversion Mode:</label>
                <select
                  v-model="options.mode"
                  @change="analyzeJson"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="auto">Auto-detect Numbers</option>
                  <option value="fields">Specific Fields Only</option>
                  <option value="quoted">Quoted Numbers Only</option>
                  <option value="all-strings">All Text Strings</option>
                </select>
              </div>

              <div v-if="options.mode === 'fields'" class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-32">Target Fields:</label>
                <input
                  v-model="options.targetFields"
                  @input="analyzeJson"
                  type="text"
                  placeholder="field1,field2,nested.field"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div class="grid grid-cols-1 gap-3">
                <label class="flex items-center">
                  <input
                    v-model="options.strictValidation"
                    @change="analyzeJson"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Strict Number Validation
                </label>

                <label class="flex items-center">
                  <input
                    v-model="options.preserveIntegers"
                    @change="analyzeJson"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Preserve Integer Types
                </label>

                <label class="flex items-center">
                  <input
                    v-model="options.allowExponential"
                    @change="analyzeJson"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Allow Exponential Notation (1e5, 2.5e-3)
                </label>

                <label class="flex items-center">
                  <input
                    v-model="options.skipInvalid"
                    @change="analyzeJson"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Skip Invalid Numbers (don't fail conversion)
                </label>
              </div>
            </div>
          </div>

          <!-- Analysis Results -->
          <div v-if="analysisResults" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 class="font-medium text-blue-900 mb-2">Analysis Results:</h5>
            <div class="text-sm text-blue-800 space-y-1">
              <p>• Text values found: {{ analysisResults.textValuesFound }}</p>
              <p>• Convertible to numbers: {{ analysisResults.convertibleCount }}</p>
              <p>• Invalid numbers: {{ analysisResults.invalidCount }}</p>
              <p v-if="analysisResults.fieldNames.length > 0">
                • Numeric fields: {{ analysisResults.fieldNames.join(', ') }}
              </p>
            </div>
          </div>

          <button
            @click="convertNumbers"
            :disabled="!inputJson.trim() || !isValidJson"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Convert Text to Numbers
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Converted JSON</h3>
            <div class="flex space-x-2">
              <button
                v-if="convertedOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Copy
              </button>
              <button
                v-if="convertedOutput"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          <div
            v-if="!convertedOutput && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">🔢</div>
              <p>No results yet. Input JSON to convert text to numbers.</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">Error</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="convertedOutput && !error" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">Conversion Complete</p>
                  <p class="text-sm text-green-600">{{ conversionStats }}</p>
                </div>
              </div>
            </div>

            <!-- Show conversion warnings if any -->
            <div
              v-if="conversionWarnings.length > 0"
              class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
            >
              <h5 class="font-medium text-yellow-900 mb-2">Conversion Warnings:</h5>
              <div class="text-sm text-yellow-800 space-y-1">
                <p v-for="warning in conversionWarnings" :key="warning">• {{ warning }}</p>
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
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'

interface ConversionOptions {
  mode: 'auto' | 'fields' | 'quoted' | 'all-strings'
  targetFields: string
  strictValidation: boolean
  preserveIntegers: boolean
  allowExponential: boolean
  skipInvalid: boolean
}

const { success, error: showError, copySuccess } = useToast()

const inputJson = ref('')
const convertedOutput = ref('')
const error = ref('')
const isValidJson = ref(false)
const analysisResults = ref<any>(null)
const conversionStats = ref('')
const conversionWarnings = ref<string[]>([])

const options = ref<ConversionOptions>({
  mode: 'auto',
  targetFields: '',
  strictValidation: true,
  preserveIntegers: true,
  allowExponential: true,
  skipInvalid: true,
})

function loadExample() {
  const example = {
    user: {
      id: '123',
      name: 'John Doe',
      balance: '1500.75',
      age: '30',
    },
    products: [
      { id: '1', price: '29.99', quantity: '5' },
      { id: '2', price: '15.50', quantity: '3' },
    ],
    metadata: {
      version: '1.2',
      count: '8',
      rating: '4.5',
      tag: 'premium',
      scientific: '1.5e-3',
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
  conversionWarnings.value = []
}

function analyzeJson() {
  error.value = ''
  analysisResults.value = null
  conversionWarnings.value = []

  if (!inputJson.value.trim()) {
    isValidJson.value = false
    return
  }

  try {
    const parsed = JSON.parse(inputJson.value)
    isValidJson.value = true

    const analysis = analyzeTextValues(parsed)
    analysisResults.value = analysis
  } catch (e) {
    error.value = 'Invalid JSON format'
    isValidJson.value = false
  }
}

function analyzeTextValues(obj: any, path = ''): any {
  let textValuesFound = 0
  let convertibleCount = 0
  let invalidCount = 0
  const fieldNames: string[] = []

  function traverse(item: any, currentPath: string) {
    if (Array.isArray(item)) {
      item.forEach((element, index) => {
        traverse(element, `${currentPath}[${index}]`)
      })
    } else if (typeof item === 'object' && item !== null) {
      Object.entries(item).forEach(([key, value]) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key

        if (typeof value === 'string') {
          textValuesFound++

          if (shouldConvertField(newPath, value)) {
            if (isConvertibleToNumber(value)) {
              convertibleCount++
              if (!fieldNames.includes(key)) {
                fieldNames.push(key)
              }
            } else {
              invalidCount++
            }
          }
        }

        traverse(value, newPath)
      })
    }
  }

  traverse(obj, path)

  return {
    textValuesFound,
    convertibleCount,
    invalidCount,
    fieldNames,
  }
}

function shouldConvertField(fieldPath: string, value: string): boolean {
  const { mode, targetFields } = options.value

  switch (mode) {
    case 'auto':
      return isConvertibleToNumber(value)
    case 'fields':
      if (!targetFields.trim()) return false
      const fields = targetFields.split(',').map((f) => f.trim())
      return fields.some((field) => fieldPath.includes(field))
    case 'quoted':
      return (
        value.startsWith('"') && value.endsWith('"') && isConvertibleToNumber(value.slice(1, -1))
      )
    case 'all-strings':
      return true
    default:
      return false
  }
}

function isConvertibleToNumber(value: string): boolean {
  if (!value || value.trim() === '') return false

  const trimmed = value.trim()

  // Remove quotes if present
  const unquoted = trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed.slice(1, -1) : trimmed

  if (options.value.strictValidation) {
    // Strict validation - must be valid number format
    const numberRegex = options.value.allowExponential
      ? /^[+-]?\d*\.?\d+([eE][+-]?\d+)?$/
      : /^[+-]?\d*\.?\d+$/
    return numberRegex.test(unquoted)
  } else {
    // Loose validation - use parseFloat
    const parsed = parseFloat(unquoted)
    return !isNaN(parsed) && isFinite(parsed)
  }
}

function convertNumbers() {
  if (!isValidJson.value) return

  try {
    const parsed = JSON.parse(inputJson.value)
    let convertedCount = 0
    let skippedCount = 0
    const warnings: string[] = []

    const converted = convertTextToNumbers(parsed, '', (stats) => {
      convertedCount = stats.converted
      skippedCount = stats.skipped
      warnings.push(...stats.warnings)
    })

    convertedOutput.value = JSON.stringify(converted, null, 2)
    conversionStats.value = `Converted ${convertedCount} text values to numbers${skippedCount > 0 ? `, skipped ${skippedCount} invalid values` : ''}`
    conversionWarnings.value = warnings
    error.value = ''
    success('Text values converted to numbers successfully!')
  } catch (e) {
    error.value = 'Failed to convert text to numbers: ' + (e as Error).message
  }
}

function convertTextToNumbers(obj: any, path = '', onConvert?: (stats: any) => void): any {
  let convertedCount = 0
  let skippedCount = 0
  const warnings: string[] = []

  function convert(item: any, currentPath: string): any {
    if (Array.isArray(item)) {
      return item.map((element, index) => convert(element, `${currentPath}[${index}]`))
    } else if (typeof item === 'object' && item !== null) {
      const result: any = {}

      Object.entries(item).forEach(([key, value]) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key

        if (typeof value === 'string' && shouldConvertField(newPath, value)) {
          const unquoted = value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value

          if (isConvertibleToNumber(value)) {
            const parsed = parseFloat(unquoted)

            if (!isNaN(parsed) && isFinite(parsed)) {
              convertedCount++

              // Preserve integer type if requested
              if (options.value.preserveIntegers && Number.isInteger(parsed)) {
                result[key] = parseInt(unquoted, 10)
              } else {
                result[key] = parsed
              }
            } else if (options.value.skipInvalid) {
              skippedCount++
              warnings.push(`Skipped invalid number: ${value} at ${newPath}`)
              result[key] = value
            } else {
              throw new Error(`Invalid number format: ${value} at ${newPath}`)
            }
          } else if (options.value.skipInvalid) {
            skippedCount++
            warnings.push(`Skipped non-numeric text: ${value} at ${newPath}`)
            result[key] = value
          } else {
            result[key] = value
          }
        } else {
          result[key] = convert(value, newPath)
        }
      })

      return result
    }

    return item
  }

  const result = convert(obj, path)
  if (onConvert) {
    onConvert({
      converted: convertedCount,
      skipped: skippedCount,
      warnings,
    })
  }
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
    a.download = 'converted-text-to-numbers.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('JSON file downloaded successfully!')
  }
}
</script>
