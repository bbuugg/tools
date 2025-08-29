<template>
  <ToolLayout
    title="JSON 格式化工具"
    description="美化、验证和格式化 JSON 数据，支持多种格式选项"
    icon="🎨"
    :features="['JSON 美化', 'JSON 验证', '自定义缩进', '压缩格式', '语法高亮']"
    input-title="输入 JSON"
    output-title="格式化结果"
  >
    <template #input-actions>
      <div class="flex space-x-2">
        <Button size="sm" variant="ghost" @click="loadExample"> 加载示例 </Button>
        <Button size="sm" variant="ghost" @click="clearInput"> 清空 </Button>
      </div>
    </template>

    <template #input>
      <div class="space-y-4">
        <Textarea
          v-model="inputJson"
          placeholder="请输入要格式化的 JSON 数据..."
          :rows="20"
          class="font-mono text-sm"
          @input="validateJson"
        />

        <!-- Validation Status -->
        <div
          v-if="validationError"
          class="p-4 bg-error-500/10 border border-error-500/30 rounded-xl animate-slide-up"
        >
          <div class="flex items-start space-x-3">
            <div class="text-error-400 text-xl">❌</div>
            <div>
              <p class="font-medium text-error-400 mb-1">JSON 格式错误</p>
              <p class="text-sm text-error-300">{{ validationError }}</p>
            </div>
          </div>
        </div>

        <div
          v-else-if="inputJson.trim() && isValid"
          class="p-4 bg-success-500/10 border border-success-500/30 rounded-xl animate-slide-up"
        >
          <div class="flex items-center space-x-3">
            <div class="text-success-400 text-xl">✅</div>
            <p class="font-medium text-success-400">JSON 格式正确</p>
          </div>
        </div>

        <!-- Format Options -->
        <Card title="格式选项" icon="⚙️">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-200">缩进大小</label>
              <select
                v-model="indentSize"
                class="w-full bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                @change="formatJson"
              >
                <option value="2">2 空格</option>
                <option value="4">4 空格</option>
                <option value="tab">Tab</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-200">输出格式</label>
              <select
                v-model="outputFormat"
                class="w-full bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                @change="formatJson"
              >
                <option value="pretty">美化格式</option>
                <option value="compact">压缩格式</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </template>

    <template #output-actions>
      <div class="flex space-x-2">
        <Button size="sm" variant="ghost" @click="copyToClipboard" :disabled="!formattedJson">
          复制
        </Button>
        <Button size="sm" variant="ghost" @click="downloadJson" :disabled="!formattedJson">
          下载
        </Button>
      </div>
    </template>

    <template #output>
      <div class="space-y-4">
        <div v-if="!formattedJson && !validationError" class="text-center py-16">
          <div class="text-slate-400 text-6xl mb-4 animate-bounce-subtle">📝</div>
          <p class="text-slate-400">输入 JSON 数据开始格式化</p>
        </div>

        <Textarea
          v-else
          v-model="formattedJson"
          :rows="20"
          readonly
          class="font-mono text-sm"
          placeholder="格式化后的 JSON 将显示在这里..."
        />

        <!-- JSON Statistics -->
        <div v-if="formattedJson" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-slate-800/30 rounded-xl p-3 text-center">
            <div class="text-lg font-semibold text-primary-400">{{ jsonStats.size }}</div>
            <div class="text-xs text-slate-400">字符数</div>
          </div>
          <div class="bg-slate-800/30 rounded-xl p-3 text-center">
            <div class="text-lg font-semibold text-success-400">{{ jsonStats.lines }}</div>
            <div class="text-xs text-slate-400">行数</div>
          </div>
          <div class="bg-slate-800/30 rounded-xl p-3 text-center">
            <div class="text-lg font-semibold text-warning-400">{{ jsonStats.keys }}</div>
            <div class="text-xs text-slate-400">键数量</div>
          </div>
          <div class="bg-slate-800/30 rounded-xl p-3 text-center">
            <div class="text-lg font-semibold text-purple-400">{{ jsonStats.depth }}</div>
            <div class="text-xs text-slate-400">嵌套深度</div>
          </div>
        </div>
      </div>
    </template>
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Card from '@/components/ui/Card.vue'

const inputJson = ref('')
const formattedJson = ref('')
const validationError = ref('')
const isValid = ref(false)
const indentSize = ref('2')
const outputFormat = ref('pretty')

// JSON Statistics
const jsonStats = computed(() => {
  if (!formattedJson.value) {
    return { size: 0, lines: 0, keys: 0, depth: 0 }
  }

  const size = formattedJson.value.length
  const lines = formattedJson.value.split('\n').length

  let keys = 0
  let depth = 0

  try {
    const parsed = JSON.parse(inputJson.value)
    keys = countKeys(parsed)
    depth = getMaxDepth(parsed)
  } catch (e) {
    // ignore
  }

  return { size, lines, keys, depth }
})

// Helper functions
function countKeys(obj: any): number {
  if (typeof obj !== 'object' || obj === null) return 0
  if (Array.isArray(obj)) {
    return obj.reduce((count, item) => count + countKeys(item), 0)
  }
  return (
    Object.keys(obj).length +
    Object.values(obj).reduce((count, value) => count + countKeys(value), 0)
  )
}

function getMaxDepth(obj: any, currentDepth = 0): number {
  if (typeof obj !== 'object' || obj === null) return currentDepth
  if (Array.isArray(obj)) {
    return Math.max(currentDepth, ...obj.map((item) => getMaxDepth(item, currentDepth + 1)))
  }
  return Math.max(
    currentDepth,
    ...Object.values(obj).map((value) => getMaxDepth(value, currentDepth + 1)),
  )
}

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
  if (!inputJson.value.trim() || !isValid.value) {
    return
  }

  try {
    let data = JSON.parse(inputJson.value)

    // Sort keys if enabled
    if (options.sortKeys) {
      data = sortObjectKeys(data)
    }

    // Convert case if needed
    if (options.keyCase !== 'preserve' || options.valueCase !== 'preserve') {
      data = convertCase(data)
    }

    let formatted: string
    const indent = indentSize.value === 'tab' ? '\t' : parseInt(indentSize.value)

    if (outputFormat.value === 'compact') {
      formatted = JSON.stringify(data)
    } else {
      formatted = JSON.stringify(data, null, indent)
    }

    // Handle unicode escaping
    if (options.escapeUnicode) {
      formatted = formatted.replace(/[\u0080-\uFFFF]/g, function (match) {
        return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4)
      })
    }

    formattedJson.value = formatted
  } catch (error: unknown) {
    if (error instanceof Error) {
      validationError.value = error.message
    } else {
      validationError.value = String(error)
    }
  }
}

function copyToClipboard() {
  if (!formattedJson.value) return

  navigator.clipboard.writeText(formattedJson.value).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = formattedJson.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
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
}

// Auto-format when input changes
watch(
  [inputJson, indentSize, outputFormat],
  () => {
    if (isValid.value) {
      formatJson()
    }
  },
  { immediate: true },
)
</script>
