<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('tools.textSteganography.title') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('tools.textSteganography.description') }}
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔒</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.textSteganography.features.encryption.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.textSteganography.features.encryption.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🔓</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.textSteganography.features.decryption.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.textSteganography.features.decryption.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="text-2xl mb-3">🛡️</div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('tools.textSteganography.features.security.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.textSteganography.features.security.description') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Encryption Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.textSteganography.encryptionTitle') }}
            </h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.textSteganography.visibleText') }}
              </label>
              <textarea
                v-model="state.text"
                :placeholder="$t('tools.textSteganography.visibleTextPlaceholder')"
                class="w-full h-24 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.textSteganography.hiddenText') }}
              </label>
              <textarea
                v-model="state.hiddenText"
                :placeholder="$t('tools.textSteganography.hiddenTextPlaceholder')"
                class="w-full h-24 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <button
              @click="encodeStr"
              :disabled="!state.text || !state.hiddenText"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ $t('tools.textSteganography.generateSteganography') }}
            </button>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-sm font-medium text-gray-700">
                  {{ $t('tools.textSteganography.steganographyResult') }}
                </label>
                <button
                  v-if="state.cipherText"
                  @click="copyToClipboard(state.cipherText)"
                  class="text-xs text-blue-600 hover:text-blue-800"
                >
                  {{ $t('common.copy') }}
                </button>
              </div>
              <textarea
                v-model="state.cipherText"
                readonly
                class="w-full h-24 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Decryption Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.textSteganography.decryptionTitle') }}
            </h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.textSteganography.steganographyText') }}
              </label>
              <textarea
                v-model="state.tempText"
                :placeholder="$t('tools.textSteganography.steganographyTextPlaceholder')"
                class="w-full h-24 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @input="decodeStr"
              ></textarea>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-sm font-medium text-gray-700">
                  {{ $t('tools.textSteganography.decodedText') }}
                </label>
                <button
                  v-if="state.decodeText"
                  @click="copyToClipboard(state.decodeText)"
                  class="text-xs text-blue-600 hover:text-blue-800"
                >
                  {{ $t('common.copy') }}
                </button>
              </div>
              <div
                class="w-full h-24 p-3 border border-gray-300 rounded-lg bg-gray-50 overflow-auto"
              >
                <p class="text-gray-700 font-mono text-sm whitespace-pre-wrap">
                  {{ state.decodeText }}
                </p>
              </div>
            </div>

            <button
              @click="reset"
              class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { copySuccess, copyError } = useToast()

const state = reactive({
  text: '', // 明文
  hiddenText: '', // 隐写的隐藏文本
  cipherText: '', // 隐写后的密文
  tempText: '', // 临时的复制文本框
  decodeText: '', // 解密后的文本
})

function reset() {
  state.text = ''
  state.hiddenText = ''
  state.cipherText = ''
  state.tempText = ''
  state.decodeText = ''
}

// 字符串转零宽字符串
function encodeStr() {
  try {
    let tempStrArr = []
    tempStrArr = state.text.split('')
    tempStrArr.splice(
      1,
      0,
      // 加密的文本
      state.hiddenText
        .split('')
        // ['荣', '顶' ]
        .map((char) => char.codePointAt(0)!.toString(2))
        // ['1000001101100011','1001100001110110']
        .join(' ')
        // "1000001101100011 1001100001110110"
        .split('')
        /* [ '1', ''1', '1',  '0', '0', '0','1', '0', '1',  '1', '0'] */
        .map((binaryNum) => {
          if (binaryNum === '1') {
            return String.fromCharCode(8203) // 零宽空格符&#8203;
          }
          if (binaryNum === '0') {
            return String.fromCharCode(8204) // 零宽不连字符&#8204;
          }
          return String.fromCharCode(8205) // 空格 -> 零宽连字符&#8205;
        })
        .join(String.fromCharCode(8206)),
    )
    state.cipherText = tempStrArr.join('')
  } catch (error) {
    console.error('Encoding error:', error)
  }
}

// 零宽字符转字符串
function decodeStr() {
  if (!state.tempText) {
    state.decodeText = ''
    return
  }
  try {
    const text = state.tempText.replace(/[\u200b-\u200f\uFEFF\u202a-\u202e]/g, '')
    const hiddenText = state.tempText.replace(/[^\u200b-\u200f\uFEFF\u202a-\u202e]/g, '')
    state.decodeText = hiddenText
      .split('‎') // 不是空字符串,是 &#8206;
      .map((char) => {
        if (char === '​' /* 不是空字符串,是&#8203; */) {
          return '1'
        }
        if (char === '‌' /*  不是空字符串,是&#8204; */) {
          return '0'
        }
        /* 是&#8205;时,用空格替换 */
        return ' '
      })
      .join('')
      // 转数组
      .split(' ')
      // 根据指定的 Unicode 编码中的序号值来返回一个字符串。
      .map((binaryNum) => String.fromCharCode(parseInt(binaryNum, 2)))
      .join('')
  } catch (error) {
    console.error('Decoding error:', error)
    state.decodeText = t('tools.textSteganography.errors.decodingFailed')
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      copySuccess()
    })
    .catch(() => {
      copyError()
    })
}
</script>
