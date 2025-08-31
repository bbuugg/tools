<template>
  <ToolLayout
    :title="$t('tools.imageWatermark.title')"
    :description="$t('tools.imageWatermark.description')"
    icon="💧"
    :features="[
      $t('tools.imageWatermark.features.watermark.title'),
      $t('tools.imageWatermark.features.batch.title'),
      $t('tools.imageWatermark.features.customization.title'),
    ]"
  >
    <!-- Main Content - Drawer Layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Panel - Operations -->
      <div :class="images.length > 0 ? 'lg:w-1/2' : 'w-full'">
        <!-- Upload Area -->
        <div class="glass rounded-xl border border-slate-700/30 p-6 mb-6">
          <div
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
            @click="openFileSelector"
            :class="[
              'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
              isDragging
                ? 'border-primary-500/50 bg-primary-500/10'
                : 'border-slate-600/50 hover:border-slate-500/50',
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
              <div class="text-6xl text-slate-400">💧</div>
              <div>
                <h3 class="text-lg font-medium text-slate-100 mb-2">
                  {{ $t('tools.imageWatermark.title') }}
                </h3>
                <p class="text-slate-400">
                  {{ $t('tools.imageWatermark.uploadDescription') }}
                </p>
                <p class="text-sm text-slate-500 mt-2">
                  {{ $t('tools.imageWatermark.supportedFormats') }}: JPG, PNG, WebP, GIF
                </p>
              </div>
              <button
                class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {{ $t('tools.imageWatermark.selectFiles') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Watermark Settings Panel -->
        <div class="glass rounded-xl border border-slate-700/30 p-6 mb-6">
          <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-2">
            {{ $t('tools.imageWatermark.settings') }}
          </h3>

          <!-- Watermark Type Selection -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.imageWatermark.watermarkType') }}
            </label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                @click="watermarkType = 'text'"
                :class="[
                  'px-4 py-3 rounded-lg border transition-colors text-center',
                  watermarkType === 'text'
                    ? 'border-primary-500/50 bg-primary-500/10 text-primary-400'
                    : 'border-slate-700/50 hover:border-slate-600/50 bg-slate-800/50',
                ]"
              >
                <div class="font-medium">{{ $t('tools.imageWatermark.textWatermark') }}</div>
                <div class="text-sm text-slate-400 mt-1">
                  {{ $t('tools.imageWatermark.textWatermarkDesc') }}
                </div>
              </button>
              <button
                @click="watermarkType = 'image'"
                :class="[
                  'px-4 py-3 rounded-lg border transition-colors text-center',
                  watermarkType === 'image'
                    ? 'border-primary-500/50 bg-primary-500/10 text-primary-400'
                    : 'border-slate-700/50 hover:border-slate-600/50 bg-slate-800/50',
                ]"
              >
                <div class="font-medium">{{ $t('tools.imageWatermark.imageWatermark') }}</div>
                <div class="text-sm text-slate-400 mt-1">
                  {{ $t('tools.imageWatermark.imageWatermarkDesc') }}
                </div>
              </button>
              <button
                @click="watermarkType = 'combined'"
                :class="[
                  'px-4 py-3 rounded-lg border transition-colors text-center',
                  watermarkType === 'combined'
                    ? 'border-primary-500/50 bg-primary-500/10 text-primary-400'
                    : 'border-slate-700/50 hover:border-slate-600/50 bg-slate-800/50',
                ]"
              >
                <div class="font-medium">{{ $t('tools.imageWatermark.combinedWatermark') }}</div>
                <div class="text-sm text-slate-400 mt-1">
                  {{ $t('tools.imageWatermark.combinedWatermarkDesc') }}
                </div>
              </button>
            </div>
          </div>

          <!-- Text Watermark Settings -->
          <div
            v-if="watermarkType === 'text' || watermarkType === 'combined'"
            class="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50"
          >
            <h4 class="text-md font-medium text-slate-200 mb-3">
              {{ $t('tools.imageWatermark.textSettings') }}
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
                  {{ $t('tools.imageWatermark.watermarkText') }}
                </label>
                <input
                  v-model="textOptions.text"
                  type="text"
                  :placeholder="$t('tools.imageWatermark.textPlaceholder')"
                  class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
                  {{ $t('tools.imageWatermark.fontSize') }}: {{ textOptions.fontSize }}px
                </label>
                <input
                  v-model="textOptions.fontSize"
                  type="range"
                  min="12"
                  max="100"
                  class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
                  {{ $t('tools.imageWatermark.fontColor') }}
                </label>
                <input
                  v-model="textOptions.color"
                  type="color"
                  class="w-full h-10 border border-slate-700 rounded cursor-pointer bg-slate-800"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
                  {{ $t('tools.imageWatermark.fontFamily') }}
                </label>
                <select
                  v-model="textOptions.fontFamily"
                  class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
            class="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50"
          >
            <h4 class="text-md font-medium text-slate-200 mb-3">
              {{ $t('tools.imageWatermark.imageSettings') }}
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
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
                      ? 'border-primary-500/50 bg-primary-500/10'
                      : 'border-slate-700/50 hover:border-slate-600/50',
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
                      class="text-sm text-red-500 hover:text-red-400"
                    >
                      {{ $t('tools.imageWatermark.removeWatermark') }}
                    </button>
                  </div>
                  <div v-else>
                    <div class="text-4xl text-slate-400 mb-2">🖼️</div>
                    <p class="text-slate-400">{{ $t('tools.imageWatermark.uploadWatermark') }}</p>
                  </div>
                </div>
              </div>
              <div>
                <div class="mb-3">
                  <label class="block text-sm font-medium text-slate-300 mb-1">
                    {{ $t('tools.imageWatermark.imageWidth') }}: {{ imageOptions.width }}px
                  </label>
                  <input
                    v-model="imageOptions.width"
                    type="range"
                    min="20"
                    :max="imageOptions.maxWidth"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div class="mb-3">
                  <label class="block text-sm font-medium text-slate-300 mb-1">
                    {{ $t('tools.imageWatermark.imageOpacity') }}: {{ imageOptions.opacity }}%
                  </label>
                  <input
                    v-model="imageOptions.opacity"
                    type="range"
                    min="0"
                    max="100"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Position Settings -->
          <div class="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <h4 class="text-md font-medium text-slate-200 mb-3">
              {{ $t('tools.imageWatermark.positionSettings') }}
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
                  {{ $t('tools.imageWatermark.position') }}
                </label>
                <select
                  v-model="positionOptions.position"
                  class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="top-left">{{ $t('tools.imageWatermark.topLeft') }}</option>
                  <option value="top-center">{{ $t('tools.imageWatermark.topCenter') }}</option>
                  <option value="top-right">{{ $t('tools.imageWatermark.topRight') }}</option>
                  <option value="center-left">{{ $t('tools.imageWatermark.centerLeft') }}</option>
                  <option value="center">{{ $t('tools.imageWatermark.center') }}</option>
                  <option value="center-right">
                    {{ $t('tools.imageWatermark.centerRight') }}
                  </option>
                  <option value="bottom-left">{{ $t('tools.imageWatermark.bottomLeft') }}</option>
                  <option value="bottom-center">
                    {{ $t('tools.imageWatermark.bottomCenter') }}
                  </option>
                  <option value="bottom-right">
                    {{ $t('tools.imageWatermark.bottomRight') }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
                  {{ $t('tools.imageWatermark.margin') }}: {{ positionOptions.margin }}px
                </label>
                <input
                  v-model="positionOptions.margin"
                  type="range"
                  min="0"
                  max="100"
                  class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div class="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <h4 class="text-md font-medium text-slate-200 mb-3">
              {{ $t('tools.imageWatermark.advancedSettings') }}
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
                  {{ $t('tools.imageWatermark.opacity') }}: {{ advancedOptions.opacity }}%
                </label>
                <input
                  v-model="advancedOptions.opacity"
                  type="range"
                  min="0"
                  max="100"
                  class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
                  {{ $t('tools.imageWatermark.rotation') }}: {{ advancedOptions.rotation }}°
                </label>
                <input
                  v-model="advancedOptions.rotation"
                  type="range"
                  min="0"
                  max="360"
                  class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
                  {{ $t('tools.imageWatermark.scale') }}: {{ advancedOptions.scale }}%
                </label>
                <input
                  v-model="advancedOptions.scale"
                  type="range"
                  min="10"
                  max="200"
                  class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Image Gallery (Drawer) -->
      <div v-if="images.length > 0" class="lg:w-1/2">
        <div class="glass rounded-xl border border-slate-700/30 p-6 mb-6 h-full flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.imageWatermark.imageList') }} ({{ images.length }})
            </h3>
            <div class="flex gap-3">
              <button
                @click="processAll"
                :disabled="isProcessing"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                class="px-4 py-2 bg-green-600/10 text-green-300 rounded-lg hover:bg-green-600/20 border border-green-600/30 hover:border-green-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ $t('tools.imageWatermark.downloadAll') }}
              </button>
              <button
                @click="clearAll"
                class="px-4 py-2 bg-red-600/10 text-red-300 rounded-lg hover:bg-red-600/20 border border-red-600/30 hover:border-red-600/50 transition-colors"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>

          <!-- Statistics -->
          <div
            v-if="processingStats.totalOriginalSize > 0"
            class="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30"
          >
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-green-300">
                  {{ formatFileSize(processingStats.totalOriginalSize) }}
                </div>
                <div class="text-sm text-green-400">
                  {{ $t('tools.imageWatermark.originalSize') }}
                </div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-300">
                  {{ formatFileSize(processingStats.totalProcessedSize) }}
                </div>
                <div class="text-sm text-green-400">
                  {{ $t('tools.imageWatermark.processedSize') }}
                </div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-300">
                  {{ processingStats.processedCount }}/{{ images.length }}
                </div>
                <div class="text-sm text-green-400">
                  {{ $t('tools.imageWatermark.processed') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Image Gallery -->
          <div class="flex-1 overflow-y-auto">
            <div class="grid grid-cols-1 gap-4">
              <div
                v-for="(image, index) in images"
                :key="index"
                class="border border-slate-700/50 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col gap-4 bg-slate-800/30"
              >
                <div class="flex items-start space-x-4">
                  <!-- Thumbnail -->
                  <div class="flex-shrink-0">
                    <img
                      :src="image.preview"
                      :alt="image.name"
                      class="w-24 h-24 object-cover rounded-lg border border-slate-700/50"
                    />
                  </div>

                  <!-- Info and Actions -->
                  <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Info Section -->
                    <div class="md:col-span-2">
                      <h4 class="text-sm font-medium text-slate-100 truncate">{{ image.name }}</h4>
                      <p class="text-sm text-slate-400">
                        {{ image.dimensions.width }} × {{ image.dimensions.height }} px
                      </p>
                      <!-- GIF Warning -->
                      <div
                        v-if="image.isGif"
                        class="mt-2 p-2 bg-blue-500/10 rounded text-blue-300 text-xs border border-blue-500/30"
                      >
                        ℹ️ {{ $t('tools.imageWatermark.gifWarning') }}
                      </div>
                      <div class="flex flex-wrap gap-4 mt-2">
                        <div class="text-sm text-slate-400">
                          {{ $t('tools.imageWatermark.original') }}:
                          {{ formatFileSize(image.originalSize) }}
                        </div>
                        <div v-if="image.processedSize" class="text-sm text-green-400">
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
                              ? 'bg-slate-500'
                              : image.status === 'processing'
                                ? 'bg-yellow-500'
                                : image.status === 'completed'
                                  ? 'bg-green-500'
                                  : 'bg-red-500',
                          ]"
                        ></div>
                        <span class="text-xs text-slate-400">
                          {{ $t(`tools.imageWatermark.status.${image.status}`) }}
                        </span>
                      </div>

                      <!-- Progress -->
                      <div v-if="image.status === 'processing'" class="w-full max-w-[100px]">
                        <div class="bg-slate-700 rounded-full h-2">
                          <div
                            class="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            :style="{ width: `${image.progress}%` }"
                          ></div>
                        </div>
                        <div class="text-xs text-slate-400 text-center mt-1">
                          {{ image.progress }}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Actions -->
                <div class="flex justify-end gap-2">
                  <button
                    v-if="image.status === 'completed' && image.processedBlob"
                    @click="previewImage(index)"
                    class="px-3 py-1 text-sm bg-purple-600/10 text-purple-300 rounded hover:bg-purple-600/20 border border-purple-600/30 hover:border-purple-600/50 transition-colors"
                  >
                    {{ $t('common.preview') }}
                  </button>
                  <button
                    v-if="image.status === 'completed' && image.processedBlob"
                    @click="downloadImage(index)"
                    class="px-3 py-1 text-sm bg-green-600/10 text-green-300 rounded hover:bg-green-600/20 border border-green-600/30 hover:border-green-600/50 transition-colors"
                  >
                    {{ $t('common.download') }}
                  </button>
                  <button
                    @click="processImage(index)"
                    :disabled="isProcessing"
                    class="px-3 py-1 text-sm bg-primary-600/10 text-primary-300 rounded hover:bg-primary-600/20 border border-primary-600/30 hover:border-primary-600/50 transition-colors disabled:opacity-50"
                  >
                    {{ $t('tools.imageWatermark.process') }}
                  </button>
                  <button
                    @click="removeImage(index)"
                    class="px-3 py-1 text-sm bg-red-600/10 text-red-300 rounded hover:bg-red-600/20 border border-red-600/30 hover:border-red-600/50 transition-colors"
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
      <div class="relative glass rounded-xl border border-slate-700/30 w-full max-w-4xl mx-4">
        <div class="flex items-center justify-between p-4 border-b border-slate-700/30 rounded-t">
          <h3 class="text-xl font-semibold text-slate-100">
            {{ $t('tools.imageWatermark.imagePreview') }}
          </h3>
          <button
            @click="showPreviewModal = false"
            class="text-slate-400 bg-transparent hover:bg-slate-800/50 hover:text-slate-200 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-colors"
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
              <h4 class="text-lg font-medium text-slate-200 mb-2">
                {{ $t('tools.imageWatermark.originalImage') }}
              </h4>
              <div class="border border-slate-700/50 rounded-lg p-2 bg-slate-800/50">
                <img
                  :src="previewImageItem?.preview"
                  :alt="previewImageItem?.name"
                  class="w-full h-auto max-h-96 object-contain"
                />
              </div>
              <div class="mt-2 text-sm text-slate-400">
                {{ previewImageItem?.name }}<br />
                {{ $t('tools.imageWatermark.size') }}:
                {{ formatFileSize(previewImageItem?.originalSize || 0) }}<br />
                {{ $t('tools.imageWatermark.dimensions') }}:
                {{ previewImageItem?.dimensions.width }} ×
                {{ previewImageItem?.dimensions.height }} px
              </div>
            </div>
            <div v-if="previewImageItem?.processedBlob">
              <h4 class="text-lg font-medium text-slate-200 mb-2">
                {{ $t('tools.imageWatermark.processedImage') }}
              </h4>
              <div class="border border-slate-700/50 rounded-lg p-2 bg-slate-800/50">
                <img
                  :src="previewImageItem?.processedPreviewUrl"
                  :alt="previewImageItem?.name"
                  class="w-full h-auto max-h-96 object-contain"
                />
              </div>
              <div class="mt-2 text-sm text-slate-400">
                {{ previewImageItem?.name }}<br />
                {{ $t('tools.imageWatermark.size') }}:
                {{ formatFileSize(previewImageItem?.processedSize || 0) }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end p-6 border-t border-slate-700/30 rounded-b">
          <button
            @click="showPreviewModal = false"
            class="text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 focus:ring-4 focus:ring-slate-800/50 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors border border-slate-700/50"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ToolLayout from '@/components/ToolLayout.vue'
// @ts-expect-error No type definitions available for gif.js
import GIF from 'gif.js'
import { decompressFrames, parseGIF } from 'gifuct-js'

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
  processedPreviewUrl?: string
  isGif: boolean // Add this to track if the image is a GIF
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
  processedPreviewUrl?: string
  isGif: boolean // Add this to track if the image is a GIF
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

// Use showError when displaying error messages
function showErrorToast(message: string) {
  showError(message)
}

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
    showErrorToast(t('tools.imageWatermark.errors.noValidImages'))
    return
  }

  for (const file of imageFiles) {
    // Check if file already exists - now we allow duplicates
    const existingIndex = images.value.findIndex(
      (img) => img.name === file.name && img.originalSize === file.size,
    )

    // Check if the file is a GIF
    const isGif = file.type === 'image/gif'

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
          isGif, // Track if it's a GIF
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
          isGif, // Track if it's a GIF
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
    showErrorToast(t('tools.imageWatermark.errors.invalidWatermark'))
    return
  }

  try {
    // Revoke previous preview URL if exists
    if (watermarkImage.value.preview) {
      URL.revokeObjectURL(watermarkImage.value.preview)
    }

    // Create preview
    const preview = await createImagePreview(file)

    // Get dimensions to set max width based on watermark dimensions
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
    showErrorToast(t('tools.imageWatermark.errors.watermarkProcessingFailed'))
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
    showErrorToast(t('tools.imageWatermark.errors.noWatermarkImage'))
    return
  }

  if (
    (watermarkType.value === 'text' || watermarkType.value === 'combined') &&
    !textOptions.value.text.trim()
  ) {
    showErrorToast(t('tools.imageWatermark.errors.noWatermarkText'))
    return
  }

  image.status = 'processing'
  image.progress = 0

  try {
    // Handle GIF files with animation preservation
    if (image.isGif) {
      await processAnimatedGif(image, index)
    } else {
      await processStaticImage(image, index)
    }
  } catch (err) {
    console.error('Processing error:', err)
    images.value[index].status = 'error'
    showErrorToast(t('tools.imageWatermark.errors.processingFailed', { filename: image.name }))
  }
}

// Process static images (JPG, PNG, WebP)
async function processStaticImage(image: ProcessedImage, index: number) {
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
    images.value[index].progress = progress
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

  images.value[index].progress = 100
  images.value[index].processedBlob = blob
  images.value[index].processedSize = blob.size
  images.value[index].status = 'completed'

  // Generate preview URL for the processed image
  if (images.value[index].processedBlob) {
    images.value[index].processedPreviewUrl = URL.createObjectURL(images.value[index].processedBlob)
  }
}

// Process animated GIFs to preserve animation
async function processAnimatedGif(image: ProcessedImage, index: number) {
  try {
    // Read the GIF file as an ArrayBuffer
    const arrayBuffer = await image.file.arrayBuffer()

    // Parse the GIF using gifuct-js
    const gif = parseGIF(arrayBuffer)
    const frames = decompressFrames(gif, true)

    if (frames.length === 0) {
      throw new Error('No frames found in GIF')
    }

    // Get canvas dimensions from the GIF header
    const width = gif.lsd.width
    const height = gif.lsd.height

    // Create canvas for processing
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    // Create a new GIF using gif.js
    const newGif = new GIF({
      workers: 2,
      quality: 10,
      width: width,
      height: height,
      workerScript: '/gif.worker.js',
    })

    // Create an offscreen canvas for proper frame handling
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = width
    offscreenCanvas.height = height
    const offscreenCtx = offscreenCanvas.getContext('2d')
    if (!offscreenCtx) throw new Error('Could not get offscreen canvas context')

    // Process each frame
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i]

      // Handle frame disposal methods
      if (i === 0) {
        // First frame - clear canvas
        offscreenCtx.clearRect(0, 0, width, height)
      } else {
        const prevFrame = frames[i - 1]
        // Handle disposal method of previous frame
        if (prevFrame.disposalType === 2) {
          // Restore to background color
          offscreenCtx.clearRect(0, 0, width, height)
        } else if (prevFrame.disposalType === 3) {
          // Restore to previous state (not implemented in this simple version)
          // For simplicity, we'll just keep the current state
        }
        // For disposalType 1 (do not dispose) or 0 (unspecified), we keep the current state
      }

      // Create ImageData from the frame patch
      if (frame.patch) {
        const patchImageData = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height,
        )

        // Draw the frame patch at the correct position
        offscreenCtx.putImageData(patchImageData, frame.dims.left, frame.dims.top)
      }

      // Copy the offscreen canvas to the main canvas
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(offscreenCanvas, 0, 0)

      // Apply watermark to this frame
      ctx.globalAlpha = advancedOptions.value.opacity / 100

      if (watermarkType.value === 'text' || watermarkType.value === 'combined') {
        await addTextWatermark(ctx, canvas)
      }

      if (watermarkType.value === 'image' || watermarkType.value === 'combined') {
        await addImageWatermark(ctx, canvas)
      }

      // Reset global alpha
      ctx.globalAlpha = 1.0

      // Add frame to new GIF with original delay
      newGif.addFrame(ctx, {
        copy: true,
        delay: frame.delay || 100,
      })

      // Update progress
      images.value[index].progress = Math.round(((i + 1) / frames.length) * 80)
    }

    // Render the new GIF
    const blob = await new Promise<Blob>((resolve, reject) => {
      newGif.on('finished', (blob: Blob) => {
        resolve(blob)
      })

      newGif.on('error', (error: Error) => {
        reject(new Error('GIF processing error: ' + error.message))
      })

      try {
        newGif.render()
      } catch (error) {
        reject(new Error('Failed to start GIF rendering: ' + (error as Error).message))
      }
    })

    images.value[index].progress = 100
    images.value[index].processedBlob = blob
    images.value[index].processedSize = blob.size
    images.value[index].status = 'completed'

    // Generate preview URL for the processed image
    if (images.value[index].processedBlob) {
      images.value[index].processedPreviewUrl = URL.createObjectURL(
        images.value[index].processedBlob,
      )
    }
  } catch (err) {
    console.error('GIF processing error:', err)
    // Fall back to static image processing
    await processStaticImage(image, index)
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
  link.download = `${image.name.replace(/\.[^/.]+$/, '')}_watermark.${image.isGif ? 'gif' : 'png'}`

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
      const extension = image.isGif ? 'gif' : 'png'
      const filename = `${image.name.replace(/\.[^/.]+$/, '')}_watermark.${extension}`
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
.slider-fix::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider-fix::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
