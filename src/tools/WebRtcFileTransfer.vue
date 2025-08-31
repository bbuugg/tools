<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">{{ $t('tools.webRtcFileTransfer.title') }}</h1>

    <!-- Room Creation/Joining Section -->
    <div class="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block mb-2 font-medium">{{
            $t('tools.webRtcFileTransfer.room.create')
          }}</label>
          <button
            @click="createRoom"
            :disabled="!signalServerConnected || inRoom"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {{ $t('tools.webRtcFileTransfer.room.createButton') }}
          </button>
        </div>
        <div>
          <label class="block mb-2 font-medium">{{
            $t('tools.webRtcFileTransfer.room.join')
          }}</label>
          <div class="flex">
            <input
              v-model="roomInput"
              :placeholder="$t('tools.webRtcFileTransfer.room.roomIdPlaceholder')"
              class="flex-1 p-2 border rounded-l"
              :disabled="!signalServerConnected || inRoom"
            />
            <button
              @click="joinRoom"
              :disabled="!roomInput || !signalServerConnected || inRoom"
              class="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:opacity-50"
            >
              {{ $t('tools.webRtcFileTransfer.room.joinButton') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Room Status -->
      <div v-if="inRoom" class="mt-4 p-3 bg-green-100 dark:bg-green-800 rounded">
        <div class="flex items-center justify-between">
          <div>
            <span class="font-medium">{{ $t('tools.webRtcFileTransfer.room.inRoom') }}:</span>
            <span class="ml-2 font-mono">{{ currentRoomId }}</span>
          </div>
          <button
            @click="leaveRoom"
            class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            {{ $t('tools.webRtcFileTransfer.room.leave') }}
          </button>
        </div>
        <div class="mt-2 text-sm">
          <span
            >{{ $t('tools.webRtcFileTransfer.room.participants') }}: {{ participants.length }}</span
          >
          <ul class="mt-1 ml-4 list-disc">
            <li v-for="participant in participants" :key="participant.id">
              {{ participant.name || participant.id }}
              <span v-if="participant.id === localDeviceId" class="text-xs italic"
                >({{ $t('tools.webRtcFileTransfer.room.you') }})</span
              >
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Status indicators -->
    <div class="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900">
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div
            :class="[
              'w-3 h-3 rounded-full mr-2',
              connectionStatus === 'connected'
                ? 'bg-green-500'
                : connectionStatus === 'connecting'
                  ? 'bg-yellow-500'
                  : 'bg-red-500',
            ]"
          ></div>
          <span>{{ $t(`tools.webRtcFileTransfer.status.${connectionStatus}`) }}</span>
        </div>
        <div v-if="localDeviceId" class="text-sm text-gray-600 dark:text-gray-300">
          {{ $t('tools.webRtcFileTransfer.deviceId') }}: {{ localDeviceId }}
        </div>
      </div>
    </div>

    <!-- Audio/Video Section -->
    <div v-if="inRoom" class="mb-6 p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-4">{{ $t('tools.webRtcFileTransfer.av.title') }}</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Local Video -->
        <div>
          <div class="font-medium mb-2">{{ $t('tools.webRtcFileTransfer.av.localVideo') }}</div>
          <div class="relative bg-black rounded overflow-hidden">
            <video
              ref="localVideo"
              autoplay
              playsinline
              muted
              class="w-full h-48 object-contain"
            ></video>
            <div
              class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
            >
              {{ $t('tools.webRtcFileTransfer.room.you') }}
            </div>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              @click="toggleCamera"
              :class="[
                'px-3 py-1 text-sm rounded',
                cameraEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white',
              ]"
            >
              {{
                cameraEnabled
                  ? $t('tools.webRtcFileTransfer.av.disableCamera')
                  : $t('tools.webRtcFileTransfer.av.enableCamera')
              }}
            </button>
            <button
              @click="toggleMicrophone"
              :class="[
                'px-3 py-1 text-sm rounded',
                microphoneEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white',
              ]"
            >
              {{
                microphoneEnabled
                  ? $t('tools.webRtcFileTransfer.av.disableMic')
                  : $t('tools.webRtcFileTransfer.av.enableMic')
              }}
            </button>
            <button
              @click="toggleScreenShare"
              :class="[
                'px-3 py-1 text-sm rounded',
                screenSharingEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white',
              ]"
            >
              {{
                screenSharingEnabled
                  ? $t('tools.webRtcFileTransfer.av.stopScreenShare')
                  : $t('tools.webRtcFileTransfer.av.startScreenShare')
              }}
            </button>
          </div>
        </div>

        <!-- Remote Videos -->
        <div>
          <div class="font-medium mb-2">{{ $t('tools.webRtcFileTransfer.av.remoteVideos') }}</div>
          <div v-if="remoteStreams.length > 0" class="space-y-4">
            <div
              v-for="stream in remoteStreams"
              :key="stream.id"
              class="relative bg-black rounded overflow-hidden"
            >
              <video
                :ref="(el) => setRemoteVideoRef(el, stream.id)"
                autoplay
                playsinline
                class="w-full h-48 object-contain"
              ></video>
              <div
                class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
              >
                {{ getParticipantName(stream.id) }}
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 italic h-48 flex items-center justify-center">
            {{ $t('tools.webRtcFileTransfer.av.noRemoteVideo') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Danmaku Section -->
    <div v-if="inRoom" class="mb-6 p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-4">{{ $t('tools.webRtcFileTransfer.danmaku.title') }}</h2>

      <div class="relative bg-gray-800 rounded-lg overflow-hidden" style="height: 300px">
        <!-- Danmaku Display Area -->
        <div ref="danmakuContainer" class="absolute inset-0 w-full h-full overflow-hidden">
          <!-- Danmaku items will be dynamically added here -->
        </div>

        <!-- Danmaku Input -->
        <div class="absolute bottom-0 left-0 right-0 p-3 bg-black bg-opacity-50">
          <div class="flex">
            <input
              v-model="danmakuInput"
              @keyup.enter="sendDanmaku"
              :placeholder="$t('tools.webRtcFileTransfer.danmaku.placeholder')"
              class="flex-1 p-2 rounded-l"
            />
            <button
              @click="sendDanmaku"
              :disabled="!danmakuInput"
              class="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:opacity-50"
            >
              {{ $t('tools.webRtcFileTransfer.danmaku.send') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Device Discovery Section -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-4">
          {{ $t('tools.webRtcFileTransfer.discovery.title') }}
        </h2>

        <div class="mb-4">
          <button
            @click="startDiscovery"
            :disabled="isDiscovering || !signalServerConnected"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {{
              isDiscovering
                ? $t('tools.webRtcFileTransfer.discovery.searching')
                : $t('tools.webRtcFileTransfer.discovery.search')
            }}
          </button>
          <div
            class="mt-2 text-sm"
            :class="signalServerConnected ? 'text-green-600' : 'text-red-600'"
          >
            {{
              signalServerConnected
                ? $t('tools.webRtcFileTransfer.discovery.connected')
                : $t('tools.webRtcFileTransfer.discovery.disconnected')
            }}
          </div>
        </div>

        <div v-if="discoveredDevices.length > 0" class="mt-4">
          <h3 class="font-medium mb-2">
            {{ $t('tools.webRtcFileTransfer.discovery.foundDevices') }}:
          </h3>
          <ul class="space-y-2">
            <li
              v-for="device in discoveredDevices"
              :key="device.id"
              class="flex justify-between items-center p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div>
                <div class="font-medium">
                  {{ device.name || $t('tools.webRtcFileTransfer.discovery.unknownDevice') }}
                </div>
                <div class="text-sm text-gray-500">{{ device.id }}</div>
              </div>
              <button
                @click="connectToDevice(device.id)"
                :disabled="connectionStatus === 'connecting'"
                class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
              >
                {{ $t('tools.webRtcFileTransfer.discovery.connect') }}
              </button>
            </li>
          </ul>
        </div>

        <div v-else class="text-gray-500 italic">
          {{ $t('tools.webRtcFileTransfer.discovery.noDevices') }}
        </div>
      </div>

      <!-- File Transfer Section -->
      <div class="border rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-4">
          {{ $t('tools.webRtcFileTransfer.transfer.title') }}
        </h2>

        <div v-if="connectionStatus === 'connected'" class="space-y-4">
          <!-- File Selection -->
          <div>
            <label class="block mb-2 font-medium">{{
              $t('tools.webRtcFileTransfer.transfer.selectFile')
            }}</label>
            <input
              type="file"
              @change="handleFileSelect"
              ref="fileInput"
              class="w-full p-2 border rounded"
              :disabled="isSending"
            />
          </div>

          <!-- Send Button -->
          <div>
            <button
              @click="sendFile"
              :disabled="!selectedFile || isSending"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {{
                isSending
                  ? $t('tools.webRtcFileTransfer.transfer.sending')
                  : $t('tools.webRtcFileTransfer.transfer.send')
              }}
            </button>
          </div>

          <!-- Progress -->
          <div v-if="transferProgress > 0" class="mt-4">
            <div class="flex justify-between mb-1">
              <span>{{ $t('tools.webRtcFileTransfer.transfer.progress') }}</span>
              <span>{{ transferProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-blue-600 h-2.5 rounded-full"
                :style="{ width: transferProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Received Files -->
          <div v-if="receivedFiles.length > 0" class="mt-4">
            <h3 class="font-medium mb-2">
              {{ $t('tools.webRtcFileTransfer.transfer.receivedFiles') }}:
            </h3>
            <ul class="space-y-2">
              <li
                v-for="(file, index) in receivedFiles"
                :key="index"
                class="flex justify-between items-center p-2 border rounded"
              >
                <div>
                  <div class="font-medium">{{ file.name }}</div>
                  <div class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</div>
                </div>
                <a
                  :href="file.url"
                  :download="file.name"
                  class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  {{ $t('tools.webRtcFileTransfer.transfer.download') }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div v-else class="text-gray-500 italic">
          {{ $t('tools.webRtcFileTransfer.transfer.connectFirst') }}
        </div>
      </div>
    </div>

    <!-- Logs Section -->
    <div class="mt-6 border rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">{{ $t('tools.webRtcFileTransfer.logs.title') }}</h2>
      <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded h-40 overflow-y-auto font-mono text-sm">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

// i18n
const { t } = useI18n()

// Reactive references
const connectionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const isDiscovering = ref(false)
const signalServerConnected = ref(false)
const localDeviceId = ref('')
const discoveredDevices = ref<{ id: string; name?: string }[]>([])
const selectedFile = ref<File | null>(null)
const isSending = ref(false)
const transferProgress = ref(0)
const receivedFiles = ref<{ name: string; size: number; url: string }[]>([])
const logs = ref<
  { timestamp: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[]
>([])
const fileInput = ref<HTMLInputElement | null>(null)

// Room functionality
const roomInput = ref('')
const currentRoomId = ref('')
const inRoom = ref(false)
const participants = ref<{ id: string; name?: string }[]>([])

// Audio/Video functionality
const localVideo = ref<HTMLVideoElement | null>(null)
const remoteVideoRefs = ref<Record<string, HTMLVideoElement | null>>({})
const localStream = ref<MediaStream | null>(null)
const remoteStreams = ref<{ id: string; stream: MediaStream }[]>([])
const cameraEnabled = ref(false)
const microphoneEnabled = ref(false)
const screenSharingEnabled = ref(false)
const screenStream = ref<MediaStream | null>(null)

// Danmaku functionality
const danmakuInput = ref('')
const danmakuContainer = ref<HTMLDivElement | null>(null)
const danmakuId = 0

// WebRTC related
let peerConnection: RTCPeerConnection | null = null
let dataChannel: RTCDataChannel | null = null
let signalServer: WebSocket | null = null
let targetDeviceId = ''
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
        startDiscovery()
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
            error: error.type || error.toString(),
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
          error: error.toString(),
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

      case 'devices':
        discoveredDevices.value = message.devices
        isDiscovering.value = false
        addLog(
          t('tools.webRtcFileTransfer.logs.devicesFound', { count: message.devices.length }),
          'success',
        )
        break

      case 'device-discovered':
        // Add newly discovered device
        if (!discoveredDevices.value.some((device) => device.id === message.id)) {
          discoveredDevices.value.push({
            id: message.id,
            name: message.name,
          })
          addLog(t('tools.webRtcFileTransfer.logs.deviceDiscovered', { id: message.id }), 'info')
        }
        break

      case 'device-disconnected':
        // Remove disconnected device
        discoveredDevices.value = discoveredDevices.value.filter(
          (device) => device.id !== message.id,
        )
        addLog(t('tools.webRtcFileTransfer.logs.deviceDisconnected', { id: message.id }), 'info')
        break

      case 'offer':
        handleOffer(message.source, message.sdp)
        break

      case 'answer':
        handleAnswer(message.sdp)
        break

      case 'ice-candidate':
        handleIceCandidate(message.candidate)
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
        participants.value = [{ id: localDeviceId.value, name: 'You' }]
        addLog(t('tools.webRtcFileTransfer.room.created', { roomId: message.roomId }), 'success')
        break

      case 'room-joined':
        currentRoomId.value = message.roomId
        inRoom.value = true
        participants.value = message.participants
        addLog(t('tools.webRtcFileTransfer.room.joined', { roomId: message.roomId }), 'success')
        break

      case 'room-error':
        addLog(t('tools.webRtcFileTransfer.room.error', { error: message.error }), 'error')
        break

      case 'participant-joined':
        participants.value.push({ id: message.participantId, name: message.name })
        addLog(
          t('tools.webRtcFileTransfer.room.participantJoined', { id: message.participantId }),
          'info',
        )
        break

      case 'participant-left':
        participants.value = participants.value.filter((p) => p.id !== message.participantId)
        addLog(
          t('tools.webRtcFileTransfer.room.participantLeft', { id: message.participantId }),
          'info',
        )
        break

      case 'room-message':
        if (message.messageType === 'danmaku') {
          displayDanmaku(message.content, message.sender)
        }
        break
    }
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.messageParseError', { error: error.toString() }),
      'error',
    )
  }
}

// Handle offer from another device
const handleOffer = async (sourceId: string, sdp: RTCSessionDescriptionInit) => {
  // Check if we have a pending connection request from this device
  const requestIndex = connectionRequests.value.findIndex((req) => req.id === sourceId)
  if (requestIndex === -1) {
    addLog(t('tools.webRtcFileTransfer.logs.unexpectedOffer', { id: sourceId }), 'warning')
    return
  }

  // Remove the request from the list
  connectionRequests.value.splice(requestIndex, 1)

  if (!peerConnection) {
    await initWebRTC(false) // Initialize as answerer
  }

  try {
    await peerConnection?.setRemoteDescription(new RTCSessionDescription(sdp))
    const answer = await peerConnection?.createAnswer()
    await peerConnection?.setLocalDescription(answer)

    // Send answer back through signaling server
    signalServer?.send(
      JSON.stringify({
        type: 'answer',
        target: sourceId,
        sdp: answer,
      }),
    )

    addLog(t('tools.webRtcFileTransfer.logs.answerSent'), 'info')
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.offerHandlingFailed', { error: error.toString() }),
      'error',
    )
  }
}

// Handle answer from another device
const handleAnswer = async (sdp: RTCSessionDescriptionInit) => {
  try {
    await peerConnection?.setRemoteDescription(new RTCSessionDescription(sdp))
    addLog(t('tools.webRtcFileTransfer.logs.connectionEstablished'), 'success')

    // Clear connection timeout since we've established connection
    if (connectionTimeout) {
      clearTimeout(connectionTimeout)
      connectionTimeout = null
    }
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.answerHandlingFailed', { error: error.toString() }),
      'error',
    )
    // Reset connection status on error
    resetConnection()
  }
}

// Handle ICE candidate
const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
  try {
    await peerConnection?.addIceCandidate(new RTCIceCandidate(candidate))
    addLog(t('tools.webRtcFileTransfer.logs.iceCandidateAdded'), 'info')
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.iceCandidateFailed', { error: error.toString() }),
      'error',
    )
  }
}

