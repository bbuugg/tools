<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('tools.fileRenamer.title') }}</h1>
        <p class="text-gray-600">{{ $t('tools.fileRenamer.subtitle') }}</p>
      </div>

      <!-- File Upload Area -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          :class="[
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          ]"
          @dragenter="isDragging = true"
          @dragleave="isDragging = false"
        >
          <div class="space-y-4">
            <div class="text-4xl text-gray-400">📁</div>
            <div>
              <p class="text-lg font-medium text-gray-700">
                {{ $t('tools.fileRenamer.uploadArea.title') }}
              </p>
              <p class="text-sm text-gray-500">{{ $t('tools.fileRenamer.uploadArea.subtitle') }}</p>
            </div>
            <div>
              <input
                type="file"
                multiple
                @change="handleFileSelect"
                ref="fileInput"
                class="hidden"
              />
              <button
                @click="(fileInput as HTMLInputElement)?.click()"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {{ $t('tools.fileRenamer.uploadArea.selectFiles') }}
              </button>
            </div>
          </div>
        </div>

        <!-- File Count Info -->
        <div v-if="files.length > 0" class="mt-4 text-sm text-gray-600">
          {{ $t('tools.fileRenamer.fileCount', { count: files.length }) }}
        </div>
      </div>

      <!-- Renaming Options -->
      <div v-if="files.length > 0" class="bg-white rounded-lg shadow-md mb-6">
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in renamingTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              {{ $t(`tools.fileRenamer.tabs.${tab.id}`) }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Sequential Tab -->
          <div v-if="activeTab === 'sequential'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('tools.fileRenamer.sequential.prefix') }}
                </label>
                <input
                  v-model="sequentialOptions.prefix"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="$t('tools.fileRenamer.sequential.prefixPlaceholder')"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('tools.fileRenamer.sequential.startNumber') }}
                </label>
                <input
                  v-model.number="sequentialOptions.startNumber"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('tools.fileRenamer.sequential.padding') }}
                </label>
                <input
                  v-model.number="sequentialOptions.padding"
                  type="number"
                  min="1"
                  max="10"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Replace Tab -->
          <div v-if="activeTab === 'replace'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('tools.fileRenamer.replace.findText') }}
                </label>
                <input
                  v-model="replaceOptions.findText"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="$t('tools.fileRenamer.replace.findPlaceholder')"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('tools.fileRenamer.replace.replaceText') }}
                </label>
                <input
                  v-model="replaceOptions.replaceText"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="$t('tools.fileRenamer.replace.replacePlaceholder')"
                />
              </div>
            </div>
            <div class="flex items-center">
              <input
                id="case-sensitive"
                v-model="replaceOptions.caseSensitive"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="case-sensitive" class="ml-2 block text-sm text-gray-700">
                {{ $t('tools.fileRenamer.replace.caseSensitive') }}
              </label>
            </div>
          </div>

          <!-- Case Tab -->
          <div v-if="activeTab === 'case'" class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                {{ $t('tools.fileRenamer.case.transformation') }}
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="caseOptions.type"
                    type="radio"
                    value="uppercase"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{
                    $t('tools.fileRenamer.case.uppercase')
                  }}</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="caseOptions.type"
                    type="radio"
                    value="lowercase"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{
                    $t('tools.fileRenamer.case.lowercase')
                  }}</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="caseOptions.type"
                    type="radio"
                    value="capitalize"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{
                    $t('tools.fileRenamer.case.capitalize')
                  }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Insert Tab -->
          <div v-if="activeTab === 'insert'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('tools.fileRenamer.insert.text') }}
                </label>
                <input
                  v-model="insertOptions.text"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="$t('tools.fileRenamer.insert.textPlaceholder')"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('tools.fileRenamer.insert.position') }}
                </label>
                <select
                  v-model="insertOptions.position"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="prefix">{{ $t('tools.fileRenamer.insert.prefix') }}</option>
                  <option value="suffix">{{ $t('tools.fileRenamer.insert.suffix') }}</option>
                  <option value="index">{{ $t('tools.fileRenamer.insert.atIndex') }}</option>
                </select>
              </div>
            </div>
            <div v-if="insertOptions.position === 'index'" class="w-full md:w-1/2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('tools.fileRenamer.insert.index') }}
              </label>
              <input
                v-model.number="insertOptions.index"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Truncate Tab -->
          <div v-if="activeTab === 'truncate'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('tools.fileRenamer.truncate.startIndex') }}
                </label>
                <input
                  v-model.number="truncateOptions.startIndex"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('tools.fileRenamer.truncate.endIndex') }}
                </label>
                <input
                  v-model.number="truncateOptions.endIndex"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p class="text-sm text-gray-500">{{ $t('tools.fileRenamer.truncate.description') }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div class="flex space-x-4">
            <button
              @click="generatePreview"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {{ $t('tools.fileRenamer.actions.preview') }}
            </button>
            <button
              @click="applyRename"
              :disabled="!hasPreview"
              class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ $t('tools.fileRenamer.actions.apply') }}
            </button>
            <button
              @click="downloadFiles"
              :disabled="!hasRenamed"
              class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ $t('tools.fileRenamer.actions.download') }}
            </button>
            <button
              @click="clearFiles"
              class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              {{ $t('tools.fileRenamer.actions.clear') }}
            </button>
          </div>
        </div>
      </div>

      <!-- File List -->
      <div v-if="files.length > 0" class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ $t('tools.fileRenamer.fileList.title') }}
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ $t('tools.fileRenamer.fileList.originalName') }}
                </th>
                <th
                  v-if="hasPreview"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ $t('tools.fileRenamer.fileList.newName') }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ $t('tools.fileRenamer.fileList.size') }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ $t('tools.fileRenamer.fileList.type') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(file, index) in files" :key="index">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ file.originalName }}
                </td>
                <td v-if="hasPreview" class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="
                      file.newName !== file.originalName
                        ? 'text-green-600 font-medium'
                        : 'text-gray-500'
                    "
                  >
                    {{ file.newName || file.originalName }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatFileSize(file.size) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ file.type || 'Unknown' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { success, info } = useToast()

interface FileItem {
  file: File
  originalName: string
  newName?: string
  size: number
  type: string
}

// State
const files = ref<FileItem[]>([])
const isDragging = ref(false)
const activeTab = ref('sequential')
const hasPreview = ref(false)
const hasRenamed = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

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

// Tab configuration
const renamingTabs = [
  { id: 'sequential' },
  { id: 'replace' },
  { id: 'case' },
  { id: 'insert' },
  { id: 'truncate' },
]

// File handling
const handleDrop = (event: DragEvent) => {
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

const processFiles = (fileList: File[]) => {
  const newFiles: FileItem[] = fileList.map((file) => ({
    file,
    originalName: file.name,
    size: file.size,
    type: file.type,
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

// Renaming functions
const generatePreview = () => {
  files.value.forEach((file, index) => {
    let newName = file.originalName

    // Apply sequential renaming
    if (activeTab.value === 'sequential') {
      const nameWithoutExt = getFileNameWithoutExtension(file.originalName)
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
  files.value.forEach((file) => {
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

    files.value.forEach((file) => {
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
  } catch (_err) {
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
</script>
