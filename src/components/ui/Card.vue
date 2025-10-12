<template>
  <div
    :class="[
      'glass rounded-2xl border border-slate-700/30 transition-all duration-200',
      hover ? 'hover:border-slate-600/50 hover:shadow-glow hover-lift cursor-pointer' : '',
      padding ? paddingClasses : '',
      shadow ? 'shadow-dark-lg' : ''
    ]"
    @click="$emit('click', $event)"
  >
    <!-- Header -->
    <div v-if="$slots.header || title" :class="['border-b border-slate-700/30', headerPadding]">
      <slot name="header">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div v-if="icon" class="text-2xl">{{ icon }}</div>
            <div>
              <h3 class="text-lg font-semibold text-slate-100">{{ title }}</h3>
              <p v-if="subtitle" class="text-sm text-slate-400">{{ subtitle }}</p>
            </div>
          </div>
          <slot name="header-actions"></slot>
        </div>
      </slot>
    </div>

    <!-- Content -->
    <div :class="contentPadding">
      <slot></slot>
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" :class="['border-t border-slate-700/30', footerPadding]">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  icon?: string
  hover?: boolean
  padding?: boolean
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hover: false,
  padding: true,
  shadow: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const paddingClasses = computed(() => props.padding ? 'p-6' : '')
const headerPadding = computed(() => props.padding ? 'p-6 pb-4' : 'p-4')
const contentPadding = computed(() => {
  if (!props.padding) return ''
  if (props.$slots?.header || props.title) return 'px-6 pb-6'
  return 'p-6'
})
const footerPadding = computed(() => props.padding ? 'p-6 pt-4' : 'p-4')
</script>
