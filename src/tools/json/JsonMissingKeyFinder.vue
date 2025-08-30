<template>
  <ToolLayout
    :title="$t('tools.jsonMissingKeyFinder.title')"
    :description="$t('tools.jsonMissingKeyFinder.description')"
    icon="🔍"
    :features="[
      $t('tools.jsonMissingKeyFinder.features.keyAnalysis.title'),
      $t('tools.jsonMissingKeyFinder.features.detailedReport.title'),
      $t('tools.jsonMissingKeyFinder.features.exportResults.title'),
    ]"
  >
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Input Section -->
      <div class="glass rounded-xl border border-slate-700/30 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.jsonMissingKeyFinder.inputTitle') }}
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

        <textarea
          v-model="inputJson"
          :placeholder="$t('tools.jsonMissingKeyFinder.inputPlaceholder')"
          class="w-full h-64 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono text-sm text-slate-100 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          @input="analyzeKeys"
        ></textarea>

        <!-- Analysis Options -->
        <div class="mt-4 space-y-4">
          <h4 class="font-medium text-slate-100">
            {{ $t('tools.jsonMissingKeyFinder.analysisOptions') }}
          </h4>
          <div class="space-y-3">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="options.ignoreNullValues"
                @change="analyzeKeys"
                type="checkbox"
                class="mr-3 h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
              />
              <span class="text-slate-300">{{
                $t('tools.jsonMissingKeyFinder.ignoreNullValues')
              }}</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                v-model="options.deepAnalysis"
                @change="analyzeKeys"
                type="checkbox"
                class="mr-3 h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
              />
              <span class="text-slate-300">{{
                $t('tools.jsonMissingKeyFinder.deepAnalysis')
              }}</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                v-model="options.caseSensitive"
                @change="analyzeKeys"
                type="checkbox"
                class="mr-3 h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
              />
              <span class="text-slate-300">{{
                $t('tools.jsonMissingKeyFinder.caseSensitive')
              }}</span>
            </label>
          </div>
        </div>

        <button
          @click="analyzeKeys"
          :disabled="!inputJson.trim() || !isValidArray"
          class="w-full mt-4 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all duration-200 font-medium hover-lift"
        >
          {{ $t('tools.jsonMissingKeyFinder.analyzeButton') }}
        </button>
      </div>

      <!-- Results Section -->
      <div class="glass rounded-xl border border-slate-700/30 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.jsonMissingKeyFinder.analysisResults') }}
          </h3>
          <div class="flex space-x-2">
            <button
              v-if="analysisResults"
              @click="copyResults"
              class="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 hover:text-blue-300 transition-all duration-200 cursor-pointer hover-lift"
            >
              {{ $t('common.copy') }}
            </button>
            <button
              v-if="analysisResults"
              @click="downloadResults"
              class="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 hover:text-green-300 transition-all duration-200 cursor-pointer hover-lift"
            >
              {{ $t('common.download') }}
            </button>
          </div>
        </div>

        <div
          v-if="!analysisResults && !error"
          class="h-80 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-700/50 rounded-lg"
        >
          <div class="text-center">
            <div class="text-3xl mb-2">🔍</div>
            <p>{{ $t('tools.jsonMissingKeyFinder.noResults') }}</p>
          </div>
        </div>

        <div v-if="error" class="h-80 flex items-center justify-center">
          <div class="text-center text-red-400">
            <div class="text-3xl mb-2">❌</div>
            <p class="font-medium">{{ $t('toast.error') }}</p>
            <p class="text-sm mt-1">{{ error }}</p>
          </div>
        </div>

        <div v-if="analysisResults && !error" class="space-y-4 max-h-80 overflow-y-auto">
          <!-- Summary -->
          <div class="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
            <h5 class="font-medium text-primary-400 mb-2">{{ $t('common.statistics') }}:</h5>
            <div class="text-sm text-primary-300 space-y-1">
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
            <h5 class="font-medium text-slate-100 mb-2">
              {{ $t('tools.jsonMissingKeyFinder.missingKeysReport') }}:
            </h5>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              <div
                v-for="(report, index) in analysisResults.missingKeysReport"
                :key="index"
                class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3"
              >
                <p class="font-medium text-amber-400">{{ $t('common.items') }} {{ index + 1 }}:</p>
                <p class="text-sm text-amber-300 mt-1">
                  {{ $t('common.found') }}: {{ report.missingKeys.join(', ') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'
import ToolLayout from '@/components/ToolLayout.vue'

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
