<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Room Entry Modal -->
    <div
      v-if="!inRoom"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
        <h1 class="text-2xl font-bold mb-6 text-center">{{ $t('tools.webRtcMeeting.title') }}</h1>

        <!-- Connection Status -->
        <div class="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div class="flex items-center space-x-2">
            <div
              :class="[
                'w-3 h-3 rounded-full',
                signalServerConnected ? 'bg-green-500' : 'bg-red-500',
              ]"
            ></div>
            <span class="text-sm">
              {{
                signalServerConnected
                  ? $t('tools.webRtcChatRoom.status.connected')
                  : $t('tools.webRtcChatRoom.status.connecting')
              }}
            </span>
          </div>
        </div>

        <!-- User Name Input -->
        <div class="mb-4">
          <label class="block mb-2 font-medium">{{ $t('tools.webRtcChatRoom.userName') }}</label>
          <input
            v-model="userName"
            :placeholder="$t('tools.webRtcChatRoom.userNamePlaceholder')"
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxlength="20"
          />
        </div>

        <!-- Room Actions -->
        <div class="space-y-3">
          <button
            @click="createRoom"
            :disabled="!signalServerConnected || !userName.trim()"
            class="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {{ $t('tools.webRtcChatRoom.room.createRoom') }}
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">{{
                $t('tools.webRtcChatRoom.or')
              }}</span>
            </div>
          </div>

          <div class="flex space-x-2">
            <input
              v-model="roomInput"
              :placeholder="$t('tools.webRtcChatRoom.room.roomIdPlaceholder')"
              class="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="!signalServerConnected"
              @keyup.enter="joinRoom"
            />
            <button
              @click="joinRoom"
              :disabled="!roomInput.trim() || !signalServerConnected || !userName.trim()"
              class="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {{ $t('tools.webRtcChatRoom.room.joinRoom') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Room Layout -->
    <div v-if="inRoom" class="flex flex-1 h-full">
      <!-- Sidebar - Participants and Controls -->
      <div
        class="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
      >
        <!-- Room Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-semibold text-lg">{{ $t('tools.webRtcChatRoom.room.title') }}</h2>
              <p class="text-sm text-gray-500 font-mono">{{ currentRoomId }}</p>
            </div>
            <button
              @click="leaveRoom"
              class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              {{ $t('tools.webRtcChatRoom.room.leave') }}
            </button>
          </div>
        </div>

        <!-- Video Section -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <!-- Local Video -->
          <div class="mb-4">
            <div class="font-medium mb-2 text-sm">
              {{ $t('tools.webRtcChatRoom.video.localVideo') }}
            </div>
            <div class="relative bg-black rounded overflow-hidden">
              <video
                ref="localVideo"
                autoplay
                playsinline
                muted
                class="w-full h-32 object-cover"
              ></video>
              <div
                class="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded"
              >
                {{ userName || $t('tools.webRtcChatRoom.room.you') }}
              </div>
            </div>
          </div>

          <!-- Remote Videos -->
          <div v-if="remoteStreams.length > 0" class="space-y-2">
            <div class="font-medium text-sm">
              {{ $t('tools.webRtcChatRoom.video.remoteVideos') }}
            </div>
            <div
              v-for="stream in remoteStreams"
              :key="stream.id"
              class="relative bg-black rounded overflow-hidden"
            >
              <video
                :ref="(el) => setRemoteVideoRef(el, stream.id)"
                autoplay
                playsinline
                class="w-full h-32 object-cover"
              ></video>
              <div
                class="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded"
              >
                {{ getParticipantName(stream.id) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Media Controls -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="toggleCamera"
              :class="[
                'px-3 py-2 text-sm rounded flex items-center justify-center',
                cameraEnabled
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white',
              ]"
            >
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  v-if="cameraEnabled"
                  d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                />
                <path
                  v-else
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 14V8a2 2 0 00-2-2h-3l-1-1H9.414l-3.707-3.707zM2 6a2 2 0 012-2h.586l2 2H4v8a2 2 0 002 2h8v-.586l2 2H4a2 2 0 01-2-2V6z"
                />
              </svg>
              {{
                cameraEnabled
                  ? $t('tools.webRtcChatRoom.controls.camera')
                  : $t('tools.webRtcChatRoom.controls.cameraOff')
              }}
            </button>

            <button
              @click="toggleMicrophone"
              :class="[
                'px-3 py-2 text-sm rounded flex items-center justify-center',
                microphoneEnabled
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white',
              ]"
            >
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path v-if="microphoneEnabled" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                <path
                  v-if="microphoneEnabled"
                  d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z"
                />
                <path
                  v-else
                  d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM7.5 6.69V4a2.5 2.5 0 015 0v2.5L7.5 6.69z"
                />
              </svg>
              {{
                microphoneEnabled
                  ? $t('tools.webRtcChatRoom.controls.mic')
                  : $t('tools.webRtcChatRoom.controls.micOff')
              }}
            </button>

            <button
              @click="toggleScreenShare"
              :class="[
                'px-3 py-2 text-sm rounded flex items-center justify-center col-span-2',
                screenSharingEnabled
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white',
              ]"
            >
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M2 3a1 1 0 011-1h14a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 2v7h12V5H4z"
                />
              </svg>
              {{
                screenSharingEnabled
                  ? $t('tools.webRtcChatRoom.controls.stopScreen')
                  : $t('tools.webRtcChatRoom.controls.shareScreen')
              }}
            </button>
          </div>
        </div>

        <!-- Participants List -->
        <div class="flex-1 p-4 overflow-y-auto">
          <div class="font-medium mb-3 text-sm">
            {{ $t('tools.webRtcChatRoom.participants.title') }} ({{ participants.length }})
          </div>
          <div class="space-y-2">
            <div
              v-for="participant in participants"
              :key="participant.id"
              class="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div class="flex items-center space-x-2">
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    participant.id === localDeviceId ? 'bg-blue-500' : 'bg-green-500',
                  ]"
                ></div>
                <span class="text-sm">
                  {{ participant.name || participant.id }}
                  <span v-if="participant.id === localDeviceId" class="text-xs text-gray-500">
                    ({{ $t('tools.webRtcChatRoom.room.you') }})
                  </span>
                  <span v-if="participant.role === 'host'" class="text-xs text-yellow-500 ml-1">
                    👑
                  </span>
                </span>
              </div>

              <!-- Participant Controls (only for host) -->
              <div v-if="isHost && participant.id !== localDeviceId" class="flex space-x-1">
                <button
                  @click="muteParticipant(participant.id)"
                  class="p-1 text-gray-400 hover:text-red-500"
                  :title="$t('tools.webRtcChatRoom.controls.mute')"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793z"
                    />
                    <path
                      d="M15.293 7.293a1 1 0 011.414 0L18 8.586l1.293-1.293a1 1 0 111.414 1.414L19.414 10l1.293 1.293a1 1 0 01-1.414 1.414L18 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L16.586 10l-1.293-1.293a1 1 0 010-1.414z"
                    />
                  </svg>
                </button>
                <button
                  @click="kickParticipant(participant.id)"
                  class="p-1 text-gray-400 hover:text-red-500"
                  :title="$t('tools.webRtcChatRoom.controls.kick')"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 001.414 1.414L10 12.414l3.293 3.293a1 1 0 001.414-1.414L11.414 11l3.293-3.293z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col">
        <!-- Chat Messages -->
        <div class="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div class="space-y-3">
            <div
              v-for="message in chatMessages.filter((m) => m && m.id)"
              :key="message.id"
              :class="[
                'flex',
                message.senderId === localDeviceId ? 'justify-end' : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  message.senderId === localDeviceId
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                ]"
              >
                <!-- Message Header -->
                <div
                  v-if="message.senderId !== localDeviceId"
                  class="text-xs text-gray-500 dark:text-gray-400 mb-1"
                >
                  {{ getParticipantName(message.senderId) }}
                </div>

                <!-- Message Content -->
                <div v-if="message.type === 'text'" class="break-words">
                  {{ message.content }}
                </div>

                <!-- File Message -->
                <div v-else-if="message.type === 'file'" class="space-y-2">
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      />
                    </svg>
                    <span class="text-sm">{{ message.fileName }}</span>
                  </div>
                  <div class="text-xs opacity-75">{{ formatFileSize(message.fileSize || 0) }}</div>
                  <button
                    v-if="message.fileUrl"
                    @click="downloadFile(message.fileUrl, message.fileName)"
                    class="text-xs underline hover:no-underline"
                  >
                    {{ $t('tools.webRtcChatRoom.chat.download') }}
                  </button>
                </div>

                <!-- System Message -->
                <div v-else-if="message.type === 'system'" class="text-sm italic">
                  {{ message.content }}
                </div>

                <!-- Message Timestamp -->
                <div class="text-xs opacity-75 mt-1">
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input Area -->
        <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div class="flex space-x-2">
            <!-- File Upload Button -->
            <button
              @click="triggerFileUpload"
              class="px-3 py-2 text-gray-500 hover:text-blue-500 border border-gray-300 rounded-lg hover:border-blue-500"
              :title="$t('tools.webRtcChatRoom.chat.sendFile')"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path
                  d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L12.586 15H17v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2v2h-2v-2z"
                />
              </svg>
            </button>

            <!-- Message Input -->
            <input
              v-model="messageInput"
              @keyup.enter="sendMessage"
              :placeholder="$t('tools.webRtcChatRoom.chat.placeholder')"
              class="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxlength="500"
            />

            <!-- Send Button -->
            <button
              @click="sendMessage"
              :disabled="!messageInput.trim()"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('tools.webRtcChatRoom.chat.send') }}
            </button>
          </div>

          <!-- File Input (Hidden) -->
          <input ref="fileInput" type="file" @change="handleFileSelect" class="hidden" />
        </div>
      </div>
    </div>

    <!-- Debug Logs (Collapsible) -->
    <div
      v-if="inRoom && showLogs"
      class="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-40"
    >
      <div
        class="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
      >
        <h3 class="font-medium text-sm">{{ $t('tools.webRtcChatRoom.logs.title') }}</h3>
        <button @click="showLogs = false" class="text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div class="p-3 h-40 overflow-y-auto font-mono text-xs">
        <div
          v-for="(log, index) in logs"
          :key="index"
          :class="{
            'text-red-500': log.type === 'error',
            'text-yellow-500': log.type === 'warning',
            'text-green-500': log.type === 'success',
            'text-blue-500': log.type === 'info',
          }"
        >
          [{{ log.timestamp }}] {{ log.message }}
        </div>
      </div>
    </div>

    <!-- Debug Toggle Button -->
    <button
      v-if="inRoom && !showLogs"
      @click="showLogs = true"
      class="fixed bottom-4 right-4 p-2 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 z-40"
      :title="$t('tools.webRtcChatRoom.logs.showLogs')"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

