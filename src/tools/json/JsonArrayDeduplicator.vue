<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('tools.jsonArrayDeduplicator.title') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('tools.jsonArrayDeduplicator.description') }}
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔍</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonArrayDeduplicator.features.smartDetection.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonArrayDeduplicator.features.smartDetection.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonArrayDeduplicator.features.flexibleOptions.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonArrayDeduplicator.features.flexibleOptions.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📊</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonArrayDeduplicator.features.detailedStats.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonArrayDeduplicator.features.detailedStats.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonArrayDeduplicator.inputTitle') }}
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
            :placeholder="$t('tools.jsonArrayDeduplicator.inputPlaceholder')"
            class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="analyzeArray"
          ></textarea>

          <!-- Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">
              {{ $t('tools.jsonArrayDeduplicator.deduplicationOptions') }}
            </h4>

            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-32"
                  >{{ $t('tools.jsonArrayDeduplicator.comparisonMethod') }}:</label
                >
                <select
                  v-model="options.method"
                  @change="analyzeArray"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="deep">
                    {{ $t('tools.jsonArrayDeduplicator.deepComparison') }}
                  </option>
                  <option value="shallow">
                    {{ $t('tools.jsonArrayDeduplicator.shallowComparison') }}
                  </option>
                  <option value="field">
                    {{ $t('tools.jsonArrayDeduplicator.fieldComparison') }}
                  </option>
                  <option value="stringify">
                    {{ $t('tools.jsonArrayDeduplicator.stringComparison') }}
                  </option>
                </select>
              </div>

              <div v-if="options.method === 'field'" class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-32"
                  >{{ $t('tools.jsonArrayDeduplicator.compareField') }}:</label
                >
                <input
                  v-model="options.compareField"
                  @input="analyzeArray"
                  type="text"
                  :placeholder="$t('tools.jsonArrayDeduplicator.compareField')"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-32"
                  >{{ $t('tools.jsonArrayDeduplicator.keepOccurrence') }}:</label
                >
                <select
                  v-model="options.keepOccurrence"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="first">
                    {{ $t('tools.jsonArrayDeduplicator.firstOccurrence') }}
                  </option>
                  <option value="last">
                    {{ $t('tools.jsonArrayDeduplicator.lastOccurrence') }}
                  </option>
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
                  {{ $t('tools.jsonArrayDeduplicator.caseSensitive') }}
                </label>

                <label class="flex items-center">
                  <input
                    v-model="options.showDuplicates"
                    @change="analyzeArray"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {{ $t('tools.jsonArrayDeduplicator.showDuplicates') }}
                </label>
              </div>
            </div>
          </div>

          <!-- Analysis Results -->
          <div v-if="analysisResults" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 class="font-medium text-blue-900 mb-2">
              {{ $t('tools.jsonArrayDeduplicator.analysisResults') }}:
            </h5>
            <div class="text-sm text-blue-800 space-y-1">
              <p>
                • {{ $t('tools.jsonArrayDeduplicator.totalElements') }}: {{ analysisResults.total }}
              </p>
              <p>
                • {{ $t('tools.jsonArrayDeduplicator.uniqueElements') }}:
                {{ analysisResults.unique }}
              </p>
              <p>
                • {{ $t('tools.jsonArrayDeduplicator.duplicatesFound') }}:
                {{ analysisResults.duplicates }}
              </p>
              <p v-if="analysisResults.duplicates > 0">
                • {{ $t('tools.jsonArrayDeduplicator.willRemove') }}:
                {{ analysisResults.toRemove }} {{ $t('common.items') }}
              </p>
            </div>
          </div>

          <button
            @click="deduplicateArray"
            :disabled="!inputJson.trim() || !isValidArray"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ $t('tools.jsonArrayDeduplicator.deduplicateButton') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonArrayDeduplicator.deduplicatedArray') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="deduplicatedOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="deduplicatedOutput"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!deduplicatedOutput && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">🔍</div>
              <p>{{ $t('tools.jsonArrayDeduplicator.noResults') }}</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">{{ $t('toast.error') }}</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="deduplicatedOutput && !error" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">
                    {{ $t('tools.jsonArrayDeduplicator.deduplicationComplete') }}
                  </p>
                  <p class="text-sm text-green-600">{{ deduplicationStats }}</p>
                </div>
              </div>
            </div>

            <textarea
              :value="deduplicatedOutput"
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

