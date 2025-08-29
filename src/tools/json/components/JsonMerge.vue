<template>
  <div class="h-full bg-dark-950 text-slate-100 p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Tool Introduction -->
      <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg">
        <h2 class="text-lg font-semibold mb-3">{{ $t('tools.jsonMerge.introduction.title') }}</h2>
        <div class="text-slate-400 space-y-2">
          <p>{{ $t('tools.jsonMerge.introduction.description') }}</p>
          <p>{{ $t('tools.jsonMerge.introduction.usage') }}</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.jsonMerge.fileUpload.title') }}
            </h3>
          </div>

          <div class="mb-6">
            <p class="text-slate-400 mb-4">{{ $t('tools.jsonMerge.fileUpload.description') }}</p>
            <input
              type="file"
              accept=".json"
              multiple
              @change="handleFileUpload"
              class="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-800/50 file:text-primary-400 hover:file:bg-slate-700/50 transition-all duration-200"
            />
          </div>

          <!-- File Preview -->
          <div v-if="uploadedFiles.length > 0" class="space-y-4">
            <h4 class="font-medium text-slate-100">
              {{ $t('tools.jsonMerge.filePreview.title') }}
            </h4>
            <div
              v-for="(file, index) in uploadedFiles"
              :key="index"
              class="border border-slate-700/30 bg-slate-800/30 rounded-xl p-4 space-y-2 hover-lift transition-all duration-200"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-slate-100">{{ file.name }}</p>
                  <p class="text-sm text-slate-400">
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
                    <span v-else class="text-warning-400">
                      {{ $t('common.loading') }}<span class="loading-dots"></span>
                    </span>
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="moveFileUp(index)"
                    :disabled="index === 0"
                    class="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-all duration-200 hover:scale-110"
                    :title="$t('tools.jsonMerge.filePreview.moveUp')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                  <button
                    @click="moveFileDown(index)"
                    :disabled="index === uploadedFiles.length - 1"
                    class="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-all duration-200 hover:scale-110"
                    :title="$t('tools.jsonMerge.filePreview.moveDown')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <button
                    @click="removeFile(index)"
                    class="p-1 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110"
                    :title="$t('tools.jsonMerge.filePreview.remove')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="text-center py-8 text-slate-400 border-2 border-dashed border-slate-700/30 rounded-xl"
          >
            <div class="text-3xl mb-2 animate-bounce-subtle">📄</div>
            <p>{{ $t('tools.jsonMerge.fileUpload.noFiles') }}</p>
          </div>

          <!-- Options -->
          <div class="mt-6 space-y-4">
            <h4 class="font-medium text-slate-100">{{ $t('tools.jsonMerge.options.title') }}</h4>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">
                {{ $t('tools.jsonMerge.options.outputFileName') }}
              </label>
              <input
                v-model="outputFileName"
                :placeholder="$t('tools.jsonMerge.options.outputFileNamePlaceholder')"
                class="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3 mt-6">
            <button
              @click="mergeJsonFiles"
              :disabled="uploadedFiles.length === 0"
              class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 font-medium hover-lift"
            >
              {{ $t('tools.jsonMerge.actions.merge') }}
            </button>
            <button
              @click="clearAllFiles"
              :disabled="uploadedFiles.length === 0"
              class="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-700/50 hover:text-white disabled:bg-slate-800/30 disabled:cursor-not-allowed disabled:text-slate-600 transition-all duration-200 font-medium hover-lift"
            >
              {{ $t('tools.jsonMerge.actions.clear') }}
            </button>
          </div>
        </div>

        <!-- Output Section -->
        <div class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-100">
              {{ $t('tools.jsonMerge.output.title') }}
            </h3>
            <button
              v-if="mergedOutput"
              @click="downloadMergedJson"
              class="px-3 py-1 text-sm bg-success-500/20 text-success-400 rounded-lg hover:bg-success-500/30 transition-all duration-200 hover-lift"
            >
              {{ $t('tools.jsonMerge.actions.download') }}
            </button>
          </div>

          <div
            v-if="!mergedOutput"
            class="h-80 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/30 rounded-xl"
          >
            <div class="text-center">
              <div class="text-3xl mb-2 animate-bounce-subtle">📄</div>
              <p>{{ $t('tools.jsonMerge.output.noOutput') }}</p>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="bg-success-500/10 border border-success-500/30 rounded-xl p-4">
              <div class="flex items-center">
                <div class="text-success-400 text-2xl mr-3">✅</div>
                <div>
                  <p class="font-medium text-success-400">
                    {{ $t('tools.jsonMerge.output.complete') }}
                  </p>
                  <p class="text-sm text-success-500/80">
                    {{ $t('tools.jsonMerge.output.itemsMerged', { count: mergedItemCount }) }}
                  </p>
                </div>
              </div>
            </div>

            <textarea
              :value="mergedOutput"
              readonly
              class="w-full h-64 p-4 border border-slate-700/30 rounded-xl font-mono text-sm resize-none bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6">
        <div
          class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg hover-lift transition-all duration-200"
        >
          <h3 class="font-semibold text-lg mb-2 text-slate-100">
            {{ $t('tools.jsonMerge.features.multipleFiles.title') }}
          </h3>
          <p class="text-slate-400">
            {{ $t('tools.jsonMerge.features.multipleFiles.description') }}
          </p>
        </div>
        <div
          class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg hover-lift transition-all duration-200"
        >
          <h3 class="font-semibold text-lg mb-2 text-slate-100">
            {{ $t('tools.jsonMerge.features.orderControl.title') }}
          </h3>
          <p class="text-slate-400">
            {{ $t('tools.jsonMerge.features.orderControl.description') }}
          </p>
        </div>
        <div
          class="glass border border-slate-700/30 p-6 rounded-xl shadow-dark-lg hover-lift transition-all duration-200"
        >
          <h3 class="font-semibold text-lg mb-2 text-slate-100">
            {{ $t('tools.jsonMerge.features.preview.title') }}
          </h3>
          <p class="text-slate-400">
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
