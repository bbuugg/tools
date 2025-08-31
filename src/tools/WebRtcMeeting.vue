<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Meeting Entry Modal -->
    <div
      v-if="!inMeeting"
      class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl p-8 w-96 max-w-md mx-4 text-gray-900 dark:text-white"
      >
        <div class="text-center mb-6">
          <div
            class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold mb-2">{{ $t('tools.webRtcMeeting.title') }}</h1>
          <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.webRtcMeeting.subtitle') }}</p>
        </div>

        <!-- Connection Status -->
        <div class="mb-6 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
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
                  ? $t('tools.webRtcMeeting.status.connected')
                  : $t('tools.webRtcMeeting.status.connecting')
              }}
            </span>
          </div>
        </div>

        <!-- User Name Input -->
        <div class="mb-6">
          <label class="block mb-2 font-medium">{{ $t('tools.webRtcMeeting.displayName') }}</label>
          <input
            v-model="displayName"
            :placeholder="$t('tools.webRtcMeeting.displayNamePlaceholder')"
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            maxlength="30"
            @keyup.enter="displayName.trim() && createMeeting()"
          />
        </div>

        <!-- Meeting Actions -->
        <div v-if="displayName.trim()" class="space-y-4">
          <button
            @click="createMeeting"
            :disabled="!signalServerConnected"
            class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z" />
            </svg>
            <span>{{ $t('tools.webRtcMeeting.meeting.createMeeting') }}</span>
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">{{
                $t('tools.webRtcMeeting.or')
              }}</span>
            </div>
          </div>

          <div class="space-y-3">
            <input
              v-model="meetingIdInput"
              :placeholder="$t('tools.webRtcMeeting.meeting.meetingIdPlaceholder')"
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              :disabled="!signalServerConnected"
              @keyup.enter="joinMeeting"
            />
            <button
              @click="joinMeeting"
              :disabled="!meetingIdInput.trim() || !signalServerConnected"
              class="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"
                />
                <path
                  d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"
                />
              </svg>
              <span>{{ $t('tools.webRtcMeeting.meeting.joinMeeting') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Meeting Interface -->
    <div v-if="inMeeting" class="flex flex-1 h-full">
      <!-- Video Grid Area -->
      <div class="flex-1 flex flex-col">
        <!-- Meeting Header -->
        <div class="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h2 class="font-semibold text-lg">{{ $t('tools.webRtcMeeting.meeting.title') }}</h2>
            <span class="text-sm text-gray-300 font-mono">{{ currentMeetingId }}</span>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm"
                >{{ participants.length }} {{ $t('tools.webRtcMeeting.participants.count') }}</span
              >
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <!-- Recording Status -->
            <div
              v-if="isRecording"
              class="flex items-center space-x-2 px-3 py-1 bg-red-600 rounded-full"
            >
              <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span class="text-sm font-medium">{{
                $t('tools.webRtcMeeting.recording.recording')
              }}</span>
            </div>

            <!-- Chat Toggle -->
            <button
              @click="showChatPanel = !showChatPanel"
              class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm relative"
              :title="$t('tools.webRtcMeeting.chat.toggleChat')"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"
                />
                <path
                  d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"
                />
              </svg>
              <div
                v-if="unreadMessages > 0"
                class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center"
              >
                {{ unreadMessages > 9 ? '9+' : unreadMessages }}
              </div>
            </button>

            <!-- Participants Panel Toggle -->
            <button
              @click="showParticipantsPanel = !showParticipantsPanel"
              class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              :title="$t('tools.webRtcMeeting.participants.togglePanel')"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"
                />
              </svg>
            </button>

            <!-- Leave Meeting Button -->
            <button
              @click="leaveMeeting"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
            >
              {{ $t('tools.webRtcMeeting.meeting.leave') }}
            </button>
          </div>
        </div>

        <!-- Video Grid -->
        <div class="flex-1 p-4 overflow-hidden">
          <div :class="['grid gap-4 h-full', getVideoGridClass()]">
            <!-- Local Video -->
            <div class="relative bg-gray-800 rounded-lg overflow-hidden group">
              <video
                ref="localVideo"
                autoplay
                playsinline
                muted
                class="w-full h-full object-cover"
              ></video>

              <!-- Local Video Overlay -->
              <div class="absolute inset-0 flex flex-col justify-between p-3">
                <div class="flex justify-between items-start">
                  <div class="bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded">
                    {{ displayName || $t('tools.webRtcMeeting.you') }}
                  </div>
                  <div class="flex space-x-1">
                    <div v-if="!microphoneEnabled" class="bg-red-500 p-1 rounded">
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22z"
                        />
                      </svg>
                    </div>
                    <div v-if="!cameraEnabled" class="bg-red-500 p-1 rounded">
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Screen Share Indicator -->
                <div
                  v-if="screenSharingEnabled"
                  class="bg-purple-500 bg-opacity-80 text-white text-xs px-2 py-1 rounded self-start"
                >
                  {{ $t('tools.webRtcMeeting.video.sharingScreen') }}
                </div>
              </div>
            </div>

            <!-- Remote Videos -->
            <div
              v-for="stream in remoteStreams"
              :key="stream.id"
              class="relative bg-gray-800 rounded-lg overflow-hidden group"
            >
              <video
                :ref="(el) => setRemoteVideoRef(el, stream.id)"
                autoplay
                playsinline
                class="w-full h-full object-cover"
              ></video>

              <!-- Remote Video Overlay -->
              <div class="absolute inset-0 flex flex-col justify-between p-3">
                <div class="flex justify-between items-start">
                  <div class="bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded">
                    {{ getParticipantName(stream.id) }}
                  </div>
                  <div class="flex space-x-1">
                    <!-- Audio/Video status indicators -->
                    <div
                      v-if="getParticipantMediaState(stream.id, 'microphone') === false"
                      class="bg-red-500 p-1 rounded"
                    >
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Meeting Controls Bar -->
        <div class="bg-gray-800 p-4">
          <div class="flex items-center justify-center space-x-4">
            <!-- Microphone Control -->
            <button
              @click="toggleMicrophone"
              :class="[
                'p-3 rounded-full transition-colors',
                microphoneEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500',
              ]"
              :title="
                microphoneEnabled
                  ? $t('tools.webRtcMeeting.controls.muteMic')
                  : $t('tools.webRtcMeeting.controls.unmuteMic')
              "
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path v-if="microphoneEnabled" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                <path
                  v-if="microphoneEnabled"
                  d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z"
                />
                <path
                  v-else
                  d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22z"
                />
              </svg>
            </button>

            <!-- Camera Control -->
            <button
              @click="toggleCamera"
              :class="[
                'p-3 rounded-full transition-colors',
                cameraEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500',
              ]"
              :title="
                cameraEnabled
                  ? $t('tools.webRtcMeeting.controls.turnOffCamera')
                  : $t('tools.webRtcMeeting.controls.turnOnCamera')
              "
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  v-if="cameraEnabled"
                  d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                />
                <path
                  v-else
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 14V8a2 2 0 00-2-2h-3l-1-1H9.414l-3.707-3.707z"
                />
              </svg>
            </button>

            <!-- Screen Share Control -->
            <button
              @click="toggleScreenShare"
              :class="[
                'p-3 rounded-full transition-colors',
                screenSharingEnabled
                  ? 'bg-purple-600 hover:bg-purple-500'
                  : 'bg-gray-600 hover:bg-gray-500',
              ]"
              :title="
                screenSharingEnabled
                  ? $t('tools.webRtcMeeting.controls.stopScreenShare')
                  : $t('tools.webRtcMeeting.controls.startScreenShare')
              "
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M2 3a1 1 0 011-1h14a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 2v7h12V5H4z"
                />
              </svg>
            </button>

            <!-- Recording Control (Host only) -->
            <button
              v-if="isHost"
              @click="toggleRecording"
              :class="[
                'p-3 rounded-full transition-colors',
                isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-600 hover:bg-gray-500',
              ]"
              :title="
                isRecording
                  ? $t('tools.webRtcMeeting.recording.stop')
                  : $t('tools.webRtcMeeting.recording.start')
              "
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  v-if="isRecording"
                  d="M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5z"
                />
                <path
                  v-else
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                />
              </svg>
            </button>

            <!-- More Options -->
            <div class="relative">
              <button
                @click="showMoreOptions = !showMoreOptions"
                class="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
                :title="$t('tools.webRtcMeeting.controls.moreOptions')"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                  />
                </svg>
              </button>

              <!-- More Options Menu -->
              <div
                v-if="showMoreOptions"
                class="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-2 min-w-48 text-gray-900 dark:text-white"
              >
                <button
                  @click="copyMeetingLink"
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path
                      d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L12.586 15H17v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
                    />
                  </svg>
                  <span>{{ $t('tools.webRtcMeeting.meeting.copyLink') }}</span>
                </button>

                <button
                  v-if="isHost"
                  @click="muteAllParticipants"
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793z"
                    />
                    <path
                      d="M15.293 7.293a1 1 0 011.414 0L18 8.586l1.293-1.293a1 1 0 111.414 1.414L19.414 10l1.293 1.293a1 1 0 01-1.414 1.414L18 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L16.586 10l-1.293-1.293a1 1 0 010-1.414z"
                    />
                  </svg>
                  <span>{{ $t('tools.webRtcMeeting.controls.muteAll') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Panel (Slide-out) -->
      <div
        v-if="showChatPanel"
        class="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col"
      >
        <!-- Chat Header -->
        <div
          class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
        >
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ $t('tools.webRtcMeeting.chat.title') }}
          </h3>
          <button
            @click="showChatPanel = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

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
                  'max-w-xs px-3 py-2 rounded-lg',
                  message.senderId === localDeviceId
                    ? 'bg-blue-500 text-white'
                    : message.type === 'system'
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-center w-full max-w-none'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border',
                ]"
              >
                <!-- Message Header -->
                <div
                  v-if="message.senderId !== localDeviceId && message.type !== 'system'"
                  class="text-xs text-gray-500 dark:text-gray-400 mb-1"
                >
                  {{ message.senderName }}
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
                    {{ $t('tools.webRtcMeeting.chat.download') }}
                  </button>
                </div>

                <!-- System Message -->
                <div v-else-if="message.type === 'system'" class="text-sm">
                  {{ message.content }}
                </div>

                <!-- Message Timestamp -->
                <div v-if="message.type !== 'system'" class="text-xs opacity-75 mt-1">
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div class="flex space-x-2">
            <!-- File Upload Button -->
            <button
              @click="triggerFileUpload"
              class="px-3 py-2 text-gray-500 hover:text-blue-500 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500"
              :title="$t('tools.webRtcMeeting.chat.sendFile')"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path
                  d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L12.586 15H17v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
                />
              </svg>
            </button>

            <!-- Message Input -->
            <input
              v-model="messageInput"
              @keyup.enter="sendMessage"
              :placeholder="$t('tools.webRtcMeeting.chat.placeholder')"
              class="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              maxlength="500"
            />

            <!-- Send Button -->
            <button
              @click="sendMessage"
              :disabled="!messageInput.trim()"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('tools.webRtcMeeting.chat.send') }}
            </button>
          </div>

          <!-- File Input (Hidden) -->
          <input ref="fileInput" type="file" @change="handleFileSelect" class="hidden" />
        </div>
      </div>

      <!-- Participants Panel (Slide-out) -->
      <div
        v-if="showParticipantsPanel"
        class="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col"
      >
        <!-- Participants Header -->
        <div
          class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
        >
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ $t('tools.webRtcMeeting.participants.title') }} ({{ participants.length }})
          </h3>
          <button
            @click="showParticipantsPanel = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Participants List -->
        <div class="flex-1 p-4 overflow-y-auto">
          <div class="space-y-2">
            <div
              v-for="participant in participants"
              :key="participant.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <div
                    class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  >
                    {{ (participant.name || participant.id).charAt(0).toUpperCase() }}
                  </div>
                  <div
                    :class="[
                      'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white',
                      participant.id === localDeviceId ? 'bg-blue-500' : 'bg-green-500',
                    ]"
                  ></div>
                </div>

                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ participant.name || participant.id }}
                    <span
                      v-if="participant.id === localDeviceId"
                      class="text-xs text-gray-500 ml-1"
                    >
                      ({{ $t('tools.webRtcMeeting.you') }})
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                    <span v-if="participant.role === 'host'" class="text-yellow-500">
                      👑 {{ $t('tools.webRtcMeeting.participants.host') }}
                    </span>
                    <span v-else>{{ $t('tools.webRtcMeeting.participants.member') }}</span>
                  </div>
                </div>
              </div>

              <!-- Participant Controls (only for host) -->
              <div v-if="isHost && participant.id !== localDeviceId" class="flex space-x-1">
                <button
                  @click="muteParticipant(participant.id)"
                  class="p-2 text-gray-400 hover:text-red-500 rounded"
                  :title="$t('tools.webRtcMeeting.controls.mute')"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                  class="p-2 text-gray-400 hover:text-red-500 rounded"
                  :title="$t('tools.webRtcMeeting.controls.remove')"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Reactive references
