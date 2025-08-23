<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">JSON Array Slicer</h1>
        <p class="text-gray-600">
          Extract specific portions of JSON arrays using index ranges or conditions
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">✂️</div>
          <h3 class="text-lg font-semibold mb-2">Index Slicing</h3>
          <p class="text-gray-600 text-sm">Extract array elements by start/end index positions</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🎯</div>
          <h3 class="text-lg font-semibold mb-2">Conditional Slicing</h3>
          <p class="text-gray-600 text-sm">Filter elements based on field values and conditions</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📊</div>
          <h3 class="text-lg font-semibold mb-2">Smart Preview</h3>
          <p class="text-gray-600 text-sm">Preview sliced results with detailed statistics</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Input JSON Array</h3>
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
            placeholder="Paste your JSON array here..."
            class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="analyzeArray"
          ></textarea>

          <!-- Slicing Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">Slicing Options</h4>

            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-24">Method:</label>
                <select
                  v-model="options.method"
                  @change="analyzeArray"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="index">Index Range</option>
                  <option value="condition">Conditional Filter</option>
                  <option value="random">Random Sample</option>
                </select>
              </div>

              <!-- Index Range Options -->
              <div v-if="options.method === 'index'" class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex items-center space-x-2">
                    <label class="text-sm font-medium text-gray-700 w-16">Start:</label>
                    <input
                      v-model.number="options.startIndex"
                      @input="analyzeArray"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div class="flex items-center space-x-2">
                    <label class="text-sm font-medium text-gray-700 w-16">End:</label>
                    <input
                      v-model.number="options.endIndex"
                      @input="analyzeArray"
                      type="number"
                      placeholder="Leave empty for end"
                      class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <!-- Conditional Options -->
              <div v-if="options.method === 'condition'" class="space-y-3">
                <div class="flex items-center space-x-4">
                  <label class="text-sm font-medium text-gray-700 w-24">Field:</label>
                  <input
                    v-model="options.conditionField"
                    @input="analyzeArray"
                    type="text"
                    placeholder="Field name (e.g., age, status)"
                    class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <select
                    v-model="options.operator"
                    @change="analyzeArray"
                    class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="equals">Equals</option>
                    <option value="not-equals">Not Equals</option>
                    <option value="greater">Greater Than</option>
                    <option value="less">Less Than</option>
                    <option value="contains">Contains</option>
                  </select>
                  <input
                    v-model="options.conditionValue"
                    @input="analyzeArray"
                    type="text"
                    placeholder="Value"
                    class="col-span-2 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Random Sample Options -->
              <div v-if="options.method === 'random'" class="space-y-3">
                <div class="flex items-center space-x-4">
                  <label class="text-sm font-medium text-gray-700 w-24">Count:</label>
                  <input
                    v-model.number="options.sampleCount"
                    @input="analyzeArray"
                    type="number"
                    min="1"
                    placeholder="Number of items"
                    class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <label class="flex items-center">
                  <input
                    v-model="options.preserveOrder"
                    @change="analyzeArray"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Preserve Original Order
                </label>
              </div>
            </div>
          </div>

          <!-- Array Info -->
          <div v-if="arrayInfo" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 class="font-medium text-blue-900 mb-2">Array Information:</h5>
            <div class="text-sm text-blue-800 space-y-1">
              <p>• Total elements: {{ arrayInfo.total }}</p>
              <p v-if="options.method === 'index'">
                • Will extract: {{ arrayInfo.willExtract }} elements (indices {{ arrayInfo.range }})
              </p>
              <p v-if="options.method === 'condition'">
                • Matching elements: {{ arrayInfo.matching }}
              </p>
              <p v-if="options.method === 'random'">
                • Will sample: {{ Math.min(options.sampleCount || 0, arrayInfo.total) }} elements
              </p>
            </div>
          </div>

          <button
            @click="sliceArray"
            :disabled="!inputJson.trim() || !isValidArray"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Slice Array
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Sliced Array</h3>
            <div class="flex space-x-2">
              <button
                v-if="slicedOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Copy
              </button>
              <button
                v-if="slicedOutput"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          <div
            v-if="!slicedOutput && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">✂️</div>
              <p>No results yet. Input a JSON array to slice.</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">Error</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="slicedOutput && !error" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">Slicing Complete</p>
                  <p class="text-sm text-green-600">{{ slicingStats }}</p>
                </div>
              </div>
            </div>

            <textarea
              :value="slicedOutput"
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

interface SlicingOptions {
  method: 'index' | 'condition' | 'random'
  startIndex: number
  endIndex: number | null
  conditionField: string
  operator: 'equals' | 'not-equals' | 'greater' | 'less' | 'contains'
  conditionValue: string
  sampleCount: number
  preserveOrder: boolean
}

const { success, error: showError, copySuccess } = useToast()

const inputJson = ref('')
const slicedOutput = ref('')
const error = ref('')
const isValidArray = ref(false)
const arrayInfo = ref<any>(null)
const slicingStats = ref('')