// i18n
const { t } = useI18n()

// Reactive references
const connectionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const signalServerConnected = ref(false)
const localDeviceId = ref('')
const selectedFile = ref<File | null>(null)
const isSending = ref(false)
const transferProgress = ref(0)
const logs = ref<
  { timestamp: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[]
>([])
const fileInput = ref<HTMLInputElement | null>(null)
const showLogs = ref(false)

// User and Room functionality
const userName = ref('')
const roomInput = ref('')
const currentRoomId = ref('')
const inRoom = ref(false)
const isHost = ref(false)
const participants = ref<{ id: string; name?: string; role?: 'host' | 'member' }[]>([])

// Chat functionality
const messageInput = ref('')
const chatMessages = ref<
  {
    id: string
    type: 'text' | 'file' | 'system'
    content: string
    senderId: string
    senderName: string
    timestamp: number
    fileName?: string
    fileSize?: number
    fileUrl?: string
  }[]
>([])

// Audio/Video functionality
const localVideo = ref<HTMLVideoElement | null>(null)
const remoteVideoRefs = ref<Record<string, HTMLVideoElement | null>>({})
const localStream = ref<MediaStream | null>(null)
const remoteStreams = ref<{ id: string; stream: MediaStream }[]>([])
const cameraEnabled = ref(false)
const microphoneEnabled = ref(false)
const screenSharingEnabled = ref(false)
const screenStream = ref<MediaStream | null>(null)
const isRecording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)

