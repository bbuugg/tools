<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import ToolLayout from '../components/ToolLayout.vue'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'
import Textarea from '../components/ui/Textarea.vue'

interface ConsoleMessage {
  content: string
  type: 'success' | 'danger' | 'info' | 'warning'
  time: string
}

interface Message {
  direction: 1 | 0 // 1 for sent, 0 for received
  content: string
  time: string
}

const { t } = useI18n()

// Reactive data
const consoleData = ref<ConsoleMessage[]>([])
const messageData = ref<Message[]>([])
const wsInstance = ref<WebSocket | null>(null)
const address = ref('ws://127.0.0.1:9501')
const content = ref('')
const heartBeatSecond = ref(1)
const heartBeatContent = ref('PING')
const autoSend = ref(false)
const autoTimer = ref<number | undefined>(undefined)
const sendClean = ref(false)
const recvClean = ref(false)
const recvDecode = ref(false)
const connected = ref(false)
const recvPause = ref(false)

// Alert data
const alertData = ref({
  class: 'success',
  state: false,
  content: '',
  timer: undefined as number | undefined,
})

// Helper functions
const formatDate = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

const showTips = (className: string, content: string) => {
  if (alertData.value.timer) {
    clearTimeout(alertData.value.timer)
  }

  alertData.value.state = false
  alertData.value.class = className
  alertData.value.content = content
  alertData.value.state = true

  alertData.value.timer = window.setTimeout(() => {
    alertData.value.state = false
  }, 3000)
}

const writeConsole = (className: 'success' | 'danger' | 'info' | 'warning', content: string) => {
  consoleData.value.push({
    content,
    type: className,
    time: formatDate(),
  })

  nextTick(() => {
    scrollToBottom('console-box')
  })
}

const formatJson = (content: string): string => {
  try {
    const parsed = JSON.parse(content)
    return JSON.stringify(parsed, null, 2)
  } catch (_error) {
    // If parsing fails, return original content
    // We don't need to use _error, just catch it to prevent throwing
    return content
  }
}

const writeNews = (direction: 1 | 0, content: string) => {
  if (recvClean.value) {
    messageData.value = []
  }

  // Format content as pretty JSON if recvDecode is enabled
  const formattedContent = recvDecode.value ? formatJson(content) : content

  messageData.value.push({
    direction,
    content: formattedContent,
    time: formatDate(),
  })

  nextTick(() => {
    if (!recvClean.value) {
      scrollToBottom('message-box')
    }
  })
}

const writeAlert = (className: 'success' | 'danger' | 'info' | 'warning', content: string) => {
  writeConsole(className, content)
  showTips(className, content)
}

const closeCode = (code: number) => {
  const codes: Record<number, string> = {
    1000: '1000 CLOSE_NORMAL',
    1001: '1001 CLOSE_GOING_AWAY',
    1002: '1002 CLOSE_PROTOCOL_ERROR',
    1003: '1003 CLOSE_UNSUPPORTED',
    1004: '1004 CLOSE_RETAIN',
    1005: '1005 CLOSE_NO_STATUS',
    1006: '1006 CLOSE_ABNORMAL',
    1007: '1007 UNSUPPORTED_DATA',
    1008: '1008 POLICY_VIOLATION',
    1009: '1009 CLOSE_TOO_LARGE',
    1010: '1010 MISSING_EXTENSION',
    1011: '1011 INTERNAL_ERROR',
    1012: '1012 SERVICE_RESTART',
    1013: '1013 TRY_AGAIN_LATER',
    1014: '1014 CLOSE_RETAIN',
    1015: '1015 TLS_HANDSHAKE',
  }

  return codes[code] || '0000 UNKNOWN_ERROR 未知错误'
}

const scrollToBottom = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollTop = element.scrollHeight
  }
}

// Main methods
const canUseH5WebSocket = () => {
  if ('WebSocket' in window) {
    writeAlert('success', t('tools.wsTool.initSuccess') || 'Initialization completed')
  } else {
    writeAlert(
      'danger',
      t('tools.wsTool.browserNotSupport') ||
        'Current browser does not support H5 WebSocket, please change browser',
    )
  }
}

const autoWsConnect = () => {
  try {
    if (!connected.value) {
      // Save address to localStorage
      localStorage.setItem('address', address.value)

      const ws = new WebSocket(address.value)
      wsInstance.value = ws

      ws.onopen = (ev) => {
        console.warn(ev)
        connected.value = true
        const service = address.value.replace('ws://', '').replace('wss://', '')
        writeAlert('success', `${t('tools.wsTool.opened')} => ${service}`)
      }

      ws.onclose = (ev) => {
        console.warn(ev)
        autoSend.value = false
        if (autoTimer.value) {
          clearInterval(autoTimer.value)
        }
        connected.value = false
        writeAlert('danger', `${t('tools.wsTool.closed')} => ${closeCode(ev.code)}`)
      }

      ws.onerror = (ev) => {
        console.warn(ev)
        writeConsole(
          'danger',
          t('tools.wsTool.errorOccurred') ||
            'An error occurred, please open the browser console to view',
        )
      }

      ws.onmessage = (ev) => {
        console.warn(ev)
        if (!recvPause.value) {
          const data = ev.data
          if (recvClean.value) messageData.value = []
          writeNews(0, data)
        }
      }
    } else {
      wsInstance.value?.close(1000, 'Active closure of the user')
    }
  } catch (err) {
    console.warn(err)
    writeAlert(
      'danger',
      t('tools.wsTool.createWsFailed') ||
        'Failed to create WebSocket object, please check the server address',
    )
  }
}

const autoHeartBeat = () => {
  if (autoSend.value) {
    autoSend.value = false
    if (autoTimer.value) {
      clearInterval(autoTimer.value)
    }
  } else {
    autoSend.value = true
    autoTimer.value = window.setInterval(() => {
      writeConsole('info', `${t('tools.wsTool.loopSend')}: ${heartBeatContent.value}`)
      sendData(heartBeatContent.value)
    }, heartBeatSecond.value * 1000)
  }
}

const sendData = (raw?: string) => {
  const data = typeof raw === 'object' ? content.value : raw || content.value

  try {
    if (wsInstance.value && wsInstance.value.readyState === WebSocket.OPEN) {
      wsInstance.value.send(data)
      writeNews(1, data)
      if (sendClean.value && typeof raw === 'object') {
        content.value = ''
      }
    } else {
      writeAlert(
        'danger',
        t('tools.wsTool.sendFailed') || 'Failed to send message, please check console for details',
      )
    }
  } catch (err) {
    writeAlert(
      'danger',
      t('tools.wsTool.sendFailed') || 'Failed to send message, please check console for details',
    )
    throw err
  }
}

const cleanMessage = () => {
  messageData.value = []
}

// Lifecycle
canUseH5WebSocket()

// Load address from localStorage if exists
const savedAddress = localStorage.getItem('address')
if (savedAddress) {
  address.value = savedAddress
}

onUnmounted(() => {
  if (autoTimer.value) {
    clearInterval(autoTimer.value)
  }
  wsInstance.value?.close()
})
</script>

