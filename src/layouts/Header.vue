<template>
  <header class="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo and Title -->
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span class="text-2xl font-bold text-blue-600">🔧</span>
            </div>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">Developer Tools</h1>
            <p class="text-blue-100 text-sm">Professional web development utilities</p>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="hidden md:flex space-x-8">
          <button
            v-for="tool in tools"
            :key="tool.id"
            @click="$emit('selectTool', tool.id)"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
              selectedTool === tool.id
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-blue-100 hover:text-white hover:bg-blue-500',
            ]"
          >
            <span class="mr-2">{{ tool.icon }}</span>
            {{ tool.name }}
          </button>
        </nav>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="bg-blue-500 p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-400 transition-colors duration-200"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden pb-4">
        <div class="space-y-2">
          <button
            v-for="tool in tools"
            :key="tool.id"
            @click="selectToolAndCloseMobile(tool.id)"
            :class="[
              'block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
              selectedTool === tool.id
                ? 'bg-white text-blue-600'
                : 'text-blue-100 hover:text-white hover:bg-blue-500',
            ]"
          >
            <span class="mr-2">{{ tool.icon }}</span>
            {{ tool.name }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Tool {
  id: string
  name: string
  icon: string
}

defineProps<{
  tools: Tool[]
  selectedTool: string
}>()

const emit = defineEmits<{
  selectTool: [toolId: string]
}>()

const mobileMenuOpen = ref(false)

function selectToolAndCloseMobile(toolId: string) {
  emit('selectTool', toolId)
  mobileMenuOpen.value = false
}
</script>
