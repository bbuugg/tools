<template>
  <div class="color-picker-tool">
    <div class="glass rounded-xl shadow-dark-xl p-6 mb-8 border border-slate-700/30">
      <h2 class="text-2xl font-bold text-slate-100 mb-2">{{ $t('tools.colorPicker.title') }}</h2>
      <p class="text-slate-400 mb-6">{{ $t('tools.colorPicker.description') }}</p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Color Picker Section -->
        <div class="space-y-6">
          <div class="glass p-6 rounded-xl border border-slate-700/30">
            <h3 class="text-lg font-semibold text-slate-100 mb-4">
              {{ $t('tools.colorPicker.colorPicker') }}
            </h3>

            <!-- Main Color Picker -->
            <div class="mb-6">
              <div
                class="w-full h-32 rounded-lg mb-4 cursor-pointer border-2 border-slate-600 hover:border-slate-400 transition-colors"
                :style="{ backgroundColor: currentColor.hex }" @click="openColorPicker"></div>
              <input ref="colorPickerInput" type="color" v-model="currentColor.hex" class="hidden"
                @input="onHexChange" />
            </div>

            <!-- Slider Mode Selector -->
            <div class="mb-4">
              <div class="flex flex-wrap gap-2 mb-2">
                <button @click="sliderMode = 'rgba'" :class="[
                  'px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
                  sliderMode === 'rgba'
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100',
                ]">
                  RGBA
                </button>
                <button @click="sliderMode = 'hsl'" :class="[
                  'px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
                  sliderMode === 'hsl'
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100',
                ]">
                  HSL
                </button>
                <button @click="sliderMode = 'hsv'" :class="[
                  'px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
                  sliderMode === 'hsv'
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100',
                ]">
                  HSV
                </button>
                <button @click="sliderMode = 'cmyk'" :class="[
                  'px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
                  sliderMode === 'cmyk'
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100',
                ]">
                  CMYK
                </button>
              </div>
            </div>

            <!-- Dynamic Sliders based on mode -->
            <div class="space-y-4">
              <!-- RGBA Sliders -->
              <div v-if="sliderMode === 'rgba'">
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">R</span>
                    <span class="text-sm text-slate-400">{{ currentColor.rgb.r }}</span>
                  </div>
                  <input type="range" min="0" max="255" :value="currentColor.rgb.r" @input="onRgbRChange"
                    class="w-full h-2 bg-red-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-red-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">G</span>
                    <span class="text-sm text-slate-400">{{ currentColor.rgb.g }}</span>
                  </div>
                  <input type="range" min="0" max="255" :value="currentColor.rgb.g" @input="onRgbGChange"
                    class="w-full h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-green-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">B</span>
                    <span class="text-sm text-slate-400">{{ currentColor.rgb.b }}</span>
                  </div>
                  <input type="range" min="0" max="255" :value="currentColor.rgb.b" @input="onRgbBChange"
                    class="w-full h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-blue-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">A</span>
                    <span class="text-sm text-slate-400">{{
                      parseFloat(String(currentColor.rgb.a)).toFixed(2)
                    }}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" :value="currentColor.rgb.a"
                    @input="onAlphaSliderChange"
                    class="w-full h-2 bg-slate-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-slate-500" />
                </div>
              </div>

              <!-- HSL Sliders -->
              <div v-else-if="sliderMode === 'hsl'">
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">H</span>
                    <span class="text-sm text-slate-400">{{ currentColor.hsl.h }}</span>
                  </div>
                  <input type="range" min="0" max="360" :value="currentColor.hsl.h" @input="onHslHChange"
                    class="w-full h-2 bg-red-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-red-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">S</span>
                    <span class="text-sm text-slate-400">{{ currentColor.hsl.s }}</span>
                  </div>
                  <input type="range" min="0" max="100" :value="currentColor.hsl.s" @input="onHslSChange"
                    class="w-full h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-green-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">L</span>
                    <span class="text-sm text-slate-400">{{ currentColor.hsl.l }}</span>
                  </div>
                  <input type="range" min="0" max="100" :value="currentColor.hsl.l" @input="onHslLChange"
                    class="w-full h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-blue-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">A</span>
                    <span class="text-sm text-slate-400">{{
                      parseFloat(String(currentColor.rgb.a)).toFixed(2)
                    }}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" :value="currentColor.rgb.a"
                    @input="onAlphaSliderChange"
                    class="w-full h-2 bg-slate-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-slate-500" />
                </div>
              </div>

              <!-- HSV Sliders -->
              <div v-else-if="sliderMode === 'hsv'">
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">H</span>
                    <span class="text-sm text-slate-400">{{ currentColor.hsv.h }}</span>
                  </div>
                  <input type="range" min="0" max="360" :value="currentColor.hsv.h" @input="onHsvHChange"
                    class="w-full h-2 bg-red-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-red-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">S</span>
                    <span class="text-sm text-slate-400">{{ currentColor.hsv.s }}</span>
                  </div>
                  <input type="range" min="0" max="100" :value="currentColor.hsv.s" @input="onHsvSChange"
                    class="w-full h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-green-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">V</span>
                    <span class="text-sm text-slate-400">{{ currentColor.hsv.v }}</span>
                  </div>
                  <input type="range" min="0" max="100" :value="currentColor.hsv.v" @input="onHsvVChange"
                    class="w-full h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-blue-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">A</span>
                    <span class="text-sm text-slate-400">{{
                      parseFloat(String(currentColor.rgb.a)).toFixed(2)
                    }}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" :value="currentColor.rgb.a"
                    @input="onAlphaSliderChange"
                    class="w-full h-2 bg-slate-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-slate-500" />
                </div>
              </div>

              <!-- CMYK Sliders -->
              <div v-else-if="sliderMode === 'cmyk'">
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">C</span>
                    <span class="text-sm text-slate-400">{{ currentColor.cmyk.c }}</span>
                  </div>
                  <input type="range" min="0" max="100" :value="currentColor.cmyk.c" @input="onCmykCChange"
                    class="w-full h-2 bg-red-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-red-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">M</span>
                    <span class="text-sm text-slate-400">{{ currentColor.cmyk.m }}</span>
                  </div>
                  <input type="range" min="0" max="100" :value="currentColor.cmyk.m" @input="onCmykMChange"
                    class="w-full h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-green-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">Y</span>
                    <span class="text-sm text-slate-400">{{ currentColor.cmyk.y }}</span>
                  </div>
                  <input type="range" min="0" max="100" :value="currentColor.cmyk.y" @input="onCmykYChange"
                    class="w-full h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-blue-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">K</span>
                    <span class="text-sm text-slate-400">{{ currentColor.cmyk.k }}</span>
                  </div>
                  <input type="range" min="0" max="100" :value="currentColor.cmyk.k" @input="onCmykKChange"
                    class="w-full h-2 bg-slate-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-slate-500" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-slate-300">A</span>
                    <span class="text-sm text-slate-400">{{
                      parseFloat(String(currentColor.rgb.a)).toFixed(2)
                    }}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" :value="currentColor.rgb.a"
                    @input="onAlphaSliderChange"
                    class="w-full h-2 bg-slate-500/20 rounded-lg appearance-none cursor-pointer slider-fix accent-slate-500" />
                </div>
              </div>
            </div>
          </div>

          <!-- Image Color Picker -->
          <div class="glass p-6 rounded-xl border border-slate-700/30">
            <h3 class="text-lg font-semibold text-slate-100 mb-4">
              {{ $t('tools.colorPicker.imagePicker') }}
            </h3>

            <!-- Image input area (hidden when image is loaded) -->
            <div v-if="!imagePreview"
              class="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer mb-4 hover:border-slate-400 transition-colors"
              @drop="handleImageDrop" @dragover.prevent @click="openImageSelector"
              :class="{ 'border-primary-500 bg-primary-500/10': isImageDragging }">
              <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageSelect" />
              <div class="space-y-2">
                <div class="text-2xl">🎨</div>
                <p class="text-slate-400">{{ $t('tools.colorPicker.dropImage') }}</p>
                <button
                  class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-glow">
                  {{ $t('tools.colorPicker.selectImage') }}
                </button>
              </div>
            </div>

            <!-- Image preview and color picker (shown when image is loaded) -->
            <div v-else>
              <div class="flex flex-wrap justify-between items-center mb-2 gap-2">
                <p class="text-sm text-slate-400">{{ $t('tools.colorPicker.imagePreview') }}</p>
                <div class="flex flex-wrap gap-2">
                  <button @click="activateColorPicker" :class="[
                    'px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
                    isColorPickerActive
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-primary-500 text-white hover:bg-primary-600 shadow-glow',
                  ]">
                    {{
                      isColorPickerActive
                        ? $t('tools.colorPicker.cancelPick')
                        : $t('tools.colorPicker.pickColor')
                    }}
                  </button>
                  <button @click="clearImage"
                    class="px-3 py-1.5 text-sm bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors">
                    {{ $t('common.clear') }}
                  </button>
                </div>
              </div>
              <div class="relative">
                <img referrerpolicy="no-referrer" :src="imagePreview" alt="Preview" class="max-w-full h-auto rounded-lg"
                  :class="{ 'cursor-crosshair': isColorPickerActive }" @click="pickColorFromImage"
                  @mousemove="handleMouseMove" @mouseleave="hideMagnifier" ref="previewImage" />
                <!-- Magnifier Canvas -->
                <canvas v-show="showMagnifier && isColorPickerActive" ref="magnifierCanvas"
                  class="absolute border-2 border-white shadow-lg rounded-lg pointer-events-none" :style="{
                    width: magnifierSize + 'px',
                    height: magnifierSize + 'px',
                    left: magnifierPosition.x + 'px',
                    top: magnifierPosition.y + 'px',
                    transform: 'translate(-50%, -50%)',
                  }"></canvas>
                <!-- Crosshair -->
                <div v-show="showMagnifier && isColorPickerActive"
                  class="absolute w-4 h-4 border-2 border-white pointer-events-none" :style="{
                    left: crosshairPosition.x + 'px',
                    top: crosshairPosition.y + 'px',
                    transform: 'translate(-50%, -50%)',
                  }"></div>
              </div>
              <p v-if="isColorPickerActive" class="text-sm text-slate-400 mt-2">
                {{ $t('tools.colorPicker.clickToPick') }}
                <br />
                {{ $t('tools.colorPicker.keepPickingUntilCancel') }}
              </p>

              <!-- Re-select image options -->
              <div class="mt-4 flex flex-wrap gap-2">
                <button @click="openImageSelector"
                  class="px-3 py-1.5 text-sm bg-slate-700/50 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors">
                  {{ $t('tools.colorPicker.selectImage') }}
                </button>
                <button @click="pasteFromClipboard"
                  class="px-3 py-1.5 text-sm bg-slate-700/50 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors">
                  {{ $t('common.paste') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Color Information Section -->
        <div class="space-y-6">
          <!-- Common Colors -->
          <div class="glass p-6 rounded-xl border border-slate-700/30">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-slate-100">
                {{ $t('tools.colorPicker.commonColors') }}
              </h3>
              <button @click="openModal"
                class="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-glow">
                {{ $t('common.more') }}
              </button>
            </div>
            <div class="grid grid-cols-6 gap-2">
              <div v-for="color in commonColors" :key="color"
                class="w-8 h-8 rounded-lg cursor-pointer border border-slate-600 hover:scale-110 transition-transform hover:border-slate-400"
                :style="{ backgroundColor: color }" @click="selectCommonColor(color)"></div>
            </div>
          </div>

          <!-- Common Colors Modal -->
          <div v-if="showModal"
            class="fixed inset-0 bg-slate-950/70 flex justify-center items-center z-[9999] backdrop-blur-sm"
            @click="closeModal" data-testid="color-modal">
            <div
              class="glass rounded-xl shadow-2xl border border-slate-700/50 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto"
              @click.stop>
              <div
                class="p-4 pb-2 flex justify-between items-center sticky top-0 bg-slate-900/80 border-b border-slate-700/30 backdrop-blur-sm">
                <h1 class="text-lg text-slate-100 font-semibold">
                  {{ $t('tools.colorPicker.commonColors') }}
                </h1>
                <button type="button" @click="closeModal"
                  class="inline-grid place-items-center border align-middle select-none font-sans font-medium text-center transition-all duration-300 ease-in disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none data-[shape=circular]:rounded-full text-sm min-w-[34px] min-h-[34px] rounded-md bg-transparent border-transparent text-slate-400 hover:bg-slate-800/50 hover:border-slate-700/50 shadow-none hover:shadow-none outline-none"
                  aria-label="Close">
                  <svg width="1.5em" height="1.5em" stroke-width="1.5" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg" color="currentColor" class="h-5 w-5">
                    <path
                      d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426"
                      stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </button>
              </div>
              <div class="p-4">
                <div class="space-y-6">
                  <div v-for="colorGroup in materialColors" :key="colorGroup.name" class="space-y-2"
                    data-testid="color-group">
                    <h2 class="text-md font-medium text-slate-100">{{ colorGroup.name }}</h2>
                    <div class="grid grid-cols-10 gap-2">
                      <div v-for="color in colorGroup.colors" :key="color"
                        class="w-8 h-8 rounded-lg cursor-pointer border border-slate-600 hover:scale-110 transition-transform hover:border-slate-400"
                        :style="{ backgroundColor: color }" @click="selectMaterialColor(color)" :title="color"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="p-4 flex justify-end gap-2 sticky bottom-0 bg-slate-900/80 border-t border-slate-700/30 backdrop-blur-sm">
                <button type="button" @click="closeModal"
                  class="inline-flex items-center justify-center border align-middle select-none font-sans font-medium text-center transition-all duration-300 ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[width=full]:w-full focus:shadow-none text-sm rounded-lg py-2 px-4 bg-transparent border-transparent text-red-400 hover:bg-red-500/10 hover:border-red-500/10 shadow-none hover:shadow-none outline-none">
                  {{ $t('common.close') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Color Values -->
          <div class="glass p-6 rounded-xl border border-slate-700/30">
            <h3 class="text-lg font-semibold text-slate-100 mb-4">
              {{ $t('tools.colorPicker.conversions') }}
            </h3>

            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span class="font-medium text-slate-200">HEX</span>
                <div class="flex items-center space-x-2">
                  <input v-model="inputValues.hex" type="text"
                    class="w-40 px-3 py-1.5 text-sm bg-slate-800/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
                    @input="onHexInputValueChange" />
                  <button @click="copyToClipboard(currentColor.hex)"
                    class="px-3 py-1.5 text-xs bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors">
                    {{ $t('common.copy') }}
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span class="font-medium text-slate-200">RGB</span>
                <div class="flex items-center space-x-2">
                  <input v-model="inputValues.rgb" type="text"
                    class="w-48 px-3 py-1.5 text-sm bg-slate-800/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
                    @input="onRgbInputValueChange" />
                  <button @click="
                    copyToClipboard(
                      `rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`,
                    )
                    "
                    class="px-3 py-1.5 text-xs bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors">
                    {{ $t('common.copy') }}
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span class="font-medium text-slate-200">RGBA</span>
                <div class="flex items-center space-x-2">
                  <input v-model="inputValues.rgba" type="text"
                    class="w-52 px-3 py-1.5 text-sm bg-slate-800/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
                    @input="onRgbaInputValueChange" />
                  <button @click="
                    copyToClipboard(
                      `rgba(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b}, ${parseFloat(String(currentColor.rgb.a)).toFixed(2)})`,
                    )
                    "
                    class="px-3 py-1.5 text-xs bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors">
                    {{ $t('common.copy') }}
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span class="font-medium text-slate-200">HSL</span>
                <div class="flex items-center space-x-2">
                  <input v-model="inputValues.hsl" type="text"
                    class="w-52 px-3 py-1.5 text-sm bg-slate-800/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
                    @input="onHslInputValueChange" />
                  <button @click="
                    copyToClipboard(
                      `hsl(${Math.round(currentColor.hsl.h)}, ${Math.round(currentColor.hsl.s)}%, ${Math.round(currentColor.hsl.l)}%)`,
                    )
                    "
                    class="px-3 py-1.5 text-xs bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors">
                    {{ $t('common.copy') }}
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span class="font-medium text-slate-200">HSV</span>
                <div class="flex items-center space-x-2">
                  <input v-model="inputValues.hsv" type="text"
                    class="w-52 px-3 py-1.5 text-sm bg-slate-800/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
                    @input="onHsvInputValueChange" />
                  <button @click="
                    copyToClipboard(
                      `hsv(${Math.round(currentColor.hsv.h)}, ${Math.round(currentColor.hsv.s)}%, ${Math.round(currentColor.hsv.v)}%)`,
                    )
                    "
                    class="px-3 py-1.5 text-xs bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors">
                    {{ $t('common.copy') }}
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span class="font-medium text-slate-200">CMYK</span>
                <div class="flex items-center space-x-2">
                  <input v-model="inputValues.cmyk" type="text"
                    class="w-56 px-3 py-1.5 text-sm bg-slate-800/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-100"
                    @input="onCmykInputValueChange" />
                  <button @click="
                    copyToClipboard(
                      `cmyk(${Math.round(currentColor.cmyk.c)}%, ${Math.round(currentColor.cmyk.m)}%, ${Math.round(currentColor.cmyk.y)}%, ${Math.round(currentColor.cmyk.k)}%)`,
                    )
                    "
                    class="px-3 py-1.5 text-xs bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors">
                    {{ $t('common.copy') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview Section -->
          <div class="glass p-6 rounded-xl border border-slate-700/30">
            <h3 class="text-lg font-semibold text-slate-100 mb-4">
              {{ $t('tools.colorPicker.preview') }}
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-slate-400 mb-2">{{ $t('tools.colorPicker.onLight') }}</p>
                <div class="h-20 rounded-lg border flex items-center justify-center border-slate-600"
                  style="background-color: #f1f5f9">
                  <div class="w-16 h-16 rounded-lg" :style="{ backgroundColor: currentColor.hex }"></div>
                </div>
              </div>
              <div>
                <p class="text-sm text-slate-400 mb-2">{{ $t('tools.colorPicker.onDark') }}</p>
                <div class="h-20 rounded-lg border flex items-center justify-center border-slate-600"
                  style="background-color: #1e293b">
                  <div class="w-16 h-16 rounded-lg" :style="{ backgroundColor: currentColor.hex }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="glass rounded-xl shadow-dark-xl p-6 border border-slate-700/30">
      <h2 class="text-xl font-bold text-slate-100 mb-4">
        {{ $t('tools.colorPicker.features.title') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-primary-500/10 p-5 rounded-xl border-l-4 border-primary-500">
          <h3 class="text-lg font-semibold text-slate-100 mb-2">
            🎨 {{ $t('tools.colorPicker.features.conversions.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.colorPicker.features.conversions.description') }}
          </p>
        </div>
        <div class="bg-green-500/10 p-5 rounded-xl border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-slate-100 mb-2">
            📸 {{ $t('tools.colorPicker.features.imagePicker.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.colorPicker.features.imagePicker.description') }}
          </p>
        </div>
        <div class="bg-purple-500/10 p-5 rounded-xl border-l-4 border-purple-500">
          <h3 class="text-lg font-semibold text-slate-100 mb-2">
            📋 {{ $t('tools.colorPicker.features.commonColors.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.colorPicker.features.commonColors.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

// Types
interface RGB {
  r: number
  g: number
  b: number
  a: number
}

interface HSL {
  h: number
  s: number
  l: number
}

interface HSV {
  h: number
  s: number
  v: number
}

interface CMYK {
  c: number
  m: number
  y: number
  k: number
}

interface Color {
  hex: string
  rgb: RGB
  hsl: HSL
  hsv: HSV
  cmyk: CMYK
}

interface InputValues {
  hex: string
  rgb: string
  rgba: string
  hsl: string
  hsv: string
  cmyk: string
}

interface MagnifierPosition {
  x: number
  y: number
}

interface CrosshairPosition {
  x: number
  y: number
}

// Composables
const { t } = useI18n()
const { success, error: showError } = useToast()

// Refs
const colorPickerInput = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const previewImage = ref<HTMLImageElement | null>(null)
const magnifierCanvas = ref<HTMLCanvasElement | null>(null)
const imagePreview = ref<string | null>(null)
const isImageDragging = ref(false)
const isColorPickerActive = ref(false)

// Magnifier refs
const showMagnifier = ref(false)
const magnifierPosition = reactive<MagnifierPosition>({ x: 0, y: 0 })
const crosshairPosition = reactive<CrosshairPosition>({ x: 0, y: 0 })
const magnifierSize = ref(150) // Size of the magnifier in pixels
const magnificationLevel = ref(5) // Zoom level

// Reactive state
const currentColor = reactive<Color>({
  hex: '#3b82f6',
  rgb: { r: 59, g: 130, b: 246, a: 1 },
  hsl: { h: 217, s: 91, l: 60 },
  hsv: { h: 217, s: 76, v: 96 },
  cmyk: { c: 76, m: 47, y: 0, k: 4 },
})

const inputValues = reactive<InputValues>({
  hex: '#3b82f6',
  rgb: 'rgb(59, 130, 246)',
  rgba: 'rgba(59, 130, 246, 1.00)',
  hsl: 'hsl(217, 91%, 60%)',
  hsv: 'hsv(217, 76%, 96%)',
  cmyk: 'cmyk(76%, 47%, 0%, 4%)',
})

// Slider mode state
const sliderMode = ref<'rgba' | 'hsl' | 'hsv' | 'cmyk'>('rgba')

// Common colors
const commonColors = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
  '#000000',
  '#ffffff',
  '#f4f4f5',
]

// Modal state
const showModal = ref(false)

// Material Design color palette
const materialColors = [
  {
    name: 'Red',
    colors: [
      '#FFEBEE',
      '#FFCDD2',
      '#EF9A9A',
      '#E57373',
      '#EF5350',
      '#F44336',
      '#E53935',
      '#D32F2F',
      '#C62828',
      '#B71C1C',
    ],
  },
  {
    name: 'Pink',
    colors: [
      '#FCE4EC',
      '#F8BBD0',
      '#F48FB1',
      '#F06292',
      '#EC407A',
      '#E91E63',
      '#D81B60',
      '#C2185B',
      '#AD1457',
      '#880E4F',
    ],
  },
  {
    name: 'Purple',
    colors: [
      '#F3E5F5',
      '#E1BEE7',
      '#CE93D8',
      '#BA68C8',
      '#AB47BC',
      '#9C27B0',
      '#8E24AA',
      '#7B1FA2',
      '#6A1B9A',
      '#4A148C',
    ],
  },
  {
    name: 'Deep Purple',
    colors: [
      '#EDE7F6',
      '#D1C4E9',
      '#B39DDB',
      '#9575CD',
      '#7E57C2',
      '#673AB7',
      '#5E35B1',
      '#512DA8',
      '#4527A0',
      '#311B92',
    ],
  },
  {
    name: 'Indigo',
    colors: [
      '#E8EAF6',
      '#C5CAE9',
      '#9FA8DA',
      '#7986CB',
      '#5C6BC0',
      '#3F51B5',
      '#3949AB',
      '#303F9F',
      '#283593',
      '#1A237E',
    ],
  },
  {
    name: 'Blue',
    colors: [
      '#E3F2FD',
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#2196F3',
      '#1E88E5',
      '#1976D2',
      '#1565C0',
      '#0D47A1',
    ],
  },
  {
    name: 'Light Blue',
    colors: [
      '#E1F5FE',
      '#B3E5FC',
      '#81D4FA',
      '#4FC3F7',
      '#29B6F6',
      '#03A9F4',
      '#039BE5',
      '#0288D1',
      '#0277BD',
      '#01579B',
    ],
  },
  {
    name: 'Cyan',
    colors: [
      '#E0F7FA',
      '#B2EBF2',
      '#80DEEA',
      '#4DD0E1',
      '#26C6DA',
      '#00BCD4',
      '#00ACC1',
      '#0097A7',
      '#00838F',
      '#006064',
    ],
  },
  {
    name: 'Teal',
    colors: [
      '#E0F2F1',
      '#B2DFDB',
      '#80CBC4',
      '#4DB6AC',
      '#26A69A',
      '#009688',
      '#00897B',
      '#00796B',
      '#00695C',
      '#004D40',
    ],
  },
  {
    name: 'Green',
    colors: [
      '#E8F5E9',
      '#C8E6C9',
      '#A5D6A7',
      '#81C784',
      '#66BB6A',
      '#4CAF50',
      '#43A047',
      '#388E3C',
      '#2E7D32',
      '#1B5E20',
    ],
  },
  {
    name: 'Light Green',
    colors: [
      '#F1F8E9',
      '#DCEDC8',
      '#C5E1A5',
      '#AED581',
      '#9CCC65',
      '#8BC34A',
      '#7CB342',
      '#689F38',
      '#558B2F',
      '#33691E',
    ],
  },
  {
    name: 'Lime',
    colors: [
      '#F9FBE7',
      '#FFF9C4',
      '#FFF59D',
      '#FFF176',
      '#FFEE58',
      '#FFEB3B',
      '#FDD835',
      '#FBC02D',
      '#F9A825',
      '#F57F17',
    ],
  },
  {
    name: 'Yellow',
    colors: [
      '#FFFDE7',
      '#FFF9C4',
      '#FFF59D',
      '#FFF176',
      '#FFEE58',
      '#FFEB3B',
      '#FDD835',
      '#FBC02D',
      '#F9A825',
      '#F57F17',
    ],
  },
  {
    name: 'Amber',
    colors: [
      '#FFF8E1',
      '#FFECB3',
      '#FFE082',
      '#FFD54F',
      '#FFCA28',
      '#FFC107',
      '#FFB300',
      '#FFA000',
      '#FF8F00',
      '#FF6F00',
    ],
  },
  {
    name: 'Orange',
    colors: [
      '#FFF3E0',
      '#FFE0B2',
      '#FFCC80',
      '#FFB74D',
      '#FFA726',
      '#FF9800',
      '#FB8C00',
      '#F57C00',
      '#EF6C00',
      '#E65100',
    ],
  },
  {
    name: 'Deep Orange',
    colors: [
      '#FBE9E7',
      '#FFCCBC',
      '#FFAB91',
      '#FF8A65',
      '#FF7043',
      '#FF5722',
      '#F4511E',
      '#E64A19',
      '#D84315',
      '#BF360C',
    ],
  },
  {
    name: 'Brown',
    colors: [
      '#EFEBE9',
      '#D7CCC8',
      '#BCAAA4',
      '#A1887F',
      '#8D6E63',
      '#795548',
      '#6D4C41',
      '#5D4037',
      '#4E342E',
      '#3E2723',
    ],
  },
  {
    name: 'Grey',
    colors: [
      '#FAFAFA',
      '#F5F5F5',
      '#EEEEEE',
      '#E0E0E0',
      '#BDBDBD',
      '#9E9E9E',
      '#757575',
      '#616161',
      '#424242',
      '#212121',
    ],
  },
  {
    name: 'Blue Grey',
    colors: [
      '#ECEFF1',
      '#CFD8DC',
      '#B0BEC5',
      '#90A4AE',
      '#78909C',
      '#607D8B',
      '#546E7A',
      '#455A64',
      '#37474F',
      '#263238',
    ],
  },
]

// Watch for color changes to update input values
watch(currentColor, () => {
  updateInputValues()
})

// Helper functions
const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 1,
    }
    : { r: 0, g: 0, b: 0, a: 1 }
}

const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  let s

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h! /= 6
  }

  return {
    h: Math.round(h! * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

const hslToRgb = (h: number, s: number, l: number): RGB => {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r! * 255),
    g: Math.round(g! * 255),
    b: Math.round(b! * 255),
    a: 1,
  }
}

const rgbToHsv = (r: number, g: number, b: number): HSV => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const v = max
  const s = max === 0 ? 0 : (max - min) / max

  if (max === min) {
    h = 0 // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / (max - min) + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / (max - min) + 2
        break
      case b:
        h = (r - g) / (max - min) + 4
        break
    }

    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  }
}

const hsvToRgb = (h: number, s: number, v: number): RGB => {
  h /= 360
  s /= 100
  v /= 100

  let r = 0,
    g = 0,
    b = 0

  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: 1,
  }
}

const rgbToCmyk = (r: number, g: number, b: number): CMYK => {
  // Convert RGB to CMY
  let c = 1 - r / 255
  let m = 1 - g / 255
  let y = 1 - b / 255

  // Find K (black key)
  const k = Math.min(c, m, y)

  // Convert to CMYK
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 }
  }

  c = (c - k) / (1 - k)
  m = (m - k) / (1 - k)
  y = (y - k) / (1 - k)

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  }
}

const cmykToRgb = (c: number, m: number, y: number, k: number): RGB => {
  c /= 100
  m /= 100
  y /= 100
  k /= 100

  const r = 255 * (1 - c) * (1 - k)
  const g = 255 * (1 - m) * (1 - k)
  const b = 255 * (1 - y) * (1 - k)

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
    a: 1,
  }
}

