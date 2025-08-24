<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('tools.universalConverter.title') }}
        </h1>
        <p class="text-gray-600">{{ $t('tools.universalConverter.description') }}</p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔄</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.universalConverter.features.bidirectional.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.universalConverter.features.bidirectional.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚡</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.universalConverter.features.realtime.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.universalConverter.features.realtime.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🛡️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.universalConverter.features.validation.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.universalConverter.features.validation.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Left Panel -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.universalConverter.inputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                @click="loadExample('left')"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {{ $t('common.loadExample') }}
              </button>
              <button
                @click="clearPanel('left')"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>

          <!-- Format Selector -->
          <div class="mb-4">
            <label class="text-sm font-medium text-gray-700 block mb-2">
              {{ $t('tools.universalConverter.format') }}:
            </label>
            <select
              v-model="leftFormat"
              @change="convert('left')"
              class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="query">HTTP Query Parameters</option>
            </select>
          </div>

          <textarea
            v-model="leftContent"
            @input="handleInput('left')"
            :placeholder="getPlaceholder(leftFormat)"
            class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>

          <div v-if="leftError" class="mt-2 text-red-600 text-sm">
            {{ leftError }}
          </div>
        </div>

        <!-- Right Panel -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.universalConverter.outputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                @click="loadExample('right')"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {{ $t('common.loadExample') }}
              </button>
              <button
                @click="clearPanel('right')"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {{ $t('common.clear') }}
              </button>
              <button
                v-if="rightContent"
                @click="copyToClipboard(rightContent)"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
            </div>
          </div>

          <!-- Format Selector -->
          <div class="mb-4">
            <label class="text-sm font-medium text-gray-700 block mb-2">
              {{ $t('tools.universalConverter.format') }}:
            </label>
            <select
              v-model="rightFormat"
              @change="convert('right')"
              class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="query">HTTP Query Parameters</option>
            </select>
          </div>

          <textarea
            v-model="rightContent"
            @input="handleInput('right')"
            :placeholder="getPlaceholder(rightFormat)"
            class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>

          <div v-if="rightError" class="mt-2 text-red-600 text-sm">
            {{ rightError }}
          </div>
        </div>
      </div>

      <!-- Conversion Direction -->
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ $t('tools.universalConverter.conversionDirection') }}
            </h3>
            <p class="text-gray-600 text-sm">
              {{ $t('tools.universalConverter.conversionDirectionDescription') }}
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="swapPanels"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center"
            >
              <span class="mr-2">🔄</span>
              {{ $t('tools.universalConverter.swap') }}
            </button>
            <button
              @click="convertLeftToRight"
              :disabled="!leftContent.trim()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ $t('tools.universalConverter.convertRight') }}
            </button>
            <button
              @click="convertRightToLeft"
              :disabled="!rightContent.trim()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ $t('tools.universalConverter.convertLeft') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import * as xml2js from 'xml2js'

const { t } = useI18n()
const { success, error: showError, copySuccess, copyError } = useToast()

// State
const leftContent = ref('')
const rightContent = ref('')
const leftFormat = ref('json')
const rightFormat = ref('xml')
const leftError = ref('')
const rightError = ref('')

// Handle input changes with debounce
let debounceTimer: number | null = null

function handleInput(panel: 'left' | 'right') {
  // Clear any existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Set new timer
  debounceTimer = window.setTimeout(() => {
    if (panel === 'left') {
      convertLeftToRight()
    } else {
      convertRightToLeft()
    }
  }, 500)
}

// Convert left panel to right panel
function convertLeftToRight() {
  if (!leftContent.value.trim()) {
    rightContent.value = ''
    rightError.value = ''
    return
  }

  try {
    leftError.value = ''
    rightError.value = ''

    const result = convertContent(leftContent.value, leftFormat.value, rightFormat.value)
    rightContent.value = result
  } catch (err: any) {
    rightError.value = err.message || t('tools.universalConverter.errors.conversionFailed')
    showError(rightError.value)
  }
}

// Convert right panel to left panel
function convertRightToLeft() {
  if (!rightContent.value.trim()) {
    leftContent.value = ''
    leftError.value = ''
    return
  }

  try {
    leftError.value = ''
    rightError.value = ''

    const result = convertContent(rightContent.value, rightFormat.value, leftFormat.value)
    leftContent.value = result
  } catch (err: any) {
    leftError.value = err.message || t('tools.universalConverter.errors.conversionFailed')
    showError(leftError.value)
  }
}

