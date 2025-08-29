<template>
  <div class="min-h-screen bg-dark-950 text-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-slate-100 mb-4 text-gradient">
          {{ $t('tools.gitEditor.title') }}
        </h1>
        <p class="text-xl text-slate-400 max-w-3xl mx-auto">
          {{ $t('tools.gitEditor.description') }}
        </p>
      </div>

      <!-- Main Editor Area -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Input Area -->
        <div class="glass rounded-xl p-6 border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-2">
            {{ $t('tools.gitEditor.input') }}
          </h3>
          <div class="space-y-4">
            <!-- Git Command Input -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.gitEditor.command') }}
              </label>
              <input
                v-model="gitCommand"
                type="text"
                placeholder="git commit -m 'message'"
                class="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-100 placeholder-slate-500 transition-all duration-200"
              />
            </div>

            <!-- Commit Message -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.gitEditor.commitMessage') }}
              </label>
              <textarea
                v-model="commitMessage"
                rows="3"
                placeholder="Enter commit message..."
                class="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-100 placeholder-slate-500 transition-all duration-200 resize-vertical"
              ></textarea>
            </div>

            <!-- Branch Name -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.gitEditor.branchName') }}
              </label>
              <input
                v-model="branchName"
                type="text"
                placeholder="main"
                class="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-100 placeholder-slate-500 transition-all duration-200"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4">
              <button
                @click="generateCommand"
                class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all duration-200 cursor-pointer hover-lift flex-1"
              >
                {{ $t('tools.gitEditor.generate') }}
              </button>
              <button
                @click="clearInput"
                class="px-6 py-3 bg-slate-700 text-slate-100 rounded-xl hover:bg-slate-600 transition-all duration-200 cursor-pointer hover-lift"
              >
                {{ $t('common.clear') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Output Area -->
        <div class="glass rounded-xl p-6 border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-2">
            {{ $t('tools.gitEditor.output') }}
          </h3>
          <div class="space-y-4">
            <!-- Generated Command -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.gitEditor.generatedCommand') }}
              </label>
              <div class="relative">
                <pre class="bg-slate-900/80 border border-slate-600/50 rounded-xl p-4 text-sm text-slate-200 overflow-x-auto font-mono"><code>{{ generatedCommand }}</code></pre>
                <button
                  v-if="generatedCommand"
                  @click="copyToClipboard"
                  class="absolute top-2 right-2 p-2 bg-slate-800/80 text-slate-300 hover:text-white rounded-lg transition-all duration-200 cursor-pointer hover-lift"
                  :title="$t('common.copy')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Command Explanation -->
            <div v-if="commandExplanation" class="bg-slate-900/50 border border-slate-600/30 rounded-xl p-4">
              <h4 class="text-sm font-medium text-slate-300 mb-2">
                {{ $t('tools.gitEditor.explanation') }}
              </h4>
              <p class="text-sm text-slate-400 leading-relaxed">
                {{ commandExplanation }}
              </p>
            </div>

            <!-- Quick Actions -->
            <div class="pt-4">
              <h4 class="text-sm font-medium text-slate-300 mb-3">
                {{ $t('tools.gitEditor.quickActions') }}
              </h4>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="action in quickActions"
                  :key="action.command"
                  @click="applyQuickAction(action)"
                  class="px-3 py-2 bg-slate-800/50 text-slate-300 hover:text-white rounded-xl hover:bg-slate-700/50 transition-all duration-200 cursor-pointer hover-lift text-sm font-mono"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Common Git Commands Reference -->
      <div class="glass rounded-xl p-6 border border-slate-700/50">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700/30 pb-2">
          {{ $t('tools.gitEditor.commonCommands') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="command in commonCommands"
            :key="command.name"
            class="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600/70 transition-all duration-200 cursor-pointer hover-lift group"
            @click="applyCommonCommand(command)"
          >
            <h4 class="text-sm font-medium text-slate-100 mb-2 group-hover:text-primary-400 transition-colors duration-200">
              {{ command.name }}
            </h4>
            <p class="text-xs text-slate-400 font-mono mb-2">
              {{ command.command }}
            </p>
            <p class="text-xs text-slate-500 leading-relaxed">
              {{ command.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Feature Descriptions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            🚀 {{ $t('tools.gitEditor.features.efficient.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.gitEditor.features.efficient.description') }}
          </p>
        </div>

        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            🔒 {{ $t('tools.gitEditor.features.secure.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.gitEditor.features.secure.description') }}
          </p>
        </div>

        <div class="glass p-6 rounded-xl border border-slate-700/50">
          <h3 class="text-lg font-semibold text-slate-100 mb-3">
            ⚡ {{ $t('tools.gitEditor.features.learning.title') }}
          </h3>
          <p class="text-slate-400 text-sm">
            {{ $t('tools.gitEditor.features.learning.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { success, error: showError } = useToast()

// State
const gitCommand = ref('')
const commitMessage = ref('')
const branchName = ref('main')
const generatedCommand = ref('')
const commandExplanation = ref('')

// Quick actions for common operations
const quickActions = ref([
  { label: 'Add all', command: 'git add .', explanation: 'Stage all changes' },
  { label: 'Commit', command: 'git commit -m', explanation: 'Commit staged changes' },
  { label: 'Push', command: 'git push', explanation: 'Push commits to remote' },
  { label: 'Pull', command: 'git pull', explanation: 'Pull latest changes' },
  { label: 'Status', command: 'git status', explanation: 'Show working tree status' },
  { label: 'Log', command: 'git log --oneline', explanation: 'Show commit history' }
])

// Common Git commands reference
const commonCommands = ref([
  {
    name: 'Initialize Repository',
    command: 'git init',
    description: 'Initialize a new Git repository'
  },
  {
    name: 'Clone Repository',
    command: 'git clone <url>',
    description: 'Clone a remote repository'
  },
  {
    name: 'Add Files',
    command: 'git add <file>',
    description: 'Stage files for commit'
  },
  {
    name: 'Commit Changes',
    command: 'git commit -m "message"',
    description: 'Commit staged changes with message'
  },
  {
    name: 'Push Changes',
    command: 'git push origin <branch>',
    description: 'Push commits to remote branch'
  },
  {
    name: 'Pull Changes',
    command: 'git pull origin <branch>',
    description: 'Pull latest changes from remote'
  },
  {
    name: 'Create Branch',
    command: 'git branch <branch>',
    description: 'Create a new branch'
  },
  {
    name: 'Switch Branch',
    command: 'git checkout <branch>',
    description: 'Switch to another branch'
  },
  {
    name: 'Merge Branch',
    command: 'git merge <branch>',
    description: 'Merge another branch into current'
  }
])

// Computed properties
const hasInput = computed(() => {
  return gitCommand.value.trim() || commitMessage.value.trim() || branchName.value.trim()
})

// Methods
function generateCommand() {
  if (!gitCommand.value.trim()) {
    showError(t('tools.gitEditor.errors.noCommand'))
    return
  }

  let command = gitCommand.value.trim()
  
  // Process commit message
  if (commitMessage.value.trim()) {
    command = command.replace(/-m\s+['"][^'"]*['"]?/, '') // Remove existing message
    command += ` -m "${commitMessage.value.trim()}"`
  }

  // Process branch name
  if (branchName.value.trim() && branchName.value !== 'main') {
    command = command.replace(/origin\s+\S+/, `origin ${branchName.value}`)
  }

  generatedCommand.value = command
  generateExplanation(command)
}

function generateExplanation(command: string) {
  const explanations: { [key: string]: string } = {
    'git init': t('tools.gitEditor.explanations.init'),
    'git clone': t('tools.gitEditor.explanations.clone'),
    'git add': t('tools.gitEditor.explanations.add'),
    'git commit': t('tools.gitEditor.explanations.commit'),
    'git push': t('tools.gitEditor.explanations.push'),
    'git pull': t('tools.gitEditor.explanations.pull'),
    'git status': t('tools.gitEditor.explanations.status'),
    'git log': t('tools.gitEditor.explanations.log'),
    'git branch': t('tools.gitEditor.explanations.branch'),
    'git checkout': t('tools.gitEditor.explanations.checkout'),
    'git merge': t('tools.gitEditor.explanations.merge'),
    'git fetch': t('tools.gitEditor.explanations.fetch')
  }

  for (const [key, explanation] of Object.entries(explanations)) {
    if (command.includes(key)) {
      commandExplanation.value = explanation
      return
    }
  }

  commandExplanation.value = t('tools.gitEditor.explanations.general')
}

function copyToClipboard() {
  if (!generatedCommand.value) return

  navigator.clipboard.writeText(generatedCommand.value)
    .then(() => {
      success(t('tools.gitEditor.success.copied'))
    })
    .catch(() => {
      showError(t('tools.gitEditor.errors.copyFailed'))
    })
}

function clearInput() {
  gitCommand.value = ''
  commitMessage.value = ''
  branchName.value = 'main'
  generatedCommand.value = ''
  commandExplanation.value = ''
}

function applyQuickAction(action: { command: string; explanation: string }) {
  gitCommand.value = action.command
  commandExplanation.value = action.explanation
}

function applyCommonCommand(command: { command: string; description: string }) {
  gitCommand.value = command.command
  commandExplanation.value = command.description
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hover-lift {
  transition: all 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.resize-vertical {
  resize: vertical;
}

pre code {
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
  line-height: 1.5;
}
</style>