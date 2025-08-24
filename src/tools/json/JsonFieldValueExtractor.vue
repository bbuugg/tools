<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">JSON Field Value Extractor</h1>
      </div>
      <div class="bg-white p-8 rounded-lg border text-center">
        <div class="text-6xl mb-4">🔄</div>
        <h3 class="text-xl font-semibold mb-2">Redirecting...</h3>
        <p class="mb-6 text-gray-600">
          This tool has been integrated into the JSON Keys/Values Extractor.
        </p>
        <button
          @click="goToKeysExtractor"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Go to Keys/Values Extractor
        </button>
        <button
          @click="$router.go(-1)"
          class="ml-4 px-6 py-2 bg-gray-600 text-white rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToKeysExtractor() {
  router.push('/json-tools/json-keys-extractor')
}

// Redirect immediately when the component is loaded
goToKeysExtractor()
</script>
