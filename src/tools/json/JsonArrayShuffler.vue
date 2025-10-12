<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">JSON Array Shuffler</h1>
        <p class="text-gray-600">Randomly shuffle JSON array elements with various algorithms</p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🎲</div>
          <h3 class="text-lg font-semibold mb-2">Random Shuffling</h3>
          <p class="text-gray-600 text-sm">
            Use various shuffle algorithms to randomize array order
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔄</div>
          <h3 class="text-lg font-semibold mb-2">Multiple Algorithms</h3>
          <p class="text-gray-600 text-sm">
            Choose from Fisher-Yates, simple random, or custom shuffle methods
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📊</div>
          <h3 class="text-lg font-semibold mb-2">Preserve Structure</h3>
          <p class="text-gray-600 text-sm">
            Maintain object integrity while shuffling array elements
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Input JSON Array</h3>
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
            placeholder="Paste your JSON array here..."
            class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="validateInput"
          ></textarea>

          <!-- Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">Shuffle Options</h4>

            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-24">Algorithm:</label>
                <select
                  v-model="options.algorithm"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fisher-yates">Fisher-Yates (Recommended)</option>
                  <option value="simple">Simple Random</option>
                  <option value="sort-random">Sort Random</option>
                </select>
              </div>

              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-24">Seed:</label>
                <input
                  v-model="options.seed"
                  type="number"
                  placeholder="Random seed (optional)"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <label class="flex items-center">
                  <input
                    v-model="options.preserveFirst"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Preserve First Element
                </label>

                <label class="flex items-center">
                  <input
                    v-model="options.preserveLast"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Preserve Last Element
                </label>
              </div>
            </div>
          </div>

          <!-- Validation Status -->
          <div v-if="validationError" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <div class="text-red-600 text-lg mr-2">❌</div>
              <div>
                <p class="font-medium text-red-800">Invalid Input</p>
                <p class="text-sm text-red-600">{{ validationError }}</p>
              </div>
            </div>
          </div>

          <div
            v-else-if="inputJson.trim() && isValidArray"
            class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div class="flex items-center">
              <div class="text-green-600 text-lg mr-2">✅</div>
              <p class="font-medium text-green-800">
                Valid JSON Array ({{ arrayLength }} elements)
              </p>
            </div>
          </div>

          <button
            @click="shuffleArray"
            :disabled="!inputJson.trim() || !isValidArray"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            🎲 Shuffle Array
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Shuffled Array</h3>
            <div class="flex space-x-2">
              <button
                v-if="shuffledOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Copy
              </button>
              <button
                v-if="shuffledOutput"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Download
              </button>
              <button
                v-if="shuffledOutput"
                @click="shuffleAgain"
                class="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                🎲 Shuffle Again
              </button>
            </div>
          </div>

          <div
            v-if="!shuffledOutput"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">🎲</div>
              <p>No shuffled array yet. Input a JSON array and click shuffle.</p>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">Array Shuffled Successfully</p>
                  <p class="text-sm text-green-600">{{ shuffleStats }}</p>
                </div>
              </div>
            </div>

            <textarea
              :value="shuffledOutput"
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
import { ref, reactive, computed } from 'vue'
import { useToast } from '@/composables/useToast'

const { success, error: showError, copySuccess, copyError, downloadSuccess } = useToast()

const inputJson = ref('')
const shuffledOutput = ref('')
const validationError = ref('')
const isValidArray = ref(false)
const arrayLength = ref(0)
const shuffleStats = ref('')

const options = reactive({
  algorithm: 'fisher-yates',
  seed: null as number | null,
  preserveFirst: false,
  preserveLast: false,
})

