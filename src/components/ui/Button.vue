<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses,
      variantClasses,
      'hover-lift',
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- Icon (left) -->
    <component
      v-if="iconLeft && !loading"
      :is="iconLeft"
      :class="['w-4 h-4', $slots.default ? 'mr-2' : '']"
    />

    <!-- Content -->
    <slot />

    <!-- Icon (right) -->
    <component
      v-if="iconRight"
      :is="iconRight"
      :class="['w-4 h-4', $slots.default ? 'ml-2' : '']"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  iconLeft?: any
  iconRight?: any
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    primary:
      'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-lg hover:shadow-glow',
    secondary:
      'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500 border border-slate-600',
    success: 'bg-success-600 hover:bg-success-700 text-white focus:ring-success-500 shadow-lg',
    warning: 'bg-warning-600 hover:bg-warning-700 text-white focus:ring-warning-500 shadow-lg',
    error: 'bg-error-600 hover:bg-error-700 text-white focus:ring-error-500 shadow-lg',
    ghost:
      'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white focus:ring-slate-500 border border-slate-700/50',
  }
  return variants[props.variant]
})
</script>
