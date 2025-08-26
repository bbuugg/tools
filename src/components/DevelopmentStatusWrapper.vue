<template>
  <div>
    <!-- Show ComingSoon if tool is under development and we're in production -->
    <ComingSoon v-if="shouldShowComingSoon" />
    <!-- Show the actual tool component otherwise -->
    <component :is="toolComponent" v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import ComingSoon from './ComingSoon.vue'

interface Props {
  toolComponent: Component
  status?: string
}

const props = withDefaults(defineProps<Props>(), {
  status: 'active'
})

// Check if we're in development mode
const isDevelopment = computed(() => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development'
})

// Determine if we should show the ComingSoon component
const shouldShowComingSoon = computed(() => {
  // If tool status is 'under_development' and we're not in development mode
  return props.status === 'under_development' && !isDevelopment.value
})
</script>
