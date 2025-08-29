<template>
  <ToolLayout
    :title="$t('tools.jsonPathExtractor.title')"
    :description="$t('tools.jsonPathExtractor.description')"
    icon="🎯"
    :features="[
      $t('tools.jsonPathExtractor.features.pathExtraction.title'),
      $t('tools.jsonPathExtractor.features.filtering.title'),
      $t('tools.jsonPathExtractor.features.export.title'),
    ]"
  >
    <!-- Tab Navigation -->
    <div class="mb-6">
      <div class="border-b border-slate-700/30">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'path'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="{
              'border-primary-500 text-primary-400': activeTab === 'path',
              'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500':
                activeTab !== 'path',
            }"
          >
            {{ $t('tools.jsonPathExtractor.tabs.path') }}
          </button>
          <button
            @click="activeTab = 'extractor'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="{
              'border-primary-500 text-primary-400': activeTab === 'extractor',
              'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500':
                activeTab !== 'extractor',
            }"
          >
            {{ $t('tools.jsonPathExtractor.tabs.extractor') }}
          </button>
          <button
            @click="activeTab = 'formatter'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="{
              'border-primary-500 text-primary-400': activeTab === 'formatter',
              'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500':
                activeTab !== 'formatter',
            }"
          >
            {{ $t('tools.jsonPathExtractor.tabs.formatter') }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Path Extractor Tab Content -->
    <div v-show="activeTab === 'path'">
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.jsonPathExtractor.inputSection.title') }}
            </h3>
            <div class="flex space-x-2">
              <button
                @click="loadExample"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/30"
              >
                {{ $t('common.loadExample') }}
              </button>
              <button
                @click="clearInput"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/30"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>

          <!-- JSON Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.jsonPathExtractor.inputSection.jsonData') }}
            </label>
            <textarea
              v-model="inputJson"
              :placeholder="$t('tools.jsonPathExtractor.inputSection.jsonPlaceholder')"
              class="w-full h-48 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono text-sm text-slate-100 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              @input="validateJson"
            ></textarea>

            <!-- JSON Validation Status -->
            <div
              v-if="jsonError"
              class="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <div class="flex items-center">
                <div class="text-red-400 text-lg mr-2">❌</div>
                <div>
                  <p class="font-medium text-red-300">
                    {{ $t('tools.jsonPathExtractor.errors.invalidJson') }}
                  </p>
                  <p class="text-sm text-red-400">{{ jsonError }}</p>
                </div>
              </div>
            </div>

            <div
              v-else-if="inputJson.trim() && isValidJson"
              class="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <div class="flex items-center">
                <div class="text-green-400 text-lg mr-2">✅</div>
                <p class="font-medium text-green-300">
                  {{ $t('tools.jsonPathExtractor.success.validJson') }}
                </p>
              </div>
            </div>
          </div>

          <!-- JSONPath Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.jsonPathExtractor.inputSection.jsonPath') }}
            </label>
            <div class="relative">
              <input
                v-model="jsonPath"
                type="text"
                :placeholder="$t('tools.jsonPathExtractor.inputSection.pathPlaceholder')"
                class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono text-sm text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                @input="extractPath"
              />
              <button
                v-if="jsonPath"
                @click="clearPath"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
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
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.jsonPathExtractor.inputSection.quickPaths') }}
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="quickPath in quickPaths"
                :key="quickPath.path"
                @click="setQuickPath(quickPath.path)"
                class="px-3 py-2 text-xs bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors font-mono text-left border border-slate-700/30"
              >
                <div class="font-medium">{{ quickPath.path }}</div>
                <div class="text-slate-400 mt-1">
                  {{ $t(`tools.jsonPathExtractor.quickPaths.${quickPath.key}`) }}
                </div>
              </button>
            </div>
          </div>

          <!-- Extract Button -->
          <button
            @click="extractPath"
            :disabled="!inputJson.trim() || !isValidJson || !jsonPath.trim()"
            class="w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-medium border border-primary-500/30 hover-lift"
          >
            {{ $t('tools.jsonPathExtractor.extractButton') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.jsonPathExtractor.outputSection.title') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="extractedData !== null"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-500/10 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/30"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="extractedData !== null"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-500/10 text-green-300 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <!-- No Results State -->
          <div
            v-if="extractedData === null"
            class="h-64 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">🎯</div>
              <p>{{ $t('tools.jsonPathExtractor.outputSection.noResults') }}</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="pathError" class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div class="flex items-center">
              <div class="text-red-400 text-2xl mr-3">⚠️</div>
              <div>
                <p class="font-medium text-red-300">
                  {{ $t('tools.jsonPathExtractor.errors.pathError') }}
                </p>
                <p class="text-sm text-red-400 mt-1">{{ pathError }}</p>
              </div>
            </div>
          </div>

          <!-- Success State -->
          <div v-else class="space-y-4">
            <!-- Results Info -->
            <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="text-green-400 text-2xl mr-3">✅</div>
                  <div>
                    <p class="font-medium text-green-300">
                      {{ $t('tools.jsonPathExtractor.success.extracted') }}
                    </p>
                    <p class="text-sm text-green-400">{{ resultsInfo }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Extracted Data -->
            <div class="bg-slate-800/30 rounded-lg p-4">
              <h4 class="text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.jsonPathExtractor.outputSection.extractedData') }}
              </h4>
              <pre
                class="bg-slate-900/50 border border-slate-700/50 rounded p-4 text-sm overflow-auto max-h-80 font-mono text-slate-100"
                >{{ formattedOutput }}</pre
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Syntax Guide (Collapsible) -->
      <div class="glass rounded-xl border border-slate-700/30 p-6 mt-6">
        <div
          class="flex items-center justify-between cursor-pointer"
          @click="showSyntax = !showSyntax"
        >
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.jsonPathExtractor.syntaxGuide.title') }}
          </h3>
          <svg
            class="w-5 h-5 text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180': showSyntax }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>

        <div v-show="showSyntax" class="mt-4 pt-4 border-t border-slate-700/30">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-slate-200 mb-3">
                {{ $t('tools.jsonPathExtractor.syntaxGuide.basicSyntax') }}
              </h4>
              <div class="space-y-2 text-sm">
                <div class="flex items-start">
                  <code
                    class="bg-slate-800/50 px-2 py-1 rounded text-slate-200 font-mono mr-3 flex-shrink-0 border border-slate-700/30"
                    >$</code
                  >
                  <span class="text-slate-300">{{
                    $t('tools.jsonPathExtractor.syntaxGuide.rootSymbol')
                  }}</span>
                </div>
                <div class="flex items-start">
                  <code
                    class="bg-slate-800/50 px-2 py-1 rounded text-slate-200 font-mono mr-3 flex-shrink-0 border border-slate-700/30"
                    >.</code
                  >
                  <span class="text-slate-300">{{
                    $t('tools.jsonPathExtractor.syntaxGuide.dotNotation')
                  }}</span>
                </div>
                <div class="flex items-start">
                  <code
                    class="bg-slate-800/50 px-2 py-1 rounded text-slate-200 font-mono mr-3 flex-shrink-0 border border-slate-700/30"
                    >[]</code
                  >
                  <span class="text-slate-300">{{
                    $t('tools.jsonPathExtractor.syntaxGuide.bracketNotation')
                  }}</span>
                </div>
                <div class="flex items-start">
                  <code
                    class="bg-slate-800/50 px-2 py-1 rounded text-slate-200 font-mono mr-3 flex-shrink-0 border border-slate-700/30"
                    >*</code
                  >
                  <span class="text-slate-300">{{
                    $t('tools.jsonPathExtractor.syntaxGuide.wildcard')
                  }}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 class="font-medium text-slate-200 mb-3">
                {{ $t('tools.jsonPathExtractor.syntaxGuide.examples') }}
              </h4>
              <div class="space-y-2 text-sm">
                <div class="bg-slate-800/50 p-2 rounded border border-slate-700/30">
                  <code class="text-slate-200 font-mono">$.store.book[0].title</code>
                  <p class="text-slate-400 mt-1">
                    {{ $t('tools.jsonPathExtractor.syntaxGuide.exampleDesc1') }}
                  </p>
                </div>
                <div class="bg-slate-800/50 p-2 rounded border border-slate-700/30">
                  <code class="text-slate-200 font-mono">$.store.book[*].author</code>
                  <p class="text-slate-400 mt-1">
                    {{ $t('tools.jsonPathExtractor.syntaxGuide.exampleDesc2') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Field Extractor Tab Content -->
    <div v-show="activeTab === 'extractor'">
      <JsonExtractorTab />
    </div>

    <!-- Formatter Tab Content -->
    <div v-show="activeTab === 'formatter'">
      <JsonFormatterTab />
    </div>
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useToast } from '../../composables/useToast'
import { useI18n } from 'vue-i18n'
import { JSONPath } from 'jsonpath-plus'
import ToolLayout from '../../components/ToolLayout.vue'
import JsonExtractorTab from './components/JsonExtractorTab.vue'
import JsonFormatterTab from './components/JsonFormatterTab.vue'

const { t } = useI18n()
const { success, error } = useToast()

// Tab management
const activeTab = ref<'path' | 'extractor' | 'formatter'>('path')

// Extractor state
const inputJson = ref('')
const jsonPath = ref('')
const extractedData = ref<unknown>(null)
const jsonError = ref('')
const pathError = ref('')
const isValidJson = ref(false)
const parsedJson = ref<Record<string, unknown> | Array<unknown> | null>(null)
const showSyntax = ref(false)

// Quick path templates
const quickPaths = ref([
  { key: 'root', path: '$' },
  { key: 'allProperties', path: '$.*' },
  { key: 'firstArrayItem', path: '$[0]' },
  { key: 'allArrayItems', path: '$[*]' },
  { key: 'lastArrayItem', path: '$[-1]' },
  { key: 'arraySlice', path: '$[0:3]' },
])

// Computed properties for extractor
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

// JSON validation function for extractor
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
  } catch (err) {
    jsonError.value = err instanceof Error ? err.message : String(err)
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
  } catch (err) {
    pathError.value = err instanceof Error ? err.message : String(err)
    extractedData.value = null
  }
}

// Utility functions for extractor
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
  } catch (err) {
    console.error('Download failed:', err)
    error(t('tools.jsonPathExtractor.messages.downloadFailed'))
  }
}
</script>

<style scoped>
.glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.hover-lift {
  transition: all 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
