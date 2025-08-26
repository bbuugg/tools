<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('tools.textProcessor.title') }}</h1>
        <p class="text-gray-600">
          {{ $t('tools.textProcessor.description') }}
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔗</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.textProcessor.features.urlEncoding.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.textProcessor.features.urlEncoding.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔒</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.textProcessor.features.base64.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.textProcessor.features.base64.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">#️⃣</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.textProcessor.features.hashing.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.textProcessor.features.hashing.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.textProcessor.inputTitle') }}
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
            v-model="inputText"
            :placeholder="$t('tools.textProcessor.inputPlaceholder')"
            class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>

          <!-- Text Statistics -->
          <div class="mt-4 p-3 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-sm text-gray-600">{{ $t('tools.textProcessor.chars') }}</p>
                <p class="font-semibold">{{ inputText.length }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">{{ $t('tools.textProcessor.words') }}</p>
                <p class="font-semibold">{{ wordCount }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">{{ $t('tools.textProcessor.lines') }}</p>
                <p class="font-semibold">{{ lineCount }}</p>
              </div>
            </div>
          </div>

          <!-- Operations -->
          <div class="mt-6 space-y-4">
            <h4 class="font-medium text-gray-900">{{ $t('tools.textProcessor.operations') }}</h4>

            <div class="grid grid-cols-2 gap-4">
              <button
                @click="urlEncode"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {{ $t('tools.textProcessor.urlEncode') }}
              </button>
              <button
                @click="urlDecode"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {{ $t('tools.textProcessor.urlDecode') }}
              </button>
              <button
                @click="base64Encode"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {{ $t('tools.textProcessor.base64Encode') }}
              </button>
              <button
                @click="base64Decode"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {{ $t('tools.textProcessor.base64Decode') }}
              </button>
              <button
                @click="md5Hash"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {{ $t('tools.textProcessor.md5Hash') }}
              </button>
              <button
                @click="sha256Hash"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {{ $t('tools.textProcessor.sha256Hash') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.textProcessor.outputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="outputText"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="outputText"
                @click="downloadResult"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <textarea
            v-model="outputText"
            :placeholder="$t('tools.textProcessor.outputPlaceholder')"
            class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readonly
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '../composables/useToast'
// @ts-ignore
import CryptoJS from 'crypto-js'

const { t } = useI18n()
const { showToast } = useToast()

// Reactive data
const inputText = ref('')
const outputText = ref('')

// Computed properties
const wordCount = computed(() => {
  return inputText.value.trim() ? inputText.value.trim().split(/\s+/).length : 0
})

const lineCount = computed(() => {
  return inputText.value ? inputText.value.split('\n').length : 0
})

// Methods
function loadExample() {
  inputText.value = t('tools.textProcessor.exampleText')
}

function clearInput() {
  inputText.value = ''
  outputText.value = ''
}

function copyToClipboard() {
  if (!outputText.value) return

  navigator.clipboard
    .writeText(outputText.value)
    .then(() => {
      showToast({
        type: 'success',
        title: t('toast.success'),
        message: t('toast.copied'),
      })
    })
    .catch(() => {
      showToast({
        type: 'error',
        title: t('toast.error'),
        message: t('toast.copyFailed'),
      })
    })
}

function downloadResult() {
  if (!outputText.value) return

  const blob = new Blob([outputText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'text-processor-result.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  showToast({
    type: 'success',
    title: t('toast.success'),
    message: t('toast.downloadSuccess'),
  })
}

// Text processing functions
function urlEncode() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    outputText.value = encodeURIComponent(inputText.value)
  } catch (error) {
    showToast({
      type: 'error',
      title: t('toast.error'),
      message: t('tools.textProcessor.errors.encodingError'),
    })
    outputText.value = ''
  }
}

function urlDecode() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    outputText.value = decodeURIComponent(inputText.value)
  } catch (error) {
    showToast({
      type: 'error',
      title: t('toast.error'),
      message: t('tools.textProcessor.errors.decodingError'),
    })
    outputText.value = ''
  }
}

function base64Encode() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    outputText.value = btoa(unescape(encodeURIComponent(inputText.value)))
  } catch (error) {
    showToast({
      type: 'error',
      title: t('toast.error'),
      message: t('tools.textProcessor.errors.encodingError'),
    })
    outputText.value = ''
  }
}

function base64Decode() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    outputText.value = decodeURIComponent(escape(atob(inputText.value)))
  } catch (error) {
    showToast({
      type: 'error',
      title: t('toast.error'),
      message: t('tools.textProcessor.errors.decodingError'),
    })
    outputText.value = ''
  }
}

function md5Hash() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    outputText.value = CryptoJS.MD5(inputText.value).toString()
  } catch (error) {
    showToast({
      type: 'error',
      title: t('toast.error'),
      message: t('tools.textProcessor.errors.hashingError'),
    })
    outputText.value = ''
  }
}

function sha256Hash() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    outputText.value = CryptoJS.SHA256(inputText.value).toString()
  } catch (error) {
    showToast({
      type: 'error',
      title: t('toast.error'),
      message: t('tools.textProcessor.errors.hashingError'),
    })
    outputText.value = ''
  }
}
</script>

<style scoped>
/* Add any component-specific styles here if needed */
</style>