const options = ref<SlicingOptions>({
  method: 'index',
  startIndex: 0,
  endIndex: null,
  conditionField: '',
  operator: 'equals',
  conditionValue: '',
  sampleCount: 10,
  preserveOrder: true,
})

function loadExample() {
  const example = [
    { id: 1, name: 'Alice', age: 25, status: 'active' },
    { id: 2, name: 'Bob', age: 30, status: 'inactive' },
    { id: 3, name: 'Charlie', age: 35, status: 'active' },
    { id: 4, name: 'Diana', age: 28, status: 'pending' },
    { id: 5, name: 'Eve', age: 32, status: 'active' },
    { id: 6, name: 'Frank', age: 27, status: 'inactive' },
    { id: 7, name: 'Grace', age: 29, status: 'active' },
    { id: 8, name: 'Henry', age: 31, status: 'pending' },
  ]
  inputJson.value = JSON.stringify(example, null, 2)
  analyzeArray()
}

function clearInput() {
  inputJson.value = ''
  slicedOutput.value = ''
  error.value = ''
  isValidArray.value = false
  arrayInfo.value = null
}

function analyzeArray() {
  error.value = ''
  arrayInfo.value = null

  if (!inputJson.value.trim()) {
    isValidArray.value = false
    return
  }

  try {
    const parsed = JSON.parse(inputJson.value)

    if (!Array.isArray(parsed)) {
      error.value = 'Input must be a valid JSON array'
      isValidArray.value = false
      return
    }

    isValidArray.value = true

    const info: any = {
      total: parsed.length,
    }

    if (options.value.method === 'index') {
      const start = Math.max(0, options.value.startIndex || 0)
      const end =
        options.value.endIndex !== null
          ? Math.min(parsed.length, options.value.endIndex)
          : parsed.length
      info.willExtract = Math.max(0, end - start)
      info.range = `${start} to ${end - 1}`
    } else if (options.value.method === 'condition' && options.value.conditionField) {
      const matching = parsed.filter((item) => evaluateCondition(item, options.value))
      info.matching = matching.length
    }

    arrayInfo.value = info
  } catch (e) {
    error.value = 'Invalid JSON format'
    isValidArray.value = false
  }
}

function evaluateCondition(item: any, opts: SlicingOptions): boolean {
  const fieldValue = getNestedValue(item, opts.conditionField)
  const conditionValue = opts.conditionValue

  switch (opts.operator) {
    case 'equals':
      return String(fieldValue) === conditionValue
    case 'not-equals':
      return String(fieldValue) !== conditionValue
    case 'greater':
      return Number(fieldValue) > Number(conditionValue)
    case 'less':
      return Number(fieldValue) < Number(conditionValue)
    case 'contains':
      return String(fieldValue).toLowerCase().includes(conditionValue.toLowerCase())
    default:
      return false
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function sliceArray() {
  if (!isValidArray.value) return

  try {
    const parsed = JSON.parse(inputJson.value)
    let result: any[]
    let stats = ''

    switch (options.value.method) {
      case 'index':
        const start = Math.max(0, options.value.startIndex || 0)
        const end =
          options.value.endIndex !== null
            ? Math.min(parsed.length, options.value.endIndex)
            : parsed.length
        result = parsed.slice(start, end)
        stats = `Extracted ${result.length} elements from index ${start} to ${end - 1}`
        break

      case 'condition':
        if (!options.value.conditionField) {
          error.value = 'Please specify a field name for conditional slicing'
          return
        }
        result = parsed.filter((item: any) => evaluateCondition(item, options.value))
        stats = `Found ${result.length} elements matching the condition`
        break

      case 'random':
        const sampleSize = Math.min(options.value.sampleCount || 10, parsed.length)
        if (options.value.preserveOrder) {
          const indices = Array.from({ length: parsed.length }, (_, i) => i)
            .sort(() => Math.random() - 0.5)
            .slice(0, sampleSize)
            .sort((a, b) => a - b)
          result = indices.map((i) => parsed[i])
        } else {
          result = [...parsed].sort(() => Math.random() - 0.5).slice(0, sampleSize)
        }
        stats = `Randomly sampled ${result.length} elements from ${parsed.length} total`
        break

      default:
        result = parsed
        stats = 'No slicing applied'
    }

    slicedOutput.value = JSON.stringify(result, null, 2)
    slicingStats.value = stats
    error.value = ''
    success('Array sliced successfully!')
  } catch (e) {
    error.value = 'Failed to slice array: ' + (e as Error).message
  }
}

function copyToClipboard() {
  if (slicedOutput.value) {
    navigator.clipboard.writeText(slicedOutput.value)
    copySuccess()
  }
}

function downloadJson() {
  if (slicedOutput.value) {
    const blob = new Blob([slicedOutput.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sliced-array.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('JSON file downloaded successfully!')
  }
}
</script>
