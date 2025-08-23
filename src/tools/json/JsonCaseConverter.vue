<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">JSON Text Case Converter</h1>
        <p class="text-gray-600">
          Transform text case in JSON strings - uppercase, lowercase, title case, and more
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🅰️</div>
          <h3 class="text-lg font-semibold mb-2">Multiple Formats</h3>
          <p class="text-gray-600 text-sm">
            Support for uppercase, lowercase, title case, camelCase, and snake_case
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🎯</div>
          <h3 class="text-lg font-semibold mb-2">Selective Processing</h3>
          <p class="text-gray-600 text-sm">
            Target specific fields or convert all text values in JSON
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">Smart Handling</h3>
          <p class="text-gray-600 text-sm">
            Preserve JSON structure while transforming text content
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

          <!-- Case Conversion Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">Case Conversion Options</h4>

            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-24">Target Case:</label>
                <select
                  v-model="options.targetCase"
                  @change="analyzeJson"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="uppercase">UPPERCASE</option>
                  <option value="lowercase">lowercase</option>
                  <option value="title">Title Case</option>
                  <option value="camel">camelCase</option>
                  <option value="pascal">PascalCase</option>
                  <option value="snake">snake_case</option>
                  <option value="kebab">kebab-case</option>
                  <option value="constant">CONSTANT_CASE</option>
                </select>
              </div>

              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-24">Apply To:</label>
                <select
                  v-model="options.applyTo"
                  @change="analyzeJson"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="values">String Values Only</option>
                  <option value="keys">Object Keys Only</option>
                  <option value="both">Both Keys and Values</option>
                  <option value="fields">Specific Fields Only</option>
                </select>
              </div>

              <div v-if="options.applyTo === 'fields'" class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-24">Target Fields:</label>
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
                    v-model="options.preserveNumbers"
                    @change="analyzeJson"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Preserve Numeric Strings
                </label>

                <label class="flex items-center">
                  <input
                    v-model="options.preserveSpecialChars"
                    @change="analyzeJson"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Preserve Special Characters
                </label>

                <label class="flex items-center">
                  <input
                    v-model="options.preserveWhitespace"
                    @change="analyzeJson"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Preserve Leading/Trailing Whitespace
                </label>
              </div>
            </div>
          </div>

          <!-- Analysis Results -->
          <div v-if="analysisResults" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 class="font-medium text-blue-900 mb-2">Analysis Results:</h5>
            <div class="text-sm text-blue-800 space-y-1">
              <p>• Text values found: {{ analysisResults.textValues }}</p>
              <p v-if="options.applyTo === 'keys' || options.applyTo === 'both'">
                • Object keys found: {{ analysisResults.objectKeys }}
              </p>
              <p>• Values to convert: {{ analysisResults.toConvert }}</p>
            </div>
          </div>

          <button
            @click="convertCase"
            :disabled="!inputJson.trim() || !isValidJson"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Convert Case
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
              <div class="text-3xl mb-2">🅰️</div>
              <p>No results yet. Input JSON to convert text case.</p>
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
                  <p class="font-medium text-green-800">Case Conversion Complete</p>
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
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'

interface CaseOptions {
  targetCase:
    | 'uppercase'
    | 'lowercase'
    | 'title'
    | 'camel'
    | 'pascal'
    | 'snake'
    | 'kebab'
    | 'constant'
  applyTo: 'values' | 'keys' | 'both' | 'fields'
  targetFields: string
  preserveNumbers: boolean
  preserveSpecialChars: boolean
  preserveWhitespace: boolean
}

const { success, error: showError, copySuccess } = useToast()

const inputJson = ref('')
const convertedOutput = ref('')
const error = ref('')
const isValidJson = ref(false)
const analysisResults = ref<any>(null)
const conversionStats = ref('')

const options = ref<CaseOptions>({
  targetCase: 'lowercase',
  applyTo: 'values',
  targetFields: '',
  preserveNumbers: true,
  preserveSpecialChars: true,
  preserveWhitespace: false,
})

function loadExample() {
  const example = {
    user_profile: {
      first_name: 'john doe',
      last_name: 'SMITH',
      email_address: 'JohnSmith@EXAMPLE.com',
      phone_number: '+1-555-123-4567',
    },
    company_details: {
      company_name: 'Tech Solutions Inc.',
      department: 'software engineering',
      position: 'Senior Developer',
      status: 'ACTIVE',
    },
    tags: ['important', 'VIP_CLIENT', 'Priority_One'],
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

    const analysis = analyzeTextContent(parsed)
    analysisResults.value = analysis
  } catch (e) {
    error.value = 'Invalid JSON format'
    isValidJson.value = false
  }
}

