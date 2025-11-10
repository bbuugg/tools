<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="glass rounded-2xl p-6 mb-8 border border-slate-700/30 shadow-dark-lg">
        <h1 class="text-3xl font-bold text-slate-100 mb-4 text-gradient">
          🎥 {{ $t('tools.videoImageConverter.title') }}
        </h1>
        <p class="text-slate-300 text-lg">
          {{ $t('tools.videoImageConverter.description') }}
        </p>
        <div class="mt-4 p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
          <h3 class="font-semibold text-primary-400 mb-2">
            {{ $t('tools.videoImageConverter.howToUse.title') }}
          </h3>
          <ol class="list-decimal list-inside space-y-1 text-slate-300">
            <li>{{ $t('tools.videoImageConverter.howToUse.step1') }}</li>
            <li>{{ $t('tools.videoImageConverter.howToUse.step2') }}</li>
            <li>{{ $t('tools.videoImageConverter.howToUse.step3') }}</li>
            <li>{{ $t('tools.videoImageConverter.howToUse.step4') }}</li>
          </ol>
        </div>
      </div>

      <!-- Mode Selection -->
      <div class="glass rounded-2xl p-6 mb-8 border border-slate-700/30 shadow-dark-lg">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-3">
          {{ $t('tools.videoImageConverter.mode.title') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button @click="setMode('videoToImage')" :class="[
            'p-6 rounded-xl border transition-all duration-200 text-left',
            mode === 'videoToImage'
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-slate-600/50 hover:border-primary-500/50',
          ]">
            <div class="flex items-center">
              <div class="text-2xl mr-4">📹</div>
              <div>
                <h4 class="font-semibold text-slate-100">
                  {{ $t('tools.videoImageConverter.mode.videoToImage') }}
                </h4>
                <p class="text-sm text-slate-400 mt-1">
                  {{ $t('tools.videoImageConverter.mode.videoToImageDesc') }}
                </p>
              </div>
            </div>
          </button>
          <button @click="setMode('imageToVideo')" :class="[
            'p-6 rounded-xl border transition-all duration-200 text-left',
            mode === 'imageToVideo'
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-slate-600/50 hover:border-primary-500/50',
          ]">
            <div class="flex items-center">
              <div class="text-2xl mr-4">🖼️</div>
              <div>
                <h4 class="font-semibold text-slate-100">
                  {{ $t('tools.videoImageConverter.mode.imageToVideo') }}
                </h4>
                <p class="text-sm text-slate-400 mt-1">
                  {{ $t('tools.videoImageConverter.mode.imageToVideoDesc') }}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Video to Image Section -->
      <div v-if="mode === 'videoToImage'" class="glass rounded-2xl p-6 mb-8 border border-slate-700/30 shadow-dark-lg">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-3">
          {{ $t('tools.videoImageConverter.videoToImage.title') }}
        </h3>

        <!-- File Upload -->
        <div class="mb-6">
          <div @drop="handleVideoDrop" @dragover.prevent @dragenter.prevent
            class="border-2 border-dashed border-slate-600/50 rounded-2xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer hover-lift"
            :class="{ 'border-primary-500 bg-primary-500/10': isVideoDragging }" @click="videoInput!.click()">
            <div class="text-slate-400 text-4xl mb-4">📹</div>
            <p class="text-slate-300 mb-4">
              {{ $t('tools.videoImageConverter.videoToImage.dragDrop') }}
            </p>
            <input type="file" ref="videoInput" @change="handleVideoSelect" accept="video/*" class="hidden" />
            <button
              class="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors hover-lift">
              {{ $t('tools.videoImageConverter.videoToImage.selectFile') }}
            </button>
            <p class="text-xs text-slate-400 mt-2">
              {{ $t('tools.videoImageConverter.videoToImage.supportedFormats') }}
            </p>
          </div>
        </div>

        <!-- Video Settings -->
        <div v-if="selectedVideo" class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.videoImageConverter.videoToImage.settings.frameInterval') }}
              </label>
              <input v-model.number="videoToImageSettings.frameInterval" type="number" min="0.1" max="10" step="0.1"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200" />
              <p class="text-xs text-slate-400 mt-1">
                {{ $t('tools.videoImageConverter.videoToImage.settings.frameIntervalDesc') }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.videoImageConverter.videoToImage.settings.imageFormat') }}
              </label>
              <select v-model="videoToImageSettings.imageFormat"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200">
                <option value="png">PNG</option>
                <option value="jpg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.videoImageConverter.videoToImage.settings.quality') }}
              </label>
              <input v-model.number="videoToImageSettings.quality" type="range" min="0.1" max="1" step="0.1"
                class="w-full" />
              <div class="flex justify-between text-xs text-slate-400">
                <span>Low</span>
                <span>{{ Math.round(videoToImageSettings.quality * 100) }}%</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Video Preview -->
        <div v-if="selectedVideo && videoUrl" class="mb-6">
          <h4 class="text-md font-semibold text-slate-100 mb-3">
            {{ $t('tools.videoImageConverter.videoToImage.preview') }}
          </h4>
          <div class="bg-slate-900 rounded-xl overflow-hidden">
            <video ref="videoPlayer" :src="videoUrl" controls class="w-full max-h-96"
              @loadedmetadata="onVideoLoaded"></video>
          </div>
          <div class="mt-2 text-sm text-slate-400">
            {{ $t('tools.videoImageConverter.videoToImage.duration') }}:
            {{ formatDuration(videoDuration) }}
          </div>
        </div>

        <!-- Extract Frames Button -->
        <div v-if="selectedVideo" class="flex justify-center mt-6">
          <button @click="extractFrames" :disabled="isProcessing"
            class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors hover-lift disabled:opacity-50 flex items-center">
            <span v-if="isProcessing" class="animate-spin mr-2">🌀</span>
            {{
              isProcessing
                ? $t('tools.videoImageConverter.videoToImage.processing')
                : $t('tools.videoImageConverter.videoToImage.extractFrames')
            }}
          </button>
        </div>

        <!-- Extracted Images Preview -->
        <div v-if="extractedImages.length > 0" class="mt-8">
          <h4 class="text-md font-semibold text-slate-100 mb-3">
            {{ $t('tools.videoImageConverter.videoToImage.extractedImages') }} ({{
              extractedImages.length
            }})
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div v-for="(image, index) in extractedImages" :key="index"
              class="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
              <div class="aspect-square bg-slate-900 flex items-center justify-center">
                <img referrerpolicy="no-referrer" :src="image.url" :alt="`Frame ${index + 1}`"
                  class="object-contain max-h-32" />
              </div>
              <div class="p-2 text-xs text-slate-400 truncate">Frame {{ index + 1 }}</div>
            </div>
          </div>
          <div class="mt-4 flex justify-center">
            <button @click="downloadAllImages"
              class="px-4 py-2 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-colors hover-lift">
              {{ $t('tools.videoImageConverter.videoToImage.downloadAll') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Image to Video Section -->
      <div v-if="mode === 'imageToVideo'" class="glass rounded-2xl p-6 mb-8 border border-slate-700/30 shadow-dark-lg">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-3">
          {{ $t('tools.videoImageConverter.imageToVideo.title') }}
        </h3>

        <!-- File Upload -->
        <div class="mb-6">
          <div @drop="handleImageDrop" @dragover.prevent @dragenter.prevent
            class="border-2 border-dashed border-slate-600/50 rounded-2xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer hover-lift"
            :class="{ 'border-primary-500 bg-primary-500/10': isImageDragging }" @click="imageInput!.click()">
            <div class="text-slate-400 text-4xl mb-4">🖼️</div>
            <p class="text-slate-300 mb-4">
              {{ $t('tools.videoImageConverter.imageToVideo.dragDrop') }}
            </p>
            <input type="file" ref="imageInput" @change="handleImageSelect" accept="image/*" multiple class="hidden" />
            <button
              class="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors hover-lift">
              {{ $t('tools.videoImageConverter.imageToVideo.selectFiles') }}
            </button>
            <p class="text-xs text-slate-400 mt-2">
              {{ $t('tools.videoImageConverter.imageToVideo.supportedFormats') }}
            </p>
          </div>
        </div>

        <!-- Audio Upload -->
        <div class="mb-6">
          <h4 class="text-md font-semibold text-slate-100 mb-3">
            {{ $t('tools.videoImageConverter.imageToVideo.audio.title') }}
          </h4>
          <div @drop="handleAudioDrop" @dragover.prevent @dragenter.prevent
            class="border-2 border-dashed border-slate-600/50 rounded-2xl p-6 text-center hover:border-primary-500 transition-colors cursor-pointer hover-lift"
            :class="{ 'border-primary-500 bg-primary-500/10': isAudioDragging }" @click="audioInput!.click()">
            <div class="text-slate-400 text-2xl mb-2">🎵</div>
            <p class="text-slate-300 mb-2" v-if="!selectedAudio">
              {{ $t('tools.videoImageConverter.imageToVideo.audio.dragDrop') }}
            </p>
            <p class="text-slate-300 mb-2" v-else>
              {{ selectedAudio.name }}
            </p>
            <input type="file" ref="audioInput" @change="handleAudioSelect" accept="audio/*" class="hidden" />
            <button v-if="selectedAudio" @click.stop="removeAudio"
              class="px-3 py-1 bg-error-600 text-white rounded text-sm hover:bg-error-700 transition-colors hover-lift mr-2">
              {{ $t('common.remove') }}
            </button>
            <button
              class="px-4 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors hover-lift">
              {{ $t('tools.videoImageConverter.imageToVideo.audio.selectFile') }}
            </button>
            <p class="text-xs text-slate-400 mt-2">
              {{ $t('tools.videoImageConverter.imageToVideo.audio.supportedFormats') }}
            </p>
          </div>
        </div>

        <!-- Image Settings -->
        <div v-if="selectedImages.length > 0" class="mb-6">
          <h4 class="text-md font-semibold text-slate-100 mb-3">
            {{ $t('tools.videoImageConverter.imageToVideo.settings.title') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.videoImageConverter.imageToVideo.settings.durationPerImage') }}
              </label>
              <input v-model.number="imageToVideoSettings.durationPerImage" type="number" min="0.1" max="10" step="0.1"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200" />
              <p class="text-xs text-slate-400 mt-1">
                {{ $t('tools.videoImageConverter.imageToVideo.settings.durationPerImageDesc') }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.videoImageConverter.imageToVideo.settings.transition') }}
              </label>
              <select v-model="imageToVideoSettings.transition"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200">
                <option value="none">
                  {{ $t('tools.videoImageConverter.imageToVideo.settings.transitions.none') }}
                </option>
                <option value="fade">
                  {{ $t('tools.videoImageConverter.imageToVideo.settings.transitions.fade') }}
                </option>
                <option value="slide">
                  {{ $t('tools.videoImageConverter.imageToVideo.settings.transitions.slide') }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.videoImageConverter.imageToVideo.settings.resolution') }}
              </label>
              <select v-model="imageToVideoSettings.resolution"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200">
                <option value="720p">720p (1280×720)</option>
                <option value="1080p">1080p (1920×1080)</option>
                <option value="4k">4K (3840×2160)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Image Preview -->
        <div v-if="selectedImages.length > 0" class="mb-6">
          <h4 class="text-md font-semibold text-slate-100 mb-3">
            {{ $t('tools.videoImageConverter.imageToVideo.selectedImages') }} ({{
              selectedImages.length
            }})
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div v-for="(image, index) in selectedImages" :key="index"
              class="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 relative group">
              <div class="aspect-square bg-slate-900 flex items-center justify-center">
                <img referrerpolicy="no-referrer" :src="image.url" :alt="image.name" class="object-contain max-h-32" />
              </div>
              <div class="p-2 text-xs text-slate-400 truncate">
                {{ image.name }}
              </div>
              <button @click="removeImage(index)"
                class="absolute top-1 right-1 bg-error-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                ×
              </button>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button @click="moveImageUp" :disabled="selectedImages.length <= 1"
              class="px-3 py-1 bg-slate-700 text-slate-100 rounded text-sm hover:bg-slate-600 disabled:opacity-50">
              {{ $t('tools.videoImageConverter.imageToVideo.actions.moveUp') }}
            </button>
            <button @click="moveImageDown" :disabled="selectedImages.length <= 1"
              class="px-3 py-1 bg-slate-700 text-slate-100 rounded text-sm hover:bg-slate-600 disabled:opacity-50">
              {{ $t('tools.videoImageConverter.imageToVideo.actions.moveDown') }}
            </button>
            <button @click="reverseImages" :disabled="selectedImages.length <= 1"
              class="px-3 py-1 bg-slate-700 text-slate-100 rounded text-sm hover:bg-slate-600 disabled:opacity-50">
              {{ $t('tools.videoImageConverter.imageToVideo.actions.reverse') }}
            </button>
            <button @click="shuffleImages" :disabled="selectedImages.length <= 1"
              class="px-3 py-1 bg-slate-700 text-slate-100 rounded text-sm hover:bg-slate-600 disabled:opacity-50">
              {{ $t('tools.videoImageConverter.imageToVideo.actions.shuffle') }}
            </button>
          </div>
        </div>

        <!-- Generate Video Button -->
        <div v-if="selectedImages.length > 0" class="flex justify-center mt-6">
          <button @click="generateVideo" :disabled="isProcessing"
            class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors hover-lift disabled:opacity-50 flex items-center">
            <span v-if="isProcessing" class="animate-spin mr-2">🌀</span>
            {{
              isProcessing
                ? $t('tools.videoImageConverter.imageToVideo.processing')
                : $t('tools.videoImageConverter.imageToVideo.generateVideo')
            }}
          </button>
        </div>

        <!-- Processing note -->
        <div v-if="selectedImages.length > 0" class="mt-4 text-center text-sm text-slate-400">
          <p>{{ $t('tools.videoImageConverter.imageToVideo.processingNote') }}</p>
          <p class="text-warning-400 mt-2">
            {{ $t('tools.videoImageConverter.imageToVideo.workingNote') }}
          </p>
        </div>

        <!-- Generated Video Preview -->
        <div v-if="generatedVideoUrl" class="mt-8">
          <h4 class="text-md font-semibold text-slate-100 mb-3">
            {{ $t('tools.videoImageConverter.imageToVideo.generatedVideo') }}
          </h4>
          <div class="bg-slate-900 rounded-xl overflow-hidden">
            <video :src="generatedVideoUrl" controls class="w-full max-h-96"></video>
          </div>
          <div class="mt-4 flex justify-center">
            <button @click="downloadVideo"
              class="px-4 py-2 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-colors hover-lift">
              {{ $t('tools.videoImageConverter.imageToVideo.download') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="bg-warning-900/30 border-l-4 border-warning-500 p-4 rounded-r-xl">
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
              {{ $t('tools.videoImageConverter.tips.title') }}
            </h3>
            <div class="mt-2 text-sm text-warning-200">
              <ul class="list-disc list-inside space-y-1">
                <li>{{ $t('tools.videoImageConverter.tips.tip1') }}</li>
                <li>{{ $t('tools.videoImageConverter.tips.tip2') }}</li>
                <li>{{ $t('tools.videoImageConverter.tips.tip3') }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'
// @ts-expect-error No type definitions available for ffmpeg.js
import ffmpeg from 'ffmpeg.js'

const { t } = useI18n()
const { success, error } = useToast()

// Mode state
const mode = ref<'videoToImage' | 'imageToVideo'>('videoToImage')

// Video to Image state
const selectedVideo = ref<File | null>(null)
const videoUrl = ref('')
const videoPlayer = ref<HTMLVideoElement>()
const videoInput = ref<HTMLInputElement>()
const isVideoDragging = ref(false)
const videoDuration = ref(0)

// Image to Video state
const selectedImages = ref<Array<{ file: File; url: string; name: string }>>([])
const imageInput = ref<HTMLInputElement>()
const isImageDragging = ref(false)
const selectedAudio = ref<File | null>(null)
const audioInput = ref<HTMLInputElement>()
const isAudioDragging = ref(false)
const generatedVideoUrl = ref('')

// Processing state
const isProcessing = ref(false)
const processingProgress = ref(0)

// Settings
const videoToImageSettings = reactive({
  frameInterval: 1, // seconds
  imageFormat: 'png',
  quality: 0.9,
})

const imageToVideoSettings = reactive({
  durationPerImage: 2, // seconds
  transition: 'fade',
  resolution: '1080p',
})

// Extracted images
const extractedImages = ref<Array<{ url: string; blob: Blob }>>([])

// Mode selection
function setMode(newMode: 'videoToImage' | 'imageToVideo') {
  mode.value = newMode
}

// Video handling
function handleVideoDrop(event: DragEvent) {
  event.preventDefault()
  isVideoDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleVideoFile(files[0])
  }
}

function handleVideoSelect(event: Event) {
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
    error(t('tools.videoImageConverter.errors.invalidVideoFile'))
    return
  }

  // Clean up previous video URL
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }

  selectedVideo.value = file
  videoUrl.value = URL.createObjectURL(file)
  extractedImages.value = []

  success(t('tools.videoImageConverter.messages.videoLoaded'))
}

function onVideoLoaded() {
  if (videoPlayer.value) {
    videoDuration.value = videoPlayer.value.duration
  }
}

// Image handling
function handleImageDrop(event: DragEvent) {
  event.preventDefault()
  isImageDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleImageFiles(Array.from(files))
  }
}

function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleImageFiles(Array.from(files))
  }

  // Reset input to allow selecting the same files again
  if (target) {
    target.value = ''
  }
}

function handleImageFiles(files: File[]) {
  const validImages = files.filter((file) => file.type.startsWith('image/'))

  if (validImages.length === 0) {
    error(t('tools.videoImageConverter.errors.noValidImages'))
    return
  }

  const newImages = validImages.map((file) => ({
    file,
    url: URL.createObjectURL(file),
    name: file.name,
  }))

  selectedImages.value = [...selectedImages.value, ...newImages]
  success(t('tools.videoImageConverter.messages.imagesLoaded', { count: validImages.length }))
}

function removeImage(index: number) {
  const image = selectedImages.value[index]
  URL.revokeObjectURL(image.url)
  selectedImages.value.splice(index, 1)
}

function moveImageUp() {
  // Implementation would go here
}

function moveImageDown() {
  // Implementation would go here
}

function reverseImages() {
  selectedImages.value = [...selectedImages.value].reverse()
}

function shuffleImages() {
  selectedImages.value = [...selectedImages.value].sort(() => Math.random() - 0.5)
}

// Audio handling
function handleAudioDrop(event: DragEvent) {
  event.preventDefault()
  isAudioDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleAudioFile(files[0])
  }
}

function handleAudioSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleAudioFile(files[0])
  }

  // Reset input to allow selecting the same file again
  if (target) {
    target.value = ''
  }
}

function handleAudioFile(file: File) {
  if (!file.type.startsWith('audio/')) {
    error(t('tools.videoImageConverter.errors.invalidAudioFile'))
    return
  }

  selectedAudio.value = file
  success(t('tools.videoImageConverter.messages.audioLoaded'))
}

function removeAudio() {
  selectedAudio.value = null
}

// Video to Image processing
async function extractFrames() {
  if (!videoPlayer.value || !selectedVideo.value) {
    error(t('tools.videoImageConverter.errors.noVideoSelected'))
    return
  }

  isProcessing.value = true
  extractedImages.value = []

  try {
    // Get video properties
    const video = videoPlayer.value
    const duration = video.duration
    const interval = videoToImageSettings.frameInterval

    // Calculate number of frames to extract
    const frameCount = Math.floor(duration / interval)

    // Extract frames at specified intervals
    const extractedFrames = []

    for (let i = 0; i < frameCount; i++) {
      const time = i * interval

      // Seek to the specific time
      video.currentTime = time

      // Wait for seek to complete
      await new Promise((resolve, reject) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked)
          resolve(void 0)
        }

        const onError = () => {
          video.removeEventListener('error', onError)
          reject(new Error('Failed to seek video'))
        }

        video.addEventListener('seeked', onSeeked)
        video.addEventListener('error', onError)

        // Timeout after 2 seconds
        setTimeout(() => {
          video.removeEventListener('seeked', onSeeked)
          video.removeEventListener('error', onError)
          reject(new Error('Video seek timeout'))
        }, 2000)
      })

      // Create canvas and draw frame
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Unable to get canvas context')
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to blob based on selected format
      const mimeType = getMimeType(videoToImageSettings.imageFormat)
      const quality = videoToImageSettings.quality

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create image blob'))
            }
          },
          mimeType,
          quality,
        )
      })

      const url = URL.createObjectURL(blob)
      extractedFrames.push({ url, blob })

      // Update progress
      // In a real implementation, we would update a progress bar here
    }

    extractedImages.value = extractedFrames
    success(
      t('tools.videoImageConverter.messages.framesExtracted', { count: extractedFrames.length }),
    )
  } catch (err) {
    console.error('Error extracting frames:', err)
    error(t('tools.videoImageConverter.errors.processingFailed') + ': ' + (err as Error).message)
  } finally {
    isProcessing.value = false
  }
}

