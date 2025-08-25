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

            <!-- History Controls -->
            <h4 class="font-medium text-gray-800 mb-3 mt-6">
              {{ $t('tools.svgEditor.visualEditor.history') }}
            </h4>
            <div class="space-y-2">
              <button
                @click="undo"
                :disabled="historyIndex <= 0"
                class="w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-left text-sm disabled:opacity-50"
              >
                ↶ {{ $t('tools.svgEditor.visualEditor.undo') }}
              </button>
              <button
                @click="redo"
                :disabled="historyIndex >= history.length - 1"
                class="w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-left text-sm disabled:opacity-50"
              >
                ↷ {{ $t('tools.svgEditor.visualEditor.redo') }}
              </button>
            </div>

            <!-- Tools -->
            <h4 class="font-medium text-gray-800 mb-3 mt-6">
              {{ $t('tools.svgEditor.visualEditor.tools') }}
            </h4>
            <div class="space-y-2">
              <button
                @click="deleteSelected"
                :disabled="!selectedShapeId"
                class="w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-left text-sm disabled:opacity-50"
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
            class="md:col-span-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center min-h-96 relative"
          >
            <svg
              ref="svgCanvas"
              :width="canvasSize.width"
              :height="canvasSize.height"
              class="bg-white border border-gray-200"
              @click="handleCanvasClick"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
            >
              <!-- Grid -->
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              <!-- Shapes -->
              <g v-for="shape in canvasShapes" :key="shape.id">
                <!-- Rectangle -->
                <g v-if="shape.type === 'rectangle'">
                  <rect
                    :x="shape.x"
                    :y="shape.y"
                    :width="shape.width"
                    :height="shape.height"
                    :fill="shape.fill"
                    :stroke="shape.stroke"
                    :stroke-width="shape.strokeWidth"
                    :fill-opacity="shape.fillOpacity"
                    :stroke-opacity="shape.strokeOpacity"
                    :transform="`rotate(${shape.rotation || 0} ${shape.x + shape.width / 2} ${shape.y + shape.height / 2})`"
                    @mousedown="startDrag($event, shape.id)"
                    :class="{ 'cursor-move': !isResizing }"
                  />
                  <!-- Resize handles -->
                  <circle
                    v-if="selectedShapeId === shape.id"
                    :cx="shape.x + shape.width"
                    :cy="shape.y + shape.height"
                    r="5"
                    fill="blue"
                    @mousedown="startResize($event, shape.id, 'se')"
                    class="cursor-se-resize"
                  />
                  <!-- Rotate handle -->
                  <circle
                    v-if="selectedShapeId === shape.id"
                    :cx="shape.x + shape.width / 2"
                    :cy="shape.y - 30"
                    r="5"
                    fill="red"
                    @mousedown="startRotate($event, shape.id)"
                    class="cursor-move"
                  />
                </g>

                <!-- Circle -->
                <g v-else-if="shape.type === 'circle'">
                  <circle
                    :cx="shape.cx"
                    :cy="shape.cy"
                    :r="shape.r"
                    :fill="shape.fill"
                    :stroke="shape.stroke"
                    :stroke-width="shape.strokeWidth"
                    :fill-opacity="shape.fillOpacity"
                    :stroke-opacity="shape.strokeOpacity"
                    :transform="`rotate(${shape.rotation || 0} ${shape.cx} ${shape.cy})`"
                    @mousedown="startDrag($event, shape.id)"
                    class="cursor-move"
                  />
                  <!-- Resize handle -->
                  <circle
                    v-if="selectedShapeId === shape.id"
                    :cx="shape.cx + shape.r"
                    :cy="shape.cy"
                    r="5"
                    fill="blue"
                    @mousedown="startResize($event, shape.id, 'e')"
                    class="cursor-ew-resize"
                  />
                  <!-- Rotate handle -->
                  <circle
                    v-if="selectedShapeId === shape.id"
                    :cx="shape.cx"
                    :cy="shape.cy - shape.r - 30"
                    r="5"
                    fill="red"
                    @mousedown="startRotate($event, shape.id)"
                    class="cursor-move"
                  />
                </g>

                <!-- Ellipse -->
                <g v-else-if="shape.type === 'ellipse'">
                  <ellipse
                    :cx="shape.cx"
                    :cy="shape.cy"
                    :rx="shape.rx"
                    :ry="shape.ry"
                    :fill="shape.fill"
                    :stroke="shape.stroke"
                    :stroke-width="shape.strokeWidth"
                    :fill-opacity="shape.fillOpacity"
                    :stroke-opacity="shape.strokeOpacity"
                    :transform="`rotate(${shape.rotation || 0} ${shape.cx} ${shape.cy})`"
                    @mousedown="startDrag($event, shape.id)"
                    class="cursor-move"
                  />
                  <!-- Resize handles -->
                  <circle
                    v-if="selectedShapeId === shape.id"
                    :cx="shape.cx + shape.rx"
                    :cy="shape.cy"
                    r="5"
                    fill="blue"
                    @mousedown="startResize($event, shape.id, 'e')"
                    class="cursor-ew-resize"
                  />
                  <circle
                    v-if="selectedShapeId === shape.id"
                    :cx="shape.cx"
                    :cy="shape.cy + shape.ry"
                    r="5"
                    fill="blue"
                    @mousedown="startResize($event, shape.id, 's')"
                    class="cursor-ns-resize"
                  />
                  <!-- Rotate handle -->
                  <circle
                    v-if="selectedShapeId === shape.id"
                    :cx="shape.cx"
                    :cy="shape.cy - Math.max(shape.rx, shape.ry) - 30"
                    r="5"
                    fill="red"
                    @mousedown="startRotate($event, shape.id)"
                    class="cursor-move"
                  />
                </g>

                <!-- Line -->
                <g v-else-if="shape.type === 'line'">
                  <line
                    :x1="shape.x1"
                    :y1="shape.y1"
                    :x2="shape.x2"
                    :y2="shape.y2"
                    :stroke="shape.stroke"
                    :stroke-width="shape.strokeWidth"
                    :stroke-opacity="shape.strokeOpacity"
                    @mousedown="startDrag($event, shape.id)"
                    class="cursor-move"
                  />
                  <!-- End point handles -->
                  <circle
                    v-if="selectedShapeId === shape.id"
                    :cx="shape.x1"
                    :cy="shape.y1"
                    r="5"
                    fill="blue"
                    @mousedown="startResize($event, shape.id, 'start')"
                    class="cursor-move"
                  />
                  <circle
                    v-if="selectedShapeId === shape.id"
                    :cx="shape.x2"
                    :cy="shape.y2"
                    r="5"
                    fill="blue"
                    @mousedown="startResize($event, shape.id, 'end')"
                    class="cursor-move"
                  />
                  <!-- Rotate handle -->
                  <circle
                    v-if="selectedShapeId === shape.id"
                    :cx="(shape.x1 + shape.x2) / 2"
                    :cy="(shape.y1 + shape.y2) / 2 - 30"
                    r="5"
                    fill="red"
                    @mousedown="startRotate($event, shape.id)"
                    class="cursor-move"
                  />
                </g>

                <!-- Triangle -->
                <g v-else-if="shape.type === 'triangle'">
                  <polygon
                    :points="shape.points"
                    :fill="shape.fill"
                    :stroke="shape.stroke"
                    :stroke-width="shape.strokeWidth"
                    :fill-opacity="shape.fillOpacity"
                    :stroke-opacity="shape.strokeOpacity"
                    :transform="`rotate(${shape.rotation || 0} ${getTriangleCenter(shape.points).x} ${getTriangleCenter(shape.points).y})`"
                    @mousedown="startDrag($event, shape.id)"
                    class="cursor-move"
                  />
                  <!-- Rotate handle -->
                  <circle
                    v-if="selectedShapeId === shape.id"
                    :cx="getTriangleCenter(shape.points).x"
                    :cy="getTriangleCenter(shape.points).y - 30"
                    r="5"
                    fill="red"
                    @mousedown="startRotate($event, shape.id)"
                    class="cursor-move"
                  />
                </g>

                <!-- Path (Curve) -->
                <g v-else-if="shape.type === 'path'">
                  <path
                    :d="shape.d"
                    :fill="shape.fill"
                    :stroke="shape.stroke"
                    :stroke-width="shape.strokeWidth"
                    :fill-opacity="shape.fillOpacity"
                    :stroke-opacity="shape.strokeOpacity"
                    @mousedown="startDrag($event, shape.id)"
                    class="cursor-move"
                  />
                  <!-- Control points for curve adjustment -->
                  <template v-for="(point, index) in getControlPointsForShape(shape)" :key="index">
                    <circle
                      :cx="point.x"
                      :cy="point.y"
                      r="4"
                      fill="red"
                      @mousedown="startControlPointDrag($event, shape.id, index)"
                      class="cursor-move"
                    />
                  </template>
                </g>
              </g>
            </svg>
          </div>

          <!-- Properties Panel -->
          <div class="md:col-span-1">
            <h4 class="font-medium text-gray-800 mb-3">
              {{ $t('tools.svgEditor.visualEditor.properties') }}
            </h4>
            <div class="space-y-4" v-if="selectedShape">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.svgEditor.visualEditor.fill') }}
                </label>
                <input
                  v-model="selectedShape.fill"
                  type="color"
                  class="w-full h-10 border border-gray-300 rounded"
                />
                <input
                  v-model="selectedShape.fillOpacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-full mt-1"
                />
                <div class="text-xs text-gray-500 text-right">
                  {{ Math.round(selectedShape.fillOpacity * 100) }}%
                </div>
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
                <input
                  v-model="selectedShape.strokeOpacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-full mt-1"
                />
                <div class="text-xs text-gray-500 text-right">
                  {{ Math.round(selectedShape.strokeOpacity * 100) }}%
                </div>
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
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('tools.svgEditor.visualEditor.rotation') }}
                </label>
                <input
                  v-model.number="selectedShape.rotation"
                  type="range"
                  min="0"
                  max="360"
                  class="w-full"
                />
                <div class="text-xs text-gray-500 text-right">{{ selectedShape.rotation }}°</div>
              </div>
            </div>
            <div v-else class="text-gray-500 text-sm">
              {{ $t('tools.svgEditor.visualEditor.noSelection') }}
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