// WebRTC related
const peerConnections = new Map<string, RTCPeerConnection>() // Map of participant ID to RTCPeerConnection
const dataChannels = new Map<string, RTCDataChannel>() // Map of participant ID to RTCDataChannel
let signalServer: WebSocket | null = null
let connectionTimeout: number | null = null

// Connection request handling
const connectionRequests = ref<{ id: string; name?: string }[]>([])

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Add log entry
const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const now = new Date()
  const timestamp = now.toTimeString().split(' ')[0]
  logs.value.push({ timestamp, message, type })

  // Keep only the last 100 logs
  if (logs.value.length > 100) {
    logs.value.shift()
  }
}

// Connect to signaling server
const connectToSignalingServer = () => {
  const ports = [3000, 3001, 3002, 3003]
  let currentPortIndex = 0

  const tryConnect = () => {
    if (currentPortIndex >= ports.length) {
      addLog(
        t('tools.webRtcFileTransfer.logs.signalServerConnectionFailed', {
          error: 'No available ports',
        }),
        'error',
      )
      return
    }

    const port = ports[currentPortIndex]
    addLog(t('tools.webRtcFileTransfer.logs.connectingToSignalServer', { port }), 'info')

    try {
      // Connect to the signaling server
      signalServer = new WebSocket(`ws://localhost:${port}`)

      signalServer.onopen = () => {
        signalServerConnected.value = true
        addLog(t('tools.webRtcFileTransfer.logs.signalServerConnected'), 'success')
      }

      signalServer.onmessage = (event) => {
        handleMessageFromServer(event.data)
      }

      signalServer.onclose = () => {
        if (signalServerConnected.value) {
          signalServerConnected.value = false
          addLog(t('tools.webRtcFileTransfer.logs.signalServerDisconnected'), 'info')
        }
      }

      signalServer.onerror = (error) => {
        signalServerConnected.value = false
        addLog(
          t('tools.webRtcFileTransfer.logs.signalServerError', {
            error: (error as any).type || error.toString(),
          }),
          'error',
        )
        // Try next port
        currentPortIndex++
        setTimeout(tryConnect, 1000)
      }
    } catch (error) {
      signalServerConnected.value = false
      addLog(
        t('tools.webRtcFileTransfer.logs.signalServerConnectionFailed', {
          error: (error as Error).toString(),
        }),
        'error',
      )
      // Try next port
      currentPortIndex++
      setTimeout(tryConnect, 1000)
    }
  }

  tryConnect()
}

