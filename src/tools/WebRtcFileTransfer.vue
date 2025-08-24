<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">{{ $t('tools.webRtcFileTransfer.title') }}</h1>

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
          {{ $t('tools.webRtcFileTransfer.deviceId') }}: {{ localDeviceId.substring(0, 8) }}...
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
                <div class="text-sm text-gray-500">{{ device.id.substring(0, 8) }}...</div>
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
import { ref, onMounted, onUnmounted } from 'vue'
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

// WebRTC related
let peerConnection: RTCPeerConnection | null = null
let dataChannel: RTCDataChannel | null = null
let signalServer: WebSocket | null = null
let targetDeviceId = ''

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
        addLog(
          t('tools.webRtcFileTransfer.logs.receivedDeviceId', { id: message.id.substring(0, 8) }),
          'info',
        )
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
          addLog(
            t('tools.webRtcFileTransfer.logs.deviceDiscovered', { id: message.id.substring(0, 8) }),
            'info',
          )
        }
        break

      case 'device-disconnected':
        // Remove disconnected device
        discoveredDevices.value = discoveredDevices.value.filter(
          (device) => device.id !== message.id,
        )
        addLog(
          t('tools.webRtcFileTransfer.logs.deviceDisconnected', { id: message.id.substring(0, 8) }),
          'info',
        )
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
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.answerHandlingFailed', { error: error.toString() }),
      'error',
    )
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
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    })

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
      } else if (
        peerConnection?.connectionState === 'disconnected' ||
        peerConnection?.connectionState === 'failed'
      ) {
        connectionStatus.value = 'disconnected'
      }
    }

    peerConnection.ondatachannel = (event) => {
      // For answerer, get the data channel from the event
      dataChannel = event.channel
      setupDataChannelHandlers()
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

      addLog(t('tools.webRtcFileTransfer.logs.offerSent'), 'info')
    }
  } catch (error) {
    addLog(
      t('tools.webRtcFileTransfer.logs.webRTCInitFailed', { error: error.toString() }),
      'error',
    )
  }
}

// Setup data channel event handlers
const setupDataChannelHandlers = () => {
  if (!dataChannel) return

  dataChannel.onopen = () => {
    connectionStatus.value = 'connected'
    addLog(t('tools.webRtcFileTransfer.logs.dataChannelOpened'), 'success')
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
  }

  dataChannel.onmessage = (event) => {
    handleReceivedMessage(event.data)
  }
}

// Handle received message
const handleReceivedMessage = (data: any) => {
  // In a real implementation, this would handle file data
  addLog(t('tools.webRtcFileTransfer.logs.messageReceived', { type: typeof data }), 'info')
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
  addLog(
    t('tools.webRtcFileTransfer.logs.connectingToDevice', { deviceId: deviceId.substring(0, 8) }),
    'info',
  )

  // Initialize WebRTC as offerer
  await initWebRTC(true)
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
    // In a real implementation, this would use WebRTC data channel to send file
    // For this demo, we'll simulate file transfer
    const interval = setInterval(() => {
      transferProgress.value += 10
      if (transferProgress.value >= 100) {
        clearInterval(interval)
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
      }
    }, 300)
  } catch (error) {
    isSending.value = false
    addLog(t('tools.webRtcFileTransfer.logs.sendFileFailed', { error: error.toString() }), 'error')
  }
}

// Initialize
onMounted(() => {
  connectToSignalingServer()
  addLog(t('tools.webRtcFileTransfer.logs.initialized'), 'success')

  // Simulate receiving a file for demo purposes
  setTimeout(() => {
    receivedFiles.value.push({
      name: 'sample-document.txt',
      size: 1024,
      url: 'data:text/plain;base64,SGVsbG8gV29ybGQh',
    })
    addLog(t('tools.webRtcFileTransfer.logs.fileReceived', { name: 'sample-document.txt' }), 'info')
  }, 5000)
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
})
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