// Define types
interface BaseShape {
  id: string
  type: string
  fill: string
  fillOpacity: number
  stroke: string
  strokeOpacity: number
  strokeWidth: number
  rotation: number
}

interface RectangleShape extends BaseShape {
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
}

interface CircleShape extends BaseShape {
  type: 'circle'
  cx: number
  cy: number
  r: number
}

interface EllipseShape extends BaseShape {
  type: 'ellipse'
  cx: number
  cy: number
  rx: number
  ry: number
}

interface LineShape extends BaseShape {
  type: 'line'
  x1: number
  y1: number
  x2: number
  y2: number
}

interface TriangleShape extends BaseShape {
  type: 'triangle'
  points: string
}

interface ControlPoint {
  x: number
  y: number
}

interface PathShape extends BaseShape {
  type: 'path'
  d: string
  controlPoints: ControlPoint[]
}

type Shape = RectangleShape | CircleShape | EllipseShape | LineShape | TriangleShape | PathShape

interface DragState {
  startX: number
  startY: number
  shapeId: string
  resizeDirection: string
  controlPointIndex: number
}

interface Tutorial {
  id: number
  title: string
  description: string
  code: string
}

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
  { type: 'path', name: t('tools.svgEditor.shapes.path'), icon: '⌒' },
]

