<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('tools.jsonMissingKeyFinder.title') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('tools.jsonMissingKeyFinder.description') }}
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔍</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonMissingKeyFinder.features.keyAnalysis.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonMissingKeyFinder.features.keyAnalysis.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📈</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonMissingKeyFinder.features.detailedReport.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonMissingKeyFinder.features.detailedReport.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonMissingKeyFinder.features.exportResults.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonMissingKeyFinder.features.exportResults.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonMissingKeyFinder.inputTitle') }}
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
            :placeholder="$t('tools.jsonMissingKeyFinder.inputPlaceholder')"
            class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="analyzeKeys"
          ></textarea>

          <!-- Analysis Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">
              {{ $t('tools.jsonMissingKeyFinder.analysisOptions') }}
            </h4>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="options.ignoreNullValues"
                  @change="analyzeKeys"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonMissingKeyFinder.ignoreNullValues') }}
              </label>
              <label class="flex items-center">
                <input
                  v-model="options.deepAnalysis"
                  @change="analyzeKeys"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonMissingKeyFinder.deepAnalysis') }}
              </label>
              <label class="flex items-center">
                <input
                  v-model="options.caseSensitive"
                  @change="analyzeKeys"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonMissingKeyFinder.caseSensitive') }}
              </label>
            </div>
          </div>

          <button
            @click="analyzeKeys"
            :disabled="!inputJson.trim() || !isValidArray"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ $t('tools.jsonMissingKeyFinder.analyzeButton') }}
          </button>
        </div>

        <!-- Results Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonMissingKeyFinder.analysisResults') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="analysisResults"
                @click="copyResults"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="analysisResults"
                @click="downloadResults"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!analysisResults && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">🔍</div>
              <p>{{ $t('tools.jsonMissingKeyFinder.noResults') }}</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">{{ $t('toast.error') }}</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="analysisResults && !error" class="space-y-4 max-h-80 overflow-y-auto">
            <!-- Summary -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 class="font-medium text-blue-900 mb-2">{{ $t('common.statistics') }}:</h5>
              <div class="text-sm text-blue-800 space-y-1">
                <p>
                  • {{ $t('tools.jsonMissingKeyFinder.totalObjects') }}:
                  {{ analysisResults.totalObjects }}
                </p>
                <p>
                  • {{ $t('tools.jsonMissingKeyFinder.uniqueKeys') }}:
                  {{ analysisResults.allKeys.length }}
                </p>
                <p>
                  • {{ $t('tools.jsonMissingKeyFinder.objectsWithMissing') }}:
                  {{ analysisResults.objectsWithMissingKeys }}
                </p>
              </div>
            </div>

            <!-- Missing Keys Report -->
            <div v-if="analysisResults.missingKeysReport.length > 0">
              <h5 class="font-medium text-gray-900 mb-2">
                {{ $t('tools.jsonMissingKeyFinder.missingKeysReport') }}:
              </h5>
              <div class="space-y-2 max-h-60 overflow-y-auto">
                <div
                  v-for="(report, index) in analysisResults.missingKeysReport"
                  :key="index"
                  class="bg-yellow-50 border border-yellow-200 rounded p-3"
                >
                  <p class="font-medium text-yellow-900">
                    {{ $t('common.items') }} {{ index + 1 }}:
                  </p>
                  <p class="text-sm text-yellow-800">
                    {{ $t('common.found') }}: {{ report.missingKeys.join(', ') }}
                  </p>
                </div>
              </div>
            </div>
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

interface AnalysisOptions {
  ignoreNullValues: boolean
  deepAnalysis: boolean
  caseSensitive: boolean
}

const { success, copySuccess } = useToast()

const inputJson = ref('')
const error = ref('')
const isValidArray = ref(false)

interface MissingKeyReport {
  missingKeys: string[]
}

interface AnalysisResults {
  totalObjects: number
  allKeys: string[]
  keyStatistics: Record<string, number>
  missingKeysReport: MissingKeyReport[]
  objectsWithMissingKeys: number
}

const analysisResults = ref<AnalysisResults | null>(null)

const options = ref<AnalysisOptions>({
  ignoreNullValues: false,
  deepAnalysis: false,
  caseSensitive: false,
})

function loadExample() {
  const example = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane' },
    { id: 3, age: 25, email: 'test@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
  ]
  inputJson.value = JSON.stringify(example, null, 2)
  analyzeKeys()
}

function clearInput() {
  inputJson.value = ''
  error.value = ''
  isValidArray.value = false
  analysisResults.value = null
}

function analyzeKeys() {
  error.value = ''
  analysisResults.value = null

  if (!inputJson.value.trim()) {
    isValidArray.value = false
    return
  }

  try {
    const parsed = JSON.parse(inputJson.value)

    if (!Array.isArray(parsed)) {
      throw new Error(t('tools.jsonMissingKeyFinder.errors.invalidArray'))
    }

    isValidArray.value = true

    // Find all unique keys across all objects
    const allKeys = new Set<string>()
    parsed.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach((key) => {
          allKeys.add(key)
        })
      }
    })

    // Find missing keys for each object
    const missingKeysReport: MissingKeyReport[] = []
    let objectsWithMissingKeys = 0

    parsed.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        const itemKeys = Object.keys(item)
        const missingKeys: string[] = []

        allKeys.forEach((key) => {
          if (!itemKeys.includes(key)) {
            missingKeys.push(key)
          }
        })

        if (missingKeys.length > 0) {
          objectsWithMissingKeys++
        }

        missingKeysReport.push({ missingKeys })
      }
    })

    analysisResults.value = {
      totalObjects: parsed.length,
      allKeys: Array.from(allKeys),
      keyStatistics: {}, // Would be populated with actual statistics
      missingKeysReport,
      objectsWithMissingKeys,
    }
  } catch (e) {
    error.value = t('tools.jsonMissingKeyFinder.errors.invalidJson') + ' ' + (e as Error).message
    isValidArray.value = false
  }
}

function copyResults() {
  if (analysisResults.value) {
    const resultText = JSON.stringify(analysisResults.value, null, 2)
    navigator.clipboard.writeText(resultText)
    copySuccess()
  }
}

function downloadResults() {
  if (analysisResults.value) {
    const resultText = JSON.stringify(analysisResults.value, null, 2)
    const blob = new Blob([resultText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'missing-keys-analysis.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success(t('toast.downloadSuccess'))
  }
}
</script>
