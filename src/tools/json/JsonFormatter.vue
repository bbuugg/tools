<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('tools.jsonFormatter.title') }}</h1>
        <p class="text-gray-600">
          {{ $t('tools.jsonFormatter.description') }}
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">✨</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonFormatter.features.prettyFormat.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonFormatter.features.prettyFormat.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔍</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonFormatter.features.validation.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonFormatter.features.validation.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚙️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonFormatter.features.customization.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonFormatter.features.customization.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonFormatter.inputTitle') }}
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
            :placeholder="$t('tools.jsonFormatter.inputPlaceholder')"
            class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="validateJson"
          ></textarea>

          <!-- Validation Status -->
          <div v-if="validationError" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <div class="text-red-600 text-lg mr-2">❌</div>
              <div>
                <p class="font-medium text-red-800">{{ $t('tools.jsonFormatter.invalidJson') }}</p>
                <p class="text-sm text-red-600">{{ validationError }}</p>
              </div>
            </div>
          </div>

          <div
            v-else-if="inputJson.trim() && isValid"
            class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div class="flex items-center">
              <div class="text-green-600 text-lg mr-2">✅</div>
              <p class="font-medium text-green-800">{{ $t('tools.jsonFormatter.validJson') }}</p>
            </div>
          </div>

          <!-- Format Options -->
          <div class="mt-4 space-y-3">
            <h4 class="font-medium text-gray-900">{{ $t('tools.jsonFormatter.formatOptions') }}</h4>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700"
                  >{{ $t('tools.jsonFormatter.indent') }}:</label
                >
                <select
                  v-model="options.indent"
                  class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option :value="2">{{ $t('tools.jsonFormatter.spaces2') }}</option>
                  <option :value="4">{{ $t('tools.jsonFormatter.spaces4') }}</option>
                  <option :value="'\t'">{{ $t('tools.jsonFormatter.tab') }}</option>
                </select>
              </div>

              <label class="flex items-center">
                <input
                  v-model="options.sortKeys"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonFormatter.sortKeys') }}
              </label>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-center">
                <input
                  v-model="options.compact"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonFormatter.compactFormat') }}
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.escapeUnicode"
                  type="checkbox"
                  class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ $t('tools.jsonFormatter.escapeUnicode') }}
              </label>
            </div>
          </div>

          <!-- Case Options -->
          <div class="mt-4 space-y-3">
            <h4 class="font-medium text-gray-900">{{ $t('tools.jsonFormatter.caseOptions') }}</h4>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col space-y-1">
                <label class="text-sm font-medium text-gray-700"
                  >{{ $t('tools.jsonFormatter.keyCase') }}:</label
                >
                <select
                  v-model="options.keyCase"
                  class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="preserve">{{ $t('tools.jsonFormatter.preserveCase') }}</option>
                  <option value="upper">{{ $t('tools.jsonFormatter.toUpperCase') }}</option>
                  <option value="lower">{{ $t('tools.jsonFormatter.toLowerCase') }}</option>
                </select>
              </div>

              <div class="flex flex-col space-y-1">
                <label class="text-sm font-medium text-gray-700"
                  >{{ $t('tools.jsonFormatter.valueCase') }}:</label
                >
                <select
                  v-model="options.valueCase"
                  class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="preserve">{{ $t('tools.jsonFormatter.preserveCase') }}</option>
                  <option value="upper">{{ $t('tools.jsonFormatter.toUpperCase') }}</option>
                  <option value="lower">{{ $t('tools.jsonFormatter.toLowerCase') }}</option>
                </select>
              </div>
            </div>
          </div>

          <button
            @click="formatJson"
            :disabled="!inputJson.trim() || !isValid"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ $t('tools.jsonFormatter.formatJson') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonFormatter.outputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="formattedJson"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="formattedJson"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!formattedJson"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">✨</div>
              <p>{{ $t('tools.jsonFormatter.noResults') }}</p>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="text-green-600 text-2xl mr-3">✅</div>
                  <div>
                    <p class="font-medium text-green-800">
                      {{ $t('tools.jsonFormatter.formattingComplete') }}
                    </p>
                    <p class="text-sm text-green-600">{{ formatInfo }}</p>
                  </div>
                </div>
              </div>
            </div>

            <textarea
              :value="formattedJson"
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
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const inputJson = ref('')
const formattedJson = ref('')
const validationError = ref('')
const isValid = ref(false)
const formatInfo = ref('')

const options = reactive({
  indent: 2,
  sortKeys: false,
  compact: false,
  escapeUnicode: false,
  keyCase: 'preserve', // preserve, upper, lower
  valueCase: 'preserve', // preserve, upper, lower
})

function loadExample() {
  inputJson.value = `{"name":"John Doe","age":30,"city":"New York","hobbies":["reading","swimming","coding"],"address":{"street":"123 Main St","zip":"10001"},"active":true,"metadata":null}`
  validateJson()
}

function clearInput() {
  inputJson.value = ''
  formattedJson.value = ''
  validationError.value = ''
  isValid.value = false
  formatInfo.value = ''
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
  try {
    if (!inputJson.value.trim()) {
      showError(t('tools.jsonFormatter.messages.provideData'))
      return
    }

    let data = JSON.parse(inputJson.value)

    // Sort keys if enabled
    if (options.sortKeys) {
      data = sortObjectKeys(data)
    }

    // Convert case if needed
    if (options.keyCase !== 'preserve' || options.valueCase !== 'preserve') {
      data = convertCase(data)
    }

    // Calculate original and formatted sizes
    const originalSize = inputJson.value.length
    let formatted: string

    if (options.compact) {
      formatted = JSON.stringify(data)
    } else {
      formatted = JSON.stringify(data, null, options.indent)
    }

    // Handle unicode escaping
    if (options.escapeUnicode) {
      formatted = formatted.replace(/[\u0080-\uFFFF]/g, function (match) {
        return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).substr(-4)
      })
    }

    formattedJson.value = formatted

    // Generate format info
    const formattedSize = formatted.length
    const reduction =
      originalSize > formattedSize
        ? `${Math.round((1 - formattedSize / originalSize) * 100)}% ${t('tools.jsonFormatter.smaller')}`
        : `${Math.round((formattedSize / originalSize - 1) * 100)}% ${t('tools.jsonFormatter.larger')}`

    formatInfo.value = `${formatted.split('\n').length} ${t('tools.jsonFormatter.lines')}, ${formattedSize} ${t('tools.jsonFormatter.characters')} (${reduction})`

    success(t('tools.jsonFormatter.messages.formatSuccess'))
  } catch (error: unknown) {
    if (error instanceof Error) {
      validationError.value = error.message
      showError(t('tools.jsonFormatter.messages.formatError') + error.message)
    } else {
      const errorMessage = String(error)
      validationError.value = errorMessage
      showError(t('tools.jsonFormatter.messages.formatError') + errorMessage)
    }
  }
}

function copyToClipboard() {
  if (!formattedJson.value) return

  navigator.clipboard
    .writeText(formattedJson.value)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
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

  downloadSuccess()
}
</script>