// Shape management
const canvasShapes = ref<Shape[]>([])
const selectedShapeId = ref<string | null>(null)
const selectedShape = computed(() => {
  return canvasShapes.value.find((shape) => shape.id === selectedShapeId.value) || null
})

const getControlPointsForShape = computed(() => {
  return (shape: Shape) => {
    if (shape.type === 'path' && selectedShapeId.value === shape.id) {
      return (shape as PathShape).controlPoints || []
    }
    return []
  }
})

// Drag and resize state
const isDragging = ref(false)
const isResizing = ref(false)
const isRotating = ref(false)
const isControlPointDragging = ref(false)
const dragState = ref<DragState>({
  startX: 0,
  startY: 0,
  shapeId: '',
  resizeDirection: '',
  controlPointIndex: -1,
})

// History management
const history = ref<Shape[][]>([])
const historyIndex = ref(-1)

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
    navigator.clipboard.writeText(svgCode.value)
    success(t('tools.svgEditor.messages.codeCopied'))
  } catch (_err) {
    // Error handling
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
  let newShape: Shape

  switch (type) {
    case 'rectangle':
      newShape = {
        id: `shape-${Date.now()}`,
        type: 'rectangle',
        x: 50,
        y: 50,
        width: 100,
        height: 80,
        fill: '#3b82f6',
        fillOpacity: 1,
        stroke: '#1e40af',
        strokeOpacity: 1,
        strokeWidth: 2,
        rotation: 0,
      } as RectangleShape
      break
    case 'circle':
      newShape = {
        id: `shape-${Date.now()}`,
        type: 'circle',
        cx: 100,
        cy: 100,
        r: 40,
        fill: '#3b82f6',
        fillOpacity: 1,
        stroke: '#1e40af',
        strokeOpacity: 1,
        strokeWidth: 2,
        rotation: 0,
      } as CircleShape
      break
    case 'ellipse':
      newShape = {
        id: `shape-${Date.now()}`,
        type: 'ellipse',
        cx: 100,
        cy: 100,
        rx: 60,
        ry: 40,
        fill: '#3b82f6',
        fillOpacity: 1,
        stroke: '#1e40af',
        strokeOpacity: 1,
        strokeWidth: 2,
        rotation: 0,
      } as EllipseShape
      break
    case 'line':
      newShape = {
        id: `shape-${Date.now()}`,
        type: 'line',
        x1: 50,
        y1: 50,
        x2: 150,
        y2: 100,
        fill: '#3b82f6',
        fillOpacity: 1,
        stroke: '#1e40af',
        strokeOpacity: 1,
        strokeWidth: 2,
        rotation: 0,
      } as LineShape
      break
    case 'triangle':
      newShape = {
        id: `shape-${Date.now()}`,
        type: 'triangle',
        points: '100,50 50,150 150,150',
        fill: '#3b82f6',
        fillOpacity: 1,
        stroke: '#1e40af',
        strokeOpacity: 1,
        strokeWidth: 2,
        rotation: 0,
      } as TriangleShape
      break
    case 'path':
      newShape = {
        id: `shape-${Date.now()}`,
        type: 'path',
        d: 'M 50 100 C 75 50, 125 150, 150 100',
        controlPoints: [
          { x: 50, y: 100 },
          { x: 75, y: 50 },
          { x: 125, y: 150 },
          { x: 150, y: 100 },
        ],
        fill: '#3b82f6',
        fillOpacity: 1,
        stroke: '#1e40af',
        strokeOpacity: 1,
        strokeWidth: 2,
        rotation: 0,
      } as PathShape
      break
    default:
      throw new Error(`Unknown shape type: ${type}`)
  }

  canvasShapes.value.push(newShape)
  saveToHistory()
  updateSvgFromCanvas()
}

