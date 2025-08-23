<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">JSON Minifier</h1>
        <p class="text-gray-600">
          Compress JSON data by removing whitespace and unnecessary characters
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📦</div>
          <h3 class="text-lg font-semibold mb-2">Size Reduction</h3>
          <p class="text-gray-600 text-sm">
            Significantly reduce JSON file size by removing all unnecessary whitespace
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">⚡</div>
          <h3 class="text-lg font-semibold mb-2">Fast Processing</h3>
          <p class="text-gray-600 text-sm">
            Instant compression with real-time size comparison and statistics
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔍</div>
          <h3 class="text-lg font-semibold mb-2">Validation</h3>
          <p class="text-gray-600 text-sm">
            Automatic JSON validation before compression with error reporting
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Input JSON</h3>
            <div class="flex space-x-2">
              <button
                @click="loadExample"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Load Example
              </button>
              <button
                @click="clearInput"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            v-model="inputJson"
            placeholder="Paste your formatted JSON here..."
            class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="validateJson"
          ></textarea>

          <!-- Input Stats -->
          <div v-if="inputJson.trim()" class="mt-3 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>Characters: {{ inputJson.length.toLocaleString() }}</span>
              <span>Lines: {{ inputJson.split('\n').length }}</span>
              <span>Size: {{ formatBytes(inputJson.length) }}</span>
            </div>
          </div>

          <!-- Validation Status -->
          <div v-if="validationError" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <div class="text-red-600 text-lg mr-2">❌</div>
              <div>
                <p class="font-medium text-red-800">Invalid JSON</p>
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
              <p class="font-medium text-green-800">Valid JSON - Ready to minify</p>
            </div>
          </div>

          <button
            @click="minifyJson"
            :disabled="!inputJson.trim() || !isValid"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Minify JSON
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Minified JSON</h3>
            <div class="flex space-x-2">
              <button
                v-if="minifiedJson"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Copy
              </button>
              <button
                v-if="minifiedJson"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          <div
            v-if="!minifiedJson"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">📦</div>
              <p>No minified JSON yet. Please input valid JSON to compress.</p>
            </div>
          </div>

          <div v-else class="space-y-4">
            <!-- Compression Stats -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="text-green-600 text-2xl mr-3">✅</div>
                  <div>
                    <p class="font-medium text-green-800">Compression Complete</p>
                    <p class="text-sm text-green-600">{{ compressionStats }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Output Stats -->
            <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <div class="flex justify-between">
                <span>Characters: {{ minifiedJson.length.toLocaleString() }}</span>
                <span>Size: {{ formatBytes(minifiedJson.length) }}</span>
                <span class="text-green-600 font-medium"
                  >Saved: {{ formatBytes(inputJson.length - minifiedJson.length) }}</span
                >
              </div>
            </div>

            <textarea
              :value="minifiedJson"
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
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'

const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const inputJson = ref('')
const minifiedJson = ref('')
const validationError = ref('')
const isValid = ref(false)

function loadExample() {
  inputJson.value = `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": [
    "reading",
    "swimming",
    "coding"
  ],
  "address": {
    "street": "123 Main St",
    "zip": "10001",
    "country": "USA"
  },
  "active": true,
  "metadata": null,
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false,
      "sms": true
    }
  }
}`
  validateJson()
}

function clearInput() {
  inputJson.value = ''
  minifiedJson.value = ''
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
  } catch (error: any) {
    validationError.value = error.message
    isValid.value = false
  }
}

function minifyJson() {
  try {
    if (!inputJson.value.trim()) {
      showError('Please provide JSON data to minify')
      return
    }

    const data = JSON.parse(inputJson.value)
    minifiedJson.value = JSON.stringify(data)

    success('JSON minified successfully!')
  } catch (error: any) {
    validationError.value = error.message
    showError('Failed to minify JSON: ' + error.message)
  }
}

const compressionStats = computed(() => {
  if (!inputJson.value || !minifiedJson.value) return ''

  const originalSize = inputJson.value.length
  const minifiedSize = minifiedJson.value.length
  const reduction = Math.round((1 - minifiedSize / originalSize) * 100)

  return `${reduction}% size reduction (${originalSize.toLocaleString()} → ${minifiedSize.toLocaleString()} characters)`
})

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function copyToClipboard() {
  if (!minifiedJson.value) return

  navigator.clipboard
    .writeText(minifiedJson.value)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function downloadJson() {
  if (!minifiedJson.value) return

  const blob = new Blob([minifiedJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `minified_${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