// Handle messages from signaling server
const handleMessageFromServer = (data: string) => {
  try {
    const message = JSON.parse(data)

    switch (message.type) {
      case 'id':
        localDeviceId.value = message.id
        addLog(t('tools.webRtcFileTransfer.logs.receivedDeviceId', { id: message.id }), 'info')
        break

      // Remove device discovery related cases as they are no longer needed

      case 'offer':
        handleOffer(message.source, message.sdp)
        break

      case 'answer':
        handleAnswer(message.source, message.sdp)
        break

      case 'ice-candidate':
        handleIceCandidate(message.source, message.candidate)
        break

      case 'connection-request':
        // Add connection request to the list
        connectionRequests.value.push({
          id: message.source,
          name: message.name || message.source,
        })
        addLog(
          t('tools.webRtcFileTransfer.logs.connectionRequestReceived', {
            id: message.source,
          }),
          'info',
        )
        break

      // Room-related messages
      case 'room-created':
        currentRoomId.value = message.roomId
        inRoom.value = true
        isHost.value = true
        participants.value = [
          {
            id: localDeviceId.value,
            name: userName.value || 'You',
            role: 'host',
          },
        ]
        addLog(t('tools.webRtcChatRoom.room.created', { roomId: message.roomId }), 'success')
        // Add system message
        chatMessages.value.push({
          id: Date.now().toString(),
          type: 'system',
          content: t('tools.webRtcChatRoom.chat.roomCreated', { roomId: message.roomId }),
          senderId: 'system',
          senderName: 'System',
          timestamp: Date.now(),
        })
        // Initialize connections with all participants
        initRoomConnections()
        // Start local stream automatically when room is created
        startLocalStream()
        break

      case 'room-joined':
        currentRoomId.value = message.roomId
        inRoom.value = true
        isHost.value = message.isHost || false
        participants.value = message.participants
        addLog(t('tools.webRtcChatRoom.room.joined', { roomId: message.roomId }), 'success')
        // Add system message
        chatMessages.value.push({
          id: Date.now().toString(),
          type: 'system',
          content: t('tools.webRtcChatRoom.chat.roomJoined', { roomId: message.roomId }),
          senderId: 'system',
          senderName: 'System',
          timestamp: Date.now(),
        })
        // Initialize connections with all participants
        initRoomConnections()
        // Start local stream automatically when joining room
        startLocalStream()
        break

      case 'room-error':
        addLog(t('tools.webRtcFileTransfer.room.error', { error: message.error }), 'error')
        break

      case 'participant-joined':
        const existingParticipant = participants.value.find((p) => p.id === message.participantId)
        if (!existingParticipant) {
          participants.value.push({
            id: message.participantId,
            name: message.name,
            role: message.role || 'member',
          })

          // Add system message
          chatMessages.value.push({
            id: Date.now().toString(),
            type: 'system',
            content: t('tools.webRtcChatRoom.chat.participantJoined', { name: message.name }),
            senderId: 'system',
            senderName: 'System',
            timestamp: Date.now(),
          })
        }

        addLog(
          t('tools.webRtcChatRoom.room.participantJoined', { id: message.participantId }),
          'info',
        )
        // Initialize connection with new participant
        if (inRoom.value && message.participantId !== localDeviceId.value) {
          initConnectionWithParticipant(message.participantId)
        }
        break

      case 'participant-left':
        const leftParticipant = participants.value.find((p) => p.id === message.participantId)
        participants.value = participants.value.filter((p) => p.id !== message.participantId)

        if (leftParticipant) {
          // Add system message
          chatMessages.value.push({
            id: Date.now().toString(),
            type: 'system',
            content: t('tools.webRtcChatRoom.chat.participantLeft', { name: leftParticipant.name }),
            senderId: 'system',
            senderName: 'System',
            timestamp: Date.now(),
          })
        }

        addLog(
          t('tools.webRtcChatRoom.room.participantLeft', { id: message.participantId }),
          'info',
        )
        // Clean up connection with participant
        cleanupConnectionWithParticipant(message.participantId)
        break

      case 'room-message':
        if (message.messageType === 'chat' && message.message) {
          // Add received chat message
          chatMessages.value.push(message.message)
        }
        break
    }
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.messageParseError', { error: (error as Error).toString() }),
      'error',
    )
  }
}

// Initialize connections with all participants in the room
const initRoomConnections = async () => {
  // Initialize connections with all participants except ourselves
  for (const participant of participants.value) {
    if (participant.id !== localDeviceId.value) {
      await initConnectionWithParticipant(participant.id)
    }
  }
}

// Initialize connection with a specific participant
const initConnectionWithParticipant = async (participantId: string) => {
  try {
    // Don't create a connection to ourselves
    if (participantId === localDeviceId.value) {
      return
    }

    // Create RTCPeerConnection if it doesn't exist
    let peerConnection = peerConnections.get(participantId)
    if (!peerConnection) {
      peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: ['turn:turn.codeemo.cn'],
            username: 'codeemo',
            credential: 'codeemo',
          },
        ],
      })

      // Store the peer connection
      peerConnections.set(participantId, peerConnection)

      // Add local stream to peer connection if available
      if (localStream.value) {
        localStream.value.getTracks().forEach((track) => {
          try {
            peerConnection!.addTrack(track, localStream.value!)
          } catch (_e) {
            // Track might already be added
          }
        })
      }

      // Add screen stream to peer connection if available and screen sharing is enabled
      if (screenStream.value && screenSharingEnabled.value) {
        screenStream.value.getTracks().forEach((track) => {
          try {
            peerConnection!.addTrack(track, screenStream.value!)
          } catch (_e) {
            // Track might already be added
          }
        })
      }

      // Create data channel for file transfer
      const dataChannel = peerConnection.createDataChannel('fileTransfer', {
        ordered: true,
        maxRetransmits: 5,
      })

      // Store the data channel
      dataChannels.set(participantId, dataChannel)
      setupDataChannelHandlers(participantId, dataChannel)

      // Setup peer connection event handlers
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && signalServer) {
          // Send ICE candidate to signaling server
          signalServer.send(
            JSON.stringify({
              type: 'room-ice-candidate',
              roomId: currentRoomId.value,
              candidate: event.candidate,
            }),
          )
          addLog(t('tools.webRtcFileTransfer.logs.iceCandidateSent'), 'info')
        }
      }

      peerConnection.onconnectionstatechange = () => {
        addLog(
          t('tools.webRtcFileTransfer.logs.connectionStateChange', {
            state: peerConnection!.connectionState,
          }),
          'info',
        )
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const stream = event.streams[0]
        const streamId = `${participantId}-${stream.id}`

        addLog(`Received remote stream from ${participantId}`, 'info')

        // Check if we already have this stream
        const existingStreamIndex = remoteStreams.value.findIndex((s) => s.id === streamId)
        if (existingStreamIndex !== -1) {
          // Update existing stream
          remoteStreams.value[existingStreamIndex].stream = stream
        } else {
          // Add new stream
          remoteStreams.value.push({ id: streamId, stream })
        }

        // Attach stream to video element after next tick
        nextTick(() => {
          const videoElement = remoteVideoRefs.value[streamId]
          if (videoElement) {
            videoElement.srcObject = stream
            addLog(`Attached stream to video element for ${participantId}`, 'success')
          } else {
            addLog(`Video element not found for stream ${streamId}`, 'warning')
          }
        })

        addLog('Remote stream added successfully', 'success')
      }

      // Create and send offer
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      signalServer?.send(
        JSON.stringify({
          type: 'room-offer',
          roomId: currentRoomId.value,
          sdp: offer,
        }),
      )

      addLog(t('tools.webRtcFileTransfer.logs.webRTCInitialized'), 'success')
    }
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.webRTCInitFailed', { error: (error as Error).toString() }),
      'error',
    )
  }
}

