<template>
  <ToolLayout
    :title="$t('tools.jsonArraySlicer.title')"
    :description="$t('tools.jsonArraySlicer.description')"
    icon="✂️"
    :features="[
      $t('tools.jsonArraySlicer.features.indexSlicing.title'),
      $t('tools.jsonArraySlicer.features.conditionalSlicing.title'),
      $t('tools.jsonArraySlicer.features.smartPreview.title'),
    ]"
  >
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Input Section -->
      <div class="glass rounded-xl border border-slate-700/30 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.jsonArraySlicer.inputTitle') }}
          </h3>
          <div class="flex space-x-2">
            <button
              @click="loadExample"
              class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/30 hover:border-slate-500/50"
            >
              {{ $t('common.loadExample') }}
            </button>
            <button
              @click="clearInput"
              class="px-3 py-1 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/30 hover:border-slate-500/50"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <textarea
          v-model="inputJson"
          :placeholder="$t('tools.jsonArraySlicer.inputPlaceholder')"
          class="w-full h-64 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono text-sm text-slate-100 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          @input="analyzeArray"
        ></textarea>

        <!-- Slicing Options -->
        <div class="mt-6 space-y-5">
          <h4 class="font-medium text-slate-200">
            {{ $t('tools.jsonArraySlicer.slicingOptions') }}
          </h4>

          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label class="text-sm font-medium text-slate-300 min-w-[80px]"
                >{{ $t('tools.jsonArraySlicer.method') }}:</label
              >
              <select
                v-model="options.method"
                @change="analyzeArray"
                class="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="index">{{ $t('tools.jsonArraySlicer.indexRange') }}</option>
                <option value="condition">
                  {{ $t('tools.jsonArraySlicer.conditionalFilter') }}
                </option>
                <option value="random">{{ $t('tools.jsonArraySlicer.randomSample') }}</option>
              </select>
            </div>

            <!-- Index Range Options -->
            <div v-if="options.method === 'index'" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label class="text-sm font-medium text-slate-300 min-w-[80px]"
                    >{{ $t('tools.jsonArraySlicer.startIndex') }}:</label
                  >
                  <input
                    v-model.number="options.startIndex"
                    @input="analyzeArray"
                    type="number"
                    min="0"
                    class="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label class="text-sm font-medium text-slate-300 min-w-[80px]"
                    >{{ $t('tools.jsonArraySlicer.endIndex') }}:</label
                  >
                  <input
                    v-model.number="options.endIndex"
                    @input="analyzeArray"
                    type="number"
                    class="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <!-- Conditional Options -->
            <div v-if="options.method === 'condition'" class="space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label class="text-sm font-medium text-slate-300 min-w-[80px]"
                  >{{ $t('tools.jsonArraySlicer.conditionField') }}:</label
                >
                <input
                  v-model="options.conditionField"
                  @input="analyzeArray"
                  type="text"
                  class="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select
                  v-model="options.operator"
                  @change="analyzeArray"
                  class="px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
                  <option value="less">
                    {{ $t('tools.jsonArraySlicer.operators.less') }}
                  </option>
                  <option value="contains">
                    {{ $t('tools.jsonArraySlicer.operators.contains') }}
                  </option>
                </select>
                <input
                  v-model="options.conditionValue"
                  @input="analyzeArray"
                  type="text"
                  :placeholder="$t('tools.jsonArraySlicer.conditionValue')"
                  class="col-span-2 px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <!-- Random Sample Options -->
            <div v-if="options.method === 'random'" class="space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label class="text-sm font-medium text-slate-300 min-w-[80px]"
                  >{{ $t('tools.jsonArraySlicer.sampleCount') }}:</label
                >
                <input
                  v-model.number="options.sampleCount"
                  @input="analyzeArray"
                  type="number"
                  min="1"
                  class="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <label class="flex items-center">
                <input
                  v-model="options.preserveOrder"
                  @change="analyzeArray"
                  type="checkbox"
                  class="mr-3 h-4 w-4 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                />
                <span class="text-sm text-slate-300">
                  {{ $t('tools.jsonArraySlicer.preserveOrder') }}
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Array Info -->
        <div v-if="arrayInfo" class="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h5 class="font-medium text-blue-300 mb-3">
            {{ $t('tools.jsonArraySlicer.arrayInfo') }}:
          </h5>
          <div class="text-sm text-blue-400 space-y-1">
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
          class="w-full mt-6 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {{ $t('tools.jsonArraySlicer.sliceButton') }}
        </button>
      </div>

      <!-- Output Section -->
      <div class="glass rounded-xl border border-slate-700/30 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ $t('tools.jsonArraySlicer.slicedArray') }}
          </h3>
          <div class="flex space-x-2">
            <button
              v-if="slicedOutput"
              @click="copyToClipboard"
              class="px-3 py-1 text-sm bg-blue-500/10 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/30 hover:border-blue-500/50"
            >
              {{ $t('common.copy') }}
            </button>
            <button
              v-if="slicedOutput"
              @click="downloadJson"
              class="px-3 py-1 text-sm bg-green-500/10 text-green-300 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30 hover:border-green-500/50"
            >
              {{ $t('common.download') }}
            </button>
          </div>
        </div>

        <div
          v-if="!slicedOutput && !error"
          class="h-80 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-lg"
        >
          <div class="text-center">
            <div class="text-3xl mb-2">📊</div>
            <p>{{ $t('tools.jsonArraySlicer.noResults') }}</p>
          </div>
        </div>

        <div v-if="error" class="h-80 flex items-center justify-center">
          <div class="text-center text-red-400">
            <div class="text-3xl mb-2">❌</div>
            <p class="font-medium">{{ $t('toast.error') }}</p>
            <p class="text-sm mt-1">{{ error }}</p>
          </div>
        </div>

        <div v-if="slicedOutput && !error" class="space-y-4">
          <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div class="flex items-center">
              <div class="text-green-400 text-2xl mr-3">✅</div>
              <div>
                <p class="font-medium text-green-300">{{ $t('common.success') }}</p>
                <p class="text-sm text-green-400">{{ slicingStats }}</p>
              </div>
            </div>
          </div>

          <textarea
            :value="slicedOutput"
            readonly
            class="w-full h-80 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono text-sm text-slate-100 resize-none"
          ></textarea>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
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