// Update all color representations
const updateAllColors = () => {
  // Update HSL
  const hsl = rgbToHsl(currentColor.rgb.r, currentColor.rgb.g, currentColor.rgb.b)
  currentColor.hsl = hsl

  // Update HSV
  const hsv = rgbToHsv(currentColor.rgb.r, currentColor.rgb.g, currentColor.rgb.b)
  currentColor.hsv = hsv

  // Update CMYK
  const cmyk = rgbToCmyk(currentColor.rgb.r, currentColor.rgb.g, currentColor.rgb.b)
  currentColor.cmyk = cmyk

  // Update HEX
  currentColor.hex = rgbToHex(currentColor.rgb.r, currentColor.rgb.g, currentColor.rgb.b)

  // Update input values
  updateInputValues()
}

// Update input values for display
const updateInputValues = () => {
  inputValues.hex = currentColor.hex
  inputValues.rgb = `rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`
  inputValues.rgba = `rgba(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b}, ${parseFloat(String(currentColor.rgb.a)).toFixed(2)})`
  inputValues.hsl = `hsl(${Math.round(currentColor.hsl.h)}, ${Math.round(currentColor.hsl.s)}%, ${Math.round(currentColor.hsl.l)}%)`
  inputValues.hsv = `hsv(${Math.round(currentColor.hsv.h)}, ${Math.round(currentColor.hsv.s)}%, ${Math.round(currentColor.hsv.v)}%)`
  inputValues.cmyk = `cmyk(${Math.round(currentColor.cmyk.c)}%, ${Math.round(currentColor.cmyk.m)}%, ${Math.round(currentColor.cmyk.y)}%, ${Math.round(currentColor.cmyk.k)}%)`
}

