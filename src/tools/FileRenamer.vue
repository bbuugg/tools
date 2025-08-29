<template>
  <ToolLayout
    :title="$t('tools.fileRenamer.title')"
    :description="$t('tools.fileRenamer.description')"
    icon="📁"
    :features="[
      $t('tools.fileRenamer.tabs.sequential'),
      $t('tools.fileRenamer.tabs.replace'),
      $t('tools.fileRenamer.tabs.case'),
      $t('tools.fileRenamer.tabs.insert'),
      $t('tools.fileRenamer.tabs.truncate'),
    ]"
  >
    <!-- Upload Area -->
    <div class="glass rounded-xl border border-slate-700/30 p-6 mb-6">
      <div
        class="border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer"
        :class="{
          'border-primary-500 bg-primary-500/10': isDragging,
          'border-slate-600 hover:border-slate-500': !isDragging,
        }"
        @dragover.prevent
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop="handleFileDrop"
        @click="fileInputClick"
      >
        <div class="text-4xl mb-3">📁</div>
        <h3 class="text-lg font-medium text-slate-100 mb-1">
          {{ $t('tools.fileRenamer.uploadArea.title') }}
        </h3>
        <p class="text-slate-400 mb-4">{{ $t('tools.fileRenamer.uploadArea.subtitle') }}</p>
        <button
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors border border-primary-500/30 hover-lift"
        >
          {{ $t('tools.fileRenamer.uploadArea.selectFiles') }}
        </button>
        <input ref="fileInput" type="file" multiple @change="handleFileSelect" class="hidden" />
      </div>
    </div>

    <!-- File List and Options -->
    <div v-if="files.length > 0" class="glass rounded-xl border border-slate-700/30 p-6">
      <!-- File Count and Sorting -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="text-lg font-medium text-slate-100">
          {{ $t('tools.fileRenamer.fileCount', { count: files.length }) }}
          <span class="text-slate-400 text-sm ml-2">
            ({{ $t('tools.fileRenamer.totalSize', { size: formatTotalFileSize() }) }})
          </span>
        </div>

        <!-- Sorting Options and Script Button -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-slate-300">
            {{ $t('tools.fileRenamer.sorting.title') }}:
          </span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in sortingOptions"
              :key="option.id"
              @click="sortFiles(option.id)"
              class="px-3 py-1 text-sm rounded transition-colors border"
              :class="{
                'bg-primary-500/20 text-primary-300 border-primary-500/50': sortType === option.id,
                'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-slate-700/50':
                  sortType !== option.id,
              }"
            >
              {{ option.label }}
            </button>
          </div>
          <button
            @click="showScript"
            class="px-3 py-1 text-sm bg-green-500/10 text-green-300 rounded hover:bg-green-500/20 transition-colors border border-green-500/30"
          >
            {{ $t('tools.fileRenamer.script.downloadScript') }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-slate-700/30 mb-6">
        <nav class="-mb-px flex space-x-8 overflow-x-auto">
          <button
            v-for="tab in renamingTabs"
            :key="tab.id"
            @click="handleTabChange(tab.id)"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="{
              'border-primary-500 text-primary-400': activeTab === tab.id,
              'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500':
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
              <label class="block text-sm font-medium text-slate-300 mb-1">
                {{ $t('tools.fileRenamer.sequential.prefix') }}
              </label>
              <input
                v-model="sequentialOptions.prefix"
                :placeholder="$t('tools.fileRenamer.sequential.prefixPlaceholder')"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">
                {{ $t('tools.fileRenamer.sequential.startNumber') }}
              </label>
              <input
                v-model.number="sequentialOptions.startNumber"
                type="number"
                min="0"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">
                {{ $t('tools.fileRenamer.sequential.padding') }}
              </label>
              <input
                v-model.number="sequentialOptions.padding"
                type="number"
                min="1"
                max="10"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-100"
              />
            </div>
          </div>
        </div>

        <!-- Replace Tab -->
        <div v-if="activeTab === 'replace'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">
                {{ $t('tools.fileRenamer.replace.findText') }}
              </label>
              <input
                v-model="replaceOptions.findText"
                :placeholder="$t('tools.fileRenamer.replace.findPlaceholder')"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">
                {{ $t('tools.fileRenamer.replace.replaceText') }}
              </label>
              <input
                v-model="replaceOptions.replaceText"
                :placeholder="$t('tools.fileRenamer.replace.replacePlaceholder')"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-100"
              />
            </div>
          </div>
          <div class="mt-3">
            <label class="flex items-center">
              <input
                v-model="replaceOptions.caseSensitive"
                type="checkbox"
                class="rounded border-slate-600 text-primary-500 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 bg-slate-800/50"
              />
              <span class="ml-2 text-sm text-slate-300">
                {{ $t('tools.fileRenamer.replace.caseSensitive') }}
              </span>
            </label>
          </div>
        </div>

        <!-- Case Tab -->
        <div v-if="activeTab === 'case'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label
              class="flex items-center p-3 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors"
            >
              <input
                v-model="caseOptions.type"
                type="radio"
                value="uppercase"
                class="h-4 w-4 text-primary-500 border-slate-600 focus:ring-primary-500 bg-slate-800/50"
              />
              <span class="ml-3 text-sm text-slate-300">
                {{ $t('tools.fileRenamer.case.uppercase') }}
              </span>
            </label>
            <label
              class="flex items-center p-3 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors"
            >
              <input
                v-model="caseOptions.type"
                type="radio"
                value="lowercase"
                class="h-4 w-4 text-primary-500 border-slate-600 focus:ring-primary-500 bg-slate-800/50"
              />
              <span class="ml-3 text-sm text-slate-300">
                {{ $t('tools.fileRenamer.case.lowercase') }}
              </span>
            </label>
            <label
              class="flex items-center p-3 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors"
            >
              <input
                v-model="caseOptions.type"
                type="radio"
                value="capitalize"
                class="h-4 w-4 text-primary-500 border-slate-600 focus:ring-primary-500 bg-slate-800/50"
              />
              <span class="ml-3 text-sm text-slate-300">
                {{ $t('tools.fileRenamer.case.capitalize') }}
              </span>
            </label>
          </div>
        </div>

        <!-- Insert Tab -->
        <div v-if="activeTab === 'insert'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">
                {{ $t('tools.fileRenamer.insert.text') }}
              </label>
              <input
                v-model="insertOptions.text"
                :placeholder="$t('tools.fileRenamer.insert.textPlaceholder')"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">
                {{ $t('tools.fileRenamer.insert.position') }}
              </label>
              <select
                v-model="insertOptions.position"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-100"
              >
                <option value="prefix">{{ $t('tools.fileRenamer.insert.prefix') }}</option>
                <option value="suffix">{{ $t('tools.fileRenamer.insert.suffix') }}</option>
                <option value="index">{{ $t('tools.fileRenamer.insert.atIndex') }}</option>
              </select>
            </div>
          </div>
          <div v-if="insertOptions.position === 'index'" class="mt-3">
            <label class="block text-sm font-medium text-slate-300 mb-1">
              {{ $t('tools.fileRenamer.insert.index') }}
            </label>
            <input
              v-model.number="insertOptions.index"
              type="number"
              min="0"
              class="w-full md:w-1/3 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-100"
            />
          </div>
        </div>

        <!-- Truncate Tab -->
        <div v-if="activeTab === 'truncate'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">
                {{ $t('tools.fileRenamer.truncate.startIndex') }}
              </label>
              <input
                v-model.number="truncateOptions.startIndex"
                type="number"
                min="0"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">
                {{ $t('tools.fileRenamer.truncate.endIndex') }}
              </label>
              <input
                v-model.number="truncateOptions.endIndex"
                type="number"
                min="0"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-100"
              />
            </div>
          </div>
          <p class="mt-2 text-sm text-slate-400">
            {{ $t('tools.fileRenamer.truncate.description') }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-3 mb-6">
        <button
          v-if="hasPreview"
          @click="applyRename"
          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors border border-green-500/30 hover-lift"
        >
          {{ $t('tools.fileRenamer.actions.apply') }}
        </button>
        <button
          v-if="hasRenamed"
          @click="downloadFiles"
          class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors border border-purple-500/30 hover-lift"
        >
          {{ $t('tools.fileRenamer.actions.download') }}
        </button>
        <button
          @click="clearFiles"
          class="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors border border-slate-600/30 hover-lift"
        >
          {{ $t('tools.fileRenamer.actions.clear') }}
        </button>
      </div>

      <!-- File List -->
      <div class="border rounded-lg overflow-hidden border-slate-700/50">
        <div class="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50">
          <h3 class="font-medium text-slate-100">
            {{ $t('tools.fileRenamer.fileList.title') }}
          </h3>
          <p class="text-sm text-slate-400 mt-1">
            {{ $t('tools.fileRenamer.fileList.dragHint') }}
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-700/50">
            <thead class="bg-slate-800/30">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                >
                  {{ $t('tools.fileRenamer.fileList.drag') }}
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                >
                  {{ $t('tools.fileRenamer.fileList.originalName') }}
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                >
                  {{ $t('tools.fileRenamer.fileList.newName') }}
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                >
                  {{ $t('tools.fileRenamer.fileList.size') }}
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
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
              class="divide-y divide-slate-700/50 bg-slate-800/20"
            >
              <template #item="{ element: file }">
                <tr class="cursor-move hover:bg-slate-800/30 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    <div
                      class="cursor-move text-slate-500 hover:text-slate-300 transition-colors"
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
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                    {{ file.originalName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <span
                      :class="{
                        'text-green-400 font-medium':
                          file.tmpName && file.tmpName !== file.originalName,
                      }"
                    >
                      {{ file.tmpName || file.currentName }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {{ formatFileSize(file.size) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {{ file.type || '—' }}
                  </td>
                </tr>
              </template>
            </draggable>
          </table>
        </div>
      </div>
    </div>

    <!-- Script Modal -->
    <div
      v-if="showScriptModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div
        class="relative bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl mx-4 border border-slate-700/50"
      >
        <div class="flex items-center justify-between p-4 border-b border-slate-700/50 rounded-t">
          <h3 class="text-xl font-semibold text-slate-100">
            {{ $t('tools.fileRenamer.script.scriptPreview') }}
          </h3>
          <button
            @click="showScriptModal = false"
            class="text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-colors"
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
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.fileRenamer.script.scriptType') }}
            </label>
            <select
              v-model="scriptOptions.scriptType"
              class="block w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-100"
            >
              <option value="windows">{{ $t('tools.fileRenamer.script.windows') }}</option>
              <option value="linux">{{ $t('tools.fileRenamer.script.linux') }}</option>
            </select>
          </div>
          <div
            class="bg-slate-800 text-green-400 p-4 font-mono text-sm overflow-x-auto max-h-96 rounded border border-slate-700/50"
          >
            <pre>{{ scriptContent || $t('tools.fileRenamer.script.noContent') }}</pre>
          </div>
        </div>
        <div class="flex items-center justify-end p-6 border-t border-slate-700/50 rounded-b">
          <button
            @click="copyScriptToClipboard"
            class="text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-500/30 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 transition-colors"
          >
            {{ $t('tools.fileRenamer.script.copyScript') }}
          </button>
          <button
            @click="showScriptModal = false"
            class="text-slate-300 bg-slate-700 hover:bg-slate-600 focus:ring-4 focus:ring-slate-700/30 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 transition-colors"
          >
            {{ $t('common.close') }}
          </button>
          <button
            @click="downloadScript"
            class="text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:ring-primary-500/30 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
          >
            {{ $t('tools.fileRenamer.script.downloadScript') }}
          </button>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import draggable from 'vuedraggable'
import ToolLayout from '@/components/ToolLayout.vue'

const { t } = useI18n()
const { success, info, error } = useToast()

// State
interface FileInfo {
  id: string
  file: File
  originalName: string
  currentName: string
  tmpName?: string
  size: number
  type: string
  lastModified: number
}

const files = ref<FileInfo[]>([])
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
  return files.value.reduce((total: number, file: FileInfo) => total + file.size, 0)
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
  sortedFiles.value.forEach((file: FileInfo, index: number) => {
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
    content = '@echo off\r\n'

    let hasRenamingCommands = false
    sortedFiles.value.forEach((file: any) => {
      // Only generate commands for files that have a current name different from original
      if (file.currentName && file.currentName !== file.originalName) {
        content += `ren "${file.originalName}" "${file.currentName}"\r\n`
        hasRenamingCommands = true
      }
    })

    content += 'echo File renaming completed.\r\n'

    // Always add pause for Windows scripts
    content += 'pause\r\n'

    // If no files need renaming, show a message
    if (!hasRenamingCommands) {
      content = '@echo off\n'
      content += 'echo No files require renaming.\n'
      content += 'pause\n'
    }
  } else if (scriptType === 'linux') {
    content = '#!/bin/bash\n'
    content += 'echo "Process files in current directory"\n'

    let hasRenamingCommands = false
    sortedFiles.value.forEach((file: any) => {
      // Only generate commands for files that have a current name different from original
      if (file.currentName && file.currentName !== file.originalName) {
        content += `mv "${file.originalName}" "${file.currentName}"\n`
        hasRenamingCommands = true
      }
    })

    // If no files need renaming, show a message
    if (!hasRenamingCommands) {
      content += 'echo "No files require renaming."\n'
    }
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

// Function to copy script content to clipboard
const copyScriptToClipboard = async () => {
  if (!scriptContent.value) {
    info(t('tools.fileRenamer.messages.noScriptToCopy'))
    return
  }

  try {
    await navigator.clipboard.writeText(scriptContent.value)
    success(t('tools.fileRenamer.messages.scriptCopied'))
  } catch (err) {
    console.error('Failed to copy script: ', err)
    error(t('tools.fileRenamer.messages.scriptCopyFailed'))
  }
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
    return
  }

  // Always allow tab switching
  activeTab.value = tabId
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
  const newFiles: FileInfo[] = fileList.map((file) => ({
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

<style scoped>
.glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.hover-lift {
  transition: all 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