function analyzeTextContent(obj: any, path = ''): any {
  let textValues = 0
  let objectKeys = 0
  let toConvert = 0

  function traverse(item: any, currentPath: string, parentKey?: string) {
    if (parentKey && (options.value.applyTo === 'keys' || options.value.applyTo === 'both')) {
      objectKeys++
      if (shouldConvertField(currentPath, parentKey, true)) {
        toConvert++
      }
    }

    if (Array.isArray(item)) {
      item.forEach((element, index) => {
        traverse(element, `${currentPath}[${index}]`)
      })
    } else if (typeof item === 'object' && item !== null) {
      Object.entries(item).forEach(([key, value]) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key

        if (
          typeof value === 'string' &&
          (options.value.applyTo === 'values' ||
            options.value.applyTo === 'both' ||
            options.value.applyTo === 'fields')
        ) {
          textValues++
          if (shouldConvertField(newPath, value, false)) {
            toConvert++
          }
        }

        traverse(value, newPath, key)
      })
    }
  }

  traverse(obj, path)

  return {
    textValues,
    objectKeys,
    toConvert,
  }
}

function shouldConvertField(fieldPath: string, value: string, isKey: boolean): boolean {
  const { applyTo, targetFields } = options.value

  if (applyTo === 'fields') {
    if (!targetFields.trim()) return false
    const fields = targetFields.split(',').map((f) => f.trim())
    return fields.some((field) => fieldPath.includes(field))
  }

  if (isKey && (applyTo === 'keys' || applyTo === 'both')) {
    return true
  }

  if (!isKey && (applyTo === 'values' || applyTo === 'both')) {
    // Check if we should preserve numbers
    if (options.value.preserveNumbers && /^\d+(\.\d+)?$/.test(value.trim())) {
      return false
    }
    return true
  }

  return false
}

function convertCase() {
  if (!isValidJson.value) return

  try {
    const parsed = JSON.parse(inputJson.value)
    let convertedCount = 0

    const converted = convertCaseInObject(parsed, '', (count) => {
      convertedCount = count
    })

    convertedOutput.value = JSON.stringify(converted, null, 2)
    conversionStats.value = `Converted ${convertedCount} text values to ${options.value.targetCase}`
    error.value = ''
    success('Text case converted successfully!')
  } catch (e) {
    error.value = 'Failed to convert case: ' + (e as Error).message
  }
}

function convertCaseInObject(obj: any, path = '', onConvert?: (count: number) => void): any {
  let convertedCount = 0

  function convert(item: any, currentPath: string): any {
    if (Array.isArray(item)) {
      return item.map((element, index) => convert(element, `${currentPath}[${index}]`))
    } else if (typeof item === 'object' && item !== null) {
      const result: any = {}

      Object.entries(item).forEach(([key, value]) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key
        let newKey = key

        // Convert key if needed
        if (shouldConvertField(newPath, key, true)) {
          newKey = transformCase(key)
          convertedCount++
        }

        // Convert value if it's a string and should be converted
        if (typeof value === 'string' && shouldConvertField(newPath, value, false)) {
          result[newKey] = transformCase(value)
          convertedCount++
        } else {
          result[newKey] = convert(value, newPath)
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

function transformCase(text: string): string {
  if (!text) return text

  // Preserve whitespace if requested
  const trimmed = options.value.preserveWhitespace ? text : text.trim()

  switch (options.value.targetCase) {
    case 'uppercase':
      return trimmed.toUpperCase()

    case 'lowercase':
      return trimmed.toLowerCase()

    case 'title':
      return trimmed.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())

    case 'camel':
      return trimmed
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[A-Z]/, (char) => char.toLowerCase())

    case 'pascal':
      return trimmed
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[a-z]/, (char) => char.toUpperCase())

    case 'snake':
      return trimmed
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')

    case 'kebab':
      return trimmed
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    case 'constant':
      return trimmed
        .toUpperCase()
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')

    default:
      return trimmed
  }
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
    a.download = 'case-converted.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('JSON file downloaded successfully!')
  }
}
</script>