// Cleanup connection with a specific participant
const cleanupConnectionWithParticipant = (participantId: string) => {
  // Close peer connection
  const peerConnection = peerConnections.get(participantId)
  if (peerConnection) {
    peerConnection.close()
    peerConnections.delete(participantId)
  }

  // Close data channel
  const dataChannel = dataChannels.get(participantId)
  if (dataChannel) {
    dataChannel.close()
    dataChannels.delete(participantId)
  }
}

// Handle offer from another device
const handleOffer = async (sourceId: string, sdp: RTCSessionDescriptionInit) => {
  // For room-based connections, we don't need to check connection requests
  // as participants are already in the same room

  try {
    // Create RTCPeerConnection if it doesn't exist
    let peerConnection = peerConnections.get(sourceId)
    if (!peerConnection) {
      peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: ['turn:turn.codeemo.cn'],
            username: 'codeemo',
            credential: 'codeemo',
          },
        ],
      })
      peerConnections.set(sourceId, peerConnection)

      // Add local stream to peer connection if available
      if (localStream.value) {
        localStream.value.getTracks().forEach((track) => {
          try {
            peerConnection!.addTrack(track, localStream.value!)
          } catch (_e) {
            // Track might already be added
          }
        })
      }

      // Add screen stream to peer connection if available and screen sharing is enabled
      if (screenStream.value && screenSharingEnabled.value) {
        screenStream.value.getTracks().forEach((track) => {
          try {
            peerConnection!.addTrack(track, screenStream.value!)
          } catch (_e) {
            // Track might already be added
          }
        })
      }

      // Setup peer connection event handlers
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && signalServer) {
          // Send ICE candidate to signaling server
          signalServer.send(
            JSON.stringify({
              type: 'room-ice-candidate',
              roomId: currentRoomId.value,
              candidate: event.candidate,
            }),
          )
          addLog(t('tools.webRtcFileTransfer.logs.iceCandidateSent'), 'info')
        }
      }

      peerConnection.onconnectionstatechange = () => {
        addLog(
          t('tools.webRtcFileTransfer.logs.connectionStateChange', {
            state: peerConnection!.connectionState,
          }),
          'info',
        )
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const stream = event.streams[0]
        const streamId = `${sourceId}-${stream.id}`

        addLog(`Received remote stream from ${sourceId}`, 'info')

        // Check if we already have this stream
        const existingStreamIndex = remoteStreams.value.findIndex((s) => s.id === streamId)
        if (existingStreamIndex !== -1) {
          // Update existing stream
          remoteStreams.value[existingStreamIndex].stream = stream
        } else {
          // Add new stream
          remoteStreams.value.push({ id: streamId, stream })
        }

        // Attach stream to video element after next tick
        nextTick(() => {
          const videoElement = remoteVideoRefs.value[streamId]
          if (videoElement) {
            videoElement.srcObject = stream
            addLog(`Attached stream to video element for ${sourceId}`, 'success')
          } else {
            addLog(`Video element not found for stream ${streamId}`, 'warning')
          }
        })

        addLog('Remote stream added successfully', 'success')
      }

      peerConnection.ondatachannel = (event) => {
        // Get the data channel from the event
        const dataChannel = event.channel
        dataChannels.set(sourceId, dataChannel)
        setupDataChannelHandlers(sourceId, dataChannel)
      }
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    // Send answer back through signaling server
    signalServer?.send(
      JSON.stringify({
        type: 'room-answer',
        roomId: currentRoomId.value,
        sdp: answer,
      }),
    )

    addLog(t('tools.webRtcFileTransfer.logs.answerSent'), 'info')
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.offerHandlingFailed', {
        error: (error as Error).toString(),
      }),
      'error',
    )
  }
}

// Handle answer from another device
const handleAnswer = async (sourceId: string, sdp: RTCSessionDescriptionInit) => {
  try {
    const peerConnection = peerConnections.get(sourceId)
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
      addLog(t('tools.webRtcFileTransfer.logs.connectionEstablished'), 'success')
    }
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.answerHandlingFailed', {
        error: (error as Error).toString(),
      }),
      'error',
    )
  }
}

// Handle ICE candidate
const handleIceCandidate = async (sourceId: string, candidate: RTCIceCandidateInit) => {
  try {
    const peerConnection = peerConnections.get(sourceId)
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      addLog(t('tools.webRtcFileTransfer.logs.iceCandidateAdded'), 'info')
    }
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.iceCandidateFailed', { error: (error as Error).toString() }),
      'error',
    )
  }
}

// Setup data channel event handlers
const setupDataChannelHandlers = (participantId: string, dataChannel: RTCDataChannel) => {
  dataChannel.onopen = () => {
    addLog(t('tools.webRtcFileTransfer.logs.dataChannelOpened'), 'success')
  }

  dataChannel.onclose = () => {
    addLog(t('tools.webRtcFileTransfer.logs.dataChannelClosed'), 'info')
  }

  dataChannel.onerror = (error: Event) => {
    addLog(
      t('tools.webRtcFileTransfer.logs.dataChannelError', { error: error.toString() }),
      'error',
    )
  }

  dataChannel.onmessage = (event) => {
    handleReceivedMessage(event.data)
  }
}