const signalServerConnected = ref(false)
const localDeviceId = ref('')
const displayName = ref('')
const meetingIdInput = ref('')
const currentMeetingId = ref('')
const inMeeting = ref(false)
const isHost = ref(false)

// UI State
const showChatPanel = ref(false)
const showParticipantsPanel = ref(false)
const showMoreOptions = ref(false)
const unreadMessages = ref(0)

// Participants and Chat
const participants = ref<{ id: string; name?: string; role?: 'host' | 'member' }[]>([])
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

// Media State
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

// File Transfer
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isSending = ref(false)
const transferProgress = ref(0)

// WebRTC
let signalServer: WebSocket | null = null
const peerConnections = new Map<string, RTCPeerConnection>()
const dataChannels = new Map<string, RTCDataChannel>()
const participantMediaStates = new Map<string, { microphone: boolean; camera: boolean }>()

// Logs
const logs = ref<
  { timestamp: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[]
>([])

// Meeting Functions
const createMeeting = () => {
  if (!signalServer || !displayName.value.trim()) return

  signalServer.send(
    JSON.stringify({
      type: 'create-meeting',
      deviceId: localDeviceId.value,
      displayName: displayName.value.trim(),
    }),
  )
}

const joinMeeting = () => {
  if (!signalServer || !meetingIdInput.value || !displayName.value.trim()) return

  signalServer.send(
    JSON.stringify({
      type: 'join-meeting',
      meetingId: meetingIdInput.value,
      deviceId: localDeviceId.value,
      displayName: displayName.value.trim(),
    }),
  )
}

const leaveMeeting = () => {
  if (!signalServer) return

  signalServer.send(
    JSON.stringify({
      type: 'leave-meeting',
      meetingId: currentMeetingId.value,
      deviceId: localDeviceId.value,
    }),
  )

  // Clean up local state
  inMeeting.value = false
  isHost.value = false
  currentMeetingId.value = ''
  participants.value = []
  chatMessages.value = []
  remoteStreams.value = []

  // Stop local media
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop())
    localStream.value = null
  }

  // Close peer connections
  peerConnections.forEach((pc) => pc.close())
  peerConnections.clear()
  dataChannels.clear()
}

