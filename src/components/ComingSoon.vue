<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <div class="text-6xl mb-4">🚧</div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ toolName }}
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          This tool is coming soon! We're working hard to bring you more amazing development
          utilities.
        </p>
      </div>

      <!-- Coming Soon Card -->
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <div class="text-blue-600 text-4xl mb-4">⏳</div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Under Development</h2>
          <p class="text-gray-600 mb-6">
            We're actively developing this tool to provide you with the best possible experience.
            Check back soon for updates!
          </p>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 class="text-sm font-semibold text-blue-800 mb-2">What to expect:</h3>
            <ul class="text-sm text-blue-700 text-left space-y-1">
              <li>• Intuitive and user-friendly interface</li>
              <li>• Powerful functionality tailored for developers</li>
              <li>• Fast performance and reliable results</li>
              <li>• Modern design with Tailwind CSS</li>
            </ul>
          </div>

          <button
            @click="goBack"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ← Back to Tools
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  toolName: string
}>()

const emit = defineEmits<{
  goBack: []
}>()

function goBack() {
  emit('goBack')
}
</script>
