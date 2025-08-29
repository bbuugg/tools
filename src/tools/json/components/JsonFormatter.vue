<template>
  <div class="grid lg:grid-cols-2 gap-6">
    <!-- Input Section -->
    <div class="glass rounded-xl border border-slate-700/30 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-100">
          {{ $t('tools.jsonFormatter.inputTitle') }}
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

      <div class="space-y-4">
        <textarea
          v-model="inputJson"
          :placeholder="$t('tools.jsonFormatter.inputPlaceholder')"
          :rows="15"
          class="font-mono text-sm w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          @input="validateJson"
        ></textarea>

        <!-- Validation Status -->
        <div
          v-if="validationError"
          class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-slide-up"
        >
          <div class="flex items-start space-x-3">
            <div class="text-red-400 text-xl">❌</div>
            <div>
              <p class="font-medium text-red-400 mb-1">
                {{ $t('tools.jsonFormatter.invalidJson') }}
              </p>
              <p class="text-sm text-red-300">{{ validationError }}</p>
            </div>
          </div>
        </div>

        <div
          v-else-if="inputJson.trim() && isValid"
          class="p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-slide-up"
        >
          <div class="flex items-center space-x-3">
            <div class="text-green-400 text-xl">✅</div>
            <p class="font-medium text-green-400">
              {{ $t('tools.jsonFormatter.validJson') }}
            </p>
          </div>
        </div>

        <!-- Format Options -->
        <div class="glass rounded-xl border border-slate-700/30 p-4">
          <h4 class="font-medium text-slate-200 mb-3">
            {{ $t('tools.jsonFormatter.formatOptions') }}
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-200">
                {{ $t('tools.jsonFormatter.indent') }}
              </label>
              <select
                v-model="options.indent"
                class="w-full bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                @change="formatJson"
              >
                <option value="2">{{ $t('tools.jsonFormatter.spaces2') }}</option>
                <option value="4">{{ $t('tools.jsonFormatter.spaces4') }}</option>
                <option value="tab">{{ $t('tools.jsonFormatter.tab') }}</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-200">
                {{ $t('tools.jsonFormatter.outputFormat') }}
              </label>
              <select
                v-model="options.compact"
                class="w-full bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                @change="formatJson"
              >
                <option :value="false">
                  {{ $t('tools.jsonFormatter.prettyFormat') }}
                </option>
                <option :value="true">
                  {{ $t('tools.jsonFormatter.compactFormat') }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-200">
                {{ $t('tools.jsonFormatter.keyCase') }}
              </label>
              <select
                v-model="options.keyCase"
                class="w-full bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                @change="formatJson"
              >
                <option value="preserve">
                  {{ $t('tools.jsonFormatter.preserveCase') }}
                </option>
                <option value="upper">
                  {{ $t('tools.jsonFormatter.toUpperCase') }}
                </option>
                <option value="lower">
                  {{ $t('tools.jsonFormatter.toLowerCase') }}
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-200">
                {{ $t('tools.jsonFormatter.valueCase') }}
              </label>
              <select
                v-model="options.valueCase"
                class="w-full bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                @change="formatJson"
              >
                <option value="preserve">
                  {{ $t('tools.jsonFormatter.preserveCase') }}
                </option>
                <option value="upper">
                  {{ $t('tools.jsonFormatter.toUpperCase') }}
                </option>
                <option value="lower">
                  {{ $t('tools.jsonFormatter.toLowerCase') }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-4">
            <label class="flex items-center space-x-2">
              <input
                v-model="options.sortKeys"
                type="checkbox"
                class="rounded border-slate-600 text-primary-500 focus:ring-primary-500 bg-slate-800/50"
                @change="formatJson"
              />
              <span class="text-sm text-slate-300">
                {{ $t('tools.jsonFormatter.sortKeys') }}
              </span>
            </label>
            <label class="flex items-center space-x-2">
              <input
                v-model="options.escapeUnicode"
                type="checkbox"
                class="rounded border-slate-600 text-primary-500 focus:ring-primary-500 bg-slate-800/50"
                @change="formatJson"
              />
              <span class="text-sm text-slate-300">
                {{ $t('tools.jsonFormatter.escapeUnicode') }}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Output Section -->
    <div class="glass rounded-xl border border-slate-700/30 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-100">
          {{ $t('tools.jsonFormatter.outputTitle') }}
        </h3>
        <div class="flex space-x-2">
          <button
            @click="copyToClipboard"
            :disabled="!formattedJson"
            class="px-3 py-1 text-sm bg-blue-500/10 text-blue-300 rounded-lg hover:bg-blue-500/20 disabled:opacity-50 transition-colors border border-blue-500/30"
          >
            {{ $t('common.copy') }}
          </button>
          <button
            @click="downloadJson"
            :disabled="!formattedJson"
            class="px-3 py-1 text-sm bg-green-500/10 text-green-300 rounded-lg hover:bg-green-500/20 disabled:opacity-50 transition-colors border border-green-500/30"
          >
            {{ $t('common.download') }}
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-if="!formattedJson && !validationError"
          class="h-64 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-lg"
        >
          <div class="text-center">
            <div class="text-3xl mb-2">📝</div>
            <p>{{ $t('tools.jsonFormatter.noResults') }}</p>
          </div>
        </div>

        <textarea
          v-else
          v-model="formattedJson"
          :rows="15"
          readonly
          class="font-mono text-sm w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg resize-none"
        ></textarea>

        <!-- JSON Statistics -->
        <div v-if="formattedJson" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-slate-800/30 rounded-xl p-3 text-center">
            <div class="text-lg font-semibold text-primary-400">{{ jsonStats.size }}</div>
            <div class="text-xs text-slate-400">
              {{ $t('tools.jsonFormatter.characters') }}
            </div>
          </div>
          <div class="bg-slate-800/30 rounded-xl p-3 text-center">
            <div class="text-lg font-semibold text-success-400">{{ jsonStats.lines }}</div>
            <div class="text-xs text-slate-400">{{ $t('tools.jsonFormatter.lines') }}</div>
          </div>
          <div class="bg-slate-800/30 rounded-xl p-3 text-center">
            <div class="text-lg font-semibold text-warning-400">{{ jsonStats.keys }}</div>
            <div class="text-xs text-slate-400">{{ $t('tools.jsonFormatter.keys') }}</div>
          </div>
          <div class="bg-slate-800/30 rounded-xl p-3 text-center">
            <div class="text-lg font-semibold text-purple-400">{{ jsonStats.depth }}</div>
            <div class="text-xs text-slate-400">{{ $t('tools.jsonFormatter.depth') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { success, error: showError, copySuccess, copyError } = useToast()

const inputJson = ref('')
const formattedJson = ref('')
const validationError = ref('')
const isValid = ref(false)

const options = reactive({
  indent: 2,
  sortKeys: false,
  compact: false,
  escapeUnicode: false,
  keyCase: 'preserve', // preserve, upper, lower
  valueCase: 'preserve', // preserve, upper, lower
})

// JSON Statistics
const jsonStats = computed(() => {
  if (!formattedJson.value) {
    return { size: 0, lines: 0, keys: 0, depth: 0 }
  }

  const size = formattedJson.value.length
  const lines = formattedJson.value.split('\n').length

  let keys = 0
  let depth = 0

  try {
    const parsed = JSON.parse(inputJson.value)
    keys = countKeys(parsed)
    depth = getMaxDepth(parsed)
  } catch (e) {
    // ignore
  }

  return { size, lines, keys, depth }
})

// Helper functions
function countKeys(obj: any): number {
  if (typeof obj !== 'object' || obj === null) return 0
  if (Array.isArray(obj)) {
    return obj.reduce((count, item) => count + countKeys(item), 0)
  }
  return (
    Object.keys(obj).length +
    Object.values(obj).reduce((count, value) => count + countKeys(value), 0)
  )
}

function getMaxDepth(obj: any, currentDepth = 0): number {
  if (typeof obj !== 'object' || obj === null) return currentDepth
  if (Array.isArray(obj)) {
    return Math.max(currentDepth, ...obj.map((item) => getMaxDepth(item, currentDepth + 1)))
  }
  return Math.max(
    currentDepth,
    ...Object.values(obj).map((value) => getMaxDepth(value, currentDepth + 1)),
  )
}

function loadExample() {
  inputJson.value = `{"name":"John Doe","age":30,"city":"New York","hobbies":["reading","swimming","coding"],"address":{"street":"123 Main St","zip":"10001"},"active":true,"metadata":null}`
  validateJson()
}

function clearInput() {
  inputJson.value = ''
  formattedJson.value = ''
  validationError.value = ''
  isValid.value = false
}

function validateJson() {
  validationError.value = ''
  isValid.value = false

  if (!inputJson.value.trim()) {
    return
  }

  try {
    JSON.parse(inputJson.value)
    isValid.value = true
    formatJson()
  } catch (error: unknown) {
    if (error instanceof Error) {
      validationError.value = error.message
      isValid.value = false
    } else {
      validationError.value = String(error)
      isValid.value = false
    }
  }
}

function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  } else if (obj !== null && typeof obj === 'object') {
    const sortedObj: Record<string, unknown> = {}
    Object.keys(obj as Record<string, unknown>)
      .sort()
      .forEach((key) => {
        sortedObj[key] = sortObjectKeys((obj as Record<string, unknown>)[key])
      })
    return sortedObj
  }
  return obj
}

/**
 * Convert keys or values case according to options
 */
function convertCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertCase(item))
  } else if (obj !== null && typeof obj === 'object') {
    const convertedObj: Record<string, unknown> = {}

    Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
      // Convert key case
      let convertedKey = key
      if (options.keyCase === 'upper') {
        convertedKey = key.toUpperCase()
      } else if (options.keyCase === 'lower') {
        convertedKey = key.toLowerCase()
      }

      // Convert value case if it's a string
      let convertedValue = value
      if (typeof value === 'string' && options.valueCase !== 'preserve') {
        if (options.valueCase === 'upper') {
          convertedValue = value.toUpperCase()
        } else if (options.valueCase === 'lower') {
          convertedValue = value.toLowerCase()
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively convert nested objects/arrays
        convertedValue = convertCase(value)
      }

      convertedObj[convertedKey] = convertedValue
    })

    return convertedObj
  }

  // Handle primitive values (strings, numbers, booleans, null)
  if (typeof obj === 'string' && options.valueCase !== 'preserve') {
    if (options.valueCase === 'upper') {
      return obj.toUpperCase()
    } else if (options.valueCase === 'lower') {
      return obj.toLowerCase()
    }
  }

  return obj
}