function getTriangleCenter(points: string) {
  const coords = points.split(' ').map((p: string) => {
    const [x, y] = p.split(',').map(Number)
    return { x, y }
  })

  const centerX = coords.reduce((sum, point) => sum + point.x, 0) / coords.length
  const centerY = coords.reduce((sum, point) => sum + point.y, 0) / coords.length

  return { x: centerX, y: centerY }
}

function handleCanvasClick(_event: MouseEvent) {
  // Deselect if clicking on empty space
  selectedShapeId.value = null
}

function startDrag(event: MouseEvent, shapeId: string) {
  event.preventDefault()
  isDragging.value = true
  selectedShapeId.value = shapeId
  dragState.value = {
    startX: event.clientX,
    startY: event.clientY,
    shapeId,
    resizeDirection: '',
    controlPointIndex: -1,
  }
}

function startResize(event: MouseEvent, shapeId: string, direction: string) {
  event.preventDefault()
  event.stopPropagation()
  isResizing.value = true
  selectedShapeId.value = shapeId
  dragState.value = {
    startX: event.clientX,
    startY: event.clientY,
    shapeId,
    resizeDirection: direction,
    controlPointIndex: -1,
  }
}

function startRotate(event: MouseEvent, shapeId: string) {
  event.preventDefault()
  event.stopPropagation()
  isRotating.value = true
  selectedShapeId.value = shapeId
  dragState.value = {
    startX: event.clientX,
    startY: event.clientY,
    shapeId,
    resizeDirection: '',
    controlPointIndex: -1,
  }
}