// Video Grid Layout
const getVideoGridClass = () => {
  const totalVideos = remoteStreams.value.length + 1 // +1 for local video

  if (totalVideos === 1) return 'grid-cols-1'
  if (totalVideos === 2) return 'grid-cols-2'
  if (totalVideos <= 4) return 'grid-cols-2 grid-rows-2'
  if (totalVideos <= 6) return 'grid-cols-3 grid-rows-2'
  if (totalVideos <= 9) return 'grid-cols-3 grid-rows-3'
  return 'grid-cols-4 grid-rows-3'
}

// Media Controls
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

    // Notify other participants
    broadcastMediaStateChange('microphone', audioTrack.enabled)
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

    // Notify other participants
    broadcastMediaStateChange('camera', videoTrack.enabled)
  }
}

const toggleScreenShare = async () => {
  if (screenSharingEnabled.value) {
    await stopScreenShare()
  } else {
    await startScreenShare()
  }
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// Utility Functions
const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  logs.value.push({
    timestamp: new Date().toLocaleTimeString(),
    message,
    type,
  })

  // Keep only last 100 logs
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(-100)
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Initialize on mount
onMounted(() => {
  localDeviceId.value = generateDeviceId()
  connectToSignalServer()
})

// Cleanup on unmount
onUnmounted(() => {
  if (signalServer) {
    signalServer.close()
  }

  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop())
  }

  peerConnections.forEach((pc) => pc.close())
})

