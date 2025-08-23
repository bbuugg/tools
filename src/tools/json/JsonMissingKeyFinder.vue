<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">JSON Missing Key Finder</h1>
        <p class="text-gray-600">Find missing keys across JSON objects in arrays and detect inconsistencies</p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔍</div>
          <h3 class="text-lg font-semibold mb-2">Key Analysis</h3>
          <p class="text-gray-600 text-sm">Analyze all objects to find missing keys and inconsistencies</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📈</div>
          <h3 class="text-lg font-semibold mb-2">Detailed Report</h3>
          <p class="text-gray-600 text-sm">Get comprehensive reports on missing keys per object</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">Export Results</h3>
          <p class="text-gray-600 text-sm">Export findings and generate complete object templates</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Input JSON Array</h3>
            <div class="flex space-x-2">
              <button @click="loadExample" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">Load Example</button>
              <button @click="clearInput" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">Clear</button>
            </div>
          </div>

          <textarea v-model="inputJson" placeholder="Paste your JSON array here..." class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @input="analyzeKeys"></textarea>

          <!-- Analysis Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">Analysis Options</h4>
            <div class="space-y-3">
              <label class="flex items-center">
                <input v-model="options.ignoreNullValues" @change="analyzeKeys" type="checkbox" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Ignore Null Values
              </label>
              <label class="flex items-center">
                <input v-model="options.deepAnalysis" @change="analyzeKeys" type="checkbox" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Deep Analysis (Nested Objects)
              </label>
              <label class="flex items-center">
                <input v-model="options.caseSensitive" @change="analyzeKeys" type="checkbox" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Case Sensitive Key Comparison
              </label>
            </div>
          </div>

          <button @click="analyzeKeys" :disabled="!inputJson.trim() || !isValidArray" class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">Analyze Missing Keys</button>
        </div>

        <!-- Results Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Analysis Results</h3>
            <div class="flex space-x-2">
              <button v-if="analysisResults" @click="copyResults" class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Copy</button>
              <button v-if="analysisResults" @click="downloadResults" class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">Download</button>
            </div>
          </div>

          <div v-if="!analysisResults && !error" class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <div class="text-center">
              <div class="text-3xl mb-2">🔍</div>
              <p>No analysis yet. Input a JSON array to find missing keys.</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">Error</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="analysisResults && !error" class="space-y-4 max-h-80 overflow-y-auto">
            <!-- Summary -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 class="font-medium text-blue-900 mb-2">Summary:</h5>
              <div class="text-sm text-blue-800 space-y-1">
                <p>• Total objects: {{ analysisResults.totalObjects }}</p>
                <p>• Unique keys found: {{ analysisResults.allKeys.length }}</p>
                <p>• Objects with missing keys: {{ analysisResults.objectsWithMissingKeys }}</p>
              </div>
            </div>

            <!-- Missing Keys Report -->
            <div v-if="analysisResults.missingKeysReport.length > 0">
              <h5 class="font-medium text-gray-900 mb-2">Missing Keys by Object:</h5>
              <div class="space-y-2 max-h-60 overflow-y-auto">
                <div v-for="(report, index) in analysisResults.missingKeysReport" :key="index" class="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p class="font-medium text-yellow-900">Object {{ index + 1 }}:</p>
                  <p class="text-sm text-yellow-800">Missing: {{ report.missingKeys.join(', ') }}</p>
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

interface AnalysisOptions {
  ignoreNullValues: boolean
  deepAnalysis: boolean
  caseSensitive: boolean
}

const { success, copySuccess } = useToast()

const inputJson = ref('')
const error = ref('')
const isValidArray = ref(false)
interface AnalysisResults {
  totalObjects: number
  allKeys: string[]
  keyStatistics: Record<string, number>
  missingKeysReport: MissingKeyReport[]
  objectsWithMissingKeys: number
  completeTemplate: Record<string, unknown>
}

interface MissingKeyReport {
  index: number
  missingKeys: string[]
  hasKeys: string[]
  missingCount: number
}

const analysisResults = ref<AnalysisResults | null>(null)