function startControlPointDrag(event: MouseEvent, shapeId: string, index: number) {
  event.preventDefault()
  event.stopPropagation()
  isControlPointDragging.value = true
  selectedShapeId.value = shapeId
  dragState.value = {
    startX: event.clientX,
    startY: event.clientY,
    shapeId,
    resizeDirection: '',
    controlPointIndex: index,
  }
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value && !isResizing.value && !isRotating.value && !isControlPointDragging.value)
    return

  const shape = canvasShapes.value.find((s) => s.id === dragState.value.shapeId)
  if (!shape) return

  const dx = event.clientX - dragState.value.startX
  const dy = event.clientY - dragState.value.startY

  if (isDragging.value) {
    // Move shape
    switch (shape.type) {
      case 'rectangle':
        shape.x += dx
        shape.y += dy
        break
      case 'circle':
        shape.cx += dx
        shape.cy += dy
        break
      case 'ellipse':
        shape.cx += dx
        shape.cy += dy
        break
      case 'line':
        shape.x1 += dx
        shape.y1 += dy
        shape.x2 += dx
        shape.y2 += dy
        break
      case 'triangle':
        const points = shape.points.split(' ')
        shape.points = points
          .map((point) => {
            const [x, y] = point.split(',').map(Number)
            return `${x + dx},${y + dy}`
          })
          .join(' ')
        break
      case 'path':
        // Move all control points
        if (shape.controlPoints) {
          shape.controlPoints.forEach((point: { x: number; y: number }) => {
            point.x += dx
            point.y += dy
          })
          updatePathData(shape)
        }
        break
    }
  } else if (isResizing.value) {
    // Resize shape
    switch (shape.type) {
      case 'rectangle':
        if (dragState.value.resizeDirection === 'se') {
          shape.width += dx
          shape.height += dy
        }
        break
      case 'circle':
        if (dragState.value.resizeDirection === 'e') {
          shape.r += dx
        }
        break
      case 'ellipse':
        if (dragState.value.resizeDirection === 'e') {
          shape.rx += dx
        } else if (dragState.value.resizeDirection === 's') {
          shape.ry += dy
        }
        break
      case 'line':
        if (dragState.value.resizeDirection === 'start') {
          shape.x1 += dx
          shape.y1 += dy
        } else if (dragState.value.resizeDirection === 'end') {
          shape.x2 += dx
          shape.y2 += dy
        }
        break
    }
  } else if (isRotating.value) {
    // Rotate shape
    let centerX, centerY
    switch (shape.type) {
      case 'rectangle':
        centerX = shape.x + shape.width / 2
        centerY = shape.y + shape.height / 2
        break
      case 'circle':
        centerX = shape.cx
        centerY = shape.cy
        break
      case 'ellipse':
        centerX = shape.cx
        centerY = shape.cy
        break
      case 'line':
        centerX = (shape.x1 + shape.x2) / 2
        centerY = (shape.y1 + shape.y2) / 2
        break
      case 'triangle':
        const center = getTriangleCenter(shape.points)
        centerX = center.x
        centerY = center.y
        break
      default:
        return
    }

    // Calculate angle between center and mouse position
    const angle = (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) / Math.PI
    shape.rotation = angle
  } else if (isControlPointDragging.value) {
    // Move control point for paths
    if (shape.type === 'path' && shape.controlPoints) {
      const point = shape.controlPoints[dragState.value.controlPointIndex]
      if (point) {
        point.x += dx
        point.y += dy
        // Update the path data based on control points
        updatePathData(shape)
      }
    }
  }

  dragState.value.startX = event.clientX
  dragState.value.startY = event.clientY
  updateSvgFromCanvas()
}