// Reset connection to initial state
const resetConnection = () => {
  connectionStatus.value = 'disconnected'

  // Clear connection timeout if exists
  if (connectionTimeout) {
    clearTimeout(connectionTimeout)
    connectionTimeout = null
  }

  // Close all peer connections
  peerConnections.forEach((pc) => pc.close())
  peerConnections.clear()

  // Close all data channels
  dataChannels.forEach((dc) => dc.close())
  dataChannels.clear()

  addLog(t('tools.webRtcFileTransfer.logs.connectionReset'), 'info')
}

// Handle received message
const handleReceivedMessage = (data: unknown) => {
  try {
    if (data instanceof ArrayBuffer) {
      // Handle file data chunks
      handleFileDataChunk(data)
    } else {
      // Handle JSON messages
      const message = JSON.parse(data as string)
      if (message.type === 'file-metadata') {
        // Handle file metadata
        handleFileMetadata(message)
      } else if (message.type === 'chat') {
        // Handle chat message via data channel
        chatMessages.value.push(message)
      }
    }
  } catch (_error) {
    // If it's not JSON, it might be a file chunk
    if (data instanceof ArrayBuffer) {
      handleFileDataChunk(data)
    } else {
      addLog(t('tools.webRtcFileTransfer.logs.messageReceived', { type: typeof data }), 'info')
    }
  }
}

// Handle file metadata
let currentFileMetadata: { name: string; size: number; mimeType: string } | null = null
let receivedChunks: ArrayBuffer[] = []
let receivedSize = 0

const handleFileMetadata = (metadata: {
  name: string
  size: number
  mimeType: string
  senderId?: string
  senderName?: string
}) => {
  currentFileMetadata = metadata
  receivedChunks = []
  receivedSize = 0

  // Add file message to chat
  const fileMessage = {
    id: Date.now().toString(),
    type: 'file' as const,
    content: `Receiving file: ${metadata.name}`,
    senderId: metadata.senderId || 'unknown',
    senderName: metadata.senderName || 'Unknown',
    timestamp: Date.now(),
    fileName: metadata.name,
    fileSize: metadata.size,
  }
  chatMessages.value.push(fileMessage)

  addLog(
    t('tools.webRtcFileTransfer.logs.receivingFile', {
      name: metadata.name,
      size: formatFileSize(metadata.size),
    }),
    'info',
  )
}

// Handle file data chunks
const handleFileDataChunk = (chunk: ArrayBuffer) => {
  if (!currentFileMetadata) {
    addLog(t('tools.webRtcFileTransfer.logs.unexpectedDataChunk'), 'warning')
    return
  }

  receivedChunks.push(chunk)
  receivedSize += chunk.byteLength

  // Update progress
  const progress = Math.floor((receivedSize / currentFileMetadata.size) * 100)
  transferProgress.value = progress

  // Check if file is complete
  if (receivedSize >= currentFileMetadata.size) {
    // Reconstruct file
    const blob = new Blob(receivedChunks, { type: currentFileMetadata.mimeType })
    const url = URL.createObjectURL(blob)

    // Add file message to chat
    const fileMessage = {
      id: Date.now().toString(),
      type: 'file' as const,
      content: `File received: ${currentFileMetadata.name}`,
      senderId: 'system',
      senderName: 'System',
      timestamp: Date.now(),
      fileName: currentFileMetadata.name,
      fileSize: currentFileMetadata.size,
      fileUrl: url,
    }
    chatMessages.value.push(fileMessage)

    // Reset for next file
    const fileName = currentFileMetadata.name
    currentFileMetadata = null
    receivedChunks = []
    receivedSize = 0
    transferProgress.value = 0

    addLog(
      t('tools.webRtcFileTransfer.logs.fileReceived', {
        name: fileName,
      }),
      'success',
    )
  }
}

// Chat functionality
const sendMessage = () => {
  if (!messageInput.value.trim() || !inRoom.value || !signalServer) return

  const message = {
    id: Date.now().toString(),
    type: 'text' as const,
    content: messageInput.value.trim(),
    senderId: localDeviceId.value,
    senderName: userName.value || localDeviceId.value,
    timestamp: Date.now(),
  }

  // Add to local chat
  chatMessages.value.push(message)

  // Send to other participants via signaling server
  signalServer.send(
    JSON.stringify({
      type: 'room-message',
      roomId: currentRoomId.value,
      messageType: 'chat',
      message: message,
    }),
  )

  // Clear input
  messageInput.value = ''
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const downloadFile = (url: string, fileName?: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const broadcastMediaStateChange = (mediaType: string, enabled: boolean) => {
  if (!signalServer || !inRoom.value) return

  signalServer.send(
    JSON.stringify({
      type: 'room-message',
      roomId: currentRoomId.value,
      messageType: 'media-state',
      mediaType,
      enabled,
      senderId: localDeviceId.value,
    }),
  )
}

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    addLog(
      t('tools.webRtcFileTransfer.logs.fileSelected', {
        name: selectedFile.value.name,
        size: formatFileSize(selectedFile.value.size),
      }),
      'info',
    )
  }
}

