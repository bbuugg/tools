<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('tools.jsonArraySlicer.title') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('tools.jsonArraySlicer.description') }}
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">✂️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonArraySlicer.features.indexSlicing.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonArraySlicer.features.indexSlicing.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🎯</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonArraySlicer.features.conditionalSlicing.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonArraySlicer.features.conditionalSlicing.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">📊</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.jsonArraySlicer.features.smartPreview.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.jsonArraySlicer.features.smartPreview.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonArraySlicer.inputTitle') }}
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
            :placeholder="$t('tools.jsonArraySlicer.inputPlaceholder')"
            class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="analyzeArray"
          ></textarea>

          <!-- Slicing Options -->
          <div class="mt-4 space-y-4">
            <h4 class="font-medium text-gray-900">
              {{ $t('tools.jsonArraySlicer.slicingOptions') }}
            </h4>

            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <label class="text-sm font-medium text-gray-700 w-24"
                  >{{ $t('tools.jsonArraySlicer.method') }}:</label
                >
                <select
                  v-model="options.method"
                  @change="analyzeArray"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="index">{{ $t('tools.jsonArraySlicer.indexRange') }}</option>
                  <option value="condition">
                    {{ $t('tools.jsonArraySlicer.conditionalFilter') }}
                  </option>
                  <option value="random">{{ $t('tools.jsonArraySlicer.randomSample') }}</option>
                </select>
              </div>

              <!-- Index Range Options -->
              <div v-if="options.method === 'index'" class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex items-center space-x-2">
                    <label class="text-sm font-medium text-gray-700 w-16"
                      >{{ $t('tools.jsonArraySlicer.startIndex') }}:</label
                    >
                    <input
                      v-model.number="options.startIndex"
                      @input="analyzeArray"
                      type="number"
                      min="0"
                      :placeholder="$t('tools.jsonArraySlicer.startIndex')"
                      class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div class="flex items-center space-x-2">
                    <label class="text-sm font-medium text-gray-700 w-16"
                      >{{ $t('tools.jsonArraySlicer.endIndex') }}:</label
                    >
                    <input
                      v-model.number="options.endIndex"
                      @input="analyzeArray"
                      type="number"
                      :placeholder="$t('tools.jsonArraySlicer.endIndex')"
                      class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <!-- Conditional Options -->
              <div v-if="options.method === 'condition'" class="space-y-3">
                <div class="flex items-center space-x-4">
                  <label class="text-sm font-medium text-gray-700 w-24"
                    >{{ $t('tools.jsonArraySlicer.conditionField') }}:</label
                  >
                  <input
                    v-model="options.conditionField"
                    @input="analyzeArray"
                    type="text"
                    :placeholder="$t('tools.jsonArraySlicer.conditionField')"
                    class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <select
                    v-model="options.operator"
                    @change="analyzeArray"
                    class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="equals">
                      {{ $t('tools.jsonArraySlicer.operators.equals') }}
                    </option>
                    <option value="not-equals">
                      {{ $t('tools.jsonArraySlicer.operators.notEquals') }}
                    </option>
                    <option value="greater">
                      {{ $t('tools.jsonArraySlicer.operators.greater') }}
                    </option>
                    <option value="less">{{ $t('tools.jsonArraySlicer.operators.less') }}</option>
                    <option value="contains">
                      {{ $t('tools.jsonArraySlicer.operators.contains') }}
                    </option>
                  </select>
                  <input
                    v-model="options.conditionValue"
                    @input="analyzeArray"
                    type="text"
                    :placeholder="$t('tools.jsonArraySlicer.conditionValue')"
                    class="col-span-2 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Random Sample Options -->
              <div v-if="options.method === 'random'" class="space-y-3">
                <div class="flex items-center space-x-4">
                  <label class="text-sm font-medium text-gray-700 w-24"
                    >{{ $t('tools.jsonArraySlicer.sampleCount') }}:</label
                  >
                  <input
                    v-model.number="options.sampleCount"
                    @input="analyzeArray"
                    type="number"
                    min="1"
                    :placeholder="$t('tools.jsonArraySlicer.sampleCount')"
                    class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <label class="flex items-center">
                  <input
                    v-model="options.preserveOrder"
                    @change="analyzeArray"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {{ $t('tools.jsonArraySlicer.preserveOrder') }}
                </label>
              </div>
            </div>
          </div>

          <!-- Array Info -->
          <div v-if="arrayInfo" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 class="font-medium text-blue-900 mb-2">
              {{ $t('tools.jsonArraySlicer.arrayInfo') }}:
            </h5>
            <div class="text-sm text-blue-800 space-y-1">
              <p>• {{ $t('tools.jsonArraySlicer.totalElements') }}: {{ arrayInfo.total }}</p>
              <p v-if="options.method === 'index' && arrayInfo.willExtract !== undefined">
                • {{ $t('tools.jsonArraySlicer.willExtract') }}: {{ arrayInfo.willExtract }}
                {{ $t('common.items') }} <span v-if="arrayInfo.range">({{ arrayInfo.range }})</span>
              </p>
              <p v-if="options.method === 'condition' && arrayInfo.matching !== undefined">
                • {{ $t('tools.jsonArraySlicer.matchingElements') }}: {{ arrayInfo.matching }}
              </p>
              <p v-if="options.method === 'random'">
                • {{ $t('tools.jsonArraySlicer.willSample') }}:
                {{ Math.min(options.sampleCount || 0, arrayInfo.total) }} {{ $t('common.items') }}
              </p>
            </div>
          </div>

          <button
            @click="sliceArray"
            :disabled="!inputJson.trim() || !isValidArray"
            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ $t('tools.jsonArraySlicer.sliceButton') }}
          </button>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonArraySlicer.slicedArray') }}
            </h3>
            <div class="flex space-x-2">
              <button
                v-if="slicedOutput"
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                {{ $t('common.copy') }}
              </button>
              <button
                v-if="slicedOutput"
                @click="downloadJson"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                {{ $t('common.download') }}
              </button>
            </div>
          </div>

          <div
            v-if="!slicedOutput && !error"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">📊</div>
              <p>{{ $t('tools.jsonArraySlicer.noResults') }}</p>
            </div>
          </div>

          <div v-if="error" class="h-80 flex items-center justify-center">
            <div class="text-center text-red-600">
              <div class="text-3xl mb-2">❌</div>
              <p class="font-medium">{{ $t('toast.error') }}</p>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="slicedOutput && !error" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">{{ $t('common.success') }}</p>
                  <p class="text-sm text-green-600">{{ slicingStats }}</p>
                </div>
              </div>
            </div>

            <textarea
              :value="slicedOutput"
              readonly
              class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 resize-none"
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface SlicingOptions {
  method: 'index' | 'condition' | 'random'
  startIndex: number
  endIndex: number | null
  conditionField: string
  operator: 'equals' | 'not-equals' | 'greater' | 'less' | 'contains'
  conditionValue: string
  sampleCount: number
  preserveOrder: boolean
}

