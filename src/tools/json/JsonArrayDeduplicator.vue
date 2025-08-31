<template>
  <ToolLayout
    :title="$t('tools.jsonArrayDeduplicator.title')"
    :description="$t('tools.jsonArrayDeduplicator.description')"
    icon="🔍"
    :features="[
      $t('tools.jsonArrayDeduplicator.features.smartDetection.title'),
      $t('tools.jsonArrayDeduplicator.features.flexibleOptions.title'),
      $t('tools.jsonArrayDeduplicator.features.detailedStats.title'),
    ]"
  >
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Input Section -->
      <div class="glass rounded-xl border border-slate-700/30 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.jsonArrayDeduplicator.inputTitle') }}
          </h3>
          <div class="flex space-x-2">
            <button
              @click="loadExample"
              class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/30 hover:border-slate-500/50"
            >
              {{ $t('common.loadExample') }}
            </button>
            <button
              @click="clearInput"
              class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/30 hover:border-slate-500/50"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <textarea
          v-model="inputJson"
          :placeholder="$t('tools.jsonArrayDeduplicator.inputPlaceholder')"
          class="w-full h-64 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono text-sm text-slate-100 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          @input="analyzeArray"
        ></textarea>

        <!-- Options -->
        <div class="mt-6 space-y-5">
          <h4 class="font-medium text-slate-200">
            {{ $t('tools.jsonArrayDeduplicator.deduplicationOptions') }}
          </h4>

          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label class="text-sm font-medium text-slate-300 min-w-[120px]"
                >{{ $t('tools.jsonArrayDeduplicator.comparisonMethod') }}:</label
              >
              <select
                v-model="options.method"
                @change="analyzeArray"
                class="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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

            <div
              v-if="options.method === 'field'"
              class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
            >
              <label class="text-sm font-medium text-slate-300 min-w-[120px]"
                >{{ $t('tools.jsonArrayDeduplicator.compareField') }}:</label
              >
              <input
                v-model="options.compareField"
                @input="analyzeArray"
                type="text"
                :placeholder="$t('tools.jsonArrayDeduplicator.compareField')"
                class="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label class="text-sm font-medium text-slate-300 min-w-[120px]"
                >{{ $t('tools.jsonArrayDeduplicator.keepOccurrence') }}:</label
              >
              <select
                v-model="options.keepOccurrence"
                class="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="first">
                  {{ $t('tools.jsonArrayDeduplicator.firstOccurrence') }}
                </option>
                <option value="last">
                  {{ $t('tools.jsonArrayDeduplicator.lastOccurrence') }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 gap-3 pt-2">
              <label class="flex items-center">
                <input
                  v-model="options.caseSensitive"
                  @change="analyzeArray"
                  type="checkbox"
                  class="mr-3 h-4 w-4 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                />
                <span class="text-sm text-slate-300">
                  {{ $t('tools.jsonArrayDeduplicator.caseSensitive') }}
                </span>
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.showDuplicates"
                  @change="analyzeArray"
                  type="checkbox"
                  class="mr-3 h-4 w-4 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                />
                <span class="text-sm text-slate-300">
                  {{ $t('tools.jsonArrayDeduplicator.showDuplicates') }}
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Analysis Results -->
        <div
          v-if="analysisResults"
          class="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
        >
          <h5 class="font-medium text-blue-300 mb-3">
            {{ $t('tools.jsonArrayDeduplicator.analysisResults') }}:
          </h5>
          <div class="text-sm text-blue-400 space-y-1">
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
              • {{ $t('tools.jsonArrayDeduplicator.willRemove') }}: {{ analysisResults.toRemove }}
              {{ $t('common.items') }}
            </p>
          </div>
        </div>

        <button
          @click="deduplicateArray"
          :disabled="!inputJson.trim() || !isValidArray"
          class="w-full mt-6 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {{ $t('tools.jsonArrayDeduplicator.deduplicateButton') }}
        </button>
      </div>

      <!-- Output Section -->
      <div class="glass rounded-xl border border-slate-700/30 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.jsonArrayDeduplicator.deduplicatedArray') }}
          </h3>
          <div class="flex space-x-2">
            <button
              v-if="deduplicatedOutput"
              @click="copyToClipboard"
              class="px-3 py-1 text-sm bg-blue-500/10 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/30 hover:border-blue-500/50"
            >
              {{ $t('common.copy') }}
            </button>
            <button
              v-if="deduplicatedOutput"
              @click="downloadJson"
              class="px-3 py-1 text-sm bg-green-500/10 text-green-300 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30 hover:border-green-500/50"
            >
              {{ $t('common.download') }}
            </button>
          </div>
        </div>

        <div
          v-if="!deduplicatedOutput && !error"
          class="h-80 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-lg"
        >
          <div class="text-center">
            <div class="text-3xl mb-2">🔍</div>
            <p>{{ $t('tools.jsonArrayDeduplicator.noResults') }}</p>
          </div>
        </div>

        <div v-if="error" class="h-80 flex items-center justify-center">
          <div class="text-center text-red-400">
            <div class="text-3xl mb-2">❌</div>
            <p class="font-medium">{{ $t('toast.error') }}</p>
            <p class="text-sm mt-1">{{ error }}</p>
          </div>
        </div>

        <div v-if="deduplicatedOutput && !error" class="space-y-4">
          <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div class="flex items-center">
              <div class="text-green-400 text-2xl mr-3">✅</div>
              <div>
                <p class="font-medium text-green-300">
                  {{ $t('tools.jsonArrayDeduplicator.deduplicationComplete') }}
                </p>
                <p class="text-sm text-green-400">{{ deduplicationStats }}</p>
              </div>
            </div>
          </div>

          <textarea
            :value="deduplicatedOutput"
            readonly
            class="w-full h-80 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono text-sm text-slate-100 resize-none"
          ></textarea>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
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

// Use showError when displaying error messages
function showErrorToast(message: string) {
  showError(message)
}

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

// Define a type for JSON values
type JsonValue = string | number | boolean | null | JsonArray | JsonObject
interface JsonObject {
  [key: string]: JsonValue
}
type JsonArray = JsonValue[]

function loadExample() {
  const example: JsonObject[] = [
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
    const parsed: JsonValue = JSON.parse(inputJson.value)

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
    const errorMessage =
      t('tools.jsonArrayDeduplicator.errors.invalidJson') + ' ' + (e as Error).message
    error.value = errorMessage
    showErrorToast(errorMessage)
    isValidArray.value = false
  }
}

function deduplicateArray() {
  if (!isValidArray.value) return

  try {
    const parsed: JsonArray = JSON.parse(inputJson.value)
    let result: JsonArray = []
    let removedCount = 0

    switch (options.value.method) {
      case 'deep':
        const seen = new Set()
        result = parsed.filter((item) => {
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
        result = parsed.filter((item, index) => {
          const firstIndex = parsed.findIndex((other) => other === item)
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
          result = parsed.filter((item) => {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) {
              return true
            }

            const obj = item as JsonObject
            const value = obj[options.value.compareField]
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
        result = parsed.filter((item) => {
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
    const errorMessage =
      t('tools.jsonArrayDeduplicator.errors.invalidJson') + ' ' + (e as Error).message
    error.value = errorMessage
    showErrorToast(errorMessage)
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
