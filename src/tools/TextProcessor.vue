<template>
  <div class="h-full bg-dark-950 text-slate-100 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-100 mb-2">{{ $t('tools.textProcessor.title') }}</h1>
        <p class="text-slate-400">
          {{ $t('tools.textProcessor.description') }}
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg hover-lift transition-all duration-200">
          <div class="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200">🔗</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">
            {{ $t('tools.textProcessor.features.urlEncoding.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.textProcessor.features.urlEncoding.description') }}
          </p>
        </div>
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg hover-lift transition-all duration-200">
          <div class="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200">🔒</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">
            {{ $t('tools.textProcessor.features.base64.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.textProcessor.features.base64.description') }}
          </p>
        </div>
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg hover-lift transition-all duration-200">
          <div class="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200">#️⃣</div>
          <h3 class="text-lg font-semibold mb-2 text-slate-100">
            {{ $t('tools.textProcessor.features.hashing.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.textProcessor.features.hashing.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.textProcessor.inputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                @click="loadExample"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 hover-lift"
              >
                {{ $t('common.loadExample') }}
              </button>
              <button
                @click="clearInput"
                class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 hover-lift"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>

          <textarea
            v-model="inputText"
            :placeholder="$t('tools.textProcessor.inputPlaceholder')"
            class="w-full h-80 p-4 border border-slate-700/30 rounded-xl font-mono text-sm resize-none bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          ></textarea>

          <!-- Text Statistics -->
          <div class="mt-4 p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-sm text-slate-400">{{ $t('tools.textProcessor.chars') }}</p>
                <p class="font-semibold text-slate-100">{{ inputText.length }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">{{ $t('tools.textProcessor.words') }}</p>
                <p class="font-semibold text-slate-100">{{ wordCount }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">{{ $t('tools.textProcessor.lines') }}</p>
                <p class="font-semibold text-slate-100">{{ lineCount }}</p>
              </div>
            </div>
          </div>

          <!-- Operations -->
          <div class="mt-6 space-y-4">
            <h4 class="font-medium text-slate-100">{{ $t('tools.textProcessor.operations') }}</h4>

            <div class="grid grid-cols-2 gap-4">
              <button
                @click="urlEncode"
                class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium hover-lift"
              >
                {{ $t('tools.textProcessor.urlEncode') }}
              </button>
              <button
                @click="urlDecode"
                class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium hover-lift"
              >
                {{ $t('tools.textProcessor.urlDecode') }}
              </button>
              <button
                @click="base64Encode"
                class="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 font-medium hover-lift"
              >
                {{ $t('tools.textProcessor.base64Encode') }}
              </button>
              <button
                @click="base64Decode"
                class="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 font-medium hover-lift"
              >
                {{ $t('tools.textProcessor.base64Decode') }}
              </button>
              <button
                @click="md5Hash"
                class="px-4 py-2 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-all duration-200 font-medium hover-lift"
              >
                {{ $t('tools.textProcessor.md5Hash') }}
              </button>
              <button
                @click="sha256Hash"
                class="px-4 py-2 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-all duration-200 font-medium hover-lift"
              >
                {{ $t('tools.textProcessor.sha256Hash') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Output Section -->
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.textProcessor.outputTitle') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="outputText"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-all duration-200 hover-lift"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="outputText"
                @click="downloadResult"
                class="px-3 py-1 text-sm bg-success-500/20 text-success-400 rounded-lg hover:bg-success-500/30 transition-all duration-200 hover-lift"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <textarea
            v-model="outputText"
            :placeholder="$t('tools.textProcessor.outputPlaceholder')"
            class="w-full h-80 p-4 border border-slate-700/30 rounded-xl font-mono text-sm resize-none bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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