<template>
  <ToolLayout :title="t('tools.wsTool.title')" :description="t('tools.wsTool.description')">
    <!-- Alert -->
    <transition name="slide-fade">
      <div
        v-if="alertData.state"
        class="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4"
        :class="`bg-${alertData.class === 'danger' ? 'red' : alertData.class === 'success' ? 'green' : alertData.class === 'info' ? 'blue' : 'yellow'}-500 text-white rounded-lg p-3 text-center shadow-lg`"
      >
        {{ alertData.content }}
      </div>
    </transition>

    <div class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Panel -->
        <div class="space-y-6">
          <!-- Server Configuration -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-slate-100">
                {{ t('tools.wsTool.serverConfig') }}
              </h2>
              <span class="text-sm px-2 py-1 rounded bg-slate-700 text-slate-300">
                {{ t('tools.wsTool.status') }}:
                <span
                  :class="{
                    'text-red-400': !wsInstance,
                    'text-yellow-400': wsInstance && wsInstance.readyState === 0,
                    'text-green-400': wsInstance && wsInstance.readyState === 1,
                    'text-orange-400': wsInstance && wsInstance.readyState === 2,
                    'text-gray-400': wsInstance && wsInstance.readyState === 3,
                  }"
                >
                  {{
                    !wsInstance
                      ? t('tools.wsTool.notCreated')
                      : wsInstance.readyState === 0
                        ? t('tools.wsTool.notOpened')
                        : wsInstance.readyState === 1
                          ? t('tools.wsTool.connected')
                          : wsInstance.readyState === 2
                            ? t('tools.wsTool.closing')
                            : t('tools.wsTool.closedStatus')
                  }}
                </span>
              </span>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  {{ t('tools.wsTool.serverAddress') }}
                </label>
                <div class="flex space-x-2">
                  <Input
                    v-model="address"
                    :placeholder="
                      t('tools.wsTool.addressPlaceholder') || 'Enter server address without prefix'
                    "
                    :disabled="connected"
                    class="flex-1"
                  />
                  <Button :variant="connected ? 'danger' : 'success'" @click="autoWsConnect">
                    {{
                      connected
                        ? t('tools.wsTool.closeConnection')
                        : t('tools.wsTool.openConnection')
                    }}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Packet Settings -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 class="text-xl font-semibold mb-4 text-slate-100">
              {{ t('tools.wsTool.packetSettings') }}
            </h2>

            <!-- Auto Send -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ t('tools.wsTool.autoSend') }}
              </label>
              <div class="flex space-x-2">
                <Input
                  v-model.number="heartBeatSecond"
                  type="number"
                  min="1"
                  :disabled="!connected"
                  class="w-20"
                />
                <div class="flex items-center text-slate-300">
                  {{ t('tools.wsTool.secondsSend') }}
                </div>
                <Input v-model="heartBeatContent" :disabled="!connected" class="flex-1" />
                <Button
                  :variant="autoSend ? 'danger' : 'success'"
                  :disabled="!connected"
                  @click="autoHeartBeat"
                >
                  {{ autoSend ? t('tools.wsTool.stopSend') : t('tools.wsTool.startSend') }}
                </Button>
              </div>
            </div>

            <!-- Manual Send -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ t('tools.wsTool.manualSend') }}
              </label>
              <Textarea
                v-model="content"
                :placeholder="t('tools.wsTool.sendPlaceholder') || 'Content to send to server'"
                :disabled="!connected"
                rows="3"
                class="mb-3"
              />

              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <label class="flex items-center text-slate-300">
                    <input
                      v-model="sendClean"
                      type="checkbox"
                      :disabled="!connected"
                      class="mr-2 rounded bg-dark-800 border-dark-600 text-blue-500 focus:ring-blue-500"
                    />
                    {{ t('tools.wsTool.clearAfterSend') }}
                  </label>
                </div>

                <Button variant="success" :disabled="!connected" @click="sendData">
                  {{ t('tools.wsTool.sendToServer') }}
                </Button>
              </div>
            </div>
          </div>

          <!-- Debug Messages -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 class="text-xl font-semibold mb-4 text-slate-100">
              {{ t('tools.wsTool.debugMessages') }}
            </h2>

            <div
              id="console-box"
              class="bg-dark-900/50 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm"
            >
              <div
                v-if="consoleData.length === 0"
                class="text-slate-400 h-full flex items-center justify-center"
              >
                {{ t('tools.wsTool.noDebugMessages') }}
              </div>

              <div v-for="(item, index) in consoleData" :key="index" class="mb-2">
                <strong
                  :class="`text-${item.type === 'danger' ? 'red' : item.type === 'success' ? 'green' : item.type === 'info' ? 'blue' : 'yellow'}-400`"
                >
                  {{ item.time }} =&gt;
                </strong>
                <span class="text-slate-200">{{ item.content }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="space-y-6">
          <!-- Message History -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-slate-100">
                {{ t('tools.wsTool.messageHistory') }}
              </h2>
              <Button variant="secondary" size="sm" @click="cleanMessage">
                {{ t('tools.wsTool.clearMessages') }}
              </Button>
            </div>

            <div class="space-y-4 mb-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label class="flex items-center text-slate-300 text-sm">
                  <input
                    v-model="recvClean"
                    type="checkbox"
                    :disabled="!connected"
                    class="mr-2 rounded bg-dark-800 border-dark-600 text-blue-500 focus:ring-blue-500"
                  />
                  {{ t('tools.wsTool.clearAfterReceive') }}
                </label>

                <label class="flex items-center text-slate-300 text-sm">
                  <input
                    v-model="recvDecode"
                    type="checkbox"
                    :disabled="!connected"
                    class="mr-2 rounded bg-dark-800 border-dark-600 text-blue-500 focus:ring-blue-500"
                  />
                  {{ t('tools.wsTool.jsonDecode') }}
                </label>

                <label class="flex items-center text-slate-300 text-sm">
                  <input
                    v-model="recvPause"
                    type="checkbox"
                    :disabled="!connected"
                    class="mr-2 rounded bg-dark-800 border-dark-600 text-blue-500 focus:ring-blue-500"
                  />
                  {{ t('tools.wsTool.pauseReceive') }}
                </label>
              </div>
            </div>

            <div
              id="message-box"
              class="bg-dark-900/50 rounded-lg p-4 h-96 overflow-y-auto font-mono"
            >
              <div
                v-if="messageData.length === 0"
                class="text-slate-400 h-full flex items-center justify-center"
              >
                {{ t('tools.wsTool.noMessages') }}
              </div>

              <div
                v-for="(item, index) in messageData"
                :key="index"
                class="mb-4"
                :class="{ 'text-left': item.direction, 'text-right': !item.direction }"
              >
                <div class="mb-1">
                  <strong :class="item.direction ? 'text-green-400' : 'text-blue-400'">
                    {{ item.direction ? t('tools.wsTool.sent') : t('tools.wsTool.received') }}
                  </strong>
                  <span class="text-slate-400 text-sm ml-2">{{ item.time }}</span>
                </div>
                <div
                  v-if="!recvDecode"
                  class="text-slate-200 whitespace-pre-wrap break-words"
                  :class="{
                    'text-left': item.direction,
                    'text-right': !item.direction,
                    'bg-green-900/20 p-2 rounded': item.direction,
                    'bg-blue-900/20 p-2 rounded': !item.direction,
                  }"
                >
                  {{ item.content }}
                </div>
                <div
                  v-else
                  class="text-slate-200 whitespace-pre-wrap break-words text-left"
                  :class="{
                    'bg-green-900/20 p-2 rounded': item.direction,
                    'bg-blue-900/20 p-2 rounded': !item.direction,
                  }"
                >
                  {{ item.content }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.font-mono {
  font-family: monospace;
}
</style>