// Initialize WebRTC
const initWebRTC = async (isOfferer: boolean = true) => {
  try {
    // Create RTCPeerConnection
    peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'turn:turn.codeemo.cn',
            // 'stun:stun.l.google.com:19302',
            // 'stun:stun1.l.google.com:19302',
            // 'stun:stun2.l.google.com:19302',
            // 'stun:stun3.l.google.com:19302',
            // 'stun:stun4.l.google.com:19302',
          ],
          username: 'codeemo',
          credential: 'codeemo',
        },
      ],
    })

    // Add local stream to peer connection if available
    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => {
        peerConnection?.addTrack(track, localStream.value!)
      })
    }

    // Add screen stream to peer connection if available
    if (screenStream.value) {
      screenStream.value.getTracks().forEach((track) => {
        peerConnection?.addTrack(track, screenStream.value!)
      })
    }

    // Create data channel for file transfer (only for offerer)
    if (isOfferer) {
      dataChannel = peerConnection.createDataChannel('fileTransfer', {
        ordered: true,
        maxRetransmits: 5,
      })

      setupDataChannelHandlers()
    }

    // Setup peer connection event handlers
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && signalServer) {
        // Send ICE candidate to signaling server
        signalServer.send(
          JSON.stringify({
            type: 'ice-candidate',
            target: targetDeviceId,
            candidate: event.candidate,
          }),
        )
        addLog(t('tools.webRtcFileTransfer.logs.iceCandidateSent'), 'info')
      }
    }

    peerConnection.onconnectionstatechange = () => {
      addLog(
        t('tools.webRtcFileTransfer.logs.connectionStateChange', {
          state: peerConnection?.connectionState,
        }),
        'info',
      )

      if (peerConnection?.connectionState === 'connected') {
        connectionStatus.value = 'connected'
        // Clear connection timeout since we've established connection
        if (connectionTimeout) {
          clearTimeout(connectionTimeout)
          connectionTimeout = null
        }
      } else if (
        peerConnection?.connectionState === 'disconnected' ||
        peerConnection?.connectionState === 'failed'
      ) {
        connectionStatus.value = 'disconnected'
        // Reset connection on failure
        resetConnection()
      }
    }

    peerConnection.ondatachannel = (event) => {
      // For answerer, get the data channel from the event
      dataChannel = event.channel
      setupDataChannelHandlers()
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const stream = event.streams[0]
      const streamId = stream.id

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
        }
      })

      addLog(t('tools.webRtcFileTransfer.av.remoteStreamAdded'), 'info')
    }

    addLog(t('tools.webRtcFileTransfer.logs.webRTCInitialized'), 'success')

    // If we're the offerer, create and send offer
    if (isOfferer && peerConnection && signalServer) {
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      signalServer.send(
        JSON.stringify({
          type: 'offer',
          target: targetDeviceId,
          sdp: offer,
        }),
      )

      // Set connection timeout
      connectionTimeout = window.setTimeout(() => {
        addLog(t('tools.webRtcFileTransfer.logs.connectionTimeout'), 'warning')
        resetConnection()
      }, 30000) // 30 seconds timeout

      addLog(t('tools.webRtcFileTransfer.logs.offerSent'), 'info')
    }
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.webRTCInitFailed', { error: error.toString() }),
      'error',
    )
    // Reset connection on error
    resetConnection()
  }
}

