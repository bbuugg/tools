<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ $t('tools.imageWatermark.title') }}
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ $t('tools.imageWatermark.description') }}
        </p>
      </div>

      <!-- Upload Area -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          @click="openFileSelector"
          :class="[
            'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          ]"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileSelect"
            class="hidden"
          />
          <div class="space-y-4">
            <div class="text-6xl text-gray-400">💧</div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ $t('tools.imageWatermark.uploadTitle') }}
              </h3>
              <p class="text-gray-600">
                {{ $t('tools.imageWatermark.uploadDescription') }}
              </p>
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('tools.imageWatermark.supportedFormats') }}: JPG, PNG, WebP, GIF
              </p>
            </div>
            <button
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ $t('tools.imageWatermark.selectFiles') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Watermark Settings Panel -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {{ $t('tools.imageWatermark.settings') }}
        </h3>

        <!-- Watermark Type Selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('tools.imageWatermark.watermarkType') }}
          </label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              @click="watermarkType = 'text'"
              :class="[
                'px-4 py-3 rounded-lg border transition-colors text-center',
                watermarkType === 'text'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400',
              ]"
            >
              <div class="font-medium">{{ $t('tools.imageWatermark.textWatermark') }}</div>
              <div class="text-sm text-gray-500 mt-1">
                {{ $t('tools.imageWatermark.textWatermarkDesc') }}
              </div>
            </button>
            <button
              @click="watermarkType = 'image'"
              :class="[
                'px-4 py-3 rounded-lg border transition-colors text-center',
                watermarkType === 'image'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400',
              ]"
            >
              <div class="font-medium">{{ $t('tools.imageWatermark.imageWatermark') }}</div>
              <div class="text-sm text-gray-500 mt-1">
                {{ $t('tools.imageWatermark.imageWatermarkDesc') }}
              </div>
            </button>
            <button
              @click="watermarkType = 'combined'"
              :class="[
                'px-4 py-3 rounded-lg border transition-colors text-center',
                watermarkType === 'combined'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400',
              ]"
            >
              <div class="font-medium">{{ $t('tools.imageWatermark.combinedWatermark') }}</div>
              <div class="text-sm text-gray-500 mt-1">
                {{ $t('tools.imageWatermark.combinedWatermarkDesc') }}
              </div>
            </button>
          </div>
        </div>

        <!-- Text Watermark Settings -->
        <div
          v-if="watermarkType === 'text' || watermarkType === 'combined'"
          class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h4 class="text-md font-medium text-gray-900 mb-3">
            {{ $t('tools.imageWatermark.textSettings') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.imageWatermark.watermarkText') }}
              </label>
              <input
                v-model="textOptions.text"
                type="text"
                :placeholder="$t('tools.imageWatermark.textPlaceholder')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.imageWatermark.fontSize') }}: {{ textOptions.fontSize }}px
              </label>
              <input
                v-model="textOptions.fontSize"
                type="range"
                min="12"
                max="100"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.imageWatermark.fontColor') }}
              </label>
              <input
                v-model="textOptions.color"
                type="color"
                class="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.imageWatermark.fontFamily') }}
              </label>
              <select
                v-model="textOptions.fontFamily"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Arial">Arial</option>
                <option value="Verdana">Verdana</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Image Watermark Settings -->
        <div
          v-if="watermarkType === 'image' || watermarkType === 'combined'"
          class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h4 class="text-md font-medium text-gray-900 mb-3">
            {{ $t('tools.imageWatermark.imageSettings') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.imageWatermark.watermarkImage') }}
              </label>
              <div
                @drop="handleWatermarkDrop"
                @dragover.prevent
                @dragenter.prevent
                @click="openWatermarkSelector"
                :class="[
                  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  isWatermarkDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400',
                ]"
              >
                <input
                  ref="watermarkInput"
                  type="file"
                  accept="image/*"
                  @change="handleWatermarkSelect"
                  class="hidden"
                />
                <div v-if="watermarkImage.preview" class="flex flex-col items-center">
                  <img
                    :src="watermarkImage.preview"
                    :alt="$t('tools.imageWatermark.watermarkPreview')"
                    class="max-h-24 max-w-full mb-2"
                  />
                  <button
                    @click.stop="removeWatermark"
                    class="text-sm text-red-600 hover:text-red-800"
                  >
                    {{ $t('tools.imageWatermark.removeWatermark') }}
                  </button>
                </div>
                <div v-else>
                  <div class="text-4xl text-gray-400 mb-2">🖼️</div>
                  <p class="text-gray-600">{{ $t('tools.imageWatermark.uploadWatermark') }}</p>
                </div>
              </div>
            </div>
            <div>
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.imageWatermark.imageWidth') }}: {{ imageOptions.width }}px
                </label>
                <input
                  v-model="imageOptions.width"
                  type="range"
                  min="20"
                  :max="imageOptions.maxWidth"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.imageWatermark.imageOpacity') }}: {{ imageOptions.opacity }}%
                </label>
                <input
                  v-model="imageOptions.opacity"
                  type="range"
                  min="0"
                  max="100"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Position Settings -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 class="text-md font-medium text-gray-900 mb-3">
            {{ $t('tools.imageWatermark.positionSettings') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.imageWatermark.position') }}
              </label>
              <select
                v-model="positionOptions.position"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="top-left">{{ $t('tools.imageWatermark.topLeft') }}</option>
                <option value="top-center">{{ $t('tools.imageWatermark.topCenter') }}</option>
                <option value="top-right">{{ $t('tools.imageWatermark.topRight') }}</option>
                <option value="center-left">{{ $t('tools.imageWatermark.centerLeft') }}</option>
                <option value="center">{{ $t('tools.imageWatermark.center') }}</option>
                <option value="center-right">{{ $t('tools.imageWatermark.centerRight') }}</option>
                <option value="bottom-left">{{ $t('tools.imageWatermark.bottomLeft') }}</option>
                <option value="bottom-center">{{ $t('tools.imageWatermark.bottomCenter') }}</option>
                <option value="bottom-right">{{ $t('tools.imageWatermark.bottomRight') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.imageWatermark.margin') }}: {{ positionOptions.margin }}px
              </label>
              <input
                v-model="positionOptions.margin"
                type="range"
                min="0"
                max="100"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 class="text-md font-medium text-gray-900 mb-3">
            {{ $t('tools.imageWatermark.advancedSettings') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.imageWatermark.opacity') }}: {{ advancedOptions.opacity }}%
              </label>
              <input
                v-model="advancedOptions.opacity"
                type="range"
                min="0"
                max="100"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.imageWatermark.rotation') }}: {{ advancedOptions.rotation }}°
              </label>
              <input
                v-model="advancedOptions.rotation"
                type="range"
                min="0"
                max="360"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.imageWatermark.scale') }}: {{ advancedOptions.scale }}%
              </label>
              <input
                v-model="advancedOptions.scale"
                type="range"
                min="10"
                max="200"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Images List -->
      <div v-if="images.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ $t('tools.imageWatermark.imageList') }} ({{ images.length }})
          </h3>
          <div class="flex gap-3">
            <button
              @click="processAll"
              :disabled="isProcessing"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isProcessing" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ $t('tools.imageWatermark.processing') }}
              </span>
              <span v-else>{{ $t('tools.imageWatermark.processAll') }}</span>
            </button>
            <button
              @click="downloadAll"
              :disabled="!hasProcessedImages"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('tools.imageWatermark.downloadAll') }}
            </button>
            <button
              @click="clearAll"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <!-- Statistics -->
        <div
          v-if="processingStats.totalOriginalSize > 0"
          class="mb-6 p-4 bg-green-50 rounded-lg border border-green-200"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-green-700">
                {{ formatFileSize(processingStats.totalOriginalSize) }}
              </div>
              <div class="text-sm text-green-600">
                {{ $t('tools.imageWatermark.originalSize') }}
              </div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-700">
                {{ formatFileSize(processingStats.totalProcessedSize) }}
              </div>
              <div class="text-sm text-green-600">
                {{ $t('tools.imageWatermark.processedSize') }}
              </div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-700">
                {{ processingStats.processedCount }}/{{ images.length }}
              </div>
              <div class="text-sm text-green-600">{{ $t('tools.imageWatermark.processed') }}</div>
            </div>
          </div>
        </div>

        <!-- Image Items -->
        <div class="space-y-4">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start space-x-4">
              <!-- Thumbnail -->
              <div class="flex-shrink-0">
                <img
                  :src="image.preview"
                  :alt="image.name"
                  class="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
              </div>

              <!-- Info and Actions -->
              <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Info Section -->
                <div class="md:col-span-2">
                  <h4 class="text-sm font-medium text-gray-900 truncate">{{ image.name }}</h4>
                  <p class="text-sm text-gray-500">
                    {{ image.dimensions.width }} × {{ image.dimensions.height }} px
                  </p>
                  <div class="flex flex-wrap gap-4 mt-2">
                    <div class="text-sm text-gray-600">
                      {{ $t('tools.imageWatermark.original') }}:
                      {{ formatFileSize(image.originalSize) }}
                    </div>
                    <div v-if="image.processedSize" class="text-sm text-green-600">
                      {{ $t('tools.imageWatermark.processed') }}:
                      {{ formatFileSize(image.processedSize) }}
                    </div>
                  </div>
                </div>

                <!-- Status & Actions Section -->
                <div class="flex flex-col items-end space-y-2">
                  <!-- Status -->
                  <div class="flex items-center space-x-2">
                    <div
                      :class="[
                        'w-3 h-3 rounded-full',
                        image.status === 'pending'
                          ? 'bg-gray-400'
                          : image.status === 'processing'
                            ? 'bg-yellow-400'
                            : image.status === 'completed'
                              ? 'bg-green-400'
                              : 'bg-red-400',
                      ]"
                    ></div>
                    <span class="text-xs text-gray-600">
                      {{ $t(`tools.imageWatermark.status.${image.status}`) }}
                    </span>
                  </div>

                  <!-- Progress -->
                  <div v-if="image.status === 'processing'" class="w-full max-w-[100px]">
                    <div class="bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${image.progress}%` }"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-500 text-center mt-1">{{ image.progress }}%</div>
                  </div>

                  <!-- Actions -->
                  <div class="flex flex-wrap gap-2 justify-end">
                    <button
                      v-if="image.status === 'completed' && image.processedBlob"
                      @click="previewImage(index)"
                      class="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      {{ $t('common.preview') }}
                    </button>
                    <button
                      v-if="image.status === 'completed' && image.processedBlob"
                      @click="downloadImage(index)"
                      class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      {{ $t('common.download') }}
                    </button>
                    <button
                      @click="processImage(index)"
                      :disabled="isProcessing"
                      class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {{ $t('tools.imageWatermark.process') }}
                    </button>
                    <button
                      @click="removeImage(index)"
                      class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      {{ $t('tools.imageWatermark.remove') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <div
        v-if="showPreviewModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div class="relative bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 rounded-t">
            <h3 class="text-xl font-semibold text-gray-800">
              {{ $t('tools.imageWatermark.imagePreview') }}
            </h3>
            <button
              @click="showPreviewModal = false"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-2">
                  {{ $t('tools.imageWatermark.originalImage') }}
                </h4>
                <div class="border border-gray-200 rounded-lg p-2">
                  <img
                    :src="previewImageItem?.preview"
                    :alt="previewImageItem?.name"
                    class="w-full h-auto max-h-96 object-contain"
                  />
                </div>
                <div class="mt-2 text-sm text-gray-600">
                  {{ previewImageItem?.name }}<br />
                  {{ $t('tools.imageWatermark.size') }}:
                  {{ formatFileSize(previewImageItem?.originalSize || 0) }}<br />
                  {{ $t('tools.imageWatermark.dimensions') }}:
                  {{ previewImageItem?.dimensions.width }} ×
                  {{ previewImageItem?.dimensions.height }} px
                </div>
              </div>
              <div v-if="previewImageItem?.processedBlob">
                <h4 class="text-lg font-medium text-gray-900 mb-2">
                  {{ $t('tools.imageWatermark.processedImage') }}
                </h4>
                <div class="border border-gray-200 rounded-lg p-2">
                  <img
                    :src="previewImageItem?.processedPreviewUrl"
                    :alt="previewImageItem?.name"
                    class="w-full h-auto max-h-96 object-contain"
                  />
                </div>
                <div class="mt-2 text-sm text-gray-600">
                  {{ previewImageItem?.name }}<br />
                  {{ $t('tools.imageWatermark.size') }}:
                  {{ formatFileSize(previewImageItem?.processedSize || 0) }}
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end p-6 border-t border-gray-200 rounded-b">
            <button
              @click="showPreviewModal = false"
              class="text-gray-600 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Feature Descriptions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            💧 {{ $t('tools.imageWatermark.features.watermark.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageWatermark.features.watermark.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            🖼️ {{ $t('tools.imageWatermark.features.batch.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageWatermark.features.batch.description') }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            ⚙️ {{ $t('tools.imageWatermark.features.customization.title') }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ $t('tools.imageWatermark.features.customization.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

interface ProcessedImage {
  name: string
  file: File
  preview: string
  originalSize: number
  processedSize?: number
  dimensions: {
    width: number
    height: number
  }
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  processedBlob?: Blob
  processedPreviewUrl?: string // Add this for preview
}

interface TextOptions {
  text: string
  fontSize: number
  color: string
  fontFamily: string
}

interface ImageOptions {
  width: number
  maxWidth: number
  opacity: number
}

interface PositionOptions {
  position:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center-left'
    | 'center'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  margin: number
}

interface AdvancedOptions {
  opacity: number
  rotation: number
  scale: number
}

const { t } = useI18n()
const { success, error: showError } = useToast()

// Refs
const fileInput = ref<HTMLInputElement>()
const watermarkInput = ref<HTMLInputElement>()
const images = ref<ProcessedImage[]>([])
const isDragging = ref(false)
const isWatermarkDragging = ref(false)
const isProcessing = ref(false)

// Preview modal
const showPreviewModal = ref(false)
const previewImageItem = ref<ProcessedImage | null>(null)

// Watermark settings
const watermarkType = ref<'text' | 'image' | 'combined'>('text')
const textOptions = ref<TextOptions>({
  text: 'Watermark',
  fontSize: 24,
  color: '#ffffff',
  fontFamily: 'Arial',
})
const watermarkImage = ref({
  file: null as File | null,
  preview: '',
})
const imageOptions = ref<ImageOptions>({
  width: 100,
  maxWidth: 300,
  opacity: 80,
})
const positionOptions = ref<PositionOptions>({
  position: 'bottom-right',
  margin: 20,
})
const advancedOptions = ref<AdvancedOptions>({
  opacity: 80,
  rotation: 0,
  scale: 100,
})

// Computed properties
const hasProcessedImages = computed(() => {
  return images.value.some((img) => img.status === 'completed')
})

const processingStats = computed(() => {
  const completed = images.value.filter((img) => img.status === 'completed')
  const totalOriginalSize = completed.reduce((sum, img) => sum + img.originalSize, 0)
  const totalProcessedSize = completed.reduce((sum, img) => sum + (img.processedSize || 0), 0)
  const processedCount = completed.length

  return {
    totalOriginalSize,
    totalProcessedSize,
    processedCount,
  }
})

// File handling
function openFileSelector() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    addFiles(Array.from(files))
  }
  // Reset the input value to allow selecting the same file again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files) {
    addFiles(Array.from(files))
  }
}

async function addFiles(files: File[]) {
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    showError(t('tools.imageWatermark.errors.noValidImages'))
    return
  }

  for (const file of imageFiles) {
    // Check if file already exists - now we allow duplicates
    const existingIndex = images.value.findIndex(
      (img) => img.name === file.name && img.originalSize === file.size,
    )

    if (existingIndex !== -1) {
      // Update existing file
      try {
        const dimensions = await getImageDimensions(file)
        const preview = await createImagePreview(file)

        images.value[existingIndex] = {
          name: file.name,
          file,
          preview,
          originalSize: file.size,
          dimensions,
          status: 'pending',
          progress: 0,
        }
      } catch (err) {
        console.error('Error processing file:', file.name, err)
      }
    } else {
      // Add new file
      try {
        const dimensions = await getImageDimensions(file)
        const preview = await createImagePreview(file)

        const imageItem: ProcessedImage = {
          name: file.name,
          file,
          preview,
          originalSize: file.size,
          dimensions,
          status: 'pending',
          progress: 0,
        }

        images.value.push(imageItem)
      } catch (err) {
        console.error('Error processing file:', file.name, err)
      }
    }
  }
}

// Watermark image handling
function openWatermarkSelector() {
  watermarkInput.value?.click()
}

function handleWatermarkSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files && files.length > 0) {
    setWatermarkImage(files[0])
  }
  // Reset the input value
  if (watermarkInput.value) {
    watermarkInput.value.value = ''
  }
}

function handleWatermarkDrop(event: DragEvent) {
  event.preventDefault()
  isWatermarkDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    setWatermarkImage(files[0])
  }
}

async function setWatermarkImage(file: File) {
  if (!file.type.startsWith('image/')) {
    showError(t('tools.imageWatermark.errors.invalidWatermark'))
    return
  }

  try {
    // Revoke previous preview URL if exists
    if (watermarkImage.value.preview) {
      URL.revokeObjectURL(watermarkImage.value.preview)
    }

    // Create preview
    const preview = await createImagePreview(file)

    // Get dimensions to set max width
    const dimensions = await getImageDimensions(file)

    watermarkImage.value = {
      file,
      preview,
    }

    // Update image options with max width based on watermark dimensions
    imageOptions.value.maxWidth = Math.min(dimensions.width, 500)
    imageOptions.value.width = Math.min(imageOptions.value.width, imageOptions.value.maxWidth)
  } catch (err) {
    console.error('Error processing watermark image:', err)
    showError(t('tools.imageWatermark.errors.watermarkProcessingFailed'))
  }
}

function removeWatermark() {
  if (watermarkImage.value.preview) {
    URL.revokeObjectURL(watermarkImage.value.preview)
  }
  watermarkImage.value = {
    file: null,
    preview: '',
  }
}

// Image processing utilities
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Watermark processing functions
async function processImage(index: number) {
  const image = images.value[index]
  if (!image) return

  // Validate watermark settings
  if (
    (watermarkType.value === 'image' || watermarkType.value === 'combined') &&
    !watermarkImage.value.file
  ) {
    showError(t('tools.imageWatermark.errors.noWatermarkImage'))
    return
  }

  if (
    (watermarkType.value === 'text' || watermarkType.value === 'combined') &&
    !textOptions.value.text.trim()
  ) {
    showError(t('tools.imageWatermark.errors.noWatermarkText'))
    return
  }

  image.status = 'processing'
  image.progress = 0

  try {
    // Create canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    // Load main image
    const mainImg = new Image()
    await new Promise((resolve, reject) => {
      mainImg.onload = resolve
      mainImg.onerror = reject
      mainImg.src = image.preview
    })

    // Set canvas dimensions to match the main image
    canvas.width = mainImg.width
    canvas.height = mainImg.height

    // Draw main image
    ctx.drawImage(mainImg, 0, 0, canvas.width, canvas.height)

    // Apply global alpha for overall opacity
    ctx.globalAlpha = advancedOptions.value.opacity / 100

    // Add watermark based on type
    if (watermarkType.value === 'text' || watermarkType.value === 'combined') {
      await addTextWatermark(ctx, canvas)
    }

    if (watermarkType.value === 'image' || watermarkType.value === 'combined') {
      await addImageWatermark(ctx, canvas)
    }

    // Reset global alpha
    ctx.globalAlpha = 1.0

    // Simulate progress
    for (let progress = 20; progress <= 80; progress += 20) {
      image.progress = progress
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob!)
        },
        'image/png',
        0.9,
      )
    })

    image.progress = 100
    image.processedBlob = blob
    image.processedSize = blob.size
    image.status = 'completed'

    // Generate preview URL for the processed image
    if (image.processedBlob) {
      image.processedPreviewUrl = URL.createObjectURL(image.processedBlob)
    }
  } catch (err) {
    console.error('Processing error:', err)
    image.status = 'error'
    showError(t('tools.imageWatermark.errors.processingFailed', { filename: image.name }))
  }
}