// Send file to all participants
const sendFile = async () => {
  if (!selectedFile.value) {
    addLog(t('tools.webRtcFileTransfer.logs.channelNotReady'), 'error')
    return
  }

  isSending.value = true
  transferProgress.value = 0
  addLog(t('tools.webRtcFileTransfer.logs.sendingFile', { name: selectedFile.value.name }), 'info')

  // Add file message to chat immediately
  const fileMessage = {
    id: Date.now().toString(),
    type: 'file' as const,
    content: `Sending file: ${selectedFile.value.name}`,
    senderId: localDeviceId.value,
    senderName: userName.value || localDeviceId.value,
    timestamp: Date.now(),
    fileName: selectedFile.value.name,
    fileSize: selectedFile.value.size,
  }
  chatMessages.value.push(fileMessage)

  try {
    // Send file to all participants with open data channels
    for (const [_participantId, dataChannel] of dataChannels.entries()) {
      if (dataChannel.readyState === 'open') {
        // Send file metadata first
        const fileMetadata = {
          type: 'file-metadata',
          name: selectedFile.value.name,
          size: selectedFile.value.size,
          mimeType: selectedFile.value.type,
          senderId: localDeviceId.value,
          senderName: userName.value || localDeviceId.value,
        }

        dataChannel.send(JSON.stringify(fileMetadata))

        // Read file as ArrayBuffer and send in chunks
        const reader = new FileReader()
        const chunkSize = 16384 // 16KB chunks
        let offset = 0

        const sendChunk = () => {
          if (offset >= selectedFile.value!.size) {
            // File transfer complete for this participant
            addLog(
              t('tools.webRtcFileTransfer.logs.fileSent', { name: selectedFile.value!.name }),
              'success',
            )
            return
          }

          const slice = selectedFile.value!.slice(offset, offset + chunkSize)
          reader.readAsArrayBuffer(slice)
        }

        reader.onload = (e) => {
          // Send chunk data
          if (dataChannel.readyState === 'open') {
            dataChannel.send(e.target!.result as ArrayBuffer)
          } else {
            throw new Error('Data channel is not open')
          }

          // Update progress
          offset += chunkSize
          transferProgress.value = Math.min(
            100,
            Math.floor((offset / selectedFile.value!.size) * 100),
          )

          // Send next chunk
          setTimeout(sendChunk, 0)
        }

        reader.onerror = (error) => {
          throw error
        }

        // Start sending
        sendChunk()
      }
    }

    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    selectedFile.value = null
    isSending.value = false
  } catch (error) {
    isSending.value = false
    addLog(
      t('tools.webRtcFileTransfer.logs.sendFileFailed', { error: (error as Error).toString() }),
      'error',
    )
  }
}

// Room functionality
const createRoom = () => {
  if (!signalServer || !userName.value.trim()) return

  signalServer.send(
    JSON.stringify({
      type: 'create-room',
      deviceId: localDeviceId.value,
      userName: userName.value.trim(),
    }),
  )
}

const joinRoom = () => {
  if (!signalServer || !roomInput.value || !userName.value.trim()) return

  signalServer.send(
    JSON.stringify({
      type: 'join-room',
      roomId: roomInput.value,
      deviceId: localDeviceId.value,
      userName: userName.value.trim(),
    }),
  )
}

const leaveRoom = () => {
  if (!signalServer || !currentRoomId.value) return

  signalServer.send(
    JSON.stringify({
      type: 'leave-room',
      roomId: currentRoomId.value,
      deviceId: localDeviceId.value,
    }),
  )

  // Reset room state
  currentRoomId.value = ''
  inRoom.value = false
  participants.value = []

  // Stop local stream
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop())
    localStream.value = null
  }

  // Stop screen stream
  if (screenStream.value) {
    screenStream.value.getTracks().forEach((track) => track.stop())
    screenStream.value = null
  }

  // Clear remote streams
  remoteStreams.value = []
  remoteVideoRefs.value = {}

  // Reset connections
  resetConnection()

  addLog(t('tools.webRtcFileTransfer.room.left'), 'info')
}

// Audio/Video functionality
const startLocalStream = async () => {
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })

    if (localVideo.value) {
      localVideo.value.srcObject = localStream.value
    }

    cameraEnabled.value = true
    microphoneEnabled.value = true

    // If we're in a room, add the new tracks to all peer connections
    if (inRoom.value) {
      // Create new peer connections for any participants we don't already have connections with
      for (const participant of participants.value) {
        if (participant.id !== localDeviceId.value && !peerConnections.has(participant.id)) {
          await initConnectionWithParticipant(participant.id)
        }
      }

      // Add tracks to existing peer connections
      for (const [participantId, peerConnection] of peerConnections.entries()) {
        if (participantId !== localDeviceId.value) {
          // Remove existing tracks first to avoid duplicates
          const senders = peerConnection.getSenders()
          senders.forEach((sender) => {
            if (sender.track) {
              peerConnection.removeTrack(sender)
            }
          })

          // Add all tracks from the local stream
          localStream.value.getTracks().forEach((track) => {
            try {
              peerConnection.addTrack(track, localStream.value!)
            } catch (_e) {
              // Track might already be added
            }
          })
        }
      }
    }

    addLog(t('tools.webRtcFileTransfer.av.localStreamStarted'), 'success')
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.av.localStreamError', { error: (error as Error).toString() }),
      'error',
    )
  }
}

const toggleCamera = async () => {
  if (!localStream.value) {
    await startLocalStream()
    return
  }

  const videoTrack = localStream.value.getVideoTracks()[0]
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled
    cameraEnabled.value = videoTrack.enabled
    addLog(videoTrack.enabled ? 'Camera enabled' : 'Camera disabled', 'info')

    // Notify other participants about camera state change
    broadcastMediaStateChange('camera', videoTrack.enabled)
  }
}

const toggleMicrophone = async () => {
  if (!localStream.value) {
    await startLocalStream()
    return
  }

  const audioTrack = localStream.value.getAudioTracks()[0]
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled
    microphoneEnabled.value = audioTrack.enabled
    addLog(audioTrack.enabled ? 'Microphone enabled' : 'Microphone disabled', 'info')

    // Notify other participants about microphone state change
    broadcastMediaStateChange('microphone', audioTrack.enabled)
  }
}