// Setup data channel event handlers
const setupDataChannelHandlers = () => {
  if (!dataChannel) return

  dataChannel.onopen = () => {
    connectionStatus.value = 'connected'
    addLog(t('tools.webRtcFileTransfer.logs.dataChannelOpened'), 'success')
    // Clear connection timeout since we've established connection
    if (connectionTimeout) {
      clearTimeout(connectionTimeout)
      connectionTimeout = null
    }
  }

  dataChannel.onclose = () => {
    connectionStatus.value = 'disconnected'
    addLog(t('tools.webRtcFileTransfer.logs.dataChannelClosed'), 'info')
  }

  dataChannel.onerror = (error) => {
    addLog(
      t('tools.webRtcFileTransfer.logs.dataChannelError', { error: error.toString() }),
      'error',
    )
    // Reset connection on error
    resetConnection()
  }

  dataChannel.onmessage = (event) => {
    handleReceivedMessage(event.data)
  }
}

// Reset connection to initial state
const resetConnection = () => {
  connectionStatus.value = 'disconnected'
  targetDeviceId = ''

  // Clear connection timeout if exists
  if (connectionTimeout) {
    clearTimeout(connectionTimeout)
    connectionTimeout = null
  }

  // Close peer connection
  if (peerConnection) {
    peerConnection.close()
    peerConnection = null
  }

  // Close data channel
  if (dataChannel) {
    dataChannel.close()
    dataChannel = null
  }

  addLog(t('tools.webRtcFileTransfer.logs.connectionReset'), 'info')
}

