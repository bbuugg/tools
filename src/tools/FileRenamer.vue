<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('tools.fileRenamer.title') }}</h1>
        <p class="text-gray-600">{{ $t('tools.fileRenamer.subtitle') }}</p>
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
          </div>

          <!-- Sorting Options -->
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
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8 overflow-x-auto">
            <button
              v-for="tab in renamingTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
              :class="{
                'border-blue-500 text-blue-600': activeTab === tab.id,
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300':
                  activeTab !== tab.id,
              }"
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

          <!-- Script Tab -->
          <div v-if="activeTab === 'script'">
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ $t('tools.fileRenamer.script.scriptType') }}
                  </label>
                  <select
                    v-model="scriptOptions.scriptType"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="windows">{{ $t('tools.fileRenamer.script.windows') }}</option>
                    <option value="linux">{{ $t('tools.fileRenamer.script.linux') }}</option>
                    <option value="both">{{ $t('tools.fileRenamer.script.both') }}</option>
                  </select>
                </div>
                <div class="flex items-center justify-center">
                  <button
                    @click="generateScriptContent"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {{ $t('tools.fileRenamer.script.generatePreview') }}
                  </button>
                </div>
              </div>
              
              <!-- Script Preview -->
              <div v-if="scriptContent" class="border rounded-lg overflow-hidden">
                <div class="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                  <h3 class="font-medium text-gray-900">
                    {{ $t('tools.fileRenamer.script.scriptPreview') }}
                  </h3>
                  <button
                    @click="downloadScript"
                    class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    {{ $t('tools.fileRenamer.script.downloadScript') }}
                  </button>
                </div>
                <div class="bg-gray-800 text-green-400 p-4 font-mono text-sm overflow-x-auto max-h-96">
                  <pre>{{ scriptContent }}</pre>
                </div>
              </div>
              
              <!-- Instructions -->
              <div class="bg-blue-50 p-4 rounded-md">
                <h4 class="text-sm font-medium text-blue-800 mb-2">
                  {{ $t('tools.fileRenamer.script.instructions.title') }}
                </h4>
                <p class="text-sm text-blue-700">
                  {{ $t('tools.fileRenamer.script.instructions.description') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3 mb-6">
          <button
            @click="generatePreview"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {{ $t('tools.fileRenamer.actions.preview') }}
          </button>
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
                :disabled="sortType !== 'manual'"
                class="divide-y divide-gray-200 bg-white"
              >
                <template #item="{ element: file }">
                  <tr
                    :class="{
                      'cursor-move': sortType === 'manual',
                    }"
                  >
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div
                        v-if="sortType === 'manual'"
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
                      <div v-else class="text-gray-300">
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
                            file.newName && file.newName !== file.originalName,
                        }"
                      >
                        {{ file.newName || file.originalName }}
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

      <!-- Empty State -->
      <div v-else class="bg-white p-12 rounded-lg shadow-sm border text-center">
        <div class="text-5xl mb-4">📁</div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">
          {{ $t('tools.fileRenamer.uploadArea.title') }}
        </h3>
        <p class="text-gray-500">
          {{ $t('tools.fileRenamer.uploadArea.subtitle') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import draggable from 'vuedraggable'

const { t } = useI18n()
const { success, info } = useToast()

interface FileItem {
  id: string
  file: File
  originalName: string
  newName?: string
  size: number
  type: string
  lastModified: number
}

// State
const files = ref<FileItem[]>([])
const isDragging = ref(false)
const activeTab = ref('sequential')
const hasPreview = ref(false)
const hasRenamed = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const sortType = ref('natural')

// Computed property for sorted files
const sortedFiles = computed(() => {
  // For manual sorting, we return the files array directly as it's managed by vuedraggable
  if (sortType.value === 'manual') {
    return files.value
  }

  const filesArray = [...files.value]

  switch (sortType.value) {
    case 'natural':
      return filesArray.sort((a, b) =>
        a.originalName.localeCompare(b.originalName, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      )
    case 'filename':
      return filesArray.sort((a, b) => a.originalName.localeCompare(b.originalName))
    case 'modifiedTime':
      return filesArray.sort((a, b) => a.lastModified - b.lastModified)
    case 'modifiedTimeDesc':
      return filesArray.sort((a, b) => b.lastModified - a.lastModified)
    case 'random':
      return filesArray.sort(() => Math.random() - 0.5)
    case 'reverse':
      return filesArray.reverse()
    default:
      return filesArray
  }
})

// Tab configuration
const renamingTabs = [
  { id: 'sequential' },
  { id: 'replace' },
  { id: 'case' },
  { id: 'insert' },
  { id: 'truncate' },
  { id: 'script' },
]

// Sorting options
const sortingOptions = [
  { id: 'natural', label: t('tools.fileRenamer.sorting.natural') },
  { id: 'filename', label: t('tools.fileRenamer.sorting.filename') },
  { id: 'modifiedTime', label: t('tools.fileRenamer.sorting.modifiedTime') },
  { id: 'modifiedTimeDesc', label: t('tools.fileRenamer.sorting.modifiedTimeDesc') },
  { id: 'random', label: t('tools.fileRenamer.sorting.random') },
  { id: 'reverse', label: t('tools.fileRenamer.sorting.reverse') },
  { id: 'manual', label: t('tools.fileRenamer.sorting.manual') },
]

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

const scriptOptions = ref({
  scriptType: 'windows',
})

// State for script content
const scriptContent = ref('')

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
  const newFiles: FileItem[] = fileList.map((file) => ({
    id: `${file.name}-${file.lastModified}-${file.size}`, // Unique ID for each file
    file,
    originalName: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  }))

  files.value = [...files.value, ...newFiles]
  hasPreview.value = false
  hasRenamed.value = false

  success(t('tools.fileRenamer.messages.filesAdded', { count: newFiles.length }))
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

// Sorting function
const sortFiles = (type: string) => {
  sortType.value = type
}

// Renaming functions
const generatePreview = () => {
  sortedFiles.value.forEach((file, index) => {
    let newName = file.originalName

    // Apply sequential renaming
    if (activeTab.value === 'sequential') {
      const nameWithoutExt = getFileNameWithoutExtension(file.originalName) // eslint-disable-line @typescript-eslint/no-unused-vars
      const extension = getFileExtension(file.originalName)
      const number = (sequentialOptions.value.startNumber + index)
        .toString()
        .padStart(sequentialOptions.value.padding, '0')
      newName = `${sequentialOptions.value.prefix}${number}${extension}`
    }

    // Apply replace renaming
    else if (activeTab.value === 'replace' && replaceOptions.value.findText) {
      const flags = replaceOptions.value.caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(
        replaceOptions.value.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        flags,
      )
      newName = file.originalName.replace(regex, replaceOptions.value.replaceText)
    }

    // Apply case transformation
    else if (activeTab.value === 'case') {
      const nameWithoutExt = getFileNameWithoutExtension(file.originalName)
      const extension = getFileExtension(file.originalName)

      let transformedName = nameWithoutExt
      if (caseOptions.value.type === 'uppercase') {
        transformedName = nameWithoutExt.toUpperCase()
      } else if (caseOptions.value.type === 'lowercase') {
        transformedName = nameWithoutExt.toLowerCase()
      } else if (caseOptions.value.type === 'capitalize') {
        transformedName = nameWithoutExt
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      }

      newName = `${transformedName}${extension}`
    }

    // Apply text insertion
    else if (activeTab.value === 'insert' && insertOptions.value.text) {
      const nameWithoutExt = getFileNameWithoutExtension(file.originalName)
      const extension = getFileExtension(file.originalName)

      if (insertOptions.value.position === 'prefix') {
        newName = `${insertOptions.value.text}${nameWithoutExt}${extension}`
      } else if (insertOptions.value.position === 'suffix') {
        newName = `${nameWithoutExt}${insertOptions.value.text}${extension}`
      } else if (insertOptions.value.position === 'index') {
        const index = Math.min(insertOptions.value.index, nameWithoutExt.length)
        const before = nameWithoutExt.substring(0, index)
        const after = nameWithoutExt.substring(index)
        newName = `${before}${insertOptions.value.text}${after}${extension}`
      }
    }

    // Apply truncation
    else if (activeTab.value === 'truncate') {
      const nameWithoutExt = getFileNameWithoutExtension(file.originalName)
      const extension = getFileExtension(file.originalName)

      const start = Math.max(0, truncateOptions.value.startIndex)
      const end = truncateOptions.value.endIndex || nameWithoutExt.length
      const truncatedName = nameWithoutExt.substring(start, Math.min(end, nameWithoutExt.length))

      newName = `${truncatedName}${extension}`
    }

    file.newName = newName
  })

  hasPreview.value = true
  success(t('tools.fileRenamer.messages.previewGenerated'))
}

const applyRename = () => {
  sortedFiles.value.forEach((file) => {
    if (file.newName && file.newName !== file.originalName) {
      // Create a new file with the new name
      const newFile = new File([file.file], file.newName, { type: file.file.type })
      file.file = newFile
      file.originalName = file.newName
    }
  })

  hasRenamed.value = true
  hasPreview.value = false
  success(t('tools.fileRenamer.messages.renameApplied'))
}

const downloadFiles = async () => {
  if (!hasRenamed.value) return

  try {
    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    sortedFiles.value.forEach((file) => {
      zip.file(file.originalName, file.file)
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
  info(t('tools.fileRenamer.messages.filesCleared'))
}

// Script generation functions
const generateScriptContent = () => {
  if (files.value.length === 0) {
    info(t('tools.fileRenamer.messages.noFilesToProcess'))
    scriptContent.value = ''
    return
  }

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
    
    sortedFiles.value.forEach((file) => {
      if (file.newName && file.newName !== file.originalName) {
        content += '  if "%%~nxi"=="' + file.originalName + '" ren "%%i" "' + file.newName + '"\n'
      }
    })
    
    content += ')\n'
    content += 'echo File renaming completed.\n'
    content += 'pause\n'
  } 
  else if (scriptType === 'linux') {
    content = '#!/bin/bash\n'
    content += '# Linux Shell Script for File Renaming\n'
    content += '# Generated by File Renamer Tool\n\n'
    
    content += '# Process files in current directory\n'
    content += 'for file in *; do\n'
    
    sortedFiles.value.forEach((file) => {
      if (file.newName && file.newName !== file.originalName) {
        content += '  if [ "$(basename "$file")" = "' + file.originalName + '" ]; then\n'
        content += '    mv "$file" "' + file.newName + '"\n'
        content += '  fi\n'
      }
    })
    
    content += 'done\n'
    content += 'echo "File renaming completed."\n'
  }
  else if (scriptType === 'both') {
    content = '# Windows Batch Script\n'
    content += '@echo off\n'
    content += 'REM Windows Batch Script for File Renaming\n'
    content += 'REM Generated by File Renamer Tool\n\n'
    
    content += 'REM Process files in current directory\n'
    content += 'for %%i in (*.*) do (\n'
    
    sortedFiles.value.forEach((file) => {
      if (file.newName && file.newName !== file.originalName) {
        content += '  if "%%~nxi"=="' + file.originalName + '" ren "%%i" "' + file.newName + '"\n'
      }
    })
    
    content += ')\n'
    content += 'echo File renaming completed.\n'
    content += 'pause\n\n'
    
    content += '# Linux Shell Script\n'
    content += '#!/bin/bash\n'
    content += '# Linux Shell Script for File Renaming\n'
    content += '# Generated by File Renamer Tool\n\n'
    
    content += '# Process files in current directory\n'
    content += 'for file in *; do\n'
    
    sortedFiles.value.forEach((file) => {
      if (file.newName && file.newName !== file.originalName) {
        content += '  if [ "$(basename "$file")" = "' + file.originalName + '" ]; then\n'
        content += '    mv "$file" "' + file.newName + '"\n'
        content += '  fi\n'
      }
    })
    
    content += 'done\n'
    content += 'echo "File renaming completed."\n'
  }

  scriptContent.value = content
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
  } else if (scriptType === 'both') {
    fileName = 'rename_files.txt'
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

// Add the generateScript function to the actions section
// Drag and drop event handlers for vue.draggable
const handleDragStart = () => {
  // Can be used for additional logic when dragging starts
}

const handleDragEnd = () => {
  // Can be used for additional logic when dragging ends
  // For manual sorting, we might want to update the preview if it exists
  if (hasPreview.value && sortType.value === 'manual') {
    generatePreview()
  }
}
</script>