const options = ref<AnalysisOptions>({
  ignoreNullValues: true,
  deepAnalysis: false,
  caseSensitive: true
})

function loadExample() {
  const example = [
    { id: 1, name: "Alice", email: "alice@example.com", age: 25 },
    { id: 2, name: "Bob", phone: "+1-555-0123", age: 30 },
    { id: 3, name: "Charlie", email: "charlie@example.com", department: "Engineering" },
    { name: "Diana", email: "diana@example.com", age: 28, phone: "+1-555-0456" }
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
      error.value = 'Input must be a JSON array'
      isValidArray.value = false
      return
    }

    if (parsed.length === 0) {
      error.value = 'JSON array cannot be empty'
      isValidArray.value = false
      return
    }

    isValidArray.value = true
    
    // Perform analysis
    const results = performKeyAnalysis(parsed)
    analysisResults.value = results
    
    const missingCount = results.objectsWithMissingKeys
    if (missingCount === 0) {
      success('All objects have consistent keys!')
    } else {
      success(`Analysis complete! Found ${missingCount} objects with missing keys.`)
    }
  } catch {
    error.value = 'Invalid JSON format'
    isValidArray.value = false
  }
}

function performKeyAnalysis(array: unknown[]): AnalysisResults {
  // Collect all unique keys
  const allKeys = new Set<string>()
  const keyStats: Record<string, number> = {}
  
  array.forEach(obj => {
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        if (!options.value.ignoreNullValues || obj[key] !== null) {
          const keyToUse = options.value.caseSensitive ? key : key.toLowerCase()
          allKeys.add(keyToUse)
          keyStats[keyToUse] = (keyStats[keyToUse] || 0) + 1
        }
      })
    }
  })
  
  const allKeysArray = Array.from(allKeys)
  
  // Find missing keys for each object
  const missingKeysReport: MissingKeyReport[] = []
  let objectsWithMissingKeys = 0
  
  array.forEach((obj, index) => {
    if (typeof obj === 'object' && obj !== null) {
      const objectKeys = Object.keys(obj)
        .filter(key => !options.value.ignoreNullValues || obj[key] !== null)
        .map(key => options.value.caseSensitive ? key : key.toLowerCase())
      
      const missingKeys = allKeysArray.filter(key => !objectKeys.includes(key))
      
      if (missingKeys.length > 0) {
        objectsWithMissingKeys++
        missingKeysReport.push({
          index,
          missingKeys,
          hasKeys: objectKeys,
          missingCount: missingKeys.length
        })
      }
    }
  })
  
  return {
    totalObjects: array.length,
    allKeys: allKeysArray,
    keyStatistics: keyStats,
    missingKeysReport,
    objectsWithMissingKeys,
    completeTemplate: createCompleteTemplate(allKeysArray)
  }
}

function createCompleteTemplate(keys: string[]) {
  const template: Record<string, unknown> = {}
  keys.forEach(key => {
    template[key] = null
  })
  return template
}

function copyResults() {
  if (analysisResults.value) {
    const report = {
      summary: {
        totalObjects: analysisResults.value.totalObjects,
        uniqueKeys: analysisResults.value.allKeys.length,
        objectsWithMissingKeys: analysisResults.value.objectsWithMissingKeys
      },
      allKeys: analysisResults.value.allKeys,
      missingKeysReport: analysisResults.value.missingKeysReport,
      completeTemplate: analysisResults.value.completeTemplate
    }
    
    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
    copySuccess()
  }
}

function downloadResults() {
  if (analysisResults.value) {
    const report = {
      analysis: 'JSON Missing Keys Report',
      timestamp: new Date().toISOString(),
      summary: {
        totalObjects: analysisResults.value.totalObjects,
        uniqueKeys: analysisResults.value.allKeys.length,
        objectsWithMissingKeys: analysisResults.value.objectsWithMissingKeys
      },
      allKeys: analysisResults.value.allKeys,
      missingKeysReport: analysisResults.value.missingKeysReport,
      completeTemplate: analysisResults.value.completeTemplate
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'missing-keys-analysis.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Analysis report downloaded successfully!')
  }
}
</script>