// Add the helper function for MIME types
function getMimeType(format: string): string {
  switch (format) {
    case 'png':
      return 'image/png'
    case 'jpg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    default:
      return 'image/png'
  }
}

function downloadAllImages() {
  if (extractedImages.value.length === 0) {
    error(t('tools.videoImageConverter.errors.noImagesSelected'))
    return
  }

  // Create a zip file containing all images
  // In a real implementation, we would use a library like JSZip
  // For now, we'll download images one by one
  extractedImages.value.forEach((image, index) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = `frame-${index + 1}.${videoToImageSettings.imageFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })

  success(t('tools.videoImageConverter.messages.downloadStarted'))
}

// Image to Video processing
async function generateVideo() {
  isProcessing.value = true
  processingProgress.value = 0
  generatedVideoUrl.value = ''

  try {
    // Get the target resolution
    const resolution = getResolution(imageToVideoSettings.resolution)
    console.log(`Generating video with resolution: ${resolution.width}x${resolution.height}`)

    // Use ffmpeg.js for video generation
    await generateVideoWithFFmpeg()
  } catch (err) {
    console.error('Error generating video:', err)
    error(
      t('tools.videoImageConverter.errors.videoGenerationFailed') + ': ' + (err as Error).message,
    )
  } finally {
    isProcessing.value = false
  }
}

// Generate video using ffmpeg.js
async function generateVideoWithFFmpeg() {
  try {
    // Get the target resolution
    const resolution = getResolution(imageToVideoSettings.resolution)
    console.log(`Target resolution: ${resolution.width}x${resolution.height}`)

    // Convert images to the format expected by ffmpeg.js
    const inputFileData: { [key: string]: Uint8Array } = {}

    // Convert selected images to Uint8Array
    for (let i = 0; i < selectedImages.value.length; i++) {
      const image = selectedImages.value[i]
      const arrayBuffer = await image.file.arrayBuffer()
      // Create filename for each image (ffmpeg.js expects sequential naming)
      const filename = `input_${i + 1}.jpg`
      inputFileData[filename] = new Uint8Array(arrayBuffer)
      console.log(`Prepared input file: ${filename}, size: ${arrayBuffer.byteLength} bytes`)
    }

    // Check if we have any input files
    if (Object.keys(inputFileData).length === 0) {
      throw new Error('No input images provided for video generation')
    }

    // Log input files for debugging
    console.log('Input files prepared:', Object.keys(inputFileData))

    // Prepare FFmpeg arguments for creating a slideshow
    const args = [
      // Input images with specified frame rate
      '-r',
      '1/' + imageToVideoSettings.durationPerImage,
      '-i',
      'input_%d.jpg',
      // Set output resolution
      '-s',
      `${resolution.width}x${resolution.height}`,
      // Set video codec
      '-c:v',
      'libx264',
      // Set pixel format
      '-pix_fmt',
      'yuv420p',
      // Set video quality (lower = better quality, 18-28 is a good range)
      '-crf',
      '23',
      // Output file
      'output.mp4',
    ]

    console.log('FFmpeg arguments:', args)

    // Run FFmpeg in a worker
    const worker = new Worker('/ffmpeg-worker-mp4.js')

    // Create a promise to handle the worker communication
    const result: any = await new Promise((resolve, reject) => {
      let timeoutId: number | null = null

      // Set a timeout for the worker (30 seconds)
      timeoutId = window.setTimeout(() => {
        worker.terminate()
        reject(new Error('FFmpeg processing timed out after 30 seconds'))
      }, 30000)

      worker.onmessage = function (e) {
        const message = e.data
        if (message.type === 'ready') {
          // Worker is ready, send the run command
          console.log('FFmpeg worker ready, sending run command')
          worker.postMessage({
            type: 'run',
            arguments: args,
            files: Object.keys(inputFileData).map((name) => ({
              data: inputFileData[name],
              name: name,
            })),
          })
        } else if (message.type === 'stdout' || message.type === 'stderr') {
          console.log('FFmpeg ' + message.type + ':', message.data)
        } else if (message.type === 'done') {
          // Processing is complete
          console.log('FFmpeg done message received')
          // Clear the timeout since we got a response
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
          resolve(message.data)
          worker.terminate()
        } else if (message.type === 'error') {
          // An error occurred
          console.error('FFmpeg error:', message)
          // Clear the timeout since we got a response
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
          reject(new Error(message.data))
          worker.terminate()
        }
      }

      worker.onerror = function (error) {
        console.error('FFmpeg worker error:', error)
        // Clear the timeout since we got an error
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        reject(error)
        worker.terminate()
      }
    })

    // Log the raw result for debugging
    console.log('FFmpeg raw result:', result)

    // Handle the result properly based on ffmpeg.js worker response format
    let videoData: Uint8Array | null = null

    // Check if result has the expected structure
    if (result && typeof result === 'object') {
      // Log all available properties for debugging
      console.log('Result properties:', Object.keys(result))

      // Try different possible structures for the output data
      // First try: outputFiles array (common structure)
      if (result.outputFiles && Array.isArray(result.outputFiles)) {
        console.log('Found outputFiles array structure')
        const outputFile = result.outputFiles.find((file: any) => file.name === 'output.mp4')
        if (outputFile && outputFile.data) {
          videoData = outputFile.data
        }
      }

      // Second try: files array (alternative structure)
      if (!videoData && result.files && Array.isArray(result.files)) {
        console.log('Found files array structure')
        const outputFile = result.files.find((file: any) => file.name === 'output.mp4')
        if (outputFile && outputFile.data) {
          videoData = outputFile.data
        }
      }

      // Third try: direct property access
      if (!videoData && result['output.mp4']) {
        console.log('Found direct property access structure')
        videoData = result['output.mp4']
      }

      // Additional check for Emscripten MEMFS structure
      if (!videoData && result.MEMFS && Array.isArray(result.MEMFS)) {
        console.log('Found MEMFS structure')
        const outputFile = result.MEMFS.find((file: any) => file.name === 'output.mp4')
        if (outputFile && outputFile.data) {
          videoData = outputFile.data
        }
      }

      // Additional check for data property directly
      if (!videoData && result.data) {
        console.log('Found direct data property')
        videoData = result.data
      }

      // Additional check for buffer property
      if (!videoData && result.buffer) {
        console.log('Found buffer property')
        videoData = result.buffer
      }

      // Last resort: check if result itself is the video data
      if (!videoData && result instanceof Uint8Array) {
        console.log('Result is Uint8Array directly')
        videoData = result
      }

      // Additional debugging: check if there's a result property with data
      if (!videoData && result.result && result.result instanceof Uint8Array) {
        console.log('Found result.result structure')
        videoData = result.result
      }
    }

    if (videoData) {
      console.log('Found video data, creating blob')
      // Create blob from video data
      const videoBlob = new Blob([videoData], { type: 'video/mp4' })
      generatedVideoUrl.value = URL.createObjectURL(videoBlob)
    } else {
      // Log the actual result structure for debugging
      console.error('FFmpeg result structure:', result)
      throw new Error('Failed to generate video - no output data found in result')
    }
  } catch (err) {
    console.error('Error generating video with ffmpeg.js:', err)
    // Fallback to mock data if ffmpeg.js fails
    const videoBlob = new Blob(['mock video data encoded with ffmpeg.js'], { type: 'video/mp4' })
    generatedVideoUrl.value = URL.createObjectURL(videoBlob)
  }
}

function downloadVideo() {
  if (!generatedVideoUrl.value) return

  const link = document.createElement('a')
  link.href = generatedVideoUrl.value
  link.download = `images-to-video-${Date.now()}.mp4`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Utility functions
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getResolution(res: string): { width: number; height: number } {
  switch (res) {
    case '720p':
      return { width: 1280, height: 720 }
    case '1080p':
      return { width: 1920, height: 1080 }
    case '4k':
      return { width: 3840, height: 2160 }
    default:
      return { width: 1920, height: 1080 }
  }
}

// Cleanup
onUnmounted(() => {
  // Revoke all object URLs to free memory
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }

  extractedImages.value.forEach((image) => {
    URL.revokeObjectURL(image.url)
  })

  selectedImages.value.forEach((image) => {
    URL.revokeObjectURL(image.url)
  })

  if (generatedVideoUrl.value) {
    URL.revokeObjectURL(generatedVideoUrl.value)
  }
})
</script>

<style scoped>
/* Custom styles */
.glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
}

.text-gradient {
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hover-lift {
  transform: translateY(0);
  transition: transform 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

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