interface DeduplicationOptions {
  method: 'deep' | 'shallow' | 'field' | 'stringify'
  compareField: string
  keepOccurrence: 'first' | 'last'
  caseSensitive: boolean
  showDuplicates: boolean
}

const { success, error: showError, copySuccess } = useToast()

const inputJson = ref('')
const deduplicatedOutput = ref('')
const error = ref('')
const isValidArray = ref(false)
const deduplicationStats = ref('')

const options = ref<DeduplicationOptions>({
  method: 'deep',
  compareField: '',
  keepOccurrence: 'first',
  caseSensitive: true,
  showDuplicates: false,
})

interface AnalysisResults {
  total: number
  unique: number
  duplicates: number
  toRemove: number
}

const analysisResults = ref<AnalysisResults | null>(null)

function loadExample() {
  const example = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 1, name: 'John', age: 30 }, // duplicate
    { id: 3, name: 'Bob', age: 35 },
    { id: 2, name: 'Jane', age: 25 }, // duplicate
    { id: 4, name: 'Alice', age: 28 },
  ]
  inputJson.value = JSON.stringify(example, null, 2)
  analyzeArray()
}

function clearInput() {
  inputJson.value = ''
  deduplicatedOutput.value = ''
  error.value = ''
  isValidArray.value = false
  analysisResults.value = null
}

function analyzeArray() {
  error.value = ''
  analysisResults.value = null

  if (!inputJson.value.trim()) {
    isValidArray.value = false
    return
  }

  try {
    const parsed = JSON.parse(inputJson.value)

    if (!Array.isArray(parsed)) {
      throw new Error(t('tools.jsonArrayDeduplicator.errors.invalidArray'))
    }

    isValidArray.value = true

    // Simple analysis - count duplicates
    const total = parsed.length
    const uniqueSet = new Set(parsed.map((item) => JSON.stringify(item)))
    const unique = uniqueSet.size
    const duplicates = total - unique

    analysisResults.value = {
      total,
      unique,
      duplicates,
      toRemove: duplicates,
    }
  } catch (e) {
    error.value = t('tools.jsonArrayDeduplicator.errors.invalidJson') + ' ' + (e as Error).message
    isValidArray.value = false
  }
}

function deduplicateArray() {
  if (!isValidArray.value) return

  try {
    const parsed = JSON.parse(inputJson.value)
    let result: any[] = []
    let removedCount = 0

    switch (options.value.method) {
      case 'deep':
        const seen = new Set()
        result = parsed.filter((item: any) => {
          const key = JSON.stringify(item)
          if (seen.has(key)) {
            removedCount++
            return false
          }
          seen.add(key)
          return true
        })
        break

      case 'shallow':
        result = parsed.filter((item: any, index: number) => {
          const firstIndex = parsed.findIndex((other: any) => other === item)
          if (firstIndex !== index) {
            removedCount++
            return false
          }
          return true
        })
        break

      case 'field':
        if (options.value.compareField) {
          const seen = new Set()
          result = parsed.filter((item: any) => {
            const value = item[options.value.compareField]
            const key = options.value.caseSensitive ? String(value) : String(value).toLowerCase()
            if (seen.has(key)) {
              removedCount++
              return false
            }
            seen.add(key)
            return true
          })
        } else {
          result = [...parsed]
        }
        break

      case 'stringify':
        const seenStrings = new Set()
        result = parsed.filter((item: any) => {
          const key = JSON.stringify(item)
          if (seenStrings.has(key)) {
            removedCount++
            return false
          }
          seenStrings.add(key)
          return true
        })
        break
    }

    deduplicatedOutput.value = JSON.stringify(result, null, 2)
    deduplicationStats.value = `Removed ${removedCount} duplicate items`
    error.value = ''
    success(t('toast.success'))
  } catch (e) {
    error.value = t('tools.jsonArrayDeduplicator.errors.invalidJson') + ' ' + (e as Error).message
  }
}

function copyToClipboard() {
  if (deduplicatedOutput.value) {
    navigator.clipboard.writeText(deduplicatedOutput.value)
    copySuccess()
  }
}

function downloadJson() {
  if (deduplicatedOutput.value) {
    const blob = new Blob([deduplicatedOutput.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'deduplicated-array.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success(t('toast.downloadSuccess'))
  }
}
</script>
