<template>
  <div class="space-y-2">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-slate-200">
      {{ label }}
      <span v-if="required" class="text-error-400 ml-1">*</span>
    </label>

    <!-- Input Container -->
    <div class="relative">
      <!-- Left Icon -->
      <div
        v-if="iconLeft"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <component :is="iconLeft" class="h-5 w-5 text-slate-400" />
      </div>

      <!-- Input Field -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="[
          'block w-full transition-all duration-200 bg-slate-800/50 border border-slate-600/50 text-slate-100 placeholder-slate-400',
          'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'rounded-xl px-4 py-3',
          iconLeft ? 'pl-10' : '',
          iconRight ? 'pr-10' : '',
          error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : '',
          success ? 'border-success-500 focus:border-success-500 focus:ring-success-500' : '',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @keydown="$emit('keydown', $event)"
        @keyup="$emit('keyup', $event)"
        v-bind="$attrs"
      />

      <!-- Right Icon -->
      <div v-if="iconRight" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <component :is="iconRight" class="h-5 w-5 text-slate-400" />
      </div>

      <!-- Clear Button -->
      <button
        v-if="clearable && modelValue"
        @click="$emit('update:modelValue', '')"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors duration-200"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Help Text -->
    <p v-if="helpText" class="text-sm text-slate-400">
      {{ helpText }}
    </p>

    <!-- Error Message -->
    <p v-if="error && errorMessage" class="text-sm text-error-400">
      {{ errorMessage }}
    </p>

    <!-- Success Message -->
    <p v-if="success && successMessage" class="text-sm text-success-400">
      {{ successMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  type?: string
  label?: string
  placeholder?: string
  helpText?: string
  errorMessage?: string
  successMessage?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  error?: boolean
  success?: boolean
  iconLeft?: any
  iconRight?: any
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  error: false,
  success: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
  keyup: [event: KeyboardEvent]
}>()

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)
</script>
