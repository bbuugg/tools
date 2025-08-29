<template>
  <div>
    <div
      v-if="isElectron"
      class="electron-titlebar bg-gray-800 text-white flex items-center justify-between h-8 px-2 select-none"
      style="-webkit-app-region: drag"
    >
      <!-- 应用标题 -->
      <div class="flex items-center space-x-2 text-sm">
        <span class="text-lg">🔧</span>
        <span>{{ $t('navigation.tools') }}</span>
      </div>

      <!-- 窗口控制按钮 -->
      <div class="flex items-center" style="-webkit-app-region: no-drag">
        <!-- 最小化按钮 -->
        <button
          @click="minimizeWindow"
          class="window-control-btn hover:bg-gray-600 w-8 h-8 flex items-center justify-center transition-colors"
          title="最小化"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="5" width="8" height="2" />
          </svg>
        </button>

        <!-- 最大化/还原按钮 -->
        <button
          @click="toggleMaximize"
          class="window-control-btn hover:bg-gray-600 w-8 h-8 flex items-center justify-center transition-colors"
          :title="isMaximized ? '还原' : '最大化'"
        >
          <svg v-if="!isMaximized" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect
              x="2"
              y="2"
              width="8"
              height="8"
              stroke="currentColor"
              stroke-width="1"
              fill="none"
            />
          </svg>
          <svg v-else width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect
              x="2"
              y="3"
              width="6"
              height="6"
              stroke="currentColor"
              stroke-width="1"
              fill="none"
            />
            <rect
              x="4"
              y="1"
              width="6"
              height="6"
              stroke="currentColor"
              stroke-width="1"
              fill="none"
            />
          </svg>
        </button>

        <!-- 关闭按钮 -->
        <button
          @click="closeWindow"
          class="window-control-btn hover:bg-red-600 w-8 h-8 flex items-center justify-center transition-colors"
          title="关闭"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path
              d="M2 2 L10 10 M10 2 L2 10"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 检查是否在Electron环境中
const isElectron = ref(false)
const isMaximized = ref(false)

// 声明全局electronAPI类型
declare global {
  interface Window {
    electronAPI?: {
      windowMinimize: () => Promise<void>
      windowMaximize: () => Promise<void>
      windowClose: () => Promise<void>
      windowIsMaximized: () => Promise<boolean>
    }
  }
}

onMounted(async () => {
  // 检查是否在Electron环境中
  isElectron.value = !!window.electronAPI

  if (isElectron.value) {
    // 获取初始最大化状态
    try {
      isMaximized.value = await window.electronAPI!.windowIsMaximized()
    } catch (error) {
      console.error('Failed to get window maximized state:', error)
    }
  }
})

async function minimizeWindow() {
  if (window.electronAPI) {
    try {
      await window.electronAPI.windowMinimize()
    } catch (error) {
      console.error('Failed to minimize window:', error)
    }
  }
}

async function toggleMaximize() {
  if (window.electronAPI) {
    try {
      await window.electronAPI.windowMaximize()
      isMaximized.value = await window.electronAPI.windowIsMaximized()
    } catch (error) {
      console.error('Failed to toggle maximize window:', error)
    }
  }
}

async function closeWindow() {
  if (window.electronAPI) {
    try {
      await window.electronAPI.windowClose()
    } catch (error) {
      console.error('Failed to close window:', error)
    }
  }
}
</script>

<style scoped>
.electron-titlebar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

.window-control-btn {
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  outline: none;
}

.window-control-btn:focus {
  outline: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
