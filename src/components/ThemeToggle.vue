<template>
  <button
    @click="toggleTheme"
    :class="[
      'w-full p-3 rounded-xl transition-all duration-300 flex items-center space-x-3 cursor-pointer hover-lift group',
      'dark:bg-slate-800/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70',
      'bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-300/80'
    ]"
    :title="theme === 'dark' ? $t('theme.switchToLight') : $t('theme.switchToDark')"
  >
    <transition
      enter-active-class="transition-all duration-300"
      leave-active-class="transition-all duration-300"
      enter-from-class="opacity-0 rotate-180 scale-0"
      enter-to-class="opacity-100 rotate-0 scale-100"
      leave-from-class="opacity-100 rotate-0 scale-100"
      leave-to-class="opacity-0 -rotate-180 scale-0"
      mode="out-in"
    >
      <!-- Sun Icon (Light Mode) -->
      <svg
        v-if="theme === 'dark'"
        key="sun"
        class="w-5 h-5 group-hover:scale-110 transition-transform duration-200 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <!-- Moon Icon (Dark Mode) -->
      <svg
        v-else
        key="moon"
        class="w-5 h-5 group-hover:scale-110 transition-transform duration-200 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </transition>
    <span class="text-sm font-medium">{{ theme === 'dark' ? $t('theme.switchToLight') : $t('theme.switchToDark') }}</span>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>