// Generate unique device ID
const generateDeviceId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Connect to signaling server
const connectToSignalServer = () => {
  try {
    signalServer = new WebSocket('ws://localhost:3000')

    signalServer.onopen = () => {
      signalServerConnected.value = true
      addLog('Connected to signaling server', 'success')
    }

    signalServer.onmessage = (event) => {
      handleMessageFromServer(event.data)
    }

    signalServer.onclose = () => {
      signalServerConnected.value = false
      addLog('Disconnected from signaling server', 'warning')

      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (!signalServerConnected.value) {
          connectToSignalServer()
        }
      }, 3000)
    }

    signalServer.onerror = (error) => {
      addLog(`Signaling server error: ${error}`, 'error')
    }
  } catch (error) {
    addLog(`Failed to connect to signaling server: ${error}`, 'error')
  }
}

// Handle messages from signaling server
const handleMessageFromServer = (data: string) => {
  try {
    const message = JSON.parse(data)

    switch (message.type) {
      case 'meeting-created':
        currentMeetingId.value = message.meetingId
        inMeeting.value = true
        isHost.value = true
        participants.value = [
          {
            id: localDeviceId.value,
            name: displayName.value,
            role: 'host',
          },
        ]
        addLog(`Meeting created: ${message.meetingId}`, 'success')
        addSystemMessage(`Meeting created: ${message.meetingId}`)
        initMeetingConnections()
        break

      case 'meeting-joined':
        currentMeetingId.value = message.meetingId
        inMeeting.value = true
        isHost.value = message.isHost || false
        participants.value = message.participants
        addLog(`Joined meeting: ${message.meetingId}`, 'success')
        addSystemMessage(`Joined meeting: ${message.meetingId}`)
        initMeetingConnections()
        break

      case 'participant-joined':
        const existingParticipant = participants.value.find((p) => p.id === message.participantId)
        if (!existingParticipant) {
          participants.value.push({
            id: message.participantId,
            name: message.name,
            role: message.role || 'member',
          })
          addSystemMessage(`${message.name} joined the meeting`)

          // Initialize connection with new participant
          if (inMeeting.value && message.participantId !== localDeviceId.value) {
            initConnectionWithParticipant(message.participantId)
          }
        }
        break

      case 'participant-left':
        const leftParticipant = participants.value.find((p) => p.id === message.participantId)
        participants.value = participants.value.filter((p) => p.id !== message.participantId)

        if (leftParticipant) {
          addSystemMessage(`${leftParticipant.name} left the meeting`)
        }

        // Clean up connection
        cleanupConnectionWithParticipant(message.participantId)
        break

      case 'meeting-message':
        if (message.messageType === 'chat' && message.message) {
          chatMessages.value.push(message.message)
          if (!showChatPanel.value) {
            unreadMessages.value++
          }
        } else if (message.messageType === 'media-state') {
          updateParticipantMediaState(message.senderId, message.mediaType, message.enabled)
        }
        break

      case 'offer':
      case 'answer':
      case 'ice-candidate':
        handleWebRTCMessage(message)
        break

      case 'meeting-error':
        addLog(`Meeting error: ${message.error}`, 'error')
        break

      default:
        addLog(`Unknown message type: ${message.type}`, 'warning')
    }
  } catch (error) {
    addLog(`Failed to parse message: ${error}`, 'error')
  }
}

