<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('tools.jsonMerge.title') }}</h1>
        <p class="text-gray-600">{{ $t('tools.jsonMerge.description') }}</p>
      </div>

      <!-- Tool Introduction -->
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <h2 class="text-lg font-semibold mb-3">{{ $t('tools.jsonMerge.introduction.title') }}</h2>
        <div class="text-gray-600 space-y-2">
          <p>{{ $t('tools.jsonMerge.introduction.description') }}</p>
          <p>{{ $t('tools.jsonMerge.introduction.usage') }}</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonMerge.fileUpload.title') }}
            </h3>
          </div>

          <div class="mb-6">
            <p class="text-gray-600 mb-4">{{ $t('tools.jsonMerge.fileUpload.description') }}</p>
            <input
              type="file"
              accept=".json"
              multiple
              @change="handleFileUpload"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <!-- File Preview -->
          <div v-if="uploadedFiles.length > 0" class="space-y-4">
            <h4 class="font-medium text-gray-900">{{ $t('tools.jsonMerge.filePreview.title') }}</h4>
            <div
              v-for="(file, index) in uploadedFiles"
              :key="index"
              class="border rounded-lg p-4 space-y-2"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-gray-900">{{ file.name }}</p>
                  <p class="text-sm text-gray-500">
                    {{ formatFileSize(file.size) }} •
                    <span v-if="file.parsedData">
                      <span v-if="Array.isArray(file.parsedData)">
                        {{
                          $t('tools.jsonMerge.filePreview.arrayItems', {
                            count: file.parsedData.length,
                          })
                        }}
                      </span>
                      <span v-else>
                        {{ $t('tools.jsonMerge.filePreview.object') }}
                      </span>
                    </span>
                    <span v-else class="text-yellow-600">
                      {{ $t('common.loading') }}
                    </span>
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="moveFileUp(index)"
                    :disabled="index === 0"
                    class="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    :title="$t('tools.jsonMerge.filePreview.moveUp')"
                  >
                    ↑
                  </button>
                  <button
                    @click="moveFileDown(index)"
                    :disabled="index === uploadedFiles.length - 1"
                    class="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    :title="$t('tools.jsonMerge.filePreview.moveDown')"
                  >
                    ↓
                  </button>
                  <button
                    @click="removeFile(index)"
                    class="p-1 text-red-500 hover:text-red-700"
                    :title="$t('tools.jsonMerge.filePreview.remove')"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            {{ $t('tools.jsonMerge.fileUpload.noFiles') }}
          </div>

          <!-- Options -->
          <div class="mt-6 space-y-4">
            <h4 class="font-medium text-gray-900">{{ $t('tools.jsonMerge.options.title') }}</h4>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('tools.jsonMerge.options.outputFileName') }}
              </label>
              <input
                v-model="outputFileName"
                :placeholder="$t('tools.jsonMerge.options.outputFileNamePlaceholder')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3 mt-6">
            <button
              @click="mergeJsonFiles"
              :disabled="uploadedFiles.length === 0"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ $t('tools.jsonMerge.actions.merge') }}
            </button>
            <button
              @click="clearAllFiles"
              :disabled="uploadedFiles.length === 0"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors font-medium"
            >
              {{ $t('tools.jsonMerge.actions.clear') }}
            </button>
          </div>
        </div>

        <!-- Output Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.jsonMerge.output.title') }}
            </h3>
            <button
              v-if="mergedOutput"
              @click="downloadMergedJson"
              class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              {{ $t('tools.jsonMerge.actions.download') }}
            </button>
          </div>

          <div
            v-if="!mergedOutput"
            class="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">📄</div>
              <p>{{ $t('tools.jsonMerge.output.noOutput') }}</p>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-green-800">
                    {{ $t('tools.jsonMerge.output.complete') }}
                  </p>
                  <p class="text-sm text-green-600">
                    {{ $t('tools.jsonMerge.output.itemsMerged', { count: mergedItemCount }) }}
                  </p>
                </div>
              </div>
            </div>

            <textarea
              :value="mergedOutput"
              readonly
              class="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <h3 class="font-semibold text-lg mb-2 text-gray-900">
            {{ $t('tools.jsonMerge.features.multipleFiles.title') }}
          </h3>
          <p class="text-gray-600">
            {{ $t('tools.jsonMerge.features.multipleFiles.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <h3 class="font-semibold text-lg mb-2 text-gray-900">
            {{ $t('tools.jsonMerge.features.orderControl.title') }}
          </h3>
          <p class="text-gray-600">
            {{ $t('tools.jsonMerge.features.orderControl.description') }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <h3 class="font-semibold text-lg mb-2 text-gray-900">
            {{ $t('tools.jsonMerge.features.preview.title') }}
          </h3>
          <p class="text-gray-600">
            {{ $t('tools.jsonMerge.features.preview.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const { success, error: showError, downloadSuccess } = useToast()
const { t } = useI18n()

interface UploadedFile {
  name: string
  size: number
  content: string
  parsedData: unknown
}

const uploadedFiles = ref<UploadedFile[]>([])
const mergedOutput = ref<string>('')
const outputFileName = ref<string>('merged-json')

const mergedItemCount = computed(() => {
  if (!mergedOutput.value) return 0
  try {
    const parsed = JSON.parse(mergedOutput.value)
    return Array.isArray(parsed) ? parsed.length : 1
  } catch {
    return 0
  }
})

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  const newFiles: UploadedFile[] = []

  Array.from(files).forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsedData = JSON.parse(content)

        newFiles.push({
          name: file.name,
          size: file.size,
          content,
          parsedData,
        })

        // When all files are processed, update the reactive array
        if (newFiles.length === files.length) {
          uploadedFiles.value = [...uploadedFiles.value, ...newFiles]
          success(
            t('tools.jsonMerge.success.filesAdded', {
              count: newFiles.length,
            }),
          )
        }
      } catch {
        showError(
          t('tools.jsonMerge.errors.invalidJson', {
            fileName: file.name,
          }),
        )
      }
    }
    reader.readAsText(file)
  })
}

function removeFile(index: number) {
  uploadedFiles.value.splice(index, 1)
}

function moveFileUp(index: number) {
  if (index > 0) {
    const temp = uploadedFiles.value[index]
    uploadedFiles.value[index] = uploadedFiles.value[index - 1]
    uploadedFiles.value[index - 1] = temp
  }
}

function moveFileDown(index: number) {
  if (index < uploadedFiles.value.length - 1) {
    const temp = uploadedFiles.value[index]
    uploadedFiles.value[index] = uploadedFiles.value[index + 1]
    uploadedFiles.value[index + 1] = temp
  }
}

function clearAllFiles() {
  uploadedFiles.value = []
  mergedOutput.value = ''
}

function mergeJsonFiles() {
  try {
    if (uploadedFiles.value.length === 0) {
      showError(t('tools.jsonMerge.errors.noFiles'))
      return
    }

    const mergedArray: unknown[] = []

    uploadedFiles.value.forEach((file) => {
      if (Array.isArray(file.parsedData)) {
        // If it's an array, merge all items
        mergedArray.push(...file.parsedData)
      } else {
        // If it's an object, add it as a single item
        mergedArray.push(file.parsedData)
      }
    })

    mergedOutput.value = JSON.stringify(mergedArray, null, 2)
    success(t('tools.jsonMerge.success.mergeComplete'))
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    showError(
      t('tools.jsonMerge.errors.mergeFailed', {
        error: errorMessage,
      }),
    )
  }
}

function downloadMergedJson() {
  if (!mergedOutput.value) return

  const blob = new Blob([mergedOutput.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${outputFileName.value || 'merged-json'}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  downloadSuccess()
}
</script>