// Event handlers
const openColorPicker = () => {
  if (colorPickerInput.value) {
    colorPickerInput.value.click()
  }
}

const onHexChange = () => {
  const rgb = hexToRgb(currentColor.hex)
  currentColor.rgb = { ...rgb, a: currentColor.rgb.a }
  updateAllColors()
}

const onRgbChange = () => {
  updateAllColors()
}

const onAlphaChange = () => {
  // Ensure alpha is a number
  currentColor.rgb.a = parseFloat(String(currentColor.rgb.a)) || 0
  updateAllColors()
}

// New event handlers for individual slider changes
const onRgbRChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  currentColor.rgb.r = parseInt(target.value)
  onRgbChange()
}

const onRgbGChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  currentColor.rgb.g = parseInt(target.value)
  onRgbChange()
}

const onRgbBChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  currentColor.rgb.b = parseInt(target.value)
  onRgbChange()
}

const onAlphaSliderChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  currentColor.rgb.a = parseFloat(target.value)
  onAlphaChange()
}

const onHslChange = () => {
  // Ensure values are within valid ranges
  currentColor.hsl.h = Math.max(0, Math.min(360, currentColor.hsl.h))
  currentColor.hsl.s = Math.max(0, Math.min(100, currentColor.hsl.s))
  currentColor.hsl.l = Math.max(0, Math.min(100, currentColor.hsl.l))

  const rgb = hslToRgb(currentColor.hsl.h, currentColor.hsl.s, currentColor.hsl.l)
  currentColor.rgb = { ...rgb, a: currentColor.rgb.a }
  updateAllColors()
}

const onHslHChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  // Ensure value doesn't exceed max (360) or go below min (0)
  const newHsl = { ...currentColor.hsl, h: Math.min(360, Math.max(0, value)) }
  currentColor.hsl = newHsl
  onHslChange()
}

const onHslSChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  // Ensure value doesn't exceed max (100) or go below min (0)
  const newHsl = { ...currentColor.hsl, s: Math.min(100, Math.max(0, value)) }
  currentColor.hsl = newHsl
  onHslChange()
}

const onHslLChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  // Ensure value doesn't exceed max (100) or go below min (0)
  const newHsl = { ...currentColor.hsl, l: Math.min(100, Math.max(0, value)) }
  currentColor.hsl = newHsl
  onHslChange()
}

const onHsvChange = () => {
  // Ensure values are within valid ranges
  currentColor.hsv.h = Math.max(0, Math.min(360, currentColor.hsv.h))
  currentColor.hsv.s = Math.max(0, Math.min(100, currentColor.hsv.s))
  currentColor.hsv.v = Math.max(0, Math.min(100, currentColor.hsv.v))

  const rgb = hsvToRgb(currentColor.hsv.h, currentColor.hsv.s, currentColor.hsv.v)
  currentColor.rgb = { ...rgb, a: currentColor.rgb.a }
  updateAllColors()
}

const onHsvHChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  // Ensure value doesn't exceed max (360) or go below min (0)
  const newHsv = { ...currentColor.hsv, h: Math.min(360, Math.max(0, value)) }
  currentColor.hsv = newHsv
  onHsvChange()
}

const onHsvSChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  // Ensure value doesn't exceed max (100) or go below min (0)
  const newHsv = { ...currentColor.hsv, s: Math.min(100, Math.max(0, value)) }
  currentColor.hsv = newHsv
  onHsvChange()
}

const onHsvVChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  // Ensure value doesn't exceed max (100) or go below min (0)
  const newHsv = { ...currentColor.hsv, v: Math.min(100, Math.max(0, value)) }
  currentColor.hsv = newHsv
  onHsvChange()
}

const onCmykChange = () => {
  // Ensure values are within valid ranges
  currentColor.cmyk.c = Math.max(0, Math.min(100, currentColor.cmyk.c))
  currentColor.cmyk.m = Math.max(0, Math.min(100, currentColor.cmyk.m))
  currentColor.cmyk.y = Math.max(0, Math.min(100, currentColor.cmyk.y))
  currentColor.cmyk.k = Math.max(0, Math.min(100, currentColor.cmyk.k))

  const rgb = cmykToRgb(
    currentColor.cmyk.c,
    currentColor.cmyk.m,
    currentColor.cmyk.y,
    currentColor.cmyk.k,
  )
  currentColor.rgb = { ...rgb, a: currentColor.rgb.a }
  updateAllColors()
}

const onCmykCChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  // Ensure value doesn't exceed max (100) or go below min (0)
  const newCmyk = { ...currentColor.cmyk, c: Math.min(100, Math.max(0, value)) }
  currentColor.cmyk = newCmyk
  onCmykChange()
}

const onCmykMChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  // Ensure value doesn't exceed max (100) or go below min (0)
  const newCmyk = { ...currentColor.cmyk, m: Math.min(100, Math.max(0, value)) }
  currentColor.cmyk = newCmyk
  onCmykChange()
}

const onCmykYChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  // Ensure value doesn't exceed max (100) or go below min (0)
  const newCmyk = { ...currentColor.cmyk, y: Math.min(100, Math.max(0, value)) }
  currentColor.cmyk = newCmyk
  onCmykChange()
}

const onCmykKChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  // Ensure value doesn't exceed max (100) or go below min (0)
  const newCmyk = { ...currentColor.cmyk, k: Math.min(100, Math.max(0, value)) }
  currentColor.cmyk = newCmyk
  onCmykChange()
}

const selectCommonColor = (color: string) => {
  currentColor.hex = color
  const rgb = hexToRgb(color)
  currentColor.rgb = { ...rgb, a: currentColor.rgb.a }
  updateAllColors()
}

// Modal functions
const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const selectMaterialColor = (color: string) => {
  selectCommonColor(color)
  closeModal()
}