const { success, error: showError, copySuccess } = useToast()

const inputJson = ref('')
const slicedOutput = ref('')
const error = ref('')
const isValidArray = ref(false)
const slicingStats = ref('')

const options = ref<SlicingOptions>({
  method: 'index',
  startIndex: 0,
  endIndex: null,
  conditionField: '',
  operator: 'equals',
  conditionValue: '',
  sampleCount: 5,
  preserveOrder: true,
})

interface ArrayInfo {
  total: number
  willExtract?: number
  range?: string
  matching?: number
}

const arrayInfo = ref<ArrayInfo | null>(null)

function loadExample() {
  const example = [
    { id: 1, name: 'John', age: 30, city: 'New York' },
    { id: 2, name: 'Jane', age: 25, city: 'Los Angeles' },
    { id: 3, name: 'Bob', age: 35, city: 'Chicago' },
    { id: 4, name: 'Alice', age: 28, city: 'Houston' },
    { id: 5, name: 'Charlie', age: 32, city: 'Phoenix' },
    { id: 6, name: 'Diana', age: 27, city: 'Philadelphia' },
    { id: 7, name: 'Eve', age: 29, city: 'San Antonio' },
  ]
  inputJson.value = JSON.stringify(example, null, 2)
  analyzeArray()
}

function clearInput() {
  inputJson.value = ''
  slicedOutput.value = ''
  error.value = ''
  isValidArray.value = false
  arrayInfo.value = null
}