// Add system message to chat
const addSystemMessage = (content: string) => {
  chatMessages.value.push({
    id: Date.now().toString(),
    type: 'system',
    content,
    senderId: 'system',
    senderName: 'System',
    timestamp: Date.now(),
  })
}

// Update participant media state
const updateParticipantMediaState = (
  participantId: string,
  mediaType: string,
  enabled: boolean,
) => {
  const currentState = participantMediaStates.get(participantId) || {
    microphone: true,
    camera: true,
  }
  currentState[mediaType as keyof typeof currentState] = enabled
  participantMediaStates.set(participantId, currentState)
}

// Get participant media state
const getParticipantMediaState = (streamId: string, mediaType: string) => {
  const participantId = streamId.split('-')[0]
  const state = participantMediaStates.get(participantId)
  return state ? state[mediaType as keyof typeof state] : true
}

// Initialize meeting connections
const initMeetingConnections = async () => {
  // Start local media stream
  await startLocalStream()

  // Initialize connections with all participants except self
  for (const participant of participants.value) {
    if (participant.id !== localDeviceId.value) {
      await initConnectionWithParticipant(participant.id)
    }
  }
}

// Initialize connection with a specific participant
const initConnectionWithParticipant = async (participantId: string) => {
  if (peerConnections.has(participantId)) {
    return // Connection already exists
  }

  const peerConnection = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  })

  peerConnections.set(participantId, peerConnection)

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && signalServer) {
      signalServer.send(
        JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          target: participantId,
          source: localDeviceId.value,
        }),
      )
    }
  }

  // Handle remote stream
  peerConnection.ontrack = (event) => {
    const stream = event.streams[0]
    const streamId = `${participantId}-${stream.id}`

    addLog(`Received remote stream from ${participantId}`, 'info')

    // Check if we already have this stream
    const existingStreamIndex = remoteStreams.value.findIndex((s) => s.id === streamId)
    if (existingStreamIndex !== -1) {
      remoteStreams.value[existingStreamIndex].stream = stream
    } else {
      remoteStreams.value.push({ id: streamId, stream })
    }

    // Attach stream to video element
    nextTick(() => {
      const videoElement = remoteVideoRefs.value[streamId]
      if (videoElement) {
        videoElement.srcObject = stream
        addLog(`Attached stream to video element for ${participantId}`, 'success')
      }
    })
  }

  // Create data channel for chat and file transfer
  const dataChannel = peerConnection.createDataChannel('messages', {
    ordered: true,
  })

  dataChannels.set(participantId, dataChannel)
  setupDataChannelHandlers(participantId, dataChannel)

  // Add local stream tracks
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream.value!)
    })
  }

  // Handle incoming data channels
  peerConnection.ondatachannel = (event) => {
    const channel = event.channel
    dataChannels.set(participantId, channel)
    setupDataChannelHandlers(participantId, channel)
  }

  // Create offer if we're the initiator (lower device ID)
  if (localDeviceId.value < participantId) {
    try {
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      if (signalServer) {
        signalServer.send(
          JSON.stringify({
            type: 'offer',
            offer: offer,
            target: participantId,
            source: localDeviceId.value,
          }),
        )
      }
    } catch (error) {
      addLog(`Failed to create offer for ${participantId}: ${error}`, 'error')
    }
  }
}