const openImageSelector = () => {
  if (imageInput.value) {
    imageInput.value.click()
  }
}

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
      isColorPickerActive.value = false
    }

    reader.readAsDataURL(file)
    input.value = '' // Reset input to allow selecting the same file again
  }
}

const handleImageDrop = (event: DragEvent) => {
  event.preventDefault()
  isImageDragging.value = false

  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    if (file.type.match('image.*')) {
      const reader = new FileReader()

      reader.onload = (e) => {
        imagePreview.value = e.target?.result as string
        isColorPickerActive.value = false
      }

      reader.readAsDataURL(file)
    }
  }
}

// New function to handle paste from clipboard
const pasteFromClipboard = async () => {
  try {
    const clipboardItems = await navigator.clipboard.read()
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          const blob = await clipboardItem.getType(type)
          const reader = new FileReader()
          reader.onload = (e) => {
            imagePreview.value = e.target?.result as string
            isColorPickerActive.value = false
          }
          reader.readAsDataURL(blob)
          return
        }
      }
    }
    showError(t('tools.colorPicker.noImageInClipboard'))
  } catch {
    showError(t('tools.colorPicker.pasteFailed'))
  }
}

// New function to clear the loaded image
const clearImage = () => {
  imagePreview.value = null
  isColorPickerActive.value = false
}

const activateColorPicker = () => {
  isColorPickerActive.value = !isColorPickerActive.value
}

// Magnifier functions
const handleMouseMove = (event: MouseEvent) => {
  if (!isColorPickerActive.value || !previewImage.value || !imagePreview.value) return

  const img = previewImage.value
  const rect = img.getBoundingClientRect()

  // Update crosshair position
  crosshairPosition.x = event.clientX - rect.left
  crosshairPosition.y = event.clientY - rect.top

  // Update magnifier position (offset to avoid obstruction)
  magnifierPosition.x = event.clientX - rect.left + 80
  magnifierPosition.y = event.clientY - rect.top - 80

  // Show magnifier
  showMagnifier.value = true

  // Draw magnified view
  drawMagnifiedView(event)
}

const hideMagnifier = () => {
  showMagnifier.value = false
}

const drawMagnifiedView = (event: MouseEvent) => {
  if (!previewImage.value || !magnifierCanvas.value) return

  const img = previewImage.value
  const canvas = magnifierCanvas.value
  const ctx = canvas.getContext('2d')

  if (!ctx) return

  const rect = img.getBoundingClientRect()

  // Calculate the correct coordinates accounting for image scaling
  const xRatio = img.naturalWidth / rect.width
  const yRatio = img.naturalHeight / rect.height
  const x = Math.floor((event.clientX - rect.left) * xRatio)
  const y = Math.floor((event.clientY - rect.top) * yRatio)

  // Set canvas dimensions
  const size = magnifierSize.value
  canvas.width = size
  canvas.height = size

  // Draw magnified portion
  const magnification = magnificationLevel.value
  const sourceSize = size / magnification

  // Draw the magnified image
  ctx.drawImage(
    img,
    x - sourceSize / 2,
    y - sourceSize / 2,
    sourceSize,
    sourceSize,
    0,
    0,
    size,
    size,
  )

  // Draw crosshair in the center
  const center = size / 2
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(center, center - 10)
  ctx.lineTo(center, center + 10)
  ctx.moveTo(center - 10, center)
  ctx.lineTo(center + 10, center)
  ctx.stroke()

  // Draw border
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, size, size)
}

