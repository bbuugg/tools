<template>
  <ToolLayout
    :title="$t('tools.textSteganography.title')"
    :description="$t('tools.textSteganography.description')"
    icon="🔒"
    :features="['零宽字符', '文本隐写', '安全加密']"
  >
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Encryption Section -->
      <Card class="glass border-slate-700/50">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.textSteganography.encryptionTitle') }}
            </h3>
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-200 mb-2">
              {{ $t('tools.textSteganography.visibleText') }}
            </label>
            <Textarea
              v-model="state.text"
              :placeholder="$t('tools.textSteganography.visibleTextPlaceholder')"
              class="w-full font-mono text-sm resize-none"
              rows="4"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-200 mb-2">
              {{ $t('tools.textSteganography.hiddenText') }}
            </label>
            <Textarea
              v-model="state.hiddenText"
              :placeholder="$t('tools.textSteganography.hiddenTextPlaceholder')"
              class="w-full font-mono text-sm resize-none"
              rows="4"
            />
          </div>

          <Button
            @click="encodeStr"
            :disabled="!state.text || !state.hiddenText"
            class="w-full"
            variant="primary"
            size="lg"
          >
            {{ $t('tools.textSteganography.generateSteganography') }}
          </Button>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-slate-200">
                {{ $t('tools.textSteganography.steganographyResult') }}
              </label>
              <Button
                v-if="state.cipherText"
                @click="copyToClipboard(state.cipherText)"
                variant="ghost"
                size="sm"
              >
                {{ $t('common.copy') }}
              </Button>
            </div>
            <Textarea
              v-model="state.cipherText"
              readonly
              class="w-full font-mono text-sm resize-none bg-slate-800/30"
              rows="4"
            />
          </div>
        </div>
      </Card>

      <!-- Decryption Section -->
      <Card class="glass border-slate-700/50">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.textSteganography.decryptionTitle') }}
            </h3>
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-200 mb-2">
              {{ $t('tools.textSteganography.steganographyText') }}
            </label>
            <Textarea
              v-model="state.tempText"
              :placeholder="$t('tools.textSteganography.steganographyTextPlaceholder')"
              class="w-full font-mono text-sm resize-none"
              rows="4"
              @input="decodeStr"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-slate-200">
                {{ $t('tools.textSteganography.decodedText') }}
              </label>
              <Button
                v-if="state.decodeText"
                @click="copyToClipboard(state.decodeText)"
                variant="ghost"
                size="sm"
              >
                {{ $t('common.copy') }}
              </Button>
            </div>
            <div class="w-full p-3 border border-slate-600/50 rounded-xl bg-slate-800/30 overflow-auto min-h-[96px]">
              <p class="text-slate-100 font-mono text-sm whitespace-pre-wrap break-words">
                {{ state.decodeText }}
              </p>
            </div>
          </div>

          <Button
            @click="reset"
            class="w-full"
            variant="secondary"
            size="lg"
          >
            {{ $t('common.clear') }}
          </Button>
        </div>
      </Card>
    </div>
  </ToolLayout>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import ToolLayout from '@/components/ToolLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'

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
