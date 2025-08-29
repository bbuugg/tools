<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-100 mb-2 text-gradient">{{ $t('tools.cookieToJson.title') }}</h1>
        <p class="text-slate-400">{{ $t('tools.cookieToJson.description') }}</p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="glass p-6 rounded-xl shadow-dark-lg border border-slate-700/30 hover-lift transition-all duration-300">
          <div class="text-2xl mb-3">🍪</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">
            {{ $t('tools.cookieToJson.features.parsing.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.cookieToJson.features.parsing.description') }}
          </p>
        </div>
        <div class="glass p-6 rounded-xl shadow-dark-lg border border-slate-700/30 hover-lift transition-all duration-300">
          <div class="text-2xl mb-3">🔄</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">
            {{ $t('tools.cookieToJson.features.conversion.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.cookieToJson.features.conversion.description') }}
          </p>
        </div>
        <div class="glass p-6 rounded-xl shadow-dark-lg border border-slate-700/30 hover-lift transition-all duration-300">
          <div class="text-2xl mb-3">📋</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">
            {{ $t('tools.cookieToJson.features.export.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.cookieToJson.features.export.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="glass p-6 rounded-xl shadow-dark-lg border border-slate-700/30">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.cookieToJson.inputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                @click="loadExample"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800/70 hover:text-white transition-all duration-200 hover-lift"
              >
                {{ $t('common.loadExample') }}
              </button>
              <button
                @click="clearInput"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800/70 hover:text-white transition-all duration-200 hover-lift"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-sm text-slate-400 mb-2">{{ $t('tools.cookieToJson.inputNote') }}</p>
            <div class="bg-dark-800/50 border border-slate-700/50 rounded-lg p-3">
              <code class="text-sm text-primary-400">name1=value1; name2=value2; name3=value3</code>
            </div>
          </div>

          <textarea
            v-model="inputCookie"
            :placeholder="$t('tools.cookieToJson.inputPlaceholder')"
            class="w-full h-64 p-4 bg-dark-800/50 border border-slate-700/50 rounded-lg font-mono text-sm resize-none text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            @input="parseCookie"
          ></textarea>

          <!-- Parse Options -->
          <div class="mt-4 space-y-3">
            <h4 class="font-medium text-slate-100">{{ $t('tools.cookieToJson.parseOptions') }}</h4>

            <div class="grid grid-cols-1 gap-3">
              <label class="flex items-center">
                <input
                  v-model="options.decodeValues"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                  @change="parseCookie"
                />
                <span class="text-slate-300">{{ $t('tools.cookieToJson.options.decodeValues') }}</span>
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.removeEmpty"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                  @change="parseCookie"
                />
                <span class="text-slate-300">{{ $t('tools.cookieToJson.options.removeEmpty') }}</span>
              </label>

              <label class="flex items-center">
                <input
                  v-model="options.formatOutput"
                  type="checkbox"
                  class="mr-2 rounded border-slate-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                  @change="parseCookie"
                />
                <span class="text-slate-300">{{ $t('tools.cookieToJson.options.formatOutput') }}</span>
              </label>
            </div>
          </div>

          <!-- Validation Status -->
          <div v-if="errorMessage" class="mt-4 p-3 bg-error-500/10 border border-error-500/30 rounded-lg">
            <div class="flex items-center">
              <div class="text-error-400 text-lg mr-2">❌</div>
              <div>
                <p class="font-medium text-error-400">{{ $t('tools.cookieToJson.error') }}</p>
                <p class="text-sm text-error-300">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <div
            v-else-if="inputCookie.trim() && parsedCookies.length > 0"
            class="mt-4 p-3 bg-success-500/10 border border-success-500/30 rounded-lg"
          >
            <div class="flex items-center">
              <div class="text-success-400 text-lg mr-2">✅</div>
              <div>
                <p class="font-medium text-success-400">{{ $t('tools.cookieToJson.success') }}</p>
                <p class="text-sm text-success-300">
                  {{ $t('tools.cookieToJson.cookiesFound', { count: parsedCookies.length }) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Output Section -->
        <div class="glass p-6 rounded-xl shadow-dark-lg border border-slate-700/30">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.cookieToJson.outputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="jsonOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-all duration-200 hover-lift"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="jsonOutput"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-success-500/20 text-success-400 rounded-lg hover:bg-success-500/30 transition-all duration-200 hover-lift"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!jsonOutput"
            class="h-80 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2 animate-bounce-subtle">🍪</div>
              <p class="text-slate-400">{{ $t('tools.cookieToJson.noResults') }}</p>
            </div>
          </div>

          <div v-else class="space-y-4">
            <!-- Statistics -->
            <div class="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="text-primary-400 text-2xl mr-3">📊</div>
                  <div>
                    <p class="font-medium text-primary-400">
                      {{ $t('tools.cookieToJson.conversionComplete') }}
                    </p>
                    <p class="text-sm text-primary-300">{{ statistics }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- JSON Output -->
            <textarea
              :value="jsonOutput"
              readonly
              class="w-full h-64 p-4 bg-dark-800/50 border border-slate-700/50 rounded-lg font-mono text-sm resize-none text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '../../composables/useToast'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { success, error } = useToast()

// Reactive state
const inputCookie = ref('')
const parsedCookies = ref<Array<{ name: string; value: string }>>([])
const errorMessage = ref('')

// Options
const options = ref({
  decodeValues: true,
  removeEmpty: true,
  formatOutput: true,
})

// Computed properties
const jsonOutput = computed(() => {
  if (parsedCookies.value.length === 0) return ''

  const cookieObject: Record<string, string> = {}
  parsedCookies.value.forEach((cookie) => {
    cookieObject[cookie.name] = cookie.value
  })

  if (options.value.formatOutput) {
    return JSON.stringify(cookieObject, null, 2)
  } else {
    return JSON.stringify(cookieObject)
  }
})

const statistics = computed(() => {
  const totalCookies = parsedCookies.value.length
  const nonEmptyValues = parsedCookies.value.filter((c) => c.value.trim() !== '').length

  return t('tools.cookieToJson.statistics', {
    total: totalCookies,
    nonEmpty: nonEmptyValues,
  })
})

// Cookie parsing function
function parseCookie() {
  errorMessage.value = ''
  parsedCookies.value = []

  if (!inputCookie.value.trim()) {
    return
  }

  try {
    const cookieString = inputCookie.value.trim()

    // Split by semicolon and parse each cookie
    const cookiePairs = cookieString.split(';')
    const cookies: Array<{ name: string; value: string }> = []

    for (const pair of cookiePairs) {
      const trimmedPair = pair.trim()
      if (!trimmedPair) continue

      const equalIndex = trimmedPair.indexOf('=')
      if (equalIndex === -1) {
        // Handle cookies without values (like flags)
        const name = trimmedPair
        if (!options.value.removeEmpty || name) {
          cookies.push({ name, value: '' })
        }
        continue
      }

      const name = trimmedPair.substring(0, equalIndex).trim()
      let value = trimmedPair.substring(equalIndex + 1).trim()

      // Skip empty names
      if (!name) continue

      // Decode values if option is enabled
      if (options.value.decodeValues) {
        try {
          value = decodeURIComponent(value)
        } catch (e) {
          // If decoding fails, keep original value
        }
      }

      // Remove empty values if option is enabled
      if (options.value.removeEmpty && !value.trim()) {
        continue
      }

      cookies.push({ name, value })
    }

    if (cookies.length === 0) {
      errorMessage.value = t('tools.cookieToJson.errors.noCookies')
      return
    }

    parsedCookies.value = cookies
  } catch (e) {
    errorMessage.value = t('tools.cookieToJson.errors.parseError', {
      error: e instanceof Error ? e.message : String(e),
    })
  }
}

// Utility functions
function loadExample() {
  inputCookie.value =
    'sessionId=abc123def456; userId=12345; theme=dark; lang=en-US; preferences={\"notifications\":true}; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  parseCookie()
}

function clearInput() {
  inputCookie.value = ''
  parsedCookies.value = []
  errorMessage.value = ''
}

async function copyToClipboard() {
  if (!jsonOutput.value) return

  try {
    await navigator.clipboard.writeText(jsonOutput.value)
    success(t('tools.cookieToJson.messages.copied'))
  } catch (e) {
    error(t('tools.cookieToJson.messages.copyFailed'))
  }
}

function downloadJson() {
  if (!jsonOutput.value) return

  try {
    const blob = new Blob([jsonOutput.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'cookies.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
    success(t('tools.cookieToJson.messages.downloaded'))
  } catch (e) {
    error(t('tools.cookieToJson.messages.downloadFailed'))
  }
}
</script>