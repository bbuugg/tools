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
                @click="formatPanel('left')"
                :disabled="!leftContent.trim()"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {{ $t('tools.universalConverter.formatButton') }}
              </button>
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
              @change="convertLeftToRight"
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
                @click="formatPanel('right')"
                :disabled="!rightContent.trim()"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {{ $t('tools.universalConverter.formatButton') }}
              </button>
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
              @change="convertRightToLeft"
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

// Format content before conversion
function formatContent(content: string, format: string): string {
  try {
    switch (format) {
      case 'json':
        // 格式化 JSON
        const jsonData = JSON.parse(content)
        return JSON.stringify(jsonData, null, 2)
      case 'xml':
        // 格式化 XML
        return formatXmlString(content)
      case 'query':
        // Query 参数不需要特殊格式化，只是清理空白
        return content.trim()
      default:
        return content
    }
  } catch (err) {
    // 如果格式化失败，返回原内容
    return content
  }
}

// Format XML string for better readability
function formatXmlString(xmlString: string): string {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

    // 检查解析错误
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      return xmlString // 如果解析失败，返回原字符串
    }

    // 使用 XMLSerializer 重新序列化
    const serializer = new XMLSerializer()
    let formatted = serializer.serializeToString(xmlDoc)

    // 简单的格式化处理
    formatted = formatted.replace(/></g, '>\n<')

    // 添加缩进
    const lines = formatted.split('\n')
    let indentLevel = 0
    const indentedLines = lines.map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return ''

      if (trimmed.startsWith('</')) {
        indentLevel--
      }

      const indented = '  '.repeat(Math.max(0, indentLevel)) + trimmed

      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indentLevel++
      }

      return indented
    })

    return indentedLines.join('\n')
  } catch (err) {
    return xmlString
  }
}

// Convert content from one format to another
function convertContent(content: string, fromFormat: string, toFormat: string): string {
  if (fromFormat === toFormat) {
    // 即使格式相同，也进行格式化
    return formatContent(content, fromFormat)
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
    // 使用原生的 DOMParser 来解析 XML，避免 xml2js 的兼容性问题
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(content, 'text/xml')

    // 检查解析错误
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      throw new Error(t('tools.universalConverter.errors.invalidXml'))
    }

    // 将 XML DOM 转换为 JavaScript 对象
    function xmlToObject(node: Element): any {
      const result: any = {}

      // 处理属性
      if (node.attributes && node.attributes.length > 0) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i]
          result[`@${attr.name}`] = attr.value
        }
      }

      // 处理子节点
      const children = Array.from(node.children)

      // 获取纯文本内容（排除子元素的文本）
      let directTextContent = ''
      for (const childNode of node.childNodes) {
        if (childNode.nodeType === Node.TEXT_NODE) {
          const text = childNode.textContent?.trim()
          if (text) {
            directTextContent += text
          }
        }
      }

      if (children.length === 0) {
        // 叶子节点，返回文本内容
        return directTextContent || ''
      }

      // 处理子元素
      const childGroups: { [key: string]: any[] } = {}

      children.forEach((child) => {
        const tagName = child.tagName
        const childValue = xmlToObject(child)

        if (!childGroups[tagName]) {
          childGroups[tagName] = []
        }
        childGroups[tagName].push(childValue)
      })

      // 将子元素添加到结果中
      Object.keys(childGroups).forEach((tagName) => {
        const values = childGroups[tagName]
        if (values.length === 1) {
          result[tagName] = values[0]
        } else {
          result[tagName] = values
        }
      })

      // 只有在有直接文本内容且有子元素时才添加 #text 属性
      if (directTextContent && Object.keys(result).length > 0) {
        result['#text'] = directTextContent
      }

      return formatXml(result)
    }

    // 从根元素开始转换
    const rootElement = xmlDoc.documentElement
    if (!rootElement) {
      throw new Error(t('tools.universalConverter.errors.invalidXml'))
    }

    return { [rootElement.tagName]: xmlToObject(rootElement) }
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
        const decodedKey = decodeURIComponent(key)
        const decodedValue = value ? decodeURIComponent(value) : ''

        // Handle array notation like key[0], key[1] or key[]
        const arrayMatch = decodedKey.match(/^(.+?)\[(\d*)\]$/)
        if (arrayMatch) {
          const [, baseKey, index] = arrayMatch
          if (!params[baseKey]) {
            params[baseKey] = []
          }
          if (index === '') {
            // key[] notation - push to array
            params[baseKey].push(decodedValue)
          } else {
            // key[0] notation - set at specific index
            params[baseKey][parseInt(index)] = decodedValue
          }
        } else {
          // Handle nested object notation like key[subkey]
          const nestedMatch = decodedKey.match(/^(.+?)\[(.+?)\]$/)
          if (nestedMatch) {
            const [, baseKey, subKey] = nestedMatch
            if (!params[baseKey]) {
              params[baseKey] = {}
            }
            params[baseKey][subKey] = decodedValue
          } else {
            // Simple key-value pair
            params[decodedKey] = decodedValue
          }
        }
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
    // 使用原生方法生成 XML
    function objectToXml(obj: any, indent = 0): string {
      const spaces = '  '.repeat(indent)
      let xml = ''

      if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        return String(obj)
      }

      if (obj === null || obj === undefined) {
        return ''
      }

      if (Array.isArray(obj)) {
        // 处理数组：为每个元素创建 <item> 标签
        obj.forEach((item) => {
          xml += `${spaces}<item>\n`
          xml += `${spaces}  ${objectToXml(item, indent + 1)}\n`
          xml += `${spaces}</item>\n`
        })
        return xml.trim()
      }

      if (typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
          const value = obj[key]

          if (Array.isArray(value)) {
            xml += `${spaces}<${key}>\n`
            value.forEach((item) => {
              xml += `${spaces}  <item>\n`
              const itemXml = objectToXml(item, indent + 2)
              if (itemXml) {
                xml += `${itemXml}\n`
              }
              xml += `${spaces}  </item>\n`
            })
            xml += `${spaces}</${key}>\n`
          } else if (typeof value === 'object' && value !== null) {
            xml += `${spaces}<${key}>\n`
            xml += objectToXml(value, indent + 1)
            xml += `${spaces}</${key}>\n`
          } else {
            xml += `${spaces}<${key}>${String(value)}</${key}>\n`
          }
        })
      }

      return xml
    }

    return objectToXml(data, 1)
  } catch (err) {
    throw new Error(t('tools.universalConverter.errors.xmlGenerationFailed'))
  }
}