// Convert content from one format to another
function convertContent(content: string, fromFormat: string, toFormat: string): string {
  if (fromFormat === toFormat) {
    return content
  }

  let data: any

  // Parse from source format
  switch (fromFormat) {
    case 'json':
      data = parseJson(content)
      break
    case 'xml':
      data = parseXml(content)
      break
    case 'query':
      data = parseQuery(content)
      break
    default:
      throw new Error(t('tools.universalConverter.errors.unsupportedFormat'))
  }

  // Convert to target format
  switch (toFormat) {
    case 'json':
      return formatJson(data)
    case 'xml':
      return formatXml(data)
    case 'query':
      return formatQuery(data)
    default:
      throw new Error(t('tools.universalConverter.errors.unsupportedFormat'))
  }
}

// Parse JSON
function parseJson(content: string): any {
  try {
    return JSON.parse(content)
  } catch (err) {
    throw new Error(t('tools.universalConverter.errors.invalidJson'))
  }
}

// Parse XML
function parseXml(content: string): any {
  try {
    let result: any
    xml2js.parseString(content, { explicitArray: false }, (err, res) => {
      if (err) {
        throw new Error(t('tools.universalConverter.errors.invalidXml'))
      }
      result = res
    })
    return result
  } catch (err) {
    throw new Error(t('tools.universalConverter.errors.invalidXml'))
  }
}

// Parse Query Parameters
function parseQuery(content: string): any {
  try {
    const params: any = {}
    const pairs = content.split('&')

    for (const pair of pairs) {
      if (!pair) continue
      const [key, value] = pair.split('=')
      if (key) {
        params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
      }
    }

    return params
  } catch (err) {
    throw new Error(t('tools.universalConverter.errors.invalidQuery'))
  }
}

// Format as JSON
function formatJson(data: any): string {
  return JSON.stringify(data, null, 2)
}

// Format as XML
function formatXml(data: any): string {
  try {
    const builder = new xml2js.Builder({
      headless: true,
      renderOpts: {
        pretty: true,
        indent: '  ',
        newline: '\n',
      },
    })
    return builder.buildObject(data)
  } catch (err) {
    throw new Error(t('tools.universalConverter.errors.xmlGenerationFailed'))
  }
}

// Format as Query Parameters
function formatQuery(data: any): string {
  try {
    const pairs: string[] = []

    function buildPairs(obj: any, prefix = '') {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            buildPairs(item, `${prefix}[${index}]`)
          })
        } else {
          Object.keys(obj).forEach((key) => {
            const value = obj[key]
            const newPrefix = prefix ? `${prefix}[${key}]` : key
            buildPairs(value, newPrefix)
          })
        }
      } else {
        pairs.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(obj))}`)
      }
    }

    buildPairs(data)
    return pairs.join('&')
  } catch (err) {
    throw new Error(t('tools.universalConverter.errors.queryGenerationFailed'))
  }
}

// Swap panels
function swapPanels() {
  // Swap content
  const tempContent = leftContent.value
  leftContent.value = rightContent.value
  rightContent.value = tempContent

  // Swap formats
  const tempFormat = leftFormat.value
  leftFormat.value = rightFormat.value
  rightFormat.value = tempFormat

  // Swap errors
  const tempError = leftError.value
  leftError.value = rightError.value
  rightError.value = tempError
}

// Clear panel
function clearPanel(panel: 'left' | 'right') {
  if (panel === 'left') {
    leftContent.value = ''
    leftError.value = ''
  } else {
    rightContent.value = ''
    rightError.value = ''
  }
}

// Load example
function loadExample(panel: 'left' | 'right') {
  const exampleData = {
    user: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      roles: ['user', 'admin'],
      profile: {
        age: 30,
        city: 'New York',
      },
    },
  }

  if (panel === 'left') {
    leftContent.value = formatJson(exampleData)
    leftFormat.value = 'json'
    convertLeftToRight()
  } else {
    rightContent.value = formatJson(exampleData)
    rightFormat.value = 'json'
    convertRightToLeft()
  }
}

// Get placeholder based on format
function getPlaceholder(format: string): string {
  switch (format) {
    case 'json':
      return '{\n  "key": "value"\n}'
    case 'xml':
      return '<root>\n  <key>value</key>\n</root>'
    case 'query':
      return 'key1=value1&key2=value2'
    default:
      return ''
  }
}

// Copy to clipboard
function copyToClipboard(content: string) {
  navigator.clipboard
    .writeText(content)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

// Watch for format changes
watch([leftFormat, rightFormat], () => {
  if (leftContent.value) {
    convertLeftToRight()
  }
  if (rightContent.value) {
    convertRightToLeft()
  }
})
</script>
