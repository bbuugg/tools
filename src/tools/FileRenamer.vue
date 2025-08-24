<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('tools.fileRenamer.title') }}</h1>
        <p class="text-gray-600">{{ $t('tools.fileRenamer.description') }}</p>
      </div>

      <!-- Upload Area -->
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
          :class="{
            'border-blue-500 bg-blue-50': isDragging,
            'border-gray-300 hover:border-gray-400': !isDragging,
          }"
          @dragover.prevent
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop="handleFileDrop"
        >
          <div class="text-4xl mb-3">📁</div>
          <h3 class="text-lg font-medium text-gray-900 mb-1">
            {{ $t('tools.fileRenamer.uploadArea.title') }}
          </h3>
          <p class="text-gray-500 mb-4">{{ $t('tools.fileRenamer.uploadArea.subtitle') }}</p>
          <button
            @click="fileInputClick"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {{ $t('tools.fileRenamer.uploadArea.selectFiles') }}
          </button>
          <input ref="fileInput" type="file" multiple @change="handleFileSelect" class="hidden" />
        </div>
      </div>

      <!-- File List and Options -->
      <div v-if="files.length > 0" class="bg-white p-6 rounded-lg shadow-sm border">
        <!-- File Count and Sorting -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div class="text-lg font-medium text-gray-900">
            {{ $t('tools.fileRenamer.fileCount', { count: files.length }) }}
            <span class="text-gray-500 text-sm ml-2">
              ({{ $t('tools.fileRenamer.totalSize', { size: formatTotalFileSize() }) }})
            </span>
          </div>

          <!-- Sorting Options and Script Button -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-medium text-gray-700">
              {{ $t('tools.fileRenamer.sorting.title') }}:
            </span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in sortingOptions"
                :key="option.id"
                @click="sortFiles(option.id)"
                class="px-3 py-1 text-sm rounded transition-colors"
                :class="{
                  'bg-blue-100 text-blue-800 border border-blue-300': sortType === option.id,
                  'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200':
                    sortType !== option.id,
                }"
              >
                {{ option.label }}
              </button>
            </div>
            <button
              @click="showScript"
              class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              {{ $t('tools.fileRenamer.script.downloadScript') }}
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8 overflow-x-auto">
            <button
              v-for="tab in renamingTabs"
              :key="tab.id"
              @click="handleTabChange(tab.id)"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
              :class="{
                'border-blue-500 text-blue-600': activeTab === tab.id,
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300':
                  activeTab !== tab.id,
              }"
              :disabled="isApplying"
            >
              {{ $t(`tools.fileRenamer.tabs.${tab.id}`) }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="mb-6">
          <!-- Sequential Tab -->
          <div v-if="activeTab === 'sequential'">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.fileRenamer.sequential.prefix') }}
                </label>
                <input
                  v-model="sequentialOptions.prefix"
                  :placeholder="$t('tools.fileRenamer.sequential.prefixPlaceholder')"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.fileRenamer.sequential.startNumber') }}
                </label>
                <input
                  v-model.number="sequentialOptions.startNumber"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.fileRenamer.sequential.padding') }}
                </label>
                <input
                  v-model.number="sequentialOptions.padding"
                  type="number"
                  min="1"
                  max="10"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Replace Tab -->
          <div v-if="activeTab === 'replace'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.fileRenamer.replace.findText') }}
                </label>
                <input
                  v-model="replaceOptions.findText"
                  :placeholder="$t('tools.fileRenamer.replace.findPlaceholder')"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.fileRenamer.replace.replaceText') }}
                </label>
                <input
                  v-model="replaceOptions.replaceText"
                  :placeholder="$t('tools.fileRenamer.replace.replacePlaceholder')"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div class="mt-3">
              <label class="flex items-center">
                <input
                  v-model="replaceOptions.caseSensitive"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-600">
                  {{ $t('tools.fileRenamer.replace.caseSensitive') }}
                </span>
              </label>
            </div>
          </div>

          <!-- Case Tab -->
          <div v-if="activeTab === 'case'">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label
                class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  v-model="caseOptions.type"
                  type="radio"
                  value="uppercase"
                  class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span class="ml-3 text-sm text-gray-700">
                  {{ $t('tools.fileRenamer.case.uppercase') }}
                </span>
              </label>
              <label
                class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  v-model="caseOptions.type"
                  type="radio"
                  value="lowercase"
                  class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span class="ml-3 text-sm text-gray-700">
                  {{ $t('tools.fileRenamer.case.lowercase') }}
                </span>
              </label>
              <label
                class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  v-model="caseOptions.type"
                  type="radio"
                  value="capitalize"
                  class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span class="ml-3 text-sm text-gray-700">
                  {{ $t('tools.fileRenamer.case.capitalize') }}
                </span>
              </label>
            </div>
          </div>

          <!-- Insert Tab -->
          <div v-if="activeTab === 'insert'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.fileRenamer.insert.text') }}
                </label>
                <input
                  v-model="insertOptions.text"
                  :placeholder="$t('tools.fileRenamer.insert.textPlaceholder')"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.fileRenamer.insert.position') }}
                </label>
                <select
                  v-model="insertOptions.position"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="prefix">{{ $t('tools.fileRenamer.insert.prefix') }}</option>
                  <option value="suffix">{{ $t('tools.fileRenamer.insert.suffix') }}</option>
                  <option value="index">{{ $t('tools.fileRenamer.insert.atIndex') }}</option>
                </select>
              </div>
            </div>
            <div v-if="insertOptions.position === 'index'" class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.fileRenamer.insert.index') }}
              </label>
              <input
                v-model.number="insertOptions.index"
                type="number"
                min="0"
                class="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Truncate Tab -->
          <div v-if="activeTab === 'truncate'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.fileRenamer.truncate.startIndex') }}
                </label>
                <input
                  v-model.number="truncateOptions.startIndex"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.fileRenamer.truncate.endIndex') }}
                </label>
                <input
                  v-model.number="truncateOptions.endIndex"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <p class="mt-2 text-sm text-gray-500">
              {{ $t('tools.fileRenamer.truncate.description') }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3 mb-6">
          <button
            v-if="hasPreview"
            @click="applyRename"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {{ $t('tools.fileRenamer.actions.apply') }}
          </button>
          <button
            v-if="hasRenamed"
            @click="downloadFiles"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {{ $t('tools.fileRenamer.actions.download') }}
          </button>
          <button
            @click="clearFiles"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {{ $t('tools.fileRenamer.actions.clear') }}
          </button>
        </div>

        <!-- File List -->
        <div class="border rounded-lg overflow-hidden">
          <div class="bg-gray-50 px-4 py-3 border-b">
            <h3 class="font-medium text-gray-900">
              {{ $t('tools.fileRenamer.fileList.title') }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ $t('tools.fileRenamer.fileList.dragHint') }}
            </p>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ $t('tools.fileRenamer.fileList.drag') }}
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ $t('tools.fileRenamer.fileList.originalName') }}
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ $t('tools.fileRenamer.fileList.newName') }}
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ $t('tools.fileRenamer.fileList.size') }}
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ $t('tools.fileRenamer.fileList.type') }}
                  </th>
                </tr>
              </thead>
              <draggable
                v-model="files"
                tag="tbody"
                item-key="id"
                @start="handleDragStart"
                @end="handleDragEnd"
                class="divide-y divide-gray-200 bg-white"
              >
                <template #item="{ element: file }">
                  <tr class="cursor-move">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div
                        class="cursor-move text-gray-400 hover:text-gray-600"
                        title="Drag to reorder"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ file.originalName }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        :class="{
                          'text-green-600 font-medium':
                            file.tmpName && file.tmpName !== file.originalName,
                        }"
                      >
                        {{ file.tmpName || file.currentName }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatFileSize(file.size) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ file.type || '—' }}
                    </td>
                  </tr>
                </template>
              </draggable>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Script Modal using Material Tailwind -->
    <div
      v-if="showScriptModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="relative bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 rounded-t">
          <h3 class="text-xl font-semibold text-gray-800">
            {{ $t('tools.fileRenamer.script.scriptPreview') }}
          </h3>
          <button
            @click="showScriptModal = false"
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
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.fileRenamer.script.scriptType') }}
            </label>
            <select
              v-model="scriptOptions.scriptType"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="windows">{{ $t('tools.fileRenamer.script.windows') }}</option>
              <option value="linux">{{ $t('tools.fileRenamer.script.linux') }}</option>
            </select>
          </div>
          <div
            class="bg-gray-800 text-green-400 p-4 font-mono text-sm overflow-x-auto max-h-96 rounded"
          >
            <pre>{{ scriptContent || $t('tools.fileRenamer.script.noContent') }}</pre>
          </div>
        </div>
        <div class="flex items-center justify-end p-6 border-t border-gray-200 rounded-b">
          <button
            @click="showScriptModal = false"
            class="text-gray-600 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2"
          >
            {{ $t('common.close') }}
          </button>
          <button
            @click="downloadScript"
            class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            {{ $t('tools.fileRenamer.script.downloadScript') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import draggable from 'vuedraggable'

const { t } = useI18n()
const { success, info } = useToast()

// State
const files = ref<Array<any>>([])
const isDragging = ref(false)
const activeTab = ref('sequential')
const hasPreview = ref(false)
const hasRenamed = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const sortType = ref('natural')
const isApplying = ref(false) // Track if rename is being applied
const showScriptModal = ref(false) // State for script modal

// Renaming options
const sequentialOptions = ref({
  prefix: '',
  startNumber: 1,
  padding: 3,
})

const replaceOptions = ref({
  findText: '',
  replaceText: '',
  caseSensitive: false,
})

const caseOptions = ref({
  type: 'lowercase',
})

const insertOptions = ref({
  text: '',
  position: 'prefix',
  index: 0,
})

const truncateOptions = ref({
  startIndex: 0,
  endIndex: 0,
})

// Script options - remove 'both' option
const scriptOptions = ref({
  scriptType: 'windows',
})

// Computed property for sorted files
const sortedFiles = computed(() => {
  // Always return the files array directly as it's managed by vuedraggable
  // This ensures drag-and-drop works regardless of sort type
  return files.value
})

// Computed property for total file size
const totalFileSize = computed(() => {
  return files.value.reduce((total: number, file: any) => total + file.size, 0)
})

// State for script content
const scriptContent = ref('')

// Initialize script content
const initializeScriptContent = () => {
  if (files.value.length > 0) {
    generateScriptContent()
  } else {
    // Set default script content when no files are present
    scriptContent.value =
      '# No files selected\n# Add files and apply renaming options to generate script'
  }
}

// Call initializeScriptContent when component is mounted
initializeScriptContent()

// Watch for changes in files to update script content and preview
watch(
  [files, sequentialOptions, replaceOptions, caseOptions, insertOptions, truncateOptions],
  () => {
    // Generate preview automatically when files or options change
    if (files.value.length > 0) {
      generatePreview()
    }
  },
  { deep: true },
)

// Watch for changes in active tab to update script content
watch(activeTab, () => {
  if (files.value.length > 0) {
    generatePreview()
  }
})

// Watch for changes in script options
watch(
  scriptOptions,
  () => {
    if (files.value.length > 0) {
      generateScriptContent()
    }
  },
  { deep: true },
)

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTotalFileSize = (): string => {
  return formatFileSize(totalFileSize.value)
}

const getFileNameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return filename
  return filename.substring(0, lastDotIndex)
}

const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return filename.substring(lastDotIndex)
}