async function addTextWatermark(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const { text, fontSize, color, fontFamily } = textOptions.value
  const { position, margin } = positionOptions.value
  const { rotation, scale } = advancedOptions.value

  // Set text properties
  ctx.font = `${(fontSize * scale) / 100}px ${fontFamily}`
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  // Measure text
  const textMetrics = ctx.measureText(text)
  const textWidth = textMetrics.width
  const textHeight = (fontSize * scale) / 100

  // Calculate position
  let x = 0
  let y = 0

  switch (position) {
    case 'top-left':
      x = margin
      y = margin
      break
    case 'top-center':
      x = (canvas.width - textWidth) / 2
      y = margin
      break
    case 'top-right':
      x = canvas.width - textWidth - margin
      y = margin
      break
    case 'center-left':
      x = margin
      y = (canvas.height - textHeight) / 2
      break
    case 'center':
      x = (canvas.width - textWidth) / 2
      y = (canvas.height - textHeight) / 2
      break
    case 'center-right':
      x = canvas.width - textWidth - margin
      y = (canvas.height - textHeight) / 2
      break
    case 'bottom-left':
      x = margin
      y = canvas.height - textHeight - margin
      break
    case 'bottom-center':
      x = (canvas.width - textWidth) / 2
      y = canvas.height - textHeight - margin
      break
    case 'bottom-right':
      x = canvas.width - textWidth - margin
      y = canvas.height - textHeight - margin
      break
  }

  // Apply rotation if needed
  if (rotation !== 0) {
    ctx.save()
    ctx.translate(x + textWidth / 2, y + textHeight / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.fillText(text, -textWidth / 2, -textHeight / 2)
    ctx.restore()
  } else {
    ctx.fillText(text, x, y)
  }
}

async function addImageWatermark(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  if (!watermarkImage.value.file || !watermarkImage.value.preview) return

  const { width, opacity } = imageOptions.value
  const { position, margin } = positionOptions.value
  const { rotation, scale } = advancedOptions.value

  // Load watermark image
  const watermarkImg = new Image()
  await new Promise((resolve, reject) => {
    watermarkImg.onload = resolve
    watermarkImg.onerror = reject
    watermarkImg.src = watermarkImage.value.preview
  })

  // Calculate dimensions
  const aspectRatio = watermarkImg.height / watermarkImg.width
  const finalWidth = (width * scale) / 100
  const finalHeight = finalWidth * aspectRatio

  // Calculate position
  let x = 0
  let y = 0

  switch (position) {
    case 'top-left':
      x = margin
      y = margin
      break
    case 'top-center':
      x = (canvas.width - finalWidth) / 2
      y = margin
      break
    case 'top-right':
      x = canvas.width - finalWidth - margin
      y = margin
      break
    case 'center-left':
      x = margin
      y = (canvas.height - finalHeight) / 2
      break
    case 'center':
      x = (canvas.width - finalWidth) / 2
      y = (canvas.height - finalHeight) / 2
      break
    case 'center-right':
      x = canvas.width - finalWidth - margin
      y = (canvas.height - finalHeight) / 2
      break
    case 'bottom-left':
      x = margin
      y = canvas.height - finalHeight - margin
      break
    case 'bottom-center':
      x = (canvas.width - finalWidth) / 2
      y = canvas.height - finalHeight - margin
      break
    case 'bottom-right':
      x = canvas.width - finalWidth - margin
      y = canvas.height - finalHeight - margin
      break
  }

  // Apply opacity
  ctx.globalAlpha = opacity / 100

  // Apply rotation if needed
  if (rotation !== 0) {
    ctx.save()
    ctx.translate(x + finalWidth / 2, y + finalHeight / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(watermarkImg, -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight)
    ctx.restore()
  } else {
    ctx.drawImage(watermarkImg, x, y, finalWidth, finalHeight)
  }

  // Reset global alpha
  ctx.globalAlpha = 1.0
}

async function processAll() {
  isProcessing.value = true

  const pendingImages = images.value.map((img, index) => ({ img, index }))

  // Process in batches of 3 to avoid overwhelming the browser
  const batchSize = 3
  for (let i = 0; i < pendingImages.length; i += batchSize) {
    const batch = pendingImages.slice(i, i + batchSize)
    await Promise.all(batch.map(({ index }) => processImage(index)))
  }

  isProcessing.value = false
  success(t('tools.imageWatermark.success.processingComplete'))
}

// Download functions
function downloadImage(index: number) {
  const image = images.value[index]
  if (!image.processedBlob) return

  const url = URL.createObjectURL(image.processedBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${image.name.replace(/\.[^/.]+$/, '')}_watermark.png`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function downloadAll() {
  const { default: JSZip } = await import('jszip')

  const zip = new JSZip()
  const processedImages = images.value.filter(
    (img) => img.status === 'completed' && img.processedBlob,
  )

  for (const image of processedImages) {
    if (image.processedBlob) {
      const filename = `${image.name.replace(/\.[^/.]+$/, '')}_watermark.png`
      zip.file(filename, image.processedBlob)
    }
  }

  const content = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(content)
  const link = document.createElement('a')
  link.href = url
  link.download = `watermarked_images_${new Date().toISOString().split('T')[0]}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  success(t('tools.imageWatermark.success.downloadComplete'))
}

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function removeImage(index: number) {
  const image = images.value[index]
  URL.revokeObjectURL(image.preview)
  if (image.processedBlob) {
    URL.revokeObjectURL(URL.createObjectURL(image.processedBlob))
  }
  // Revoke processed preview URL if exists
  if (image.processedPreviewUrl) {
    URL.revokeObjectURL(image.processedPreviewUrl)
  }
  images.value.splice(index, 1)
}

function clearAll() {
  images.value.forEach((img) => {
    URL.revokeObjectURL(img.preview)
    if (img.processedBlob) {
      URL.revokeObjectURL(URL.createObjectURL(img.processedBlob))
    }
    // Revoke processed preview URL if exists
    if (img.processedPreviewUrl) {
      URL.revokeObjectURL(img.processedPreviewUrl)
    }
  })
  images.value = []
  // Reset file input to allow selecting the same files again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Add preview function
function previewImage(index: number) {
  previewImageItem.value = images.value[index]
  showPreviewModal.value = true
}

// Keyboard shortcuts
function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return

  const files: File[] = []
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) files.push(file)
    }
  }

  if (files.length > 0) {
    addFiles(files)
    success(t('tools.imageWatermark.success.pasteSuccess'))
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('paste', handlePaste)

  // Drag and drop for whole page
  document.addEventListener('dragenter', (e) => {
    e.preventDefault()
    isDragging.value = true
  })

  document.addEventListener('dragleave', (e) => {
    if (!e.relatedTarget) {
      isDragging.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
  images.value.forEach((img) => {
    URL.revokeObjectURL(img.preview)
    if (img.processedBlob) {
      URL.revokeObjectURL(URL.createObjectURL(img.processedBlob))
    }
    // Revoke processed preview URL if exists
    if (img.processedPreviewUrl) {
      URL.revokeObjectURL(img.processedPreviewUrl)
    }
  })

  // Revoke watermark image URL if exists
  if (watermarkImage.value.preview) {
    URL.revokeObjectURL(watermarkImage.value.preview)
  }
})
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
