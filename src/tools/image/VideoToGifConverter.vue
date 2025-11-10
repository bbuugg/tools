<template>
  <div class="min-h-screen bg-dark-950 text-slate-100 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="glass rounded-xl p-6 mb-8 border border-slate-700/50 shadow-dark-lg">
        <h1 class="text-3xl font-bold text-slate-100 mb-4">
          🎬 {{ $t('tools.videoToGifConverter.title') }}
        </h1>
        <p class="text-slate-400 text-lg">
          {{ $t('tools.videoToGifConverter.description') }}
        </p>
        <div class="mt-4 p-4 bg-primary-900/30 rounded-xl border border-primary-700/50">
          <h3 class="font-semibold text-primary-300 mb-2">
            {{ $t('tools.videoToGifConverter.howToUse.title') }}
          </h3>
          <ol class="list-decimal list-inside space-y-1 text-primary-200">
            <li>{{ $t('tools.videoToGifConverter.howToUse.step1') }}</li>
            <li>{{ $t('tools.videoToGifConverter.howToUse.step2') }}</li>
            <li>{{ $t('tools.videoToGifConverter.howToUse.step3') }}</li>
            <li>{{ $t('tools.videoToGifConverter.howToUse.step4') }}</li>
          </ol>
        </div>
      </div>

      <!-- Upload Section -->
      <div class="glass rounded-xl p-6 mb-8 border border-slate-700/50">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-2">
          {{ $t('tools.videoToGifConverter.upload.title') }}
        </h3>

        <!-- File Upload -->
        <div class="mb-6">
          <div @drop="handleFileDrop" @dragover.prevent @dragenter.prevent
            class="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary-500/50 transition-all duration-200 cursor-pointer"
            :class="{
              'border-primary-500 bg-primary-500/10': isDragging,
              'border-slate-600/50': !isDragging,
            }" @click="fileInput!.click()">
            <div class="text-slate-500 text-4xl mb-4">🎥</div>
            <p class="text-slate-400 mb-4">
              {{ $t('tools.videoToGifConverter.upload.dragDrop') }}
            </p>
            <input type="file" ref="fileInput" @change="handleFileSelect" accept="video/*" class="hidden" />
            <button
              class="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all duration-200 cursor-pointer hover-lift">
              {{ $t('tools.videoToGifConverter.upload.selectFile') }}
            </button>
            <p class="text-xs text-slate-500 mt-2">
              {{ $t('tools.videoToGifConverter.upload.supportedFormats') }}
            </p>
          </div>
        </div>

        <!-- GIF Settings -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.videoToGifConverter.settings.width') }}
            </label>
            <input v-model.number="gifSettings.width" type="number" min="100" max="800"
              class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-100 transition-all duration-200" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.videoToGifConverter.settings.quality') }}
            </label>
            <select v-model="gifSettings.quality"
              class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-100 transition-all duration-200">
              <option value="high">
                {{ $t('tools.videoToGifConverter.settings.qualityOptions.high') }}
              </option>
              <option value="medium">
                {{ $t('tools.videoToGifConverter.settings.qualityOptions.medium') }}
              </option>
              <option value="low">
                {{ $t('tools.videoToGifConverter.settings.qualityOptions.low') }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.videoToGifConverter.settings.fps') }}
            </label>
            <input v-model.number="gifSettings.fps" type="number" min="5" max="30"
              class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-100 transition-all duration-200" />
          </div>
        </div>
      </div>

      <!-- Video Preview Section -->
      <div v-if="selectedVideo" class="glass rounded-xl p-6 mb-8 border border-slate-700/50">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-2">
          {{ $t('tools.videoToGifConverter.preview.title') }}
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Video Player -->
          <div>
            <div v-if="videoUrl && !videoDuration"
              class="flex items-center justify-center w-full h-64 bg-slate-800/50 rounded-xl">
              <div class="text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p class="mt-2 text-slate-400">
                  {{ $t('tools.videoToGifConverter.loadingVideo') }}
                </p>
              </div>
            </div>
            <video v-show="videoUrl && videoDuration" ref="videoPlayer" :src="videoUrl" controls
              @loadedmetadata="onVideoLoaded" @timeupdate="onTimeUpdate" class="w-full rounded-xl bg-slate-900"></video>

            <!-- Video Controls -->
            <div class="mt-4 space-y-4">
              <div class="flex gap-2">
                <button @click="startCapture" :disabled="isCapturing || isProcessing"
                  class="px-4 py-2 bg-success-600 text-white rounded-xl hover:bg-success-500 transition-all duration-200 cursor-pointer hover-lift disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ $t('tools.videoToGifConverter.actions.startCapture') }}
                </button>
                <button @click="stopCapture" :disabled="!isCapturing || isProcessing"
                  class="px-4 py-2 bg-error-600 text-white rounded-xl hover:bg-error-500 transition-all duration-200 cursor-pointer hover-lift disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ $t('tools.videoToGifConverter.actions.stopCapture') }}
                </button>
                <button @click="generateGif" :disabled="isProcessing"
                  class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all duration-200 cursor-pointer hover-lift disabled:opacity-50 disabled:cursor-not-allowed">
                  {{
                    isProcessing
                      ? $t('common.loading')
                      : $t('tools.videoToGifConverter.actions.generateGif')
                  }}
                </button>
              </div>

              <!-- Time Range Selection -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">
                  {{ $t('tools.videoToGifConverter.timeRange.title') }}
                </label>
                <div class="flex gap-4 items-center">
                  <div class="flex items-center gap-2">
                    <label class="text-sm text-slate-400">{{ $t('tools.videoToGifConverter.timeRange.start') }}:</label>
                    <input v-model.number="timeRange.start" type="number" min="0" :max="videoDuration" step="0.1"
                      class="w-20 px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-slate-100" />
                    <span class="text-sm text-slate-500">s</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <label class="text-sm text-slate-400">{{ $t('tools.videoToGifConverter.timeRange.end') }}:</label>
                    <input v-model.number="timeRange.end" type="number" :min="timeRange.start" :max="videoDuration"
                      step="0.1"
                      class="w-20 px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-slate-100" />
                    <span class="text-sm text-slate-500">s</span>
                  </div>
                  <button @click="setCurrentTimeAsStart"
                    class="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-500 transition-all duration-200 cursor-pointer">
                    {{ $t('tools.videoToGifConverter.timeRange.setStart') }}
                  </button>
                  <button @click="setCurrentTimeAsEnd"
                    class="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-500 transition-all duration-200 cursor-pointer">
                    {{ $t('tools.videoToGifConverter.timeRange.setEnd') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Text Overlay Controls -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-md font-semibold text-slate-100">
                {{ $t('tools.videoToGifConverter.textOverlay.title') }}
              </h4>
              <button @click="addTextOverlay"
                class="px-3 py-1 bg-success-600 text-white rounded text-sm hover:bg-success-500 transition-all duration-200 cursor-pointer">
                {{ $t('tools.videoToGifConverter.textOverlay.add') }}
              </button>
            </div>

            <div class="space-y-4 max-h-64 overflow-y-auto">
              <div v-for="(text, index) in textOverlays" :key="index"
                class="border border-slate-700/50 rounded-xl p-4 space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-slate-300">
                    {{ $t('tools.videoToGifConverter.textOverlay.text') }} {{ index + 1 }}
                  </span>
                  <button @click="removeTextOverlay(index)"
                    class="text-error-500 hover:text-error-400 text-sm transition-colors duration-200 cursor-pointer">
                    {{ $t('common.remove') }}
                  </button>
                </div>

                <input v-model="text.content" type="text"
                  :placeholder="$t('tools.videoToGifConverter.textOverlay.placeholder')"
                  class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-slate-100 placeholder-slate-500 transition-all duration-200" />

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">
                      {{ $t('tools.videoToGifConverter.textOverlay.startTime') }}
                    </label>
                    <input v-model.number="text.startTime" type="number" min="0" :max="videoDuration" step="0.1"
                      class="w-full px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-xs text-slate-100" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">
                      {{ $t('tools.videoToGifConverter.textOverlay.endTime') }}
                    </label>
                    <input v-model.number="text.endTime" type="number" :min="text.startTime" :max="videoDuration"
                      step="0.1"
                      class="w-full px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-xs text-slate-100" />
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">
                      {{ $t('tools.videoToGifConverter.textOverlay.fontSize') }}
                    </label>
                    <input v-model.number="text.fontSize" type="number" min="12" max="48"
                      class="w-full px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-xs text-slate-100" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">
                      {{ $t('tools.videoToGifConverter.textOverlay.color') }}
                    </label>
                    <input v-model="text.color" type="color"
                      class="w-full h-8 border border-slate-600/50 rounded cursor-pointer" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">
                      {{ $t('tools.videoToGifConverter.textOverlay.position') }}
                    </label>
                    <select v-model="text.position"
                      class="w-full px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-xs text-slate-100">
                      <option value="top">
                        {{ $t('tools.videoToGifConverter.textOverlay.positions.top') }}
                      </option>
                      <option value="center">
                        {{ $t('tools.videoToGifConverter.textOverlay.positions.center') }}
                      </option>
                      <option value="bottom">
                        {{ $t('tools.videoToGifConverter.textOverlay.positions.bottom') }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Processing Status -->
      <div v-if="isProcessing" class="glass rounded-xl p-6 mb-8 border border-slate-700/50">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h3 class="text-lg font-semibold text-slate-100 mb-2">
            {{ $t('tools.videoToGifConverter.processing.title') }}
          </h3>
          <p class="text-slate-400">
            {{ $t('tools.videoToGifConverter.processing.description') }}
          </p>
          <div class="mt-4 bg-slate-700 rounded-full h-2">
            <div class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: processingProgress + '%' }"></div>
          </div>
          <p class="text-sm text-slate-500 mt-2">{{ processingProgress }}%</p>

          <!-- Preview of generated GIF -->
          <div v-if="generatedGif" class="mt-6">
            <h4 class="text-md font-medium text-slate-300 mb-2">
              {{ $t('tools.videoToGifConverter.processing.preview') }}
            </h4>
            <img referrerpolicy="no-referrer" :src="generatedGif" alt="GIF Preview"
              class="max-w-full h-auto mx-auto rounded-xl shadow-dark-lg" style="max-height: 200px" />
          </div>
        </div>
      </div>

      <!-- Result Section -->
      <div v-if="generatedGif" class="glass rounded-xl p-6 mb-8 border border-slate-700/50">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-2">
          {{ $t('tools.videoToGifConverter.result.title') }}
        </h3>

        <div class="text-center">
          <img referrerpolicy="no-referrer" :src="generatedGif" alt="Generated GIF"
            class="max-w-full h-auto mx-auto rounded-xl shadow-dark-lg mb-4" />

          <div class="flex justify-center gap-4">
            <button @click="downloadGif"
              class="px-6 py-2 bg-success-600 text-white rounded-xl hover:bg-success-500 transition-all duration-200 cursor-pointer hover-lift">
              {{ $t('tools.videoToGifConverter.result.download') }}
            </button>
            <button @click="resetTool"
              class="px-6 py-2 bg-slate-700 text-slate-100 rounded-xl hover:bg-slate-600 transition-all duration-200 cursor-pointer hover-lift">
              {{ $t('tools.videoToGifConverter.result.createNew') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="bg-warning-900/30 border-l-4 border-warning-500 p-4 mb-8 rounded-r-xl">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-warning-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-warning-300">
              {{ $t('tools.videoToGifConverter.tips.title') }}
            </h3>
            <div class="mt-2 text-sm text-warning-200">
              <ul class="list-disc list-inside space-y-1">
                <li>{{ $t('tools.videoToGifConverter.tips.tip1') }}</li>
                <li>{{ $t('tools.videoToGifConverter.tips.tip2') }}</li>
                <li>{{ $t('tools.videoToGifConverter.tips.tip3') }}</li>
                <li>{{ $t('tools.videoToGifConverter.tips.tip4') }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            🎬 {{ $t('tools.videoToGifConverter.features.conversion.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.videoToGifConverter.features.conversion.description') }}
          </p>
        </div>

        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            📝 {{ $t('tools.videoToGifConverter.features.textOverlay.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.videoToGifConverter.features.textOverlay.description') }}
          </p>
        </div>

        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            ⚡ {{ $t('tools.videoToGifConverter.features.customization.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.videoToGifConverter.features.customization.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
// @ts-expect-error No type definitions available for gif.js
import GIF from 'gif.js'

interface GifSettings {
  width: number
  quality: 'high' | 'medium' | 'low'
  fps: number
}

interface TextOverlay {
  content: string
  startTime: number
  endTime: number
  fontSize: number
  color: string
  position: 'top' | 'center' | 'bottom'
}

interface TimeRange {
  start: number
  end: number
}

const { t } = useI18n()
const { success, error } = useToast()

// Clipboard paste support
onMounted(() => {
  document.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
})

async function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.indexOf('video') !== -1) {
      const blob = item.getAsFile()
      if (blob) {
        // Create a File object from the blob
        const file = new File([blob], `pasted-video-${Date.now()}.mp4`, {
          type: blob.type,
        })
        handleVideoFile(file)
        success(t('tools.videoToGifConverter.messages.filePasted'))
        break
      }
    }
  }
}

// Reactive data
const selectedVideo = ref<File | null>(null)
const videoUrl = ref('')
const videoPlayer = ref<HTMLVideoElement>()
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const isCapturing = ref(false)
const isProcessing = ref(false)
const processingProgress = ref(0)
const generatedGif = ref('')
const videoDuration = ref(0)
const currentTime = ref(0)
const capturedFrames = ref<string[]>([])

const gifSettings = reactive<GifSettings>({
  width: 300,
  quality: 'medium',
  fps: 15,
})

const timeRange = reactive<TimeRange>({
  start: 0,
  end: 0,
})

const textOverlays = ref<TextOverlay[]>([])

// File handling
function handleFileDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleVideoFile(files[0])
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleVideoFile(files[0])
  }

  // Reset input to allow selecting the same file again
  if (target) {
    target.value = ''
  }
}

function handleVideoFile(file: File) {
  if (!file.type.startsWith('video/')) {
    alert(t('tools.videoToGifConverter.errors.invalidFile'))
    return
  }

  if (file.size > 100 * 1024 * 1024) {
    // 100MB limit
    alert(t('tools.videoToGifConverter.errors.fileTooLarge'))
    return
  }

  selectedVideo.value = file
  videoUrl.value = URL.createObjectURL(file)
  resetCapture()

  // Show success message
  success(t('tools.videoToGifConverter.messages.fileLoaded'))
}

function onVideoLoaded() {
  if (videoPlayer.value) {
    videoDuration.value = videoPlayer.value.duration
    // Set default time range: start at 0, end at min(15s or video duration)
    timeRange.start = 0
    timeRange.end = Math.min(videoDuration.value, 15)
  }
}

function onTimeUpdate() {
  if (videoPlayer.value) {
    currentTime.value = videoPlayer.value.currentTime
  }
}

// Time range controls
function setCurrentTimeAsStart() {
  timeRange.start = currentTime.value
}

function setCurrentTimeAsEnd() {
  timeRange.end = currentTime.value
}

// Text overlay controls
function addTextOverlay() {
  textOverlays.value.push({
    content: '',
    startTime: currentTime.value,
    endTime: Math.min(currentTime.value + 2, videoDuration.value),
    fontSize: 24,
    color: '#ffffff',
    position: 'bottom',
  })
}

function removeTextOverlay(index: number) {
  textOverlays.value.splice(index, 1)
}

// Capture and processing
function startCapture() {
  isCapturing.value = true
  capturedFrames.value = []

  if (videoPlayer.value) {
    videoPlayer.value.currentTime = timeRange.start
    videoPlayer.value.play()
  }
}

function stopCapture() {
  isCapturing.value = false

  if (videoPlayer.value) {
    videoPlayer.value.pause()
  }
}

function resetCapture() {
  isCapturing.value = false
  capturedFrames.value = []
  generatedGif.value = ''
  processingProgress.value = 0
}

async function generateGif() {
  if (!videoPlayer.value || !selectedVideo.value) {
    alert(t('tools.videoToGifConverter.errors.noVideoSelected'))
    return
  }

  // Validate time range
  if (timeRange.start >= timeRange.end) {
    alert(t('tools.videoToGifConverter.errors.invalidTimeRange'))
    return
  }

  isProcessing.value = true
  processingProgress.value = 0

  try {
    await createGifFromVideo()
    success(t('tools.videoToGifConverter.messages.gifGenerated'))
  } catch (err) {
    console.error('Error generating GIF:', err)
    error(t('tools.videoToGifConverter.errors.processingFailed') + ': ' + (err as Error).message)
  } finally {
    isProcessing.value = false
  }
}

async function createGifFromVideo() {
  if (!videoPlayer.value) {
    throw new Error('Video player not initialized')
  }

  // Check if video is loaded
  if (videoPlayer.value.readyState < 2) {
    throw new Error('Video not loaded properly. Please wait for the video to load completely.')
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Unable to get canvas context. Your browser may not support this feature.')
  }

  // Set canvas dimensions
  canvas.width = gifSettings.width
  canvas.height = (videoPlayer.value.videoHeight / videoPlayer.value.videoWidth) * gifSettings.width

  // Validate dimensions
  if (canvas.width <= 0 || canvas.height <= 0) {
    throw new Error('Invalid video dimensions. Please check your video file.')
  }

  // Configure GIF quality based on settings
  const qualityMap = {
    high: 1,
    medium: 10,
    low: 20,
  }

  // Create GIF with improved worker handling
  const gif = new GIF({
    workers: 2,
    quality: qualityMap[gifSettings.quality],
    width: canvas.width,
    height: canvas.height,
    workerScript: '/gif.worker.js',
  })

  const duration = Math.min(timeRange.end - timeRange.start, 15) // Limit to 15 seconds
  const frameInterval = 1 / gifSettings.fps
  const totalFrames = Math.floor(duration * gifSettings.fps)
  let processedFrames = 0

  // Extract frames
  for (
    let time = timeRange.start;
    time < timeRange.end && time < timeRange.start + 15;
    time += frameInterval
  ) {
    try {
      videoPlayer.value.currentTime = time
      // Wait for seek to complete
      await new Promise((resolve) => {
        const onSeeked = () => {
          videoPlayer.value?.removeEventListener('seeked', onSeeked)
          resolve(void 0)
        }
        videoPlayer.value?.addEventListener('seeked', onSeeked)
        // Fallback timeout
        setTimeout(resolve, 500)
      })

      // Draw video frame
      ctx.drawImage(videoPlayer.value, 0, 0, canvas.width, canvas.height)

      // Add text overlays for this time
      textOverlays.value.forEach((overlay) => {
        if (time >= overlay.startTime && time <= overlay.endTime && overlay.content) {
          ctx.save()

          // Configure text styling
          ctx.fillStyle = overlay.color
          ctx.font = `bold ${overlay.fontSize}px Arial`
          ctx.textAlign = 'center'
          ctx.strokeStyle = 'rgba(0,0,0,0.8)'
          ctx.lineWidth = 2

          // Calculate text position
          let y = canvas.height / 2
          if (overlay.position === 'top') y = overlay.fontSize + 20
          if (overlay.position === 'bottom') y = canvas.height - 20

          const x = canvas.width / 2

          // Draw text with stroke for better visibility
          ctx.strokeText(overlay.content, x, y)
          ctx.fillText(overlay.content, x, y)

          ctx.restore()
        }
      })

      // Add frame to GIF
      gif.addFrame(canvas, { copy: true, delay: frameInterval * 1000 })

      processedFrames++
      processingProgress.value = Math.round((processedFrames / totalFrames) * 80) // 80% for frame extraction
    } catch (err) {
      console.error('Error processing frame at time:', time, err)
      // Continue with next frame instead of stopping the whole process
    }
  }

  // Render GIF
  return new Promise<void>((resolve, reject) => {
    gif.on('progress', (progress: number) => {
      processingProgress.value = 80 + Math.round(progress * 20) // Remaining 20% for GIF rendering
    })

    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob)
      generatedGif.value = url
      processingProgress.value = 100
      resolve()
    })

    gif.on('abort', () => {
      reject(new Error('GIF generation was aborted'))
    })

    gif.on('error', (error: Error) => {
      reject(new Error('GIF generation error: ' + error.message))
    })

    try {
      gif.render()
    } catch (error) {
      reject(new Error('Failed to start GIF rendering: ' + (error as Error).message))
    }
  })
}

function downloadGif() {
  if (!generatedGif.value) return

  const link = document.createElement('a')
  link.href = generatedGif.value
  link.download = `video-to-gif-${Date.now()}.gif`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function resetTool() {
  selectedVideo.value = null
  videoUrl.value = ''
  resetCapture()
  textOverlays.value = []
  timeRange.start = 0
  timeRange.end = 0
  videoDuration.value = 0

  // Revoke object URLs to free memory
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
  if (generatedGif.value) {
    URL.revokeObjectURL(generatedGif.value)
  }

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
/* Custom styles for video controls */
video {
  background-color: #000;
}

/* Loading animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