function analyzeArray() {
  error.value = ''
  arrayInfo.value = null

  if (!inputJson.value.trim()) {
    isValidArray.value = false
    return
  }

  try {
    const parsed = JSON.parse(inputJson.value)

    if (!Array.isArray(parsed)) {
      throw new Error(t('tools.jsonArraySlicer.errors.invalidArray'))
    }

    isValidArray.value = true

    const info: ArrayInfo = {
      total: parsed.length,
    }

    if (options.value.method === 'index') {
      const start = options.value.startIndex
      const end = options.value.endIndex !== null ? options.value.endIndex : parsed.length
      const range = end > parsed.length ? parsed.length : end
      info.willExtract = Math.max(0, range - start)
      info.range = `${start}-${range}`
    } else if (options.value.method === 'condition') {
      const matching = parsed.filter((item) => matchesCondition(item)).length
      info.matching = matching
    }

    arrayInfo.value = info
  } catch (e) {
    error.value = t('tools.jsonArraySlicer.errors.invalidJson') + ' ' + (e as Error).message
    isValidArray.value = false
  }
}

function matchesCondition(item: any): boolean {
  const { conditionField, operator, conditionValue } = options.value

  if (!conditionField || !(conditionField in item)) {
    return false
  }

  const itemValue = item[conditionField]
  const conditionVal = conditionValue

  switch (operator) {
    case 'equals':
      return String(itemValue) === conditionVal
    case 'not-equals':
      return String(itemValue) !== conditionVal
    case 'greater':
      return Number(itemValue) > Number(conditionVal)
    case 'less':
      return Number(itemValue) < Number(conditionVal)
    case 'contains':
      return String(itemValue).includes(conditionVal)
    default:
      return false
  }
}

function sliceArray() {
  if (!isValidArray.value) return

  try {
    const parsed = JSON.parse(inputJson.value)
    let result: any[] = []
    let extractedCount = 0

    switch (options.value.method) {
      case 'index':
        const start = options.value.startIndex
        const end = options.value.endIndex !== null ? options.value.endIndex : parsed.length
        result = parsed.slice(start, end)
        extractedCount = result.length
        break

      case 'condition':
        result = parsed.filter((item) => matchesCondition(item))
        extractedCount = result.length
        break

      case 'random':
        const shuffled = [...parsed].sort(() => 0.5 - Math.random())
        result = options.value.preserveOrder
          ? parsed.filter((_, i) =>
              shuffled.slice(0, options.value.sampleCount).includes(parsed[i]),
            )
          : shuffled.slice(0, options.value.sampleCount)
        extractedCount = result.length
        break
    }

    slicedOutput.value = JSON.stringify(result, null, 2)
    slicingStats.value = `${extractedCount} items extracted`
    error.value = ''
    success(t('toast.success'))
  } catch (e) {
    error.value = t('tools.jsonArraySlicer.errors.invalidJson') + ' ' + (e as Error).message
  }
}

function copyToClipboard() {
  if (slicedOutput.value) {
    navigator.clipboard.writeText(slicedOutput.value)
    copySuccess()
  }
}

function downloadJson() {
  if (slicedOutput.value) {
    const blob = new Blob([slicedOutput.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sliced-array.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success(t('toast.downloadSuccess'))
  }
}
</script>