// Use showError when displaying error messages
function showErrorToast(message: string) {
  showError(message)
}

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

// Define types for JSON values
type JsonValue = string | number | boolean | null | JsonArray | JsonObject
interface JsonObject {
  [key: string]: JsonValue
}
type JsonArray = JsonValue[]

function loadExample() {
  const example: JsonObject[] = [
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
    const parsed: JsonValue = JSON.parse(inputJson.value)

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
      const matching = (parsed as JsonArray).filter((item) => matchesCondition(item)).length
      info.matching = matching
    }

    arrayInfo.value = info
  } catch (e) {
    const errorMessage = t('tools.jsonArraySlicer.errors.invalidJson') + ' ' + (e as Error).message
    error.value = errorMessage
    showErrorToast(errorMessage)
    isValidArray.value = false
  }
}

function matchesCondition(item: JsonValue): boolean {
  // Check if item is an object
  if (typeof item !== 'object' || item === null || Array.isArray(item)) {
    return false
  }

  const obj = item as JsonObject
  const { conditionField, operator, conditionValue } = options.value

  if (!conditionField || !(conditionField in obj)) {
    return false
  }

  const itemValue = obj[conditionField]
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
    const parsed: JsonArray = JSON.parse(inputJson.value)
    let result: JsonArray = []
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
    const errorMessage = t('tools.jsonArraySlicer.errors.invalidJson') + ' ' + (e as Error).message
    error.value = errorMessage
    showErrorToast(errorMessage)
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