// Format as Query Parameters
function formatQuery(data: any): string {
  try {
    const pairs: string[] = []

    function buildPairs(obj: any, prefix = '') {
      if (obj === null || obj === undefined) {
        pairs.push(`${encodeURIComponent(prefix)}=`)
        return
      }

      if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
          if (obj.length === 0) {
            pairs.push(`${encodeURIComponent(prefix)}=`)
          } else {
            obj.forEach((item, index) => {
              const arrayKey = prefix ? `${prefix}[${index}]` : `[${index}]`
              buildPairs(item, arrayKey)
            })
          }
        } else {
          const keys = Object.keys(obj)
          if (keys.length === 0) {
            pairs.push(`${encodeURIComponent(prefix)}=`)
          } else {
            keys.forEach((key) => {
              const value = obj[key]
              const newPrefix = prefix ? `${prefix}[${key}]` : key
              buildPairs(value, newPrefix)
            })
          }
        }
      } else {
        // Handle primitive values (string, number, boolean)
        const stringValue = obj === true ? 'true' : obj === false ? 'false' : String(obj)
        pairs.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(stringValue)}`)
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

// Format panel content
function formatPanel(panel: 'left' | 'right') {
  try {
    if (panel === 'left') {
      if (!leftContent.value.trim()) return
      leftError.value = ''
      const formatted = formatContent(leftContent.value, leftFormat.value)
      leftContent.value = formatted
    } else {
      if (!rightContent.value.trim()) return
      rightError.value = ''
      const formatted = formatContent(rightContent.value, rightFormat.value)
      rightContent.value = formatted
    }
  } catch (err: any) {
    const errorMessage = err.message || t('tools.universalConverter.errors.formatFailed')
    if (panel === 'left') {
      leftError.value = errorMessage
    } else {
      rightError.value = errorMessage
    }
    showError(errorMessage)
  }
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
      return '<key>value</key>\n'
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