// Clean up connection with participant
const cleanupConnectionWithParticipant = (participantId: string) => {
  // Remove remote streams
  remoteStreams.value = remoteStreams.value.filter((stream) => !stream.id.startsWith(participantId))

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

  // Remove media state
  participantMediaStates.delete(participantId)

  addLog(`Cleaned up connection with ${participantId}`, 'info')
}

// Start local media stream
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
    addLog('Local media stream started', 'success')
  } catch (error) {
    addLog(`Failed to start local media stream: ${error}`, 'error')
  }
}

// Setup data channel event handlers
const setupDataChannelHandlers = (participantId: string, dataChannel: RTCDataChannel) => {
  dataChannel.onopen = () => {
    addLog(`Data channel opened with ${participantId}`, 'success')
  }

  dataChannel.onclose = () => {
    addLog(`Data channel closed with ${participantId}`, 'info')
  }

  dataChannel.onerror = (error) => {
    addLog(`Data channel error with ${participantId}: ${error}`, 'error')
  }

  dataChannel.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      handleDataChannelMessage(message, participantId)
    } catch (error) {
      // Handle binary data (file chunks)
      handleFileChunk(event.data, participantId)
    }
  }
}

// Handle WebRTC signaling messages
const handleWebRTCMessage = async (message: any) => {
  const peerConnection = peerConnections.get(message.source)
  if (!peerConnection) {
    addLog(`No peer connection found for ${message.source}`, 'warning')
    return
  }

  try {
    switch (message.type) {
      case 'offer':
        await peerConnection.setRemoteDescription(message.offer)
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)

        if (signalServer) {
          signalServer.send(
            JSON.stringify({
              type: 'answer',
              answer: answer,
              target: message.source,
              source: localDeviceId.value,
            }),
          )
        }
        break

      case 'answer':
        await peerConnection.setRemoteDescription(message.answer)
        break

      case 'ice-candidate':
        await peerConnection.addIceCandidate(message.candidate)
        break
    }
  } catch (error) {
    addLog(`WebRTC message handling error: ${error}`, 'error')
  }
}

// Handle data channel messages
const handleDataChannelMessage = (message: any, participantId: string) => {
  switch (message.type) {
    case 'chat':
      chatMessages.value.push(message)
      if (!showChatPanel.value) {
        unreadMessages.value++
      }
      break
    case 'file-metadata':
      handleFileMetadata(message, participantId)
      break
    default:
      addLog(`Unknown data channel message type: ${message.type}`, 'warning')
  }
}