function updatePathData(shape: PathShape) {
  // Create a smooth curve path using all control points
  if (shape.controlPoints && shape.controlPoints.length >= 2) {
    const points = shape.controlPoints
    let pathData = `M ${points[0].x} ${points[0].y}`

    // If we have more than 2 points, create a smooth curve
    if (points.length >= 3) {
      // Start with the first point
      pathData = `M ${points[0].x} ${points[0].y}`

      // For each subsequent point, create a cubic bezier curve
      for (let i = 1; i < points.length; i++) {
        if (i < points.length - 1) {
          // Calculate control points for smooth curve
          const current = points[i]
          const next = points[i + 1]

          // Control point 1 (start control point)
          const cx1 = current.x
          const cy1 = current.y

          // Control point 2 (end control point)
          const cx2 = next.x
          const cy2 = next.y

          // Add cubic bezier curve
          pathData += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${next.x} ${next.y}`
        }
      }
    } else {
      // For just two points, create a straight line
      pathData += ` L ${points[1].x} ${points[1].y}`
    }

    shape.d = pathData
  }
}

function handleMouseUp() {
  if (isDragging.value || isResizing.value || isRotating.value || isControlPointDragging.value) {
    isDragging.value = false
    isResizing.value = false
    isRotating.value = false
    isControlPointDragging.value = false
    saveToHistory()
  }
}

function deleteSelected() {
  if (!selectedShapeId.value) return

  const index = canvasShapes.value.findIndex((shape) => shape.id === selectedShapeId.value)
  if (index !== -1) {
    canvasShapes.value.splice(index, 1)
    selectedShapeId.value = null
    saveToHistory()
    updateSvgFromCanvas()
    success(t('tools.svgEditor.messages.shapeDeleted'))
  }
}

function clearCanvas() {
  canvasShapes.value = []
  selectedShapeId.value = null
  saveToHistory()
  updateSvgFromCanvas()
  success(t('tools.svgEditor.messages.canvasCleared'))
}

// History management
function saveToHistory() {
  // Remove any future history if we're not at the end
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }

  // Save current state
  history.value.push(JSON.parse(JSON.stringify(canvasShapes.value)))
  historyIndex.value = history.value.length - 1
}

function undo() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    canvasShapes.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    updateSvgFromCanvas()
  }
}

function redo() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    canvasShapes.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    updateSvgFromCanvas()
  }
}

function updateSvgFromCanvas() {
  // Convert canvas shapes to SVG code
  let svgContent = `<svg width="${canvasSize.value.width}" height="${canvasSize.value.height}" xmlns="http://www.w3.org/2000/svg">\n`

  canvasShapes.value.forEach((shape) => {
    switch (shape.type) {
      case 'rectangle':
        svgContent += `  <rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${shape.fill}" fill-opacity="${shape.fillOpacity}" stroke="${shape.stroke}" stroke-opacity="${shape.strokeOpacity}" stroke-width="${shape.strokeWidth}" transform="rotate(${shape.rotation || 0} ${shape.x + shape.width / 2} ${shape.y + shape.height / 2})" />\n`
        break
      case 'circle':
        svgContent += `  <circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${shape.fill}" fill-opacity="${shape.fillOpacity}" stroke="${shape.stroke}" stroke-opacity="${shape.strokeOpacity}" stroke-width="${shape.strokeWidth}" transform="rotate(${shape.rotation || 0} ${shape.cx} ${shape.cy})" />\n`
        break
      case 'ellipse':
        svgContent += `  <ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" fill="${shape.fill}" fill-opacity="${shape.fillOpacity}" stroke="${shape.stroke}" stroke-opacity="${shape.strokeOpacity}" stroke-width="${shape.strokeWidth}" transform="rotate(${shape.rotation || 0} ${shape.cx} ${shape.cy})" />\n`
        break
      case 'line':
        svgContent += `  <line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" stroke="${shape.stroke}" stroke-opacity="${shape.strokeOpacity}" stroke-width="${shape.strokeWidth}" transform="rotate(${shape.rotation || 0} ${(shape.x1 + shape.x2) / 2} ${(shape.y1 + shape.y2) / 2})" />\n`
        break
      case 'triangle':
        const center = getTriangleCenter(shape.points)
        svgContent += `  <polygon points="${shape.points}" fill="${shape.fill}" fill-opacity="${shape.fillOpacity}" stroke="${shape.stroke}" stroke-opacity="${shape.strokeOpacity}" stroke-width="${shape.strokeWidth}" transform="rotate(${shape.rotation || 0} ${center.x} ${center.y})" />\n`
        break
      case 'path':
        svgContent += `  <path d="${shape.d}" fill="${shape.fill}" fill-opacity="${shape.fillOpacity}" stroke="${shape.stroke}" stroke-opacity="${shape.strokeOpacity}" stroke-width="${shape.strokeWidth}" />\n`
        break
    }
  })

  svgContent += '</svg>'
  svgCode.value = svgContent
}

// Tutorial functions
function loadTutorial(tutorial: Tutorial) {
  svgCode.value = tutorial.code
  success(t('tools.svgEditor.messages.tutorialLoaded'))
}

// Initialize with an example
onMounted(() => {
  loadExample()
  // Save initial state to history
  saveToHistory()
})

// Watch for changes in canvas shapes to update SVG code
watch(
  canvasShapes,
  () => {
    updateSvgFromCanvas()
  },
  { deep: true },
)

// Watch for changes in selected shape properties
watch(
  selectedShape,
  () => {
    if (selectedShape.value) {
      updateSvgFromCanvas()
    }
  },
  { deep: true },
)
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
