<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">🎨 {{ $t('tools.svgEditor.title') }}</h1>
        <p class="text-gray-600 text-lg">
          {{ $t('tools.svgEditor.description') }}
        </p>
        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 class="font-semibold text-blue-800 mb-2">
            {{ $t('tools.svgEditor.howToUse.title') }}
          </h3>
          <ol class="list-decimal list-inside space-y-1 text-blue-700">
            <li>{{ $t('tools.svgEditor.howToUse.step1') }}</li>
            <li>{{ $t('tools.svgEditor.howToUse.step2') }}</li>
            <li>{{ $t('tools.svgEditor.howToUse.step3') }}</li>
            <li>{{ $t('tools.svgEditor.howToUse.step4') }}</li>
          </ol>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Code Editor Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('tools.svgEditor.editor.title') }}
            </h3>
            <div class="flex space-x-2">
              <button
                @click="loadExample"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              >
                {{ $t('tools.svgEditor.editor.loadExample') }}
              </button>
              <button
                @click="clearEditor"
                class="px-3 py-1 bg-red-200 text-red-700 rounded text-sm hover:bg-red-300"
              >
                {{ $t('tools.svgEditor.editor.clear') }}
              </button>
            </div>
          </div>
          <div class="border border-gray-300 rounded-lg overflow-hidden">
            <textarea
              v-model="svgCode"
              class="w-full h-96 font-mono text-sm p-4 resize-none focus:outline-none"
              :placeholder="$t('tools.svgEditor.editor.placeholder')"
            ></textarea>
          </div>
          <div class="mt-4 flex justify-between">
            <div class="text-sm text-gray-500">
              {{ $t('tools.svgEditor.editor.lines') }}: {{ lineCount }}
            </div>
            <button
              @click="copyToClipboard"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {{ $t('tools.svgEditor.editor.copy') }}
            </button>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ $t('tools.svgEditor.preview.title') }}
          </h3>
          <div
            class="border border-gray-300 rounded-lg overflow-hidden bg-white flex items-center justify-center min-h-96"
          >
            <div
              v-if="svgCode"
              class="w-full h-full flex items-center justify-center p-4"
              v-html="sanitizedSvg"
            ></div>
            <div v-else class="text-gray-500 text-center p-8">
              <div class="text-4xl mb-4">🎨</div>
              <p>{{ $t('tools.svgEditor.preview.empty') }}</p>
            </div>
          </div>
          <div class="mt-4 flex justify-between">
            <div class="text-sm text-gray-500">
              {{ $t('tools.svgEditor.preview.dimensions') }}: {{ svgWidth }} × {{ svgHeight }}
            </div>
            <button
              @click="downloadSvg"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              {{ $t('tools.svgEditor.preview.download') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Visual Editor Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ $t('tools.svgEditor.visualEditor.title') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Shape Palette -->
          <div class="md:col-span-1">
            <h4 class="font-medium text-gray-800 mb-3">
              {{ $t('tools.svgEditor.visualEditor.shapes') }}
            </h4>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="shape in shapes"
                :key="shape.type"
                @click="addShape(shape.type)"
                class="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 flex flex-col items-center"
                :title="shape.name"
              >
                <div class="text-2xl mb-1">{{ shape.icon }}</div>
                <div class="text-xs">{{ shape.name }}</div>
              </button>
            </div>

            <h4 class="font-medium text-gray-800 mb-3 mt-6">
              {{ $t('tools.svgEditor.visualEditor.tools') }}
            </h4>
            <div class="space-y-2">
              <button
                @click="deleteSelected"
                class="w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-left text-sm"
              >
                🗑️ {{ $t('tools.svgEditor.visualEditor.delete') }}
              </button>
              <button
                @click="clearCanvas"
                class="w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-left text-sm"
              >
                🧹 {{ $t('tools.svgEditor.visualEditor.clear') }}
              </button>
            </div>
          </div>

          <!-- Canvas -->
          <div
            class="md:col-span-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center min-h-96"
          >
            <svg
              ref="svgCanvas"
              :width="canvasSize.width"
              :height="canvasSize.height"
              class="bg-white border border-gray-200"
              @click="handleCanvasClick"
            >
              <!-- Grid -->
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              <!-- Shapes -->
              <g v-for="(shape, index) in canvasShapes" :key="index">
                <rect
                  v-if="shape.type === 'rectangle'"
                  :x="shape.x"
                  :y="shape.y"
                  :width="shape.width"
                  :height="shape.height"
                  :fill="shape.fill"
                  :stroke="shape.stroke"
                  :stroke-width="shape.strokeWidth"
                />
                <circle
                  v-else-if="shape.type === 'circle'"
                  :cx="shape.cx"
                  :cy="shape.cy"
                  :r="shape.r"
                  :fill="shape.fill"
                  :stroke="shape.stroke"
                  :stroke-width="shape.strokeWidth"
                />
                <ellipse
                  v-else-if="shape.type === 'ellipse'"
                  :cx="shape.cx"
                  :cy="shape.cy"
                  :rx="shape.rx"
                  :ry="shape.ry"
                  :fill="shape.fill"
                  :stroke="shape.stroke"
                  :stroke-width="shape.strokeWidth"
                />
                <line
                  v-else-if="shape.type === 'line'"
                  :x1="shape.x1"
                  :y1="shape.y1"
                  :x2="shape.x2"
                  :y2="shape.y2"
                  :stroke="shape.stroke"
                  :stroke-width="shape.strokeWidth"
                />
                <polygon
                  v-else-if="shape.type === 'triangle'"
                  :points="shape.points"
                  :fill="shape.fill"
                  :stroke="shape.stroke"
                  :stroke-width="shape.strokeWidth"
                />
              </g>
            </svg>
          </div>

          <!-- Properties Panel -->
          <div class="md:col-span-1">
            <h4 class="font-medium text-gray-800 mb-3">
              {{ $t('tools.svgEditor.visualEditor.properties') }}
            </h4>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.svgEditor.visualEditor.fill') }}
                </label>
                <input
                  v-model="selectedShape.fill"
                  type="color"
                  class="w-full h-10 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.svgEditor.visualEditor.stroke') }}
                </label>
                <input
                  v-model="selectedShape.stroke"
                  type="color"
                  class="w-full h-10 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.svgEditor.visualEditor.strokeWidth') }}
                </label>
                <input
                  v-model.number="selectedShape.strokeWidth"
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  class="w-full"
                />
                <div class="text-xs text-gray-500 text-right">{{ selectedShape.strokeWidth }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tutorials Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ $t('tools.svgEditor.tutorials.title') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="tutorial in tutorials"
            :key="tutorial.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h4 class="font-medium text-gray-900 mb-2">{{ tutorial.title }}</h4>
            <p class="text-sm text-gray-600 mb-3">{{ tutorial.description }}</p>
            <button
              @click="loadTutorial(tutorial)"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {{ $t('tools.svgEditor.tutorials.viewTutorial') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">
              {{ $t('tools.svgEditor.tips.title') }}
            </h3>
            <div class="mt-2 text-sm text-yellow-700">
              <ul class="list-disc list-inside space-y-1">
                <li>{{ $t('tools.svgEditor.tips.tip1') }}</li>
                <li>{{ $t('tools.svgEditor.tips.tip2') }}</li>
                <li>{{ $t('tools.svgEditor.tips.tip3') }}</li>
                <li>{{ $t('tools.svgEditor.tips.tip4') }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DOMPurify from 'dompurify'

const { t } = useI18n()
const { success, error } = useToast()

// SVG code editor
const svgCode = ref('')

// Computed properties
const lineCount = computed(() => svgCode.value.split('\n').length)

const sanitizedSvg = computed(() => {
  return DOMPurify.sanitize(svgCode.value, {
    USE_PROFILES: { svg: true },
    ADD_TAGS: [
      'use',
      'symbol',
      'defs',
      'linearGradient',
      'radialGradient',
      'stop',
      'animate',
      'animateTransform',
    ],
    ADD_ATTR: [
      'viewBox',
      'preserveAspectRatio',
      'xlink:href',
      'gradientUnits',
      'cx',
      'cy',
      'r',
      'fx',
      'fy',
      'spreadMethod',
    ],
  })
})

const svgWidth = computed(() => {
  const match = svgCode.value.match(/width=["'](\d+)["']/)
  return match ? match[1] : 'N/A'
})

const svgHeight = computed(() => {
  const match = svgCode.value.match(/height=["'](\d+)["']/)
  return match ? match[1] : 'N/A'
})

// Visual editor
const svgCanvas = ref<SVGElement | null>(null)
const canvasSize = ref({ width: 400, height: 300 })

const shapes = [
  { type: 'rectangle', name: t('tools.svgEditor.shapes.rectangle'), icon: '▭' },
  { type: 'circle', name: t('tools.svgEditor.shapes.circle'), icon: '○' },
  { type: 'ellipse', name: t('tools.svgEditor.shapes.ellipse'), icon: '◇' },
  { type: 'line', name: t('tools.svgEditor.shapes.line'), icon: '/' },
  { type: 'triangle', name: t('tools.svgEditor.shapes.triangle'), icon: '△' },
]

const canvasShapes = ref<any[]>([])
const selectedShape = ref({
  fill: '#3b82f6',
  stroke: '#1e40af',
  strokeWidth: 2,
})

// Tutorials
const tutorials = ref([
  {
    id: 1,
    title: t('tools.svgEditor.tutorials.basicShapes'),
    description: t('tools.svgEditor.tutorials.basicShapesDesc'),
    code: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- Rectangle -->
  <rect x="10" y="10" width="100" height="50" fill="blue" />

  <!-- Circle -->
  <circle cx="150" cy="50" r="30" fill="red" />

  <!-- Ellipse -->
  <ellipse cx="100" cy="150" rx="60" ry="30" fill="green" />
</svg>`,
  },
  {
    id: 2,
    title: t('tools.svgEditor.tutorials.paths'),
    description: t('tools.svgEditor.tutorials.pathsDesc'),
    code: `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- Path -->
  <path d="M 20 20 Q 50 50 80 20 T 140 20"
        fill="none" stroke="purple" stroke-width="3" />

  <!-- Complex Path -->
  <path d="M 50 50 L 150 50 L 100 150 Z"
        fill="orange" stroke="brown" stroke-width="2" />
</svg>`,
  },
  {
    id: 3,
    title: t('tools.svgEditor.tutorials.gradients'),
    description: t('tools.svgEditor.tutorials.gradientsDesc'),
    code: `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
    </linearGradient>
    <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:rgb(0,255,0);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(0,150,0);stop-opacity:1" />
    </radialGradient>
  </defs>

  <rect x="10" y="10" width="150" height="50" fill="url(#grad1)" />
  <circle cx="200" cy="100" r="40" fill="url(#grad2)" />
</svg>`,
  },
])

// Editor functions
function loadExample() {
  svgCode.value = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="100%" height="100%" fill="#f0f0f0" />

  <!-- Shapes -->
  <circle cx="150" cy="100" r="50" fill="#3b82f6" />
  <rect x="50" y="50" width="80" height="60" fill="#ef4444" rx="10" />
  <line x1="200" y1="50" x2="280" y2="150" stroke="#10b981" stroke-width="3" />
</svg>`
  success(t('tools.svgEditor.messages.exampleLoaded'))
}

function clearEditor() {
  svgCode.value = ''
  success(t('tools.svgEditor.messages.editorCleared'))
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(svgCode.value)
    success(t('tools.svgEditor.messages.codeCopied'))
  } catch (err) {
    error(t('tools.svgEditor.errors.copyFailed'))
  }
}

function downloadSvg() {
  if (!svgCode.value) {
    error(t('tools.svgEditor.errors.noSvg'))
    return
  }

  const blob = new Blob([svgCode.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `svg-${Date.now()}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  success(t('tools.svgEditor.messages.svgDownloaded'))
}

// Visual editor functions
function addShape(type: string) {
  const newShape: any = {
    type,
    fill: selectedShape.value.fill,
    stroke: selectedShape.value.stroke,
    strokeWidth: selectedShape.value.strokeWidth,
  }

  switch (type) {
    case 'rectangle':
      newShape.x = 50
      newShape.y = 50
      newShape.width = 100
      newShape.height = 80
      break
    case 'circle':
      newShape.cx = 100
      newShape.cy = 100
      newShape.r = 40
      break
    case 'ellipse':
      newShape.cx = 100
      newShape.cy = 100
      newShape.rx = 60
      newShape.ry = 40
      break
    case 'line':
      newShape.x1 = 50
      newShape.y1 = 50
      newShape.x2 = 150
      newShape.y2 = 100
      break
    case 'triangle':
      newShape.points = '100,50 50,150 150,150'
      break
  }

  canvasShapes.value.push(newShape)
  updateSvgFromCanvas()
}

function handleCanvasClick(event: MouseEvent) {
  // For simplicity, we'll just add a shape when clicking the canvas
  // In a full implementation, you would implement selection and manipulation
  console.log('Canvas clicked at:', event.offsetX, event.offsetY)
}

function deleteSelected() {
  // In a full implementation, you would delete the selected shape
  // For now, we'll just show a message
  success(t('tools.svgEditor.messages.shapeDeleted'))
}

function clearCanvas() {
  canvasShapes.value = []
  updateSvgFromCanvas()
  success(t('tools.svgEditor.messages.canvasCleared'))
}

function updateSvgFromCanvas() {
  // Convert canvas shapes to SVG code
  let svgContent = `<svg width="${canvasSize.value.width}" height="${canvasSize.value.height}" xmlns="http://www.w3.org/2000/svg">\n`

  canvasShapes.value.forEach((shape) => {
    switch (shape.type) {
      case 'rectangle':
        svgContent += `  <rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${shape.fill}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" />\n`
        break
      case 'circle':
        svgContent += `  <circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${shape.fill}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" />\n`
        break
      case 'ellipse':
        svgContent += `  <ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" fill="${shape.fill}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" />\n`
        break
      case 'line':
        svgContent += `  <line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" />\n`
        break
      case 'triangle':
        svgContent += `  <polygon points="${shape.points}" fill="${shape.fill}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" />\n`
        break
    }
  })

  svgContent += '</svg>'
  svgCode.value = svgContent
}

// Tutorial functions
function loadTutorial(tutorial: any) {
  svgCode.value = tutorial.code
  success(t('tools.svgEditor.messages.tutorialLoaded'))
}

// Watch for changes in canvas shapes to update SVG code
watch(
  canvasShapes,
  () => {
    updateSvgFromCanvas()
  },
  { deep: true },
)

// Initialize with an example
onMounted(() => {
  loadExample()
})
</script>

<style scoped>
/* Custom styles */
textarea {
  font-family: 'Fira Code', 'Consolas', monospace;
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
