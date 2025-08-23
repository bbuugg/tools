<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">JSON Array Deduplicator</h1>
        <p class="text-gray-600">
          Remove duplicate elements from JSON arrays with various comparison methods
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔍</div>
          <h3 class="text-lg font-semibold mb-2">Smart Detection</h3>
          <p class="text-gray-600 text-sm">
            Detect duplicates using deep comparison or specific field matching
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">Flexible Options</h3>
          <p class="text-gray-600 text-sm">
            Choose comparison methods and specify which occurrence to keep
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📊</div>
          <h3 class="text-lg font-semibold mb-2">Detailed Stats</h3>
          <p class="text-gray-600 text-sm">
            Get comprehensive statistics about duplicates found and removed
          </p>
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

          <!-- Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">Deduplication Options</h4>

            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-32">Comparison Method:</label>
                <select
                  v-model="options.method"
                  @change="analyzeArray"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="deep">Deep Comparison (Entire Object)</option>
                  <option value="shallow">Shallow Comparison (Reference)</option>
                  <option value="field">Specific Field Comparison</option>
                  <option value="stringify">JSON String Comparison</option>
                </select>
              </div>

              <div v-if="options.method === 'field'" class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-32">Compare Field:</label>
                <input
                  v-model="options.compareField"
                  @input="analyzeArray"
                  type="text"
                  placeholder="Field name (e.g., id, email)"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-32">Keep Occurrence:</label>
                <select
                  v-model="options.keepOccurrence"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="first">First Occurrence</option>
                  <option value="last">Last Occurrence</option>
                </select>
              </div>

              <div class="grid grid-cols-1 gap-3">
                <label class="flex items-center">
                  <input
                    v-model="options.caseSensitive"
                    @change="analyzeArray"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Case Sensitive Comparison
                </label>

                <label class="flex items-center">
                  <input
                    v-model="options.showDuplicates"
                    @change="analyzeArray"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Show Found Duplicates
                </label>
              </div>
            </div>
          </div>

          <!-- Analysis Results -->
          <div v-if="analysisResults" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 class="font-medium text-blue-900 mb-2">Analysis Results:</h5>
            <div class="text-sm text-blue-800 space-y-1">
              <p>• Total elements: {{ analysisResults.total }}</p>
              <p>• Unique elements: {{ analysisResults.unique }}</p>
              <p>• Duplicates found: {{ analysisResults.duplicates }}</p>
              <p v-if="analysisResults.duplicates > 0">
                • Will remove: {{ analysisResults.toRemove }} elements
              </p>
            </div>
          </div>

          <button
            @click="deduplicateArray"
            :disabled="!inputJson.trim() || !isValidArray"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Remove Duplicates
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Deduplicated Array</h3>
            <div class="flex space-x-2">
              <button
                v-if="deduplicatedOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Copy
              </button>
              <button
                v-if="deduplicatedOutput"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          <div
            v-if="!deduplicatedOutput && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">🔍</div>
              <p>No results yet. Input a JSON array to remove duplicates.</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">Error</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="deduplicatedOutput && !error" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">Deduplication Complete</p>
                  <p class="text-sm text-green-600">{{ deduplicationStats }}</p>
                </div>
              </div>
            </div>

            <!-- Show found duplicates if enabled -->
            <div
              v-if="options.showDuplicates && foundDuplicates.length > 0"
              class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
            >
              <h5 class="font-medium text-yellow-900 mb-2">Found Duplicates:</h5>
              <div class="max-h-32 overflow-y-auto">
                <pre class="text-xs text-yellow-800">{{
                  JSON.stringify(foundDuplicates, null, 2)
                }}</pre>
              </div>
            </div>

            <textarea
              :value="deduplicatedOutput"
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
import { useToast } from '@/composables/useToast'

const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const inputJson = ref('')
const deduplicatedOutput = ref('')
const error = ref('')
const isValidArray = ref(false)
const analysisResults = ref<any>(null)
const deduplicationStats = ref('')
const foundDuplicates = ref<any[]>([])

const options = reactive({
  method: 'deep',
  compareField: '',
  keepOccurrence: 'first',
  caseSensitive: true,
  showDuplicates: false,
})

function loadExample() {
  inputJson.value = JSON.stringify(
    [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' },
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 3, name: 'Bob', email: 'bob@example.com' },
      { id: 2, name: 'Jane', email: 'jane@different.com' },
      { id: 4, name: 'Alice', email: 'alice@example.com' },
      { id: 3, name: 'Bob', email: 'bob@example.com' },
    ],
    null,
    2,
  )
  analyzeArray()
}

