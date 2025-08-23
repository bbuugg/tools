<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Excel Text to JSON</h1>
        <p class="text-gray-600">Convert Excel clipboard data directly to JSON format</p>
      </div>

      <!-- Coming Soon Card -->
      <div class="bg-white p-8 rounded-lg shadow-sm border text-center">
        <div class="text-6xl mb-4">🚧</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Tool Under Development</h3>
        <p class="text-gray-600 mb-6">
          This JSON tool is currently being developed and will be available soon. We're working hard
          to bring you the best experience!
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 class="font-medium text-blue-900 mb-2">Planned Features:</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li class="flex items-center">
              <span class="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Paste Excel data directly
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Auto-detect data types
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Header recognition
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Real-time conversion
            </li>
          </ul>
        </div>

        <div class="flex justify-center space-x-4">
          <button
            @click="goBack"
            class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Go Back
          </button>
          <button
            @click="viewAvailableTools"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Available Tools
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.go(-1)
}

function viewAvailableTools() {
  router.push('/json-tools/json-formatter')
}
</script>