// Sorting function - now immediate
const sortFiles = (type: string) => {
  sortType.value = type

  // Apply sorting immediately based on the selected type
  switch (type) {
    case 'natural':
      // Natural sort by filename
      files.value.sort((a: any, b: any) =>
        a.originalName.localeCompare(b.originalName, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      )
      break
    case 'filename':
      // Simple filename sort
      files.value.sort((a: any, b: any) => a.originalName.localeCompare(b.originalName))
      break
    case 'modifiedTime':
      // Sort by modification time ascending
      files.value.sort((a: any, b: any) => a.lastModified - b.lastModified)
      break
    case 'modifiedTimeDesc':
      // Sort by modification time descending
      files.value.sort((a: any, b: any) => b.lastModified - a.lastModified)
      break
    case 'random':
      // Random sort
      for (let i = files.value.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[files.value[i], files.value[j]] = [files.value[j], files.value[i]]
      }
      break
    case 'reverse':
      // Reverse current order
      files.value.reverse()
      break
    default:
      // Default to natural sort
      files.value.sort((a: any, b: any) =>
        a.originalName.localeCompare(b.originalName, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      )
  }

  // Generate preview immediately when sorting changes
  if (files.value.length > 0) {
    generatePreview()
  }
}

// Renaming functions
const generatePreview = () => {
  sortedFiles.value.forEach((file: any, index: number) => {
    let tmpName = file.originalName // Always start with original name for preview

    // Apply sequential renaming
    if (activeTab.value === 'sequential') {
      const extension = getFileExtension(file.originalName)
      const number = (sequentialOptions.value.startNumber + index)
        .toString()
        .padStart(sequentialOptions.value.padding, '0')
      tmpName = `${sequentialOptions.value.prefix}${number}${extension}`
    }

    // Apply replace renaming
    else if (activeTab.value === 'replace' && replaceOptions.value.findText) {
      const flags = replaceOptions.value.caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(
        replaceOptions.value.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        flags,
      )
      tmpName = file.originalName.replace(regex, replaceOptions.value.replaceText)
    }

    // Apply case transformation
    else if (activeTab.value === 'case') {
      const nameWithoutExtension = getFileNameWithoutExtension(file.originalName)
      const extension = getFileExtension(file.originalName)

      let transformedName = nameWithoutExtension
      if (caseOptions.value.type === 'uppercase') {
        transformedName = nameWithoutExtension.toUpperCase()
      } else if (caseOptions.value.type === 'lowercase') {
        transformedName = nameWithoutExtension.toLowerCase()
      } else if (caseOptions.value.type === 'capitalize') {
        transformedName = nameWithoutExtension
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      }

      tmpName = `${transformedName}${extension}`
    }

    // Apply text insertion
    else if (activeTab.value === 'insert' && insertOptions.value.text) {
      const nameWithoutExtension = getFileNameWithoutExtension(file.originalName)
      const extension = getFileExtension(file.originalName)

      if (insertOptions.value.position === 'prefix') {
        tmpName = `${insertOptions.value.text}${nameWithoutExtension}${extension}`
      } else if (insertOptions.value.position === 'suffix') {
        tmpName = `${nameWithoutExtension}${insertOptions.value.text}${extension}`
      } else if (insertOptions.value.position === 'index') {
        const index = Math.min(insertOptions.value.index, nameWithoutExtension.length)
        const before = nameWithoutExtension.substring(0, index)
        const after = nameWithoutExtension.substring(index)
        tmpName = `${before}${insertOptions.value.text}${after}${extension}`
      }
    }

    // Apply truncation
    else if (activeTab.value === 'truncate') {
      const nameWithoutExtension = getFileNameWithoutExtension(file.originalName)
      const extension = getFileExtension(file.originalName)

      const start = Math.max(0, truncateOptions.value.startIndex)
      const end = truncateOptions.value.endIndex || nameWithoutExtension.length
      const truncatedName = nameWithoutExtension.substring(
        start,
        Math.min(end, nameWithoutExtension.length),
      )

      tmpName = `${truncatedName}${extension}`
    }

    file.tmpName = tmpName
  })

  hasPreview.value = true
  success(t('tools.fileRenamer.messages.previewGenerated'))

  // Generate script content immediately after preview, regardless of active tab
  if (files.value.length > 0) {
    generateScriptContent()
  }
}

// Script generation functions
const generateScriptContent = () => {
  // First generate preview if not already done
  if (!hasPreview.value) {
    generatePreview()
  }

  const { scriptType } = scriptOptions.value
  let content = ''

  if (scriptType === 'windows') {
    content = '@echo off\n'
    content += 'REM Windows Batch Script for File Renaming\n'
    content += 'REM Generated by File Renamer Tool\n\n'

    content += 'REM Process files in current directory\n'
    content += 'for %%i in (*.*) do (\n'

    sortedFiles.value.forEach((file: any) => {
      // Only generate commands for files that have a current name different from original
      if (file.currentName && file.currentName !== file.originalName) {
        content +=
          '  if "%%~nxi"=="' + file.originalName + '" ren "%%i" "' + file.currentName + '"\n'
      }
    })

    content += ')\n'
    content += 'echo File renaming completed.\n'
    content += 'pause\n'
  } else if (scriptType === 'linux') {
    content = '#!/bin/bash\n'
    content += '# Linux Shell Script for File Renaming\n'
    content += '# Generated by File Renamer Tool\n\n'

    content += '# Process files in current directory\n'
    content += 'for file in *; do\n'

    sortedFiles.value.forEach((file: any) => {
      // Only generate commands for files that have a current name different from original
      if (file.currentName && file.currentName !== file.originalName) {
        content += '  if [ "$(basename "$file")" = "' + file.originalName + '" ]; then\n'
        content += '    mv "$file" "' + file.currentName + '"\n'
        content += '  fi\n'
      }
    })
  }

  // If no files need renaming, show a message
  if (!content.includes('ren "') && !content.includes('mv "')) {
    content += '\nREM No files require renaming\n'
    content += 'echo No files require renaming.\n'
  }

  scriptContent.value = content
}

const applyRename = () => {
  // Set applying state to prevent tab switching
  isApplying.value = true

  sortedFiles.value.forEach((file: any) => {
    if (file.tmpName && file.tmpName !== file.originalName) {
      // Create a new file with the new name
      const newFile = new File([file.file], file.tmpName, { type: file.file.type })
      file.file = newFile
      file.currentName = file.tmpName // Update current name to the temp name
      delete file.tmpName // Clear the temp name since it's now the current
    }
  })

  hasRenamed.value = true
  hasPreview.value = false
  isApplying.value = false
  success(t('tools.fileRenamer.messages.renameApplied'))
}

const downloadFiles = async () => {
  if (!hasRenamed.value) return

  try {
    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    sortedFiles.value.forEach((file: any) => {
      zip.file(file.currentName, file.file)
    })

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'renamed-files.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    success(t('tools.fileRenamer.messages.downloadStarted'))
  } catch (err) {
    console.error('Download error:', err)
    const { error } = useToast()
    error(t('tools.fileRenamer.messages.downloadError'))
  }
}

const clearFiles = () => {
  files.value = []
  hasPreview.value = false
  hasRenamed.value = false
  scriptContent.value = ''
  info(t('tools.fileRenamer.messages.filesCleared'))
  // Initialize script content to show default message
  initializeScriptContent()
}

const downloadScript = () => {
  if (!scriptContent.value) {
    info(t('tools.fileRenamer.messages.noScriptToDownload'))
    return
  }

  const { scriptType } = scriptOptions.value
  let fileName = 'rename_files.bat'

  if (scriptType === 'linux') {
    fileName = 'rename_files.sh'
  }

  const blob = new Blob([scriptContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  success(t('tools.fileRenamer.messages.scriptDownloaded', { fileName }))
}

// Function to generate and show script in modal
const showScript = () => {
  generateScriptContent()
  showScriptModal.value = true
}

// Drag and drop event handlers for vue.draggable
const handleDragStart = () => {
  // Can be used for additional logic when dragging starts
}

const handleDragEnd = () => {
  // Can be used for additional logic when dragging ends
  // For manual sorting, we might want to update the preview if it exists
  if (files.value.length > 0) {
    generatePreview()
  }
}

// Tab configuration
const renamingTabs = [
  { id: 'sequential' },
  { id: 'replace' },
  { id: 'case' },
  { id: 'insert' },
  { id: 'truncate' },
]

// Function to handle tab switching with restrictions
const handleTabChange = (tabId: string) => {
  // Prevent tab switching while applying rename
  if (isApplying.value) {
    info(t('tools.fileRenamer.messages.applyInProgress'))
    return
  }

  // If there's a preview but not applied, warn the user
  if (hasPreview.value && !hasRenamed.value && activeTab.value !== tabId) {
    if (confirm(t('tools.fileRenamer.messages.unappliedChanges'))) {
      activeTab.value = tabId
    }
  } else {
    activeTab.value = tabId
  }
}

// Sorting options
const sortingOptions = [
  { id: 'natural', label: t('tools.fileRenamer.sorting.natural') },
  { id: 'filename', label: t('tools.fileRenamer.sorting.filename') },
  { id: 'modifiedTime', label: t('tools.fileRenamer.sorting.modifiedTime') },
  { id: 'modifiedTimeDesc', label: t('tools.fileRenamer.sorting.modifiedTimeDesc') },
  { id: 'random', label: t('tools.fileRenamer.sorting.random') },
  { id: 'reverse', label: t('tools.fileRenamer.sorting.reverse') },
]

// File handling
const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  const droppedFiles = Array.from(event.dataTransfer?.files || [])
  processFiles(droppedFiles)
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])
  processFiles(selectedFiles)
}

const fileInputClick = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const processFiles = (fileList: File[]) => {
  const newFiles: Array<any> = fileList.map((file) => ({
    id: `${file.name}-${file.lastModified}-${file.size}`, // Unique ID for each file
    file,
    originalName: file.name,
    currentName: file.name, // Initialize currentName with originalName
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  }))

  files.value = [...files.value, ...newFiles]
  hasPreview.value = false
  hasRenamed.value = false

  // Generate preview automatically when files are added
  if (newFiles.length > 0) {
    generatePreview()
    // Initialize script content
    initializeScriptContent()
  }

  success(t('tools.fileRenamer.messages.filesAdded', { count: newFiles.length }))
}
</script>
