<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('tools.jsonPathExtractor.title') }}
        </h1>
        <p class="text-gray-600">{{ $t('tools.jsonPathExtractor.description') }}</p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🎯</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonPathExtractor.features.pathExtraction.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonPathExtractor.features.pathExtraction.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔍</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonPathExtractor.features.filtering.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonPathExtractor.features.filtering.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📋</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonPathExtractor.features.export.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonPathExtractor.features.export.description') }}
          </p>
        </div>
      </div>

      <!-- JSONPath Syntax Guide -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-4">
          {{ $t('tools.jsonPathExtractor.syntaxGuide.title') }}
        </h3>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-blue-800 mb-3">
              {{ $t('tools.jsonPathExtractor.syntaxGuide.basicSyntax') }}
            </h4>
            <div class="space-y-2 text-sm">
              <div class="flex items-start">
                <code
                  class="bg-blue-100 px-2 py-1 rounded text-blue-800 font-mono mr-3 flex-shrink-0"
                  >$</code
                >
                <span class="text-blue-700">{{
                  $t('tools.jsonPathExtractor.syntaxGuide.rootSymbol')
                }}</span>
              </div>
              <div class="flex items-start">
                <code
                  class="bg-blue-100 px-2 py-1 rounded text-blue-800 font-mono mr-3 flex-shrink-0"
                  >.</code
                >
                <span class="text-blue-700">{{
                  $t('tools.jsonPathExtractor.syntaxGuide.dotNotation')
                }}</span>
              </div>
              <div class="flex items-start">
                <code
                  class="bg-blue-100 px-2 py-1 rounded text-blue-800 font-mono mr-3 flex-shrink-0"
                  >[]</code
                >
                <span class="text-blue-700">{{
                  $t('tools.jsonPathExtractor.syntaxGuide.bracketNotation')
                }}</span>
              </div>
              <div class="flex items-start">
                <code
                  class="bg-blue-100 px-2 py-1 rounded text-blue-800 font-mono mr-3 flex-shrink-0"
                  >*</code
                >
                <span class="text-blue-700">{{
                  $t('tools.jsonPathExtractor.syntaxGuide.wildcard')
                }}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 class="font-medium text-blue-800 mb-3">
              {{ $t('tools.jsonPathExtractor.syntaxGuide.examples') }}
            </h4>
            <div class="space-y-2 text-sm">
              <div class="bg-blue-100 p-2 rounded">
                <code class="text-blue-800 font-mono">$.store.book[0].title</code>
                <p class="text-blue-600 mt-1">
                  {{ $t('tools.jsonPathExtractor.syntaxGuide.exampleDesc1') }}
                </p>
              </div>
              <div class="bg-blue-100 p-2 rounded">
                <code class="text-blue-800 font-mono">$.store.book[*].author</code>
                <p class="text-blue-600 mt-1">
                  {{ $t('tools.jsonPathExtractor.syntaxGuide.exampleDesc2') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonPathExtractor.inputSection.title') }}
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

          <!-- JSON Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.jsonPathExtractor.inputSection.jsonData') }}
            </label>
            <textarea
              v-model="inputJson"
              :placeholder="$t('tools.jsonPathExtractor.inputSection.jsonPlaceholder')"
              class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="validateJson"
            ></textarea>

            <!-- JSON Validation Status -->
            <div v-if="jsonError" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center">
                <div class="text-red-600 text-lg mr-2">❌</div>
                <div>
                  <p class="font-medium text-red-800">
                    {{ $t('tools.jsonPathExtractor.errors.invalidJson') }}
                  </p>
                  <p class="text-sm text-red-600">{{ jsonError }}</p>
                </div>
              </div>
            </div>

            <div
              v-else-if="inputJson.trim() && isValidJson"
              class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div class="flex items-center">
                <div class="text-green-600 text-lg mr-2">✅</div>
                <p class="font-medium text-green-800">
                  {{ $t('tools.jsonPathExtractor.success.validJson') }}
                </p>
              </div>
            </div>
          </div>

          <!-- JSONPath Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.jsonPathExtractor.inputSection.jsonPath') }}
            </label>
            <div class="relative">
              <input
                v-model="jsonPath"
                type="text"
                :placeholder="$t('tools.jsonPathExtractor.inputSection.pathPlaceholder')"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @input="extractPath"
              />
              <button
                v-if="jsonPath"
                @click="clearPath"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Quick Path Buttons -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.jsonPathExtractor.inputSection.quickPaths') }}
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="quickPath in quickPaths"
                :key="quickPath.path"
                @click="setQuickPath(quickPath.path)"
                class="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-mono text-left"
              >
                <div class="font-medium">{{ quickPath.path }}</div>
                <div class="text-gray-500 mt-1">
                  {{ $t(`tools.jsonPathExtractor.quickPaths.${quickPath.key}`) }}
                </div>
              </button>
            </div>
          </div>

          <!-- Extract Button -->
          <button
            @click="extractPath"
            :disabled="!inputJson.trim() || !isValidJson || !jsonPath.trim()"
            class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ $t('tools.jsonPathExtractor.extractButton') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonPathExtractor.outputSection.title') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="extractedData !== null"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="extractedData !== null"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <!-- No Results State -->
          <div
            v-if="extractedData === null"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">🎯</div>
              <p>{{ $t('tools.jsonPathExtractor.outputSection.noResults') }}</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="pathError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <div class="text-red-600 text-2xl mr-3">⚠️</div>
              <div>
                <p class="font-medium text-red-800">
                  {{ $t('tools.jsonPathExtractor.errors.pathError') }}
                </p>
                <p class="text-sm text-red-600 mt-1">{{ pathError }}</p>
              </div>
            </div>
          </div>

          <!-- Success State -->
          <div v-else class="space-y-4">
            <!-- Results Info -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="text-green-600 text-2xl mr-3">✅</div>
                  <div>
                    <p class="font-medium text-green-800">
                      {{ $t('tools.jsonPathExtractor.success.extracted') }}
                    </p>
                    <p class="text-sm text-green-600">{{ resultsInfo }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Extracted Data -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">
                {{ $t('tools.jsonPathExtractor.outputSection.extractedData') }}
              </h4>
              <pre
                class="bg-white border border-gray-200 rounded p-4 text-sm overflow-auto max-h-80 font-mono"
                >{{ formattedOutput }}</pre
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '../../composables/useToast'
import { useI18n } from 'vue-i18n'
import { JSONPath } from 'jsonpath-plus'

const { t } = useI18n()
const { success, error } = useToast()

// Reactive state
const inputJson = ref('')
const jsonPath = ref('')
const extractedData = ref<unknown>(null)
const jsonError = ref('')
const pathError = ref('')
const isValidJson = ref(false)
const parsedJson = ref<Record<string, unknown> | Array<unknown> | null>(null)

// Quick path templates
const quickPaths = ref([
  { key: 'root', path: '$' },
  { key: 'allProperties', path: '$.*' },
  { key: 'firstArrayItem', path: '$[0]' },
  { key: 'allArrayItems', path: '$[*]' },
  { key: 'lastArrayItem', path: '$[-1]' },
  { key: 'arraySlice', path: '$[0:3]' },
])

// Computed properties
const formattedOutput = computed(() => {
  if (extractedData.value === null) return ''

  try {
    return JSON.stringify(extractedData.value, null, 2)
  } catch {
    return String(extractedData.value)
  }
})

const resultsInfo = computed(() => {
  if (extractedData.value === null) return ''

  if (Array.isArray(extractedData.value)) {
    return t('tools.jsonPathExtractor.success.arrayResults', { count: extractedData.value.length })
  } else if (typeof extractedData.value === 'object' && extractedData.value !== null) {
    const keys = Object.keys(extractedData.value)
    return t('tools.jsonPathExtractor.success.objectResults', { count: keys.length })
  } else {
    return t('tools.jsonPathExtractor.success.primitiveResult', {
      type: typeof extractedData.value,
    })
  }
})

// JSON validation function
function validateJson() {
  jsonError.value = ''
  isValidJson.value = false
  parsedJson.value = null

  if (!inputJson.value.trim()) {
    return
  }

  try {
    parsedJson.value = JSON.parse(inputJson.value)
    isValidJson.value = true

    // Auto-extract if path is already set
    if (jsonPath.value.trim()) {
      extractPath()
    }
  } catch (e) {
    jsonError.value = e instanceof Error ? e.message : String(e)
    isValidJson.value = false
    extractedData.value = null
  }
}

// JSONPath extraction function
function extractPath() {
  pathError.value = ''
  extractedData.value = null

  if (!parsedJson.value || !jsonPath.value.trim()) {
    return
  }

  try {
    // Use jsonpath-plus to extract data
    const results = JSONPath({ path: jsonPath.value, json: parsedJson.value, wrap: false })

    // Handle different result types
    if (results === undefined) {
      extractedData.value = []
      pathError.value = t('tools.jsonPathExtractor.errors.noMatches')
    } else {
      extractedData.value = results
    }
  } catch (e) {
    pathError.value = e instanceof Error ? e.message : String(e)
    extractedData.value = null
  }
}

// Utility functions
function loadExample() {
  inputJson.value = JSON.stringify(
    {
      store: {
        book: [
          {
            category: 'reference',
            author: 'Nigel Rees',
            title: 'Sayings of the Century',
            price: 8.95,
          },
          {
            category: 'fiction',
            author: 'Evelyn Waugh',
            title: 'Sword of Honour',
            price: 12.99,
          },
          {
            category: 'fiction',
            author: 'Herman Melville',
            title: 'Moby Dick',
            isbn: '0-553-21311-3',
            price: 8.99,
          },
        ],
        bicycle: {
          color: 'red',
          price: 19.95,
        },
      },
    },
    null,
    2,
  )

  jsonPath.value = '$.store.book[*].title'
  validateJson()
}

function clearInput() {
  inputJson.value = ''
  jsonPath.value = ''
  extractedData.value = null
  jsonError.value = ''
  pathError.value = ''
  isValidJson.value = false
  parsedJson.value = null
}

function clearPath() {
  jsonPath.value = ''
  extractedData.value = null
  pathError.value = ''
}

function setQuickPath(path: string) {
  jsonPath.value = path
  if (isValidJson.value) {
    extractPath()
  }
}

async function copyToClipboard() {
  if (!formattedOutput.value) return

  try {
    await navigator.clipboard.writeText(formattedOutput.value)
    success(t('tools.jsonPathExtractor.messages.copied'))
  } catch {
    error(t('tools.jsonPathExtractor.messages.copyFailed'))
  }
}

function downloadJson() {
  if (!formattedOutput.value) return

  try {
    const blob = new Blob([formattedOutput.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'extracted-data.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
    success(t('tools.jsonPathExtractor.messages.downloaded'))
  } catch {
    error(t('tools.jsonPathExtractor.messages.downloadFailed'))
  }
}
</script>
