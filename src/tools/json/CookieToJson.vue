<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-100 mb-2 text-gradient">
          {{ $t('tools.cookieToJson.title') }}
        </h1>
        <p class="text-slate-400">{{ $t('tools.cookieToJson.description') }}</p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div
          class="glass p-6 rounded-xl shadow-dark-lg border border-slate-700/30 hover-lift transition-all duration-300"
        >
          <div class="text-2xl mb-3">🍪</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">
            {{ $t('tools.cookieToJson.features.parsing.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.cookieToJson.features.parsing.description') }}
          </p>
        </div>
        <div
          class="glass p-6 rounded-xl shadow-dark-lg border border-slate-700/30 hover-lift transition-all duration-300"
        >
          <div class="text-2xl mb-3">🔄</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">
            {{ $t('tools.cookieToJson.features.conversion.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.cookieToJson.features.conversion.description') }}
          </p>
        </div>
        <div
          class="glass p-6 rounded-xl shadow-dark-lg border border-slate-700/30 hover-lift transition-all duration-300"
        >
          <div class="text-2xl mb-3">📋</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">
            {{ $t('tools.cookieToJson.features.export.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.cookieToJson.features.export.description') }}
          </p>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-6 items-center">
        <!-- Left Panel (Cookie) -->
        <div class="flex-1 glass p-6 rounded-xl shadow-dark-lg border border-slate-700/30">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.cookieToJson.inputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                @click="formatCookiePanel"
                :disabled="!leftContent.trim()"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800/70 hover:text-white disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 hover-lift"
              >
                {{ $t('tools.cookieToJson.formatButton') }}
              </button>
              <button
                @click="loadCookieExample"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800/70 hover:text-white transition-all duration-200 hover-lift"
              >
                {{ $t('common.loadExample') }}
              </button>
              <button
                @click="clearCookiePanel"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800/70 hover:text-white transition-all duration-200 hover-lift"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>

          <textarea
            v-model="leftContent"
            @input="handleCookieInput"
            :placeholder="getCookiePlaceholder()"
            class="w-full h-64 p-4 bg-dark-800/50 border border-slate-700/50 rounded-lg font-mono text-sm resize-none text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          ></textarea>

          <!-- Validation Status -->
          <div
            v-if="leftError"
            class="mt-4 p-3 bg-error-500/10 border border-error-500/30 rounded-lg"
          >
            <div class="flex items-center">
              <div class="text-error-400 text-lg mr-2">❌</div>
              <div>
                <p class="font-medium text-error-400">{{ $t('tools.cookieToJson.error') }}</p>
                <p class="text-sm text-error-300">{{ leftError }}</p>
              </div>
            </div>
          </div>

          <div
            v-else-if="leftContent.trim()"
            class="mt-4 p-3 bg-success-500/10 border border-success-500/30 rounded-lg"
          >
            <div class="flex items-center">
              <div class="text-success-400 text-lg mr-2">✅</div>
              <div>
                <p class="font-medium text-success-400">{{ $t('tools.cookieToJson.success') }}</p>
                <p class="text-sm text-success-300">
                  {{
                    $t('tools.cookieToJson.cookiesFound', { count: getCookiesCount(leftContent) })
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Conversion Arrows -->
        <div class="flex flex-col items-center justify-center space-y-4">
          <button
            @click="convertCookieToJson"
            :disabled="!leftContent.trim()"
            class="p-3 bg-slate-800/50 text-slate-300 rounded-full hover:bg-slate-700/50 hover:text-white disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 hover-lift"
            :title="$t('tools.cookieToJson.convertRight')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
          <button
            @click="convertJsonToCookie"
            :disabled="!rightContent.trim()"
            class="p-3 bg-slate-800/50 text-slate-300 rounded-full hover:bg-slate-700/50 hover:text-white disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 hover-lift"
            :title="$t('tools.cookieToJson.convertLeft')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
        </div>

        <!-- Right Panel (JSON) -->
        <div class="flex-1 glass p-6 rounded-xl shadow-dark-lg border border-slate-700/30">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.cookieToJson.outputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                @click="formatJsonPanel"
                :disabled="!rightContent.trim()"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800/70 hover:text-white disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 hover-lift"
              >
                {{ $t('tools.cookieToJson.formatButton') }}
              </button>
              <button
                @click="loadJsonExample"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800/70 hover:text-white transition-all duration-200 hover-lift"
              >
                {{ $t('common.loadExample') }}
              </button>
              <button
                @click="clearJsonPanel"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800/70 hover:text-white transition-all duration-200 hover-lift"
              >
                {{ $t('common.clear') }}
              </button>
              <button
                v-if="rightContent"
                @click="copyToClipboard(rightContent)"
                class="px-3 py-1 text-sm bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-all duration-200 hover-lift"
              >
                {{ $t('common.copy') }}
              </button>
            </div>
          </div>

          <textarea
            v-model="rightContent"
            @input="handleJsonInput"
            :placeholder="getJsonPlaceholder()"
            class="w-full h-64 p-4 bg-dark-800/50 border border-slate-700/50 rounded-lg font-mono text-sm resize-none text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          ></textarea>

          <!-- Validation Status -->
          <div
            v-if="rightError"
            class="mt-4 p-3 bg-error-500/10 border border-error-500/30 rounded-lg"
          >
            <div class="flex items-center">
              <div class="text-error-400 text-lg mr-2">❌</div>
              <div>
                <p class="font-medium text-error-400">{{ $t('tools.cookieToJson.error') }}</p>
                <p class="text-sm text-error-300">{{ rightError }}</p>
              </div>
            </div>
          </div>

          <div
            v-else-if="rightContent.trim()"
            class="mt-4 p-3 bg-success-500/10 border border-success-500/30 rounded-lg"
          >
            <div class="flex items-center">
              <div class="text-success-400 text-lg mr-2">✅</div>
              <div>
                <p class="font-medium text-success-400">{{ $t('tools.cookieToJson.success') }}</p>
                <p class="text-sm text-success-300">
                  {{ $t('tools.cookieToJson.conversionComplete') }}
                </p>
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
import { useToast } from '../../composables/useToast'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { error: showError, copySuccess, copyError } = useToast()

// State
const leftContent = ref('') // Cookie content
const rightContent = ref('') // JSON content
const leftError = ref('')
const rightError = ref('')

// Types
interface CookieObject {
  [key: string]: string
}

// Handle cookie input changes with debounce
let cookieDebounceTimer: number | null = null

function handleCookieInput() {
  // Clear any existing timer
  if (cookieDebounceTimer) {
    clearTimeout(cookieDebounceTimer)
  }

  // Set new timer
  cookieDebounceTimer = window.setTimeout(() => {
    // Auto convert cookie to JSON when typing
    if (leftContent.value.trim()) {
      convertCookieToJson()
    } else {
      rightContent.value = ''
      rightError.value = ''
    }
  }, 500)
}

// Handle JSON input changes with debounce
let jsonDebounceTimer: number | null = null

function handleJsonInput() {
  // Clear any existing timer
  if (jsonDebounceTimer) {
    clearTimeout(jsonDebounceTimer)
  }

  // Set new timer
  jsonDebounceTimer = window.setTimeout(() => {
    // Auto convert JSON to cookie when typing
    if (rightContent.value.trim()) {
      convertJsonToCookie()
    } else {
      leftContent.value = ''
      leftError.value = ''
    }
  }, 500)
}

// Convert cookie to JSON
function convertCookieToJson() {
  if (!leftContent.value.trim()) {
    rightContent.value = ''
    rightError.value = ''
    return
  }

  try {
    leftError.value = ''
    rightError.value = ''

    const cookieData = parseCookieString(leftContent.value)
    rightContent.value = formatJson(cookieData)
  } catch (err: unknown) {
    rightError.value = (err as Error).message || t('tools.cookieToJson.errors.conversionFailed')
    showError(rightError.value)
  }
}

// Convert JSON to cookie
function convertJsonToCookie() {
  if (!rightContent.value.trim()) {
    leftContent.value = ''
    leftError.value = ''
    return
  }

  try {
    leftError.value = ''
    rightError.value = ''

    const jsonData = parseJson(rightContent.value)
    leftContent.value = formatCookieString(jsonData)
  } catch (err: unknown) {
    leftError.value = (err as Error).message || t('tools.cookieToJson.errors.conversionFailed')
    showError(leftError.value)
  }
}

// Format cookie content
function formatCookiePanel() {
  try {
    if (!leftContent.value.trim()) return
    leftError.value = ''
    const formatted = formatCookieString(parseCookieString(leftContent.value))
    leftContent.value = formatted
  } catch (err: unknown) {
    const errorMessage = (err as Error).message || t('tools.cookieToJson.errors.formatFailed')
    leftError.value = errorMessage
    showError(errorMessage)
  }
}

// Format JSON content
function formatJsonPanel() {
  try {
    if (!rightContent.value.trim()) return
    rightError.value = ''
    const formatted = formatJson(parseJson(rightContent.value))
    rightContent.value = formatted
  } catch (err: unknown) {
    const errorMessage = (err as Error).message || t('tools.cookieToJson.errors.formatFailed')
    rightError.value = errorMessage
    showError(errorMessage)
  }
}

// Parse Cookie String
function parseCookieString(content: string): CookieObject {
  const cookieObject: CookieObject = {}

  // Split by semicolon and parse each cookie
  const cookiePairs = content.split(';')

  for (const pair of cookiePairs) {
    const trimmedPair = pair.trim()
    if (!trimmedPair) continue

    const equalIndex = trimmedPair.indexOf('=')
    if (equalIndex === -1) {
      // Handle cookies without values (like flags)
      const name = trimmedPair
      cookieObject[name] = ''
      continue
    }

    const name = trimmedPair.substring(0, equalIndex).trim()
    let value = trimmedPair.substring(equalIndex + 1).trim()

    // Skip empty names
    if (!name) continue

    // Decode values
    try {
      value = decodeURIComponent(value)
    } catch (_e: unknown) {
      // If decoding fails, keep original value
      // _e is intentionally unused
    }

    cookieObject[name] = value
  }

  return cookieObject
}

// Parse JSON
function parseJson(content: string): CookieObject {
  return JSON.parse(content)
}

// Format as Cookie String
function formatCookieString(data: CookieObject): string {
  const cookies: string[] = []

  Object.keys(data).forEach((key) => {
    const value = data[key]
    // For cookie format, we only support string values
    const stringValue = String(value)
    // Encode the value
    const encodedValue = encodeURIComponent(stringValue)
    cookies.push(`${key}=${encodedValue}`)
  })

  return cookies.join('; ')
}

// Format as JSON
function formatJson(data: object): string {
  return JSON.stringify(data, null, 2)
}

// Clear cookie panel
function clearCookiePanel() {
  leftContent.value = ''
  leftError.value = ''
}

// Clear JSON panel
function clearJsonPanel() {
  rightContent.value = ''
  rightError.value = ''
}

// Load cookie example
function loadCookieExample() {
  const exampleCookie =
    'sessionId=abc123def456; userId=12345; theme=dark; lang=en-US; preferences={\"notifications\":true}'
  leftContent.value = exampleCookie
  convertCookieToJson()
}

// Load JSON example
function loadJsonExample() {
  const exampleJson = {
    sessionId: 'abc123def456',
    userId: '12345',
    theme: 'dark',
    lang: 'en-US',
    preferences: { notifications: true },
  }
  rightContent.value = formatJson(exampleJson)
  convertJsonToCookie()
}

// Get cookie placeholder
function getCookiePlaceholder(): string {
  return 'name1=value1; name2=value2; name3=value3'
}

// Get JSON placeholder
function getJsonPlaceholder(): string {
  return '{\n  "key": "value"\n}'
}

// Get cookies count
function getCookiesCount(cookieString: string): number {
  if (!cookieString.trim()) return 0
  return cookieString.split(';').filter((pair) => pair.trim()).length
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
</script>