// Handle received message
const handleReceivedMessage = (data: any) => {
  try {
    if (data instanceof ArrayBuffer) {
      // Handle file data chunks
      handleFileDataChunk(data)
    } else {
      // Handle JSON messages
      const message = JSON.parse(data)
      if (message.type === 'file-metadata') {
        // Handle file metadata
        handleFileMetadata(message)
      } else if (message.type === 'danmaku') {
        // Handle danmaku message
        displayDanmaku(message.content, message.sender)
      }
    }
  } catch (error) {
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

const handleFileMetadata = (metadata: { name: string; size: number; mimeType: string }) => {
  currentFileMetadata = metadata
  receivedChunks = []
  receivedSize = 0
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

    // Add to received files
    receivedFiles.value.push({
      name: currentFileMetadata.name,
      size: currentFileMetadata.size,
      url: url,
    })

    // Reset for next file
    currentFileMetadata = null
    receivedChunks = []
    receivedSize = 0
    transferProgress.value = 0

    addLog(
      t('tools.webRtcFileTransfer.logs.fileReceived', {
        name: currentFileMetadata?.name || 'unknown',
      }),
      'success',
    )
  }
}

// Start discovery process
const startDiscovery = async () => {
  if (!signalServerConnected.value || !signalServer) {
    addLog(t('tools.webRtcFileTransfer.logs.notConnectedToSignalServer'), 'error')
    return
  }

  isDiscovering.value = true
  discoveredDevices.value = [] // Clear previous devices
  addLog(t('tools.webRtcFileTransfer.logs.startDiscovery'), 'info')

  // Send discovery request to signaling server
  signalServer.send(
    JSON.stringify({
      type: 'discover',
    }),
  )
}

// Connect to a device
const connectToDevice = async (deviceId: string) => {
  targetDeviceId = deviceId
  connectionStatus.value = 'connecting'
  addLog(t('tools.webRtcFileTransfer.logs.connectingToDevice', { deviceId }), 'info')

  // Send connection request to the target device
  signalServer?.send(
    JSON.stringify({
      type: 'connection-request',
      target: deviceId,
      source: localDeviceId.value,
      name: 'Device ' + localDeviceId.value, // Simple name for now
    }),
  )

  // Initialize WebRTC as offerer
  await initWebRTC(true)
}

// Accept connection request
const acceptConnectionRequest = async (deviceId: string) => {
  // Remove the request from the list
  connectionRequests.value = connectionRequests.value.filter((req) => req.id !== deviceId)

  targetDeviceId = deviceId
  connectionStatus.value = 'connecting'
  addLog(t('tools.webRtcFileTransfer.logs.acceptingConnection', { deviceId }), 'info')

  // Initialize WebRTC as answerer
  await initWebRTC(false)
}

// Reject connection request
const rejectConnectionRequest = (deviceId: string) => {
  // Remove the request from the list
  connectionRequests.value = connectionRequests.value.filter((req) => req.id !== deviceId)
  addLog(
    t('tools.webRtcFileTransfer.logs.connectionRequestRejected', {
      deviceId,
    }),
    'info',
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

// Send file
const sendFile = async () => {
  if (!selectedFile.value || !dataChannel || dataChannel.readyState !== 'open') {
    addLog(t('tools.webRtcFileTransfer.logs.channelNotReady'), 'error')
    return
  }

  isSending.value = true
  transferProgress.value = 0
  addLog(t('tools.webRtcFileTransfer.logs.sendingFile', { name: selectedFile.value.name }), 'info')

  try {
    // Send file metadata first
    const fileMetadata = {
      type: 'file-metadata',
      name: selectedFile.value.name,
      size: selectedFile.value.size,
      mimeType: selectedFile.value.type,
    }

    dataChannel.send(JSON.stringify(fileMetadata))

    // Read file as ArrayBuffer and send in chunks
    const reader = new FileReader()
    const chunkSize = 16384 // 16KB chunks
    let offset = 0

    const sendChunk = () => {
      if (offset >= selectedFile.value!.size) {
        // File transfer complete
        isSending.value = false
        addLog(
          t('tools.webRtcFileTransfer.logs.fileSent', { name: selectedFile.value!.name }),
          'success',
        )

        // Reset file input
        if (fileInput.value) {
          fileInput.value.value = ''
        }
        selectedFile.value = null
        return
      }

      const slice = selectedFile.value!.slice(offset, offset + chunkSize)
      reader.readAsArrayBuffer(slice)
    }

    reader.onload = (e) => {
      // Send chunk data
      if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(e.target!.result as ArrayBuffer)
      } else {
        throw new Error('Data channel is not open')
      }

      // Update progress
      offset += chunkSize
      transferProgress.value = Math.min(100, Math.floor((offset / selectedFile.value!.size) * 100))

      // Send next chunk
      setTimeout(sendChunk, 0)
    }

    reader.onerror = (error) => {
      throw error
    }

    // Start sending
    sendChunk()
  } catch (error) {
    isSending.value = false
    addLog(t('tools.webRtcFileTransfer.logs.sendFileFailed', { error: error.toString() }), 'error')
  }
}

// Room functionality
const createRoom = () => {
  if (!signalServer) return

  signalServer.send(
    JSON.stringify({
      type: 'create-room',
      deviceId: localDeviceId.value,
    }),
  )
}

const joinRoom = () => {
  if (!signalServer || !roomInput.value) return

  signalServer.send(
    JSON.stringify({
      type: 'join-room',
      roomId: roomInput.value,
      deviceId: localDeviceId.value,
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

    addLog(t('tools.webRtcFileTransfer.av.localStreamStarted'), 'success')
  } catch (error) {
    addLog(t('tools.webRtcFileTransfer.av.localStreamError', { error: error.toString() }), 'error')
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
    addLog(
      videoTrack.enabled
        ? t('tools.webRtcFileTransfer.av.cameraEnabled')
        : t('tools.webRtcFileTransfer.av.cameraDisabled'),
      'info',
    )
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
    addLog(
      audioTrack.enabled
        ? t('tools.webRtcFileTransfer.av.microphoneEnabled')
        : t('tools.webRtcFileTransfer.av.microphoneDisabled'),
      'info',
    )
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
    // @ts-ignore - getDisplayMedia might not be available in all browsers
    screenStream.value = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })

    // Replace the video track in the peer connection
    if (peerConnection && screenStream.value) {
      const videoTrack = screenStream.value.getVideoTracks()[0]
      const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'video')
      if (sender) {
        sender.replaceTrack(videoTrack)
      } else {
        screenStream.value.getTracks().forEach((track) => {
          peerConnection.addTrack(track, screenStream.value!)
        })
      }
    }

    // Display the screen stream in the local video element
    if (localVideo.value && screenStream.value) {
      localVideo.value.srcObject = screenStream.value
    }

    screenSharingEnabled.value = true

    // Handle when screen sharing stops
    if (screenStream.value) {
      screenStream.value.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }
    }

    addLog(t('tools.webRtcFileTransfer.av.screenShareStarted'), 'success')
  } catch (error) {
    addLog(t('tools.webRtcFileTransfer.av.screenShareError', { error: error.toString() }), 'error')
  }
}

