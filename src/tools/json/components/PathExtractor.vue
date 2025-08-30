<template>
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
            @click="loadObjectExample"
            class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/30"
          >
            {{ $t('common.loadObjectExample') }}
          </button>
          <button
            @click="clearInput"
            class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/30"
          >
            {{ $t('common.clear') }}
          </button>
        </div>
      </div>

      <!-- Mode Selector -->
      <div class="mb-4">
        <div class="inline-flex rounded-md shadow-sm" role="group">
          <button
            @click="mode = 'path'"
            class="px-4 py-2 text-sm font-medium transition-colors rounded-l-lg"
            :class="[
              mode === 'path'
                ? 'text-white bg-primary-600'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-slate-600',
              'border border-slate-700',
            ]"
          >
            {{ $t('tools.jsonPathExtractor.mode.path') }}
          </button>
          <button
            @click="mode = 'field'"
            class="px-4 py-2 text-sm font-medium transition-colors rounded-r-lg"
            :class="[
              mode === 'field'
                ? 'text-white bg-primary-600'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-slate-600',
              'border border-slate-700 border-l-0',
            ]"
          >
            {{ $t('tools.jsonPathExtractor.mode.field') }}
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
        <div v-if="jsonError" class="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
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

      <!-- Path Mode Content -->
      <div v-show="mode === 'path'">
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
      </div>

      <!-- Field Mode Content -->
      <div v-show="mode === 'field'">
        <!-- Available Fields -->
        <div v-if="availableFields.length > 0" class="mb-4">
          <h4 class="font-medium text-slate-100 mb-3">
            {{ $t('tools.jsonExtractor.availableFields') }}
          </h4>
          <div
            class="max-h-40 overflow-y-auto border border-slate-700/30 rounded-xl p-3 bg-slate-800/30 mb-3"
          >
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="field in availableFields"
                :key="field"
                class="flex items-center text-sm text-slate-300 hover:text-slate-100 transition-colors duration-200"
              >
                <input
                  v-model="selectedFields"
                  :value="field"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                  @change="onFieldSelectionChange"
                />
                {{ field }}
              </label>
            </div>
          </div>
          <div class="flex justify-between">
            <button
              @click="selectAllFields"
              class="text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200"
            >
              {{ $t('common.selectAll') }}
            </button>
            <button
              @click="clearSelection"
              class="text-sm text-slate-400 hover:text-slate-300 transition-colors duration-200"
            >
              {{ $t('common.clearSelection') }}
            </button>
          </div>
        </div>

        <!-- Options -->
        <div class="mb-4 space-y-3">
          <h4 class="font-medium text-slate-100">{{ $t('common.options') }}</h4>

          <div class="grid grid-cols-1 gap-3">
            <label
              class="flex items-center text-slate-300 hover:text-slate-100 transition-colors duration-200"
            >
              <input
                v-model="fieldOptions.preserveStructure"
                type="checkbox"
                class="mr-2 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
              />
              {{ $t('tools.jsonExtractor.options.preserveStructure') }}
            </label>

            <label
              class="flex items-center text-slate-300 hover:text-slate-100 transition-colors duration-200"
            >
              <input
                v-model="fieldOptions.removeEmpty"
                type="checkbox"
                class="mr-2 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
              />
              {{ $t('tools.jsonExtractor.options.removeEmpty') }}
            </label>

            <label
              class="flex items-center text-slate-300 hover:text-slate-100 transition-colors duration-200"
            >
              <input
                v-model="fieldOptions.flattenNested"
                type="checkbox"
                class="mr-2 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
              />
              {{ $t('tools.jsonExtractor.options.flattenNested') }}
            </label>
          </div>
        </div>
      </div>

      <!-- Extract Button -->
      <button
        @click="mode === 'path' ? extractPath() : extractFields()"
        :disabled="
          !inputJson.trim() ||
          !isValidJson ||
          (mode === 'path' ? !jsonPath.trim() : selectedFields.length === 0)
        "
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
      <div
        v-else-if="pathError || fieldError"
        class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
      >
        <div class="flex items-center">
          <div class="text-red-400 text-2xl mr-3">⚠️</div>
          <div>
            <p class="font-medium text-red-300">
              {{ $t('tools.jsonPathExtractor.errors.pathError') }}
            </p>
            <p class="text-sm text-red-400 mt-1">{{ pathError || fieldError }}</p>
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
    <div class="flex items-center justify-between cursor-pointer" @click="showSyntax = !showSyntax">
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
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'
import { JSONPath } from 'jsonpath-plus'