// File transfer variables
let currentFileMetadata: any = null
let receivedChunks: ArrayBuffer[] = []
let receivedSize = 0

// Handle file metadata
const handleFileMetadata = (metadata: any, participantId: string) => {
  currentFileMetadata = metadata
  receivedChunks = []
  receivedSize = 0

  const participant = participants.value.find((p) => p.id === participantId)
  const senderName = participant?.name || participantId

  // Add file message to chat
  const fileMessage = {
    id: Date.now().toString(),
    type: 'file' as const,
    content: `Receiving file: ${metadata.name}`,
    senderId: participantId,
    senderName,
    timestamp: Date.now(),
    fileName: metadata.name,
    fileSize: metadata.size,
  }
  chatMessages.value.push(fileMessage)

  addLog(`Receiving file: ${metadata.name} from ${senderName}`, 'info')
}

// Handle file chunks
const handleFileChunk = (chunk: ArrayBuffer, participantId: string) => {
  if (!currentFileMetadata) return

  receivedChunks.push(chunk)
  receivedSize += chunk.byteLength

  // Check if file is complete
  if (receivedSize >= currentFileMetadata.size) {
    // Combine all chunks
    const completeFile = new Blob(receivedChunks, { type: currentFileMetadata.mimeType })
    const url = URL.createObjectURL(completeFile)

    // Update the file message with download URL
    const fileMessageIndex = chatMessages.value.findIndex(
      (m) =>
        m.type === 'file' &&
        m.fileName === currentFileMetadata.name &&
        m.senderId === participantId &&
        !m.fileUrl,
    )

    if (fileMessageIndex !== -1) {
      chatMessages.value[fileMessageIndex].fileUrl = url
      chatMessages.value[fileMessageIndex].content = `File received: ${currentFileMetadata.name}`
    }

    addLog(`File received: ${currentFileMetadata.name}`, 'success')

    // Reset for next file
    currentFileMetadata = null
    receivedChunks = []
    receivedSize = 0
  }
}

// Chat functions
const sendMessage = () => {
  if (!messageInput.value.trim() || !inMeeting.value) return

  const message = {
    id: Date.now().toString(),
    type: 'text' as const,
    content: messageInput.value.trim(),
    senderId: localDeviceId.value,
    senderName: displayName.value || localDeviceId.value,
    timestamp: Date.now(),
  }

  // Add to local chat
  chatMessages.value.push(message)

  // Send to other participants via signaling server
  if (signalServer) {
    signalServer.send(
      JSON.stringify({
        type: 'meeting-message',
        meetingId: currentMeetingId.value,
        messageType: 'chat',
        message: message,
      }),
    )
  }

  // Clear input
  messageInput.value = ''
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    sendFile()
  }
}

const sendFile = async () => {
  if (!selectedFile.value || !inMeeting.value) return

  isSending.value = true
  transferProgress.value = 0

  // Add file message to chat
  const fileMessage = {
    id: Date.now().toString(),
    type: 'file' as const,
    content: `Sending file: ${selectedFile.value.name}`,
    senderId: localDeviceId.value,
    senderName: displayName.value || localDeviceId.value,
    timestamp: Date.now(),
    fileName: selectedFile.value.name,
    fileSize: selectedFile.value.size,
  }
  chatMessages.value.push(fileMessage)

  try {
    // Send file to all participants with open data channels
    for (const [participantId, dataChannel] of dataChannels.entries()) {
      if (dataChannel.readyState === 'open') {
        // Send file metadata first
        const fileMetadata = {
          type: 'file-metadata',
          name: selectedFile.value.name,
          size: selectedFile.value.size,
          mimeType: selectedFile.value.type,
          senderId: localDeviceId.value,
          senderName: displayName.value || localDeviceId.value,
        }

        dataChannel.send(JSON.stringify(fileMetadata))

        // Send file in chunks
        const chunkSize = 16384 // 16KB chunks
        let offset = 0

        const sendChunk = () => {
          if (offset >= selectedFile.value!.size) {
            addLog(`File sent: ${selectedFile.value!.name}`, 'success')
            return
          }

          const slice = selectedFile.value!.slice(offset, offset + chunkSize)
          const reader = new FileReader()

          reader.onload = (e) => {
            if (dataChannel.readyState === 'open') {
              dataChannel.send(e.target!.result as ArrayBuffer)
            }

            offset += chunkSize
            transferProgress.value = Math.min(
              100,
              Math.floor((offset / selectedFile.value!.size) * 100),
            )

            setTimeout(sendChunk, 0)
          }

          reader.readAsArrayBuffer(slice)
        }

        sendChunk()
      }
    }

    // Reset
    selectedFile.value = null
    isSending.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    isSending.value = false
    addLog(`File send failed: ${error}`, 'error')
  }
}