const stopScreenShare = () => {
  if (screenStream.value) {
    screenStream.value.getTracks().forEach((track) => track.stop())
    screenStream.value = null
  }

  // Restore camera stream if available
  if (localStream.value && localVideo.value) {
    localVideo.value.srcObject = localStream.value
  }

  screenSharingEnabled.value = false
  addLog(t('tools.webRtcFileTransfer.av.screenShareStopped'), 'info')
}

const setRemoteVideoRef = (el: HTMLVideoElement | null, streamId: string) => {
  if (el) {
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

// Danmaku functionality
const sendDanmaku = () => {
  if (!danmakuInput.value || !inRoom.value || !signalServer) return

  const danmakuMessage = {
    type: 'room-message',
    roomId: currentRoomId.value,
    messageType: 'danmaku',
    content: danmakuInput.value,
    sender: localDeviceId.value,
  }

  signalServer.send(JSON.stringify(danmakuMessage))

  // Display locally as well
  displayDanmaku(danmakuInput.value, localDeviceId.value)

  // Clear input
  danmakuInput.value = ''
}

const displayDanmaku = (content: string, senderId: string) => {
  if (!danmakuContainer.value) return

  const danmakuElement = document.createElement('div')
  danmakuElement.className = 'absolute text-white text-sm font-bold whitespace-nowrap'
  danmakuElement.textContent = content
  danmakuElement.style.left = '100%'
  danmakuElement.style.top = `${Math.random() * 80 + 10}%`
  danmakuElement.style.color = `hsl(${Math.random() * 360}, 100%, 80%)`

  danmakuContainer.value.appendChild(danmakuElement)

  // Animate danmaku
  const animate = () => {
    const rect = danmakuElement.getBoundingClientRect()
    const containerRect = danmakuContainer.value!.getBoundingClientRect()

    if (rect.right < containerRect.left) {
      danmakuElement.remove()
      return
    }

    const currentLeft = parseFloat(danmakuElement.style.left || '100%')
    danmakuElement.style.left = `${currentLeft - 0.5}%`

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

// Initialize
onMounted(() => {
  connectToSignalingServer()
  addLog(t('tools.webRtcFileTransfer.logs.initialized'), 'success')
})

// Cleanup
onUnmounted(() => {
  if (peerConnection) {
    peerConnection.close()
  }
  if (signalServer) {
    signalServer.close()
  }
  if (dataChannel) {
    dataChannel.close()
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