function formatJson() {
  if (!inputJson.value.trim() || !isValid.value) {
    return
  }

  try {
    let data = JSON.parse(inputJson.value)

    // Sort keys if enabled
    if (options.sortKeys) {
      data = sortObjectKeys(data)
    }

    // Convert case if needed
    if (options.keyCase !== 'preserve' || options.valueCase !== 'preserve') {
      data = convertCase(data)
    }

    let formatted: string
    const indent = options.indent === 'tab' ? '\t' : parseInt(options.indent.toString())

    if (options.compact) {
      formatted = JSON.stringify(data)
    } else {
      formatted = JSON.stringify(data, null, indent)
    }

    // Handle unicode escaping
    if (options.escapeUnicode) {
      formatted = formatted.replace(/[\u0080-\uFFFF]/g, function (match) {
        return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4)
      })
    }

    formattedJson.value = formatted
  } catch (error: unknown) {
    if (error instanceof Error) {
      validationError.value = error.message
    } else {
      validationError.value = String(error)
    }
  }
}

function copyToClipboard() {
  if (!formattedJson.value) return

  navigator.clipboard.writeText(formattedJson.value).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = formattedJson.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  })
  success(t('tools.jsonFormatter.messages.copied'))
}

function downloadJson() {
  if (!formattedJson.value) return

  const blob = new Blob([formattedJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `formatted_${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  success(t('tools.jsonFormatter.messages.downloaded'))
}

// Auto-format when input changes
watch(
  [inputJson, options],
  () => {
    if (isValid.value) {
      formatJson()
    }
  },
  { immediate: true },
)
</script>