const downloadFile = (url: string, fileName?: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Video and participant functions
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

const getParticipantName = (streamId: string) => {
  const participantId = streamId.split('-')[0]
  const participant = participants.value.find((p) => p.id === participantId)
  return participant?.name || participantId
}

// Screen sharing functions
const startScreenShare = async () => {
  try {
    screenStream.value = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })

    if (localVideo.value) {
      localVideo.value.srcObject = screenStream.value
    }

    // Replace video tracks in all peer connections
    for (const [participantId, peerConnection] of peerConnections.entries()) {
      const senders = peerConnection.getSenders()
      const videoSender = senders.find((sender) => sender.track && sender.track.kind === 'video')

      if (videoSender && screenStream.value) {
        const screenVideoTrack = screenStream.value.getVideoTracks()[0]
        if (screenVideoTrack) {
          try {
            await videoSender.replaceTrack(screenVideoTrack)
          } catch (error) {
            addLog(`Failed to replace track for ${participantId}: ${error}`, 'error')
          }
        }
      }
    }

    screenSharingEnabled.value = true

    // Handle when screen sharing stops
    screenStream.value.getVideoTracks()[0].onended = () => {
      stopScreenShare()
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

  // Restore camera stream
  if (localStream.value && localVideo.value) {
    localVideo.value.srcObject = localStream.value

    // Replace screen share tracks back to camera tracks
    for (const [participantId, peerConnection] of peerConnections.entries()) {
      const senders = peerConnection.getSenders()
      const videoSender = senders.find((sender) => sender.track && sender.track.kind === 'video')

      if (videoSender && localStream.value) {
        const cameraVideoTrack = localStream.value.getVideoTracks()[0]
        if (cameraVideoTrack) {
          try {
            await videoSender.replaceTrack(cameraVideoTrack)
          } catch (error) {
            addLog(`Failed to restore camera track for ${participantId}: ${error}`, 'error')
          }
        }
      }
    }
  }

  screenSharingEnabled.value = false
  addLog('Screen sharing stopped', 'info')
}

// Recording functions
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
      link.download = `meeting-recording-${Date.now()}.webm`
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

// Host control functions
const muteParticipant = (participantId: string) => {
  if (!isHost.value || !signalServer) return

  signalServer.send(
    JSON.stringify({
      type: 'meeting-action',
      meetingId: currentMeetingId.value,
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
      type: 'meeting-action',
      meetingId: currentMeetingId.value,
      action: 'kick',
      targetId: participantId,
    }),
  )

  addLog(`Kicked participant: ${participantId}`, 'info')
}

const muteAllParticipants = () => {
  if (!isHost.value || !signalServer) return

  signalServer.send(
    JSON.stringify({
      type: 'meeting-action',
      meetingId: currentMeetingId.value,
      action: 'mute-all',
    }),
  )

  addLog('Muted all participants', 'info')
  showMoreOptions.value = false
}

const copyMeetingLink = async () => {
  const meetingLink = `${window.location.origin}${window.location.pathname}?meeting=${currentMeetingId.value}`

  try {
    await navigator.clipboard.writeText(meetingLink)
    addLog('Meeting link copied to clipboard', 'success')
  } catch (error) {
    addLog('Failed to copy meeting link', 'error')
  }

  showMoreOptions.value = false
}

// Broadcast media state change
const broadcastMediaStateChange = (mediaType: string, enabled: boolean) => {
  if (!signalServer || !inMeeting.value) return

  signalServer.send(
    JSON.stringify({
      type: 'meeting-message',
      meetingId: currentMeetingId.value,
      messageType: 'media-state',
      mediaType,
      enabled,
      senderId: localDeviceId.value,
    }),
  )
}
</script>