// Type definitions
type JsonPrimitive = string | number | boolean | null
interface JsonObject {
  [key: string]: JsonValue
}
type JsonValue = JsonPrimitive | JsonObject | JsonValue[] | undefined

const { t } = useI18n()
const { success, error } = useToast()

// Mode state
const mode = ref<'path' | 'field'>('path')

// State
const inputJson = ref('')
const jsonPath = ref('')
// Using 'any' type because JSON data can have various structures
const extractedData = ref<any>(null)
const jsonError = ref('')
const pathError = ref('')
const fieldError = ref('')
const isValidJson = ref(false)
// Using 'any' type because JSON data can have various structures
const parsedJson = ref<any>(null)
const showSyntax = ref(false)

// Field extraction state
const availableFields = ref<string[]>([])
const selectedFields = ref<string[]>([])
const fieldOptions = reactive({
  preserveStructure: true,
  removeEmpty: false,
  flattenNested: false,
})

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

// Watch mode changes to update path when switching to path mode
watch(mode, (newMode) => {
  if (newMode === 'path' && selectedFields.value.length > 0) {
    // Convert selected fields to JSONPath expression
    updateJsonPathFromFields()
  }
})

// JSON validation function
function validateJson() {
  jsonError.value = ''
  isValidJson.value = false
  parsedJson.value = null
  availableFields.value = []
  selectedFields.value = []

  if (!inputJson.value.trim()) {
    return
  }

  try {
    parsedJson.value = JSON.parse(inputJson.value)
    isValidJson.value = true

    // Analyze fields for field mode
    analyzeFields()

    // Auto-extract if path is already set or if in field mode with selections
    if (mode.value === 'path' && jsonPath.value.trim()) {
      extractPath()
    } else if (mode.value === 'field' && selectedFields.value.length > 0) {
      extractFields()
    }
  } catch (err) {
    jsonError.value = err instanceof Error ? err.message : String(err)
    isValidJson.value = false
    extractedData.value = null
  }
}

// Field analysis functions (from JsonExtractor)
// Using 'any' type because JSON data can have various structures
function getAllKeys(obj: any, prefix = ''): Set<string> {
  const keys = new Set<string>()

  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        getAllKeys(item, prefix).forEach((key) => keys.add(key))
      }
    })
  } else if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
    Object.keys(obj).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.add(fullKey)

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        getAllKeys(obj[key], fullKey).forEach((nestedKey) => keys.add(nestedKey))
      }
    })
  }

  return keys
}

function analyzeFields() {
  if (!parsedJson.value) {
    return
  }

  try {
    const data = parsedJson.value

    // Handle any JSON structure, not just arrays
    const allKeys = new Set<string>()

    if (Array.isArray(data)) {
      // If it's an array, analyze all items
      if (data.length === 0) {
        fieldError.value = t('tools.jsonExtractor.errors.emptyArray')
        return
      }

      data.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          getAllKeys(item).forEach((key) => allKeys.add(key))
        }
      })
    } else if (typeof data === 'object' && data !== null) {
      // If it's an object, analyze the object directly
      getAllKeys(data).forEach((key) => allKeys.add(key))
    } else {
      // For primitive values, no fields to extract
      availableFields.value = []
      return
    }

    availableFields.value = Array.from(allKeys).sort()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    fieldError.value = t('tools.jsonExtractor.errors.invalidJson') + ' ' + errorMessage
  }
}

function selectAllFields() {
  selectedFields.value = [...availableFields.value]
  updateJsonPathFromFields()
}

function clearSelection() {
  selectedFields.value = []
  jsonPath.value = ''
}

function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.')
  let current: any = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && !Array.isArray(current) && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }

  return current
}

// Field selection change handler
function onFieldSelectionChange() {
  updateJsonPathFromFields()
  if (mode.value === 'field') {
    extractFields()
  }
}