function loadExample() {
  inputJson.value = JSON.stringify(
    [
      { id: 1, name: 'Alice', score: 95 },
      { id: 2, name: 'Bob', score: 87 },
      { id: 3, name: 'Charlie', score: 92 },
      { id: 4, name: 'Diana', score: 98 },
      { id: 5, name: 'Edward', score: 89 },
      { id: 6, name: 'Fiona', score: 94 },
      { id: 7, name: 'George', score: 91 },
      { id: 8, name: 'Helen', score: 96 },
    ],
    null,
    2,
  )
  validateInput()
}

function clearInput() {
  inputJson.value = ''
  shuffledOutput.value = ''
  validationError.value = ''
  isValidArray.value = false
  arrayLength.value = 0
  shuffleStats.value = ''
}

function validateInput() {
  validationError.value = ''
  isValidArray.value = false
  arrayLength.value = 0

  if (!inputJson.value.trim()) {
    return
  }

  try {
    const data = JSON.parse(inputJson.value)

    if (!Array.isArray(data)) {
      validationError.value = 'Input must be a JSON array'
      return
    }

    if (data.length < 2) {
      validationError.value = 'Array must have at least 2 elements to shuffle'
      return
    }

    isValidArray.value = true
    arrayLength.value = data.length
  } catch (err: any) {
    validationError.value = 'Invalid JSON format: ' + err.message
  }
}

// Seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function fisherYatesShuffle(array: any[], useSeed = false): any[] {
  const shuffled = [...array]
  let currentIndex = shuffled.length
  let randomIndex: number

  while (currentIndex !== 0) {
    if (useSeed && options.seed !== null) {
      randomIndex = Math.floor(seededRandom(options.seed + currentIndex) * currentIndex)
    } else {
      randomIndex = Math.floor(Math.random() * currentIndex)
    }
    currentIndex--

    // Swap elements
    ;[shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ]
  }

  return shuffled
}

function simpleRandomShuffle(array: any[]): any[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function sortRandomShuffle(array: any[]): any[] {
  return [...array].sort(() => Math.random() - 0.5)
}

function shuffleArray() {
  try {
    if (!inputJson.value.trim()) {
      showError('Please provide a JSON array to shuffle')
      return
    }

    const data = JSON.parse(inputJson.value)

    if (!Array.isArray(data)) {
      showError('Input must be a JSON array')
      return
    }

    if (data.length < 2) {
      showError('Array must have at least 2 elements')
      return
    }

    let shuffled: any[]

    // Apply shuffle algorithm
    switch (options.algorithm) {
      case 'fisher-yates':
        shuffled = fisherYatesShuffle(data, options.seed !== null)
        break
      case 'simple':
        shuffled = simpleRandomShuffle(data)
        break
      case 'sort-random':
        shuffled = sortRandomShuffle(data)
        break
      default:
        shuffled = fisherYatesShuffle(data)
    }

    // Handle preserve options
    if (options.preserveFirst && data.length > 0) {
      const firstElement = data[0]
      const restShuffled = shuffled.filter((item) => item !== firstElement)
      shuffled = [firstElement, ...restShuffled]
    }

    if (options.preserveLast && data.length > 0) {
      const lastElement = data[data.length - 1]
      const restShuffled = shuffled.filter((item) => item !== lastElement)
      shuffled = [...restShuffled, lastElement]
    }

    shuffledOutput.value = JSON.stringify(shuffled, null, 2)

    // Generate shuffle stats
    const algorithmName =
      options.algorithm.charAt(0).toUpperCase() + options.algorithm.slice(1).replace('-', ' ')
    shuffleStats.value = `${data.length} elements shuffled using ${algorithmName} algorithm`

    success('Array shuffled successfully!')
  } catch (err: any) {
    showError('Failed to shuffle array: ' + err.message)
  }
}

function shuffleAgain() {
  shuffleArray()
}

function copyToClipboard() {
  if (!shuffledOutput.value) return

  navigator.clipboard
    .writeText(shuffledOutput.value)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}

function downloadJson() {
  if (!shuffledOutput.value) return

  const blob = new Blob([shuffledOutput.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `shuffled_array_${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