const pickColorFromImage = (event: MouseEvent) => {
  if (!isColorPickerActive.value || !previewImage.value || !imagePreview.value) return

  const img = previewImage.value
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return

  // Draw the image at its natural size on the canvas
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)

  // Calculate the correct coordinates accounting for image scaling
  const rect = img.getBoundingClientRect()
  const xRatio = img.naturalWidth / rect.width
  const yRatio = img.naturalHeight / rect.height
  const x = Math.floor((event.clientX - rect.left) * xRatio)
  const y = Math.floor((event.clientY - rect.top) * yRatio)

  // Ensure coordinates are within bounds
  const boundedX = Math.max(0, Math.min(img.naturalWidth - 1, x))
  const boundedY = Math.max(0, Math.min(img.naturalHeight - 1, y))

  try {
    const pixelData = ctx.getImageData(boundedX, boundedY, 1, 1).data
    const r = pixelData[0]
    const g = pixelData[1]
    const b = pixelData[2]

    // Ensure alpha is a number to prevent toFixed error
    const alpha = parseFloat(String(currentColor.rgb.a)) || 1
    currentColor.rgb = { r, g, b, a: alpha }
    updateAllColors()

    success(t('tools.colorPicker.colorPicked'))
    // Keep the color picker active for repeated picking
    // isColorPickerActive.value = false
  } catch (error) {
    console.error('Color picking error:', error)
    showError(t('tools.colorPicker.colorPickError'))
  }
}

// Input value change handlers with validation
const onHexInputValueChange = () => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (!hexRegex.test(inputValues.hex)) {
    // Don't show error, just don't update if format is invalid
    return
  }

  currentColor.hex = inputValues.hex
  const rgb = hexToRgb(currentColor.hex)
  currentColor.rgb = { ...rgb, a: currentColor.rgb.a }
  updateAllColors()
}

const onRgbInputValueChange = () => {
  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
  const match = inputValues.rgb.match(rgbRegex)

  if (!match || match.length !== 4) {
    // Don't show error, just don't update if format is invalid
    return
  }

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])

  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    // Don't show error, just don't update if values are out of range
    return
  }

  currentColor.rgb = { ...currentColor.rgb, r, g, b }
  updateAllColors()
}

const onRgbaInputValueChange = () => {
  const rgbaRegex =
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0\.\d+|1\.0+)\s*\)$/
  const match = inputValues.rgba.match(rgbaRegex)

  if (!match || match.length !== 5) {
    // Don't show error, just don't update if format is invalid
    return
  }

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  const a = parseFloat(match[4])

  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) {
    // Don't show error, just don't update if values are out of range
    return
  }

  currentColor.rgb = { r, g, b, a }
  updateAllColors()
}

const onHslInputValueChange = () => {
  const hslRegex = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/
  const match = inputValues.hsl.match(hslRegex)

  if (!match || match.length !== 4) {
    // Don't show error, just don't update if format is invalid
    return
  }

  const h = parseInt(match[1])
  const s = parseInt(match[2])
  const l = parseInt(match[3])

  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
    // Don't show error, just don't update if values are out of range
    return
  }

  const rgb = hslToRgb(h, s, l)
  currentColor.rgb = { ...rgb, a: currentColor.rgb.a }
  updateAllColors()
}

const onHsvInputValueChange = () => {
  const hsvRegex = /^hsv\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/
  const match = inputValues.hsv.match(hsvRegex)

  if (!match || match.length !== 4) {
    // Don't show error, just don't update if format is invalid
    return
  }

  const h = parseInt(match[1])
  const s = parseInt(match[2])
  const v = parseInt(match[3])

  if (h < 0 || h > 360 || s < 0 || s > 100 || v < 0 || v > 100) {
    // Don't show error, just don't update if values are out of range
    return
  }

  const rgb = hsvToRgb(h, s, v)
  currentColor.rgb = { ...rgb, a: currentColor.rgb.a }
  updateAllColors()
}

const onCmykInputValueChange = () => {
  const cmykRegex = /^cmyk\(\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/
  const match = inputValues.cmyk.match(cmykRegex)

  if (!match || match.length !== 5) {
    // Don't show error, just don't update if format is invalid
    return
  }

  const c = parseInt(match[1])
  const m = parseInt(match[2])
  const y = parseInt(match[3])
  const k = parseInt(match[4])

  if (c < 0 || c > 100 || m < 0 || m > 100 || y < 0 || y > 100 || k < 0 || k > 100) {
    // Don't show error, just don't update if values are out of range
    return
  }

  const rgb = cmykToRgb(c, m, y, k)
  currentColor.rgb = { ...rgb, a: currentColor.rgb.a }
  updateAllColors()
}

const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      success(t('toast.copied'))
    })
    .catch(() => {
      showError(t('toast.copyFailed'))
    })
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('dragover', (e) => {
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  })

  window.addEventListener('drop', (e) => {
    e.preventDefault()
  })

  // Add paste event listener for direct image paste
  window.addEventListener('paste', handlePasteEvent)

  // Initialize input values
  updateInputValues()
})

onUnmounted(() => {
  window.removeEventListener('dragover', () => { })
  window.removeEventListener('drop', () => { })
  window.removeEventListener('paste', handlePasteEvent)
})

// Handle direct paste event
const handlePasteEvent = (e: ClipboardEvent) => {
  // Prevent default paste behavior
  e.preventDefault()

  // Check for clipboard data
  if (!e.clipboardData) {
    return
  }

  // Check for files in clipboard
  if (e.clipboardData.files && e.clipboardData.files.length > 0) {
    const file = e.clipboardData.files[0]
    if (file.type.match('image.*')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        imagePreview.value = event.target?.result as string
        isColorPickerActive.value = false
      }
      reader.readAsDataURL(file)
      return
    }
  }

  // Check for image data in clipboard items (for newer browsers)
  if (e.clipboardData.items) {
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      const item = e.clipboardData.items[i]
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            imagePreview.value = event.target?.result as string
            isColorPickerActive.value = false
          }
          reader.readAsDataURL(file)
          return
        }
      }
    }
  }
}
</script>

<style scoped>
/* Custom slider thumb styling to fix drag issues */
.slider-fix::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-fix::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-fix:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.slider-fix:focus::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
</style>