// Update JSONPath based on selected fields
function updateJsonPathFromFields() {
  if (selectedFields.value.length === 0) {
    jsonPath.value = ''
    return
  }

  // Convert field selections to JSONPath
  if (selectedFields.value.length === 1) {
    // Single field selection
    jsonPath.value = `$[*].${selectedFields.value[0]}`
  } else {
    // Multiple field selection - create an array of values
    const fields = selectedFields.value.map((field) => `$[*].${field}`).join(', ')
    jsonPath.value = `[${fields}]`
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

// Field extraction function (from JsonExtractor)
function extractFields() {
  try {
    fieldError.value = ''
    extractedData.value = null

    if (!parsedJson.value) {
      throw new Error(t('tools.jsonExtractor.errors.invalidFormat'))
    }

    if (selectedFields.value.length === 0) {
      throw new Error(t('tools.jsonExtractor.errors.noFields'))
    }

    const data = parsedJson.value

    // Handle both array and object JSON structures
    // Using 'any' type because JSON data can have various structures
    let dataArray: any[]
    if (Array.isArray(data)) {
      dataArray = data
    } else if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      // Wrap single object in array
      dataArray = [data]
    } else {
      throw new Error(t('tools.jsonExtractor.errors.invalidFormat'))
    }

    // Using 'any' type because JSON data can have various structures
    const result = dataArray.map((item: any) => {
      if (fieldOptions.preserveStructure) {
        // Using 'any' type because JSON data can have various structures
        const extracted: any = {}

        selectedFields.value.forEach((field) => {
          const value = getNestedValue(item, field)

          if (fieldOptions.removeEmpty && (value === null || value === undefined || value === '')) {
            return
          }

          if (fieldOptions.flattenNested) {
            extracted[field] = value
          } else {
            // Rebuild nested structure
            const keys = field.split('.')
            // Using 'any' type because JSON data can have various structures
            let current: any = extracted

            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) {
                current[keys[i]] = {}
              }
              current = current[keys[i]]
            }

            current[keys[keys.length - 1]] = value
          }
        })

        return extracted
      } else {
        // Return array of values
        return selectedFields.value.map((field) => getNestedValue(item, field))
      }
    })

    // If original data was a single object, return single object result
    // If original data was an array, return array result
    if (Array.isArray(data) && data.length > 0) {
      extractedData.value = result
    } else if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
      extractedData.value = result.length > 0 ? result[0] : {}
    } else {
      extractedData.value = result
    }

    // Update JSONPath to reflect the field selection
    updateJsonPathFromFields()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    fieldError.value = errorMessage
    extractedData.value = null
  }
}

// Utility functions
function loadExample() {
  // Load array format example
  inputJson.value = JSON.stringify(
    [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        department: 'Engineering',
        salary: 75000,
        address: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
        },
        skills: ['JavaScript', 'Vue.js', 'Node.js'],
        active: true,
        joinDate: '2023-01-15',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 28,
        department: 'Marketing',
        salary: 65000,
        address: {
          street: '456 Oak Ave',
          city: 'San Francisco',
          zipCode: '94102',
        },
        skills: ['Marketing', 'Analytics', 'Social Media'],
        active: false,
        joinDate: '2023-03-20',
      },
    ],
    null,
    2,
  )

  // Set default mode to path and provide a default path
  mode.value = 'path'
  jsonPath.value = '$[*].name'
  validateJson()
}

function loadObjectExample() {
  // Load object format example
  inputJson.value = JSON.stringify(
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      department: 'Engineering',
      salary: 75000,
      address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
      },
      skills: ['JavaScript', 'Vue.js', 'Node.js'],
      active: true,
      joinDate: '2023-01-15',
    },
    null,
    2,
  )

  // Set default mode to path and provide a default path
  mode.value = 'path'
  jsonPath.value = '$.name'
  validateJson()
}

function clearInput() {
  inputJson.value = ''
  jsonPath.value = ''
  extractedData.value = null
  jsonError.value = ''
  pathError.value = ''
  fieldError.value = ''
  isValidJson.value = false
  parsedJson.value = null
  availableFields.value = []
  selectedFields.value = []
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