// Screen sharing functionality
const toggleScreenShare = async () => {
  if (screenSharingEnabled.value) {
    // Stop screen sharing
    stopScreenShare()
  } else {
    // Start screen sharing
    startScreenShare()
  }
}

const startScreenShare = async () => {
  try {
    // getDisplayMedia might not be available in all browsers
    screenStream.value = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })

    // Display the screen stream in the local video element
    if (localVideo.value && screenStream.value) {
      localVideo.value.srcObject = screenStream.value
    }

    // If we're in a room, replace tracks in all peer connections
    if (inRoom.value) {
      for (const [participantId, peerConnection] of peerConnections.entries()) {
        if (participantId !== localDeviceId.value) {
          // Replace video tracks with screen share tracks
          const senders = peerConnection.getSenders()
          const videoSender = senders.find(
            (sender) => sender.track && sender.track.kind === 'video',
          )

          if (videoSender && screenStream.value) {
            const screenVideoTrack = screenStream.value.getVideoTracks()[0]
            if (screenVideoTrack) {
              try {
                await videoSender.replaceTrack(screenVideoTrack)
                addLog(`Screen share track replaced for ${participantId}`, 'success')
              } catch (error) {
                addLog(`Failed to replace track for ${participantId}: ${error}`, 'error')
              }
            }
          }
        }
      }
    }

    screenSharingEnabled.value = true

    // Handle when screen sharing stops
    if (screenStream.value) {
      screenStream.value.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }
    }

    addLog('Screen sharing started', 'success')
  } catch (error) {
    addLog(`Screen share error: ${error}`, 'error')
  }
}

const stopScreenShare = async () => {
  if (screenStream.value) {
    screenStream.value.getTracks().forEach((track) => track.stop())
    screenStream.value = null
  }

  // Restore camera stream if available
  if (localStream.value && localVideo.value) {
    localVideo.value.srcObject = localStream.value

    // If we're in a room, replace screen share tracks back to camera tracks
    if (inRoom.value) {
      for (const [participantId, peerConnection] of peerConnections.entries()) {
        if (participantId !== localDeviceId.value) {
          const senders = peerConnection.getSenders()
          const videoSender = senders.find(
            (sender) => sender.track && sender.track.kind === 'video',
          )

          if (videoSender && localStream.value) {
            const cameraVideoTrack = localStream.value.getVideoTracks()[0]
            if (cameraVideoTrack) {
              try {
                await videoSender.replaceTrack(cameraVideoTrack)
                addLog(`Camera track restored for ${participantId}`, 'success')
              } catch (error) {
                addLog(`Failed to restore camera track for ${participantId}: ${error}`, 'error')
              }
            }
          }
        }
      }
    }
  }

  screenSharingEnabled.value = false
  addLog('Screen sharing stopped', 'info')
}

const setRemoteVideoRef = (el: any, streamId: string) => {
  if (el && el instanceof HTMLVideoElement) {
    remoteVideoRefs.value[streamId] = el

    // Find the stream and attach it
    const streamEntry = remoteStreams.value.find((s) => s.id === streamId)
    if (streamEntry) {
      el.srcObject = streamEntry.stream
    }
  }
}

const getParticipantName = (participantId: string) => {
  const participant = participants.value.find((p) => p.id === participantId)
  return participant ? participant.name || participant.id : participantId
}

// Room management functionality
const muteParticipant = (participantId: string) => {
  if (!isHost.value || !signalServer) return

  signalServer.send(
    JSON.stringify({
      type: 'room-action',
      roomId: currentRoomId.value,
      action: 'mute',
      targetId: participantId,
    }),
  )

  addLog(`Muted participant: ${participantId}`, 'info')
}

const kickParticipant = (participantId: string) => {
  if (!isHost.value || !signalServer) return

  signalServer.send(
    JSON.stringify({
      type: 'room-action',
      roomId: currentRoomId.value,
      action: 'kick',
      targetId: participantId,
    }),
  )

  addLog(`Kicked participant: ${participantId}`, 'info')
}

// Recording functionality
const startRecording = async () => {
  if (!localStream.value) return

  try {
    const options = { mimeType: 'video/webm; codecs=vp9' }
    mediaRecorder.value = new MediaRecorder(localStream.value, options)

    const chunks: Blob[] = []
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.value.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `recording-${Date.now()}.webm`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    mediaRecorder.value.start()
    isRecording.value = true
    addLog('Recording started', 'success')
  } catch (error) {
    addLog(`Recording failed: ${error}`, 'error')
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    addLog('Recording stopped', 'info')
  }
}

// Expose functions to template
defineExpose({
  handleFileSelect,
  sendFile,
  createRoom,
  joinRoom,
  leaveRoom,
  toggleCamera,
  toggleMicrophone,
  toggleScreenShare,
  setRemoteVideoRef,
  getParticipantName,
  sendMessage,
  triggerFileUpload,
  muteParticipant,
  kickParticipant,
  startRecording,
  stopRecording,
})

// Initialize
onMounted(() => {
  connectToSignalingServer()
  addLog(t('tools.webRtcFileTransfer.logs.initialized'), 'success')
})

// Cleanup
onUnmounted(() => {
  // Close all peer connections
  peerConnections.forEach((pc) => pc.close())
  peerConnections.clear()

  // Close all data channels
  dataChannels.forEach((dc) => dc.close())
  dataChannels.clear()

  if (signalServer) {
    signalServer.close()
  }

  if (connectionTimeout) {
    clearTimeout(connectionTimeout)
  }

  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop())
  }

  if (screenStream.value) {
    screenStream.value.getTracks().forEach((track) => track.stop())
  }
})
</script>