function clearInput() {
  inputJson.value = ''
  deduplicatedOutput.value = ''
  error.value = ''
  isValidArray.value = false
  analysisResults.value = null
  deduplicationStats.value = ''
  foundDuplicates.value = []
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true

  if (obj1 == null || obj2 == null) return false
  if (typeof obj1 !== typeof obj2) return false

  if (typeof obj1 !== 'object') {
    return options.caseSensitive
      ? obj1 === obj2
      : String(obj1).toLowerCase() === String(obj2).toLowerCase()
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

function getCompareValue(item: any): any {
  switch (options.method) {
    case 'field':
      const value = item[options.compareField]
      return options.caseSensitive ? value : String(value || '').toLowerCase()
    case 'stringify':
      return JSON.stringify(item)
    case 'shallow':
      return item
    case 'deep':
    default:
      return item
  }
}

function isDuplicate(item1: any, item2: any): boolean {
  switch (options.method) {
    case 'field':
      const val1 = getCompareValue(item1)
      const val2 = getCompareValue(item2)
      return val1 === val2
    case 'stringify':
      return JSON.stringify(item1) === JSON.stringify(item2)
    case 'shallow':
      return item1 === item2
    case 'deep':
    default:
      return deepEqual(item1, item2)
  }
}

function analyzeArray() {
  error.value = ''
  isValidArray.value = false
  analysisResults.value = null

  if (!inputJson.value.trim()) {
    return
  }

  try {
    const data = JSON.parse(inputJson.value)

    if (!Array.isArray(data)) {
      error.value = 'Input must be a JSON array'
      return
    }

    isValidArray.value = true

    // Analyze duplicates
    const duplicateIndices = new Set<number>()
    const seen = new Map<any, number>()

    data.forEach((item, index) => {
      const compareValue = getCompareValue(item)

      if (options.method === 'deep') {
        // For deep comparison, check against all previous items
        for (let i = 0; i < index; i++) {
          if (isDuplicate(item, data[i])) {
            if (options.keepOccurrence === 'first') {
              duplicateIndices.add(index)
            } else {
              duplicateIndices.add(i)
            }
            break
          }
        }
      } else {
        // For other methods, use Map for efficiency
        if (seen.has(compareValue)) {
          if (options.keepOccurrence === 'first') {
            duplicateIndices.add(index)
          } else {
            duplicateIndices.add(seen.get(compareValue)!)
            seen.set(compareValue, index)
          }
        } else {
          seen.set(compareValue, index)
        }
      }
    })

    const uniqueCount = data.length - duplicateIndices.size

    analysisResults.value = {
      total: data.length,
      unique: uniqueCount,
      duplicates: duplicateIndices.size,
      toRemove: duplicateIndices.size,
    }
  } catch (err: any) {
    error.value = 'Invalid JSON format: ' + err.message
  }
}

function deduplicateArray() {
  try {
    if (!inputJson.value.trim()) {
      showError('Please provide a JSON array to deduplicate')
      return
    }

    const data = JSON.parse(inputJson.value)

    if (!Array.isArray(data)) {
      showError('Input must be a JSON array')
      return
    }

    if (options.method === 'field' && !options.compareField.trim()) {
      showError('Please specify a field name for field comparison')
      return
    }

    const duplicates: any[] = []
    const result: any[] = []
    const duplicateIndices = new Set<number>()
    const seen = new Map<any, number>()

    // Find duplicates
    data.forEach((item, index) => {
      let isDupe = false

      if (options.method === 'deep') {
        // Deep comparison
        for (let i = 0; i < index; i++) {
          if (!duplicateIndices.has(i) && isDuplicate(item, data[i])) {
            isDupe = true
            duplicates.push(item)
            if (options.keepOccurrence === 'first') {
              duplicateIndices.add(index)
            } else {
              duplicateIndices.add(i)
              result[i] = item // Replace with newer occurrence
            }
            break
          }
        }
      } else {
        // Other comparison methods
        const compareValue = getCompareValue(item)
        if (seen.has(compareValue)) {
          isDupe = true
          duplicates.push(item)
          if (options.keepOccurrence === 'first') {
            duplicateIndices.add(index)
          } else {
            const prevIndex = seen.get(compareValue)!
            duplicateIndices.add(prevIndex)
            seen.set(compareValue, index)
          }
        } else {
          seen.set(compareValue, index)
        }
      }

      if (!isDupe) {
        result.push(item)
      }
    })

    // Filter out duplicates based on indices
    const finalResult = data.filter((_, index) => !duplicateIndices.has(index))

    deduplicatedOutput.value = JSON.stringify(finalResult, null, 2)
    foundDuplicates.value = duplicates

    // Generate stats
    const originalCount = data.length
    const finalCount = finalResult.length
    const removedCount = originalCount - finalCount
    const methodName = options.method.charAt(0).toUpperCase() + options.method.slice(1)

    deduplicationStats.value = `Removed ${removedCount} duplicates using ${methodName} comparison. ${finalCount} unique elements remain.`

    success('Array deduplicated successfully!')
  } catch (err: any) {
    showError('Failed to deduplicate array: ' + err.message)
  }
}

function copyToClipboard() {
  if (!deduplicatedOutput.value) return

  navigator.clipboard
    .writeText(deduplicatedOutput.value)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function downloadJson() {
  if (!deduplicatedOutput.value) return

  const blob = new Blob([deduplicatedOutput.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `deduplicated_array_${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
