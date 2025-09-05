<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 text-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-slate-100 mb-4 text-gradient">
          {{ $t('tools.jwtTool.title') }}
        </h1>
        <p class="text-xl text-slate-300 max-w-3xl mx-auto">
          {{ $t('tools.jwtTool.description') }}
        </p>
      </div>

      <!-- Toggle Switch -->
      <div class="flex justify-center mb-8">
        <div class="inline-flex rounded-xl shadow-dark-lg" role="group">
          <button
            type="button"
            @click="activeTab = 'encode'"
            :class="[
              'px-6 py-3 text-sm font-medium rounded-l-xl transition-all duration-200 cursor-pointer hover-lift',
              activeTab === 'encode'
                ? 'bg-primary-600 text-white shadow-glow'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-r border-slate-600/50',
            ]"
          >
            {{ $t('tools.jwtTool.encodeTab') }}
          </button>
          <button
            type="button"
            @click="activeTab = 'decode'"
            :class="[
              'px-6 py-3 text-sm font-medium transition-all duration-200 cursor-pointer hover-lift',
              activeTab === 'decode'
                ? 'bg-primary-600 text-white shadow-glow'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-r border-slate-600/50',
            ]"
          >
            {{ $t('tools.jwtTool.decodeTab') }}
          </button>
          <button
            type="button"
            @click="activeTab = 'verify'"
            :class="[
              'px-6 py-3 text-sm font-medium rounded-r-xl transition-all duration-200 cursor-pointer hover-lift',
              activeTab === 'verify'
                ? 'bg-primary-600 text-white shadow-glow'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50',
            ]"
          >
            {{ $t('tools.jwtTool.verifyTab') }}
          </button>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div
          class="glass p-6 rounded-xl border border-slate-700/30 hover-lift transition-all duration-300"
        >
          <div class="text-2xl mb-3 animate-bounce-subtle">🔐</div>
          <h3 class="text-lg font-semibold text-slate-100 mb-2">
            {{ $t('tools.jwtTool.features.encode.title') }}
          </h3>
          <p class="text-slate-300 text-sm">
            {{ $t('tools.jwtTool.features.encode.description') }}
          </p>
        </div>
        <div
          class="glass p-6 rounded-xl border border-slate-700/30 hover-lift transition-all duration-300"
        >
          <div class="text-2xl mb-3 animate-bounce-subtle">🔍</div>
          <h3 class="text-lg font-semibold text-slate-100 mb-2">
            {{ $t('tools.jwtTool.features.decode.title') }}
          </h3>
          <p class="text-slate-300 text-sm">
            {{ $t('tools.jwtTool.features.decode.description') }}
          </p>
        </div>
        <div
          class="glass p-6 rounded-xl border border-slate-700/30 hover-lift transition-all duration-300"
        >
          <div class="text-2xl mb-3 animate-bounce-subtle">✅</div>
          <h3 class="text-lg font-semibold text-slate-100 mb-2">
            {{ $t('tools.jwtTool.features.verify.title') }}
          </h3>
          <p class="text-slate-300 text-sm">
            {{ $t('tools.jwtTool.features.verify.description') }}
          </p>
        </div>
      </div>

      <!-- Encode Tab -->
      <div v-show="activeTab === 'encode'" class="space-y-8">
        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.jwtTool.encode.header') }}
          </h3>
          <div class="mb-4">
            <textarea
              v-model="encodeHeader"
              class="w-full h-32 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-mono"
            ></textarea>
          </div>
        </div>

        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.jwtTool.encode.payload') }}
          </h3>
          <div class="mb-4">
            <textarea
              v-model="encodePayload"
              class="w-full h-40 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-mono"
            ></textarea>
          </div>
        </div>

        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.jwtTool.encode.secret') }}
          </h3>
          <div class="mb-4">
            <input
              v-model="encodeSecret"
              type="text"
              class="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              :placeholder="$t('tools.jwtTool.encode.secret')"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ $t('tools.jwtTool.encode.algorithm') }}
            </label>
            <select
              v-model="encodeAlgorithm"
              class="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            >
              <option value="HS256">{{ $t('tools.jwtTool.encode.algorithms.HS256') }}</option>
              <option value="HS384">{{ $t('tools.jwtTool.encode.algorithms.HS384') }}</option>
              <option value="HS512">{{ $t('tools.jwtTool.encode.algorithms.HS512') }}</option>
            </select>
          </div>

          <div class="flex flex-wrap gap-4">
            <button
              @click="generateToken"
              class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 cursor-pointer hover-lift"
            >
              {{ $t('tools.jwtTool.encode.generate') }}
            </button>
            <button
              @click="clearEncode"
              class="px-6 py-3 bg-slate-700 text-slate-200 rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-200 cursor-pointer hover-lift"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <div v-if="generatedToken" class="glass rounded-xl border border-slate-700/30 p-6">
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.jwtTool.encode.token') }}
          </h3>
          <div class="mb-4">
            <textarea
              v-model="generatedToken"
              readonly
              class="w-full h-32 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 font-mono break-all"
            ></textarea>
          </div>
          <div class="flex flex-wrap gap-4">
            <button
              @click="copyToken"
              class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 cursor-pointer hover-lift"
            >
              {{ $t('tools.jwtTool.encode.copy') }}
            </button>
            <button
              @click="downloadToken"
              class="px-6 py-3 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-all duration-200 cursor-pointer hover-lift"
            >
              {{ $t('tools.jwtTool.encode.download') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Decode Tab -->
      <div v-show="activeTab === 'decode'" class="space-y-8">
        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.jwtTool.decode.tokenInput') }}
          </h3>
          <div class="mb-4">
            <textarea
              v-model="decodeToken"
              :placeholder="$t('tools.jwtTool.decode.tokenPlaceholder')"
              class="w-full h-32 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-mono"
            ></textarea>
          </div>
          <div class="flex flex-wrap gap-4">
            <button
              @click="decodeJWT"
              :disabled="!decodeToken.trim()"
              class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 cursor-pointer hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('tools.jwtTool.decode.verifySignature') }}
            </button>
            <button
              @click="clearDecode"
              class="px-6 py-3 bg-slate-700 text-slate-200 rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-200 cursor-pointer hover-lift"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <div v-if="decodedHeader || decodedPayload" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="glass rounded-xl border border-slate-700/30 p-6">
            <h3 class="text-lg font-semibold text-slate-100 mb-4">
              {{ $t('tools.jwtTool.decode.header') }}
            </h3>
            <div v-if="decodedHeader" class="mb-4">
              <pre
                class="w-full h-40 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 overflow-auto font-mono text-sm"
                >{{ decodedHeader }}</pre
              >
            </div>
            <div v-else class="text-slate-400 italic">
              {{ $t('common.noResults') }}
            </div>
          </div>

          <div class="glass rounded-xl border border-slate-700/30 p-6">
            <h3 class="text-lg font-semibold text-slate-100 mb-4">
              {{ $t('tools.jwtTool.decode.payload') }}
            </h3>
            <div v-if="decodedPayload" class="mb-4">
              <pre
                class="w-full h-40 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 overflow-auto font-mono text-sm"
                >{{ decodedPayload }}</pre
              >
            </div>
            <div v-else class="text-slate-400 italic">
              {{ $t('common.noResults') }}
            </div>
          </div>
        </div>

        <div
          v-if="decodedSignature !== null"
          class="glass rounded-xl border border-slate-700/30 p-6"
        >
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.jwtTool.decode.signature') }}
          </h3>
          <div class="mb-4">
            <pre
              class="w-full h-20 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 overflow-auto font-mono text-sm break-all"
              >{{ decodedSignature }}</pre
            >
          </div>
          <div class="flex items-center gap-4">
            <div
              :class="[
                'w-3 h-3 rounded-full transition-all duration-200',
                isTokenValid ? 'bg-success-400 shadow-success-glow' : 'bg-red-400 shadow-red-glow',
              ]"
            ></div>
            <span v-if="isTokenValid" class="text-success-400">
              {{ $t('tools.jwtTool.messages.validToken') }}
            </span>
            <span v-else-if="isTokenExpired" class="text-red-400">
              {{ $t('tools.jwtTool.messages.expiredToken') }}
            </span>
            <span v-else-if="isTokenNotBefore" class="text-red-400">
              {{ $t('tools.jwtTool.messages.notBeforeToken') }}
            </span>
            <span v-else class="text-red-400">
              {{ $t('tools.jwtTool.messages.invalidToken') }}
            </span>
          </div>
        </div>

        <div v-if="tokenClaims" class="glass rounded-xl border border-slate-700/30 p-6">
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.jwtTool.decode.payload') }} {{ $t('common.statistics') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-if="tokenClaims.exp"
              class="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4"
            >
              <div class="text-sm text-slate-400">{{ $t('tools.jwtTool.decode.expiration') }}</div>
              <div class="text-slate-100 font-medium">
                {{ new Date(tokenClaims.exp * 1000).toLocaleString() }}
              </div>
            </div>
            <div
              v-if="tokenClaims.nbf"
              class="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4"
            >
              <div class="text-sm text-slate-400">{{ $t('tools.jwtTool.decode.notBefore') }}</div>
              <div class="text-slate-100 font-medium">
                {{ new Date(tokenClaims.nbf * 1000).toLocaleString() }}
              </div>
            </div>
            <div
              v-if="tokenClaims.iat"
              class="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4"
            >
              <div class="text-sm text-slate-400">{{ $t('tools.jwtTool.decode.issuedAt') }}</div>
              <div class="text-slate-100 font-medium">
                {{ new Date(tokenClaims.iat * 1000).toLocaleString() }}
              </div>
            </div>
            <div
              v-if="tokenClaims.iss"
              class="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4"
            >
              <div class="text-sm text-slate-400">{{ $t('tools.jwtTool.decode.issuer') }}</div>
              <div class="text-slate-100 font-medium truncate">{{ tokenClaims.iss }}</div>
            </div>
            <div
              v-if="tokenClaims.sub"
              class="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4"
            >
              <div class="text-sm text-slate-400">{{ $t('tools.jwtTool.decode.subject') }}</div>
              <div class="text-slate-100 font-medium truncate">{{ tokenClaims.sub }}</div>
            </div>
            <div
              v-if="tokenClaims.aud"
              class="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4"
            >
              <div class="text-sm text-slate-400">{{ $t('tools.jwtTool.decode.audience') }}</div>
              <div class="text-slate-100 font-medium truncate">{{ tokenClaims.aud }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Verify Tab -->
      <div v-show="activeTab === 'verify'" class="space-y-8">
        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.jwtTool.verify.tokenInput') }}
          </h3>
          <div class="mb-4">
            <textarea
              v-model="verifyToken"
              :placeholder="$t('tools.jwtTool.verify.tokenPlaceholder')"
              class="w-full h-32 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-mono"
            ></textarea>
          </div>
        </div>

        <div class="glass rounded-xl border border-slate-700/30 p-6">
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.jwtTool.verify.secret') }}
          </h3>
          <div class="mb-4">
            <input
              v-model="verifySecret"
              type="text"
              class="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              :placeholder="$t('tools.jwtTool.verify.secret')"
            />
          </div>
          <div class="flex flex-wrap gap-4">
            <button
              @click="verifySignature"
              :disabled="!verifyToken.trim() || !verifySecret.trim()"
              class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 cursor-pointer hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('tools.jwtTool.verify.verify') }}
            </button>
            <button
              @click="clearVerify"
              class="px-6 py-3 bg-slate-700 text-slate-200 rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-200 cursor-pointer hover-lift"
            >
              {{ $t('common.clear') }}
            </button>
          </div>
        </div>

        <div
          v-if="verificationResult !== null"
          class="glass rounded-xl border border-slate-700/30 p-6"
        >
          <h3 class="text-lg font-semibold text-slate-100 mb-4">
            {{ $t('tools.jwtTool.verify.verificationResult') }}
          </h3>
          <div class="flex items-center gap-4">
            <div
              :class="[
                'w-3 h-3 rounded-full transition-all duration-200',
                verificationResult
                  ? 'bg-success-400 shadow-success-glow'
                  : 'bg-red-400 shadow-red-glow',
              ]"
            ></div>
            <span v-if="verificationResult" class="text-success-400">
              {{ $t('tools.jwtTool.messages.validSignature') }}
            </span>
            <span v-else class="text-red-400">
              {{ $t('tools.jwtTool.messages.invalidSignature') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import CryptoJS from 'crypto-js'

interface JwtHeader {
  alg: string
  typ: string
  [key: string]: any
}

interface JwtPayload {
  [key: string]: any
}

interface JwtClaims {
  exp?: number
  nbf?: number
  iat?: number
  iss?: string
  sub?: string
  aud?: string
}

const { t } = useI18n()
const { success, error: showError } = useToast()

// Tabs
const activeTab = ref<'encode' | 'decode' | 'verify'>('encode')

// Encode tab
const encodeHeader = ref<string>(
  JSON.stringify(
    {
      alg: 'HS256',
      typ: 'JWT',
    },
    null,
    2,
  ),
)
const encodePayload = ref<string>(
  JSON.stringify(
    {
      sub: '1234567890',
      name: 'John Doe',
      iat: Math.floor(Date.now() / 1000),
    },
    null,
    2,
  ),
)
const encodeSecret = ref<string>('your-256-bit-secret')
const encodeAlgorithm = ref<string>('HS256')
const generatedToken = ref<string>('')

// Decode tab
const decodeToken = ref<string>('')
const decodedHeader = ref<string>('')
const decodedPayload = ref<string>('')
const decodedSignature = ref<string>('')
const isTokenValid = ref<boolean>(false)
const isTokenExpired = ref<boolean>(false)
const isTokenNotBefore = ref<boolean>(false)
const tokenClaims = ref<JwtClaims | null>(null)

// Verify tab
const verifyToken = ref<string>('')
const verifySecret = ref<string>('')
const verificationResult = ref<boolean | null>(null)

// Helper functions
function base64UrlEncode(source: string): string {
  // Convert to base64
  let encoded = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(source))
  // Replace non-URL safe characters
  encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return encoded
}

function base64UrlDecode(source: string): string {
  // Replace URL safe characters
  let decoded = source.replace(/-/g, '+').replace(/_/g, '/')
  // Add padding if needed
  while (decoded.length % 4) {
    decoded += '='
  }
  // Convert from base64
  return CryptoJS.enc.Base64.parse(decoded).toString(CryptoJS.enc.Utf8)
}

function generateSignature(
  header: string,
  payload: string,
  secret: string,
  algorithm: string,
): string {
  const data = header + '.' + payload
  let hash

  switch (algorithm) {
    case 'HS256':
      hash = CryptoJS.HmacSHA256(data, secret)
      break
    case 'HS384':
      hash = CryptoJS.HmacSHA384(data, secret)
      break
    case 'HS512':
      hash = CryptoJS.HmacSHA512(data, secret)
      break
    default:
      hash = CryptoJS.HmacSHA256(data, secret)
  }

  return base64UrlEncode(CryptoJS.enc.Base64.stringify(hash))
}

// Encode functions
function generateToken() {
  try {
    // Validate JSON
    const headerObj = JSON.parse(encodeHeader.value)
    const payloadObj = JSON.parse(encodePayload.value)

    // Encode header and payload
    const encodedHeader = base64UrlEncode(JSON.stringify(headerObj))
    const encodedPayload = base64UrlEncode(JSON.stringify(payloadObj))

    // Generate signature
    const signature = generateSignature(
      encodedHeader,
      encodedPayload,
      encodeSecret.value,
      encodeAlgorithm.value,
    )

    // Combine to form JWT
    generatedToken.value = `${encodedHeader}.${encodedPayload}.${signature}`

    success(t('tools.jwtTool.messages.tokenGenerated'))
  } catch (err) {
    console.error('JWT generation error:', err)
    showError(t('tools.jwtTool.errors.generateFailed'))
  }
}

function clearEncode() {
  encodeHeader.value = JSON.stringify(
    {
      alg: 'HS256',
      typ: 'JWT',
    },
    null,
    2,
  )
  encodePayload.value = JSON.stringify(
    {
      sub: '1234567890',
      name: 'John Doe',
      iat: Math.floor(Date.now() / 1000),
    },
    null,
    2,
  )
  encodeSecret.value = 'your-256-bit-secret'
  encodeAlgorithm.value = 'HS256'
  generatedToken.value = ''
}

function copyToken() {
  navigator.clipboard
    .writeText(generatedToken.value)
    .then(() => {
      success(t('tools.jwtTool.messages.tokenCopied'))
    })
    .catch(() => {
      showError(t('tools.jwtTool.errors.copyFailed'))
    })
}

function downloadToken() {
  const blob = new Blob([generatedToken.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'jwt-token.txt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  success(t('tools.jwtTool.messages.tokenDownloaded'))
}

// Decode functions
function decodeJWT() {
  try {
    if (!decodeToken.value.trim()) {
      showError(t('tools.jwtTool.errors.invalidToken'))
      return
    }

    const parts = decodeToken.value.split('.')
    if (parts.length !== 3) {
      showError(t('tools.jwtTool.errors.invalidToken'))
      return
    }

    const [headerPart, payloadPart, signaturePart] = parts

    // Decode header
    try {
      const headerJson = base64UrlDecode(headerPart)
      const headerObj = JSON.parse(headerJson)
      decodedHeader.value = JSON.stringify(headerObj, null, 2)
    } catch (err) {
      decodedHeader.value = t('tools.jwtTool.errors.invalidJson')
    }

    // Decode payload
    try {
      const payloadJson = base64UrlDecode(payloadPart)
      const payloadObj = JSON.parse(payloadJson)
      decodedPayload.value = JSON.stringify(payloadObj, null, 2)
      tokenClaims.value = payloadObj

      // Check expiration
      isTokenExpired.value = false
      isTokenNotBefore.value = false
      if (payloadObj.exp && payloadObj.exp < Math.floor(Date.now() / 1000)) {
        isTokenExpired.value = true
      }
      if (payloadObj.nbf && payloadObj.nbf > Math.floor(Date.now() / 1000)) {
        isTokenNotBefore.value = true
      }
    } catch (err) {
      decodedPayload.value = t('tools.jwtTool.errors.invalidJson')
      tokenClaims.value = null
    }

    // Store signature
    decodedSignature.value = signaturePart

    // Verify signature if secret is provided
    if (encodeSecret.value) {
      verifySignatureForDecode()
    } else {
      isTokenValid.value = false
    }
  } catch (err) {
    console.error('JWT decode error:', err)
    showError(t('tools.jwtTool.errors.invalidToken'))
  }
}

function verifySignatureForDecode() {
  try {
    const parts = decodeToken.value.split('.')
    if (parts.length !== 3) return

    const [headerPart, payloadPart] = parts
    const headerJson = base64UrlDecode(headerPart)
    const headerObj = JSON.parse(headerJson)

    const expectedSignature = generateSignature(
      headerPart,
      payloadPart,
      encodeSecret.value,
      headerObj.alg || 'HS256',
    )

    isTokenValid.value = expectedSignature === decodedSignature.value
  } catch (err) {
    isTokenValid.value = false
  }
}

function clearDecode() {
  decodeToken.value = ''
  decodedHeader.value = ''
  decodedPayload.value = ''
  decodedSignature.value = ''
  isTokenValid.value = false
  isTokenExpired.value = false
  isTokenNotBefore.value = false
  tokenClaims.value = null
}

// Verify functions
function verifySignature() {
  try {
    if (!verifyToken.value.trim() || !verifySecret.value.trim()) {
      showError(t('tools.jwtTool.errors.missingSecret'))
      return
    }

    const parts = verifyToken.value.split('.')
    if (parts.length !== 3) {
      verificationResult.value = false
      showError(t('tools.jwtTool.errors.invalidToken'))
      return
    }

    const [headerPart, payloadPart, signaturePart] = parts

    // Get algorithm from header
    let algorithm = 'HS256'
    try {
      const headerJson = base64UrlDecode(headerPart)
      const headerObj = JSON.parse(headerJson)
      algorithm = headerObj.alg || 'HS256'
    } catch (err) {
      // Use default if header parsing fails
    }

    // Generate expected signature
    const expectedSignature = generateSignature(
      headerPart,
      payloadPart,
      verifySecret.value,
      algorithm,
    )

    // Compare signatures
    verificationResult.value = expectedSignature === signaturePart

    if (verificationResult.value) {
      success(t('tools.jwtTool.messages.validSignature'))
    } else {
      showError(t('tools.jwtTool.messages.invalidSignature'))
    }
  } catch (err) {
    console.error('JWT verification error:', err)
    verificationResult.value = false
    showError(t('tools.jwtTool.errors.verifyFailed'))
  }
}

function clearVerify() {
  verifyToken.value = ''
  verifySecret.value = ''
  verificationResult.value = null
}

// Initialize with example data
onMounted(() => {
  // Load example data if needed
})
</script>

<style scoped>
/* Glass effect utility */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.glass-light {
  background: rgba(255, 255, 255, 0.1);
}

/* Text gradient */
.text-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Shadow utilities */
.shadow-dark-lg {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.shadow-dark-xl {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.shadow-success-glow {
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
}

.shadow-red-glow {
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
}

/* Hover effects */
.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

/* Animations */
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}

@keyframes bounce-subtle {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading dots animation */
.loading-dots::after {
  content: '';
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%,
  20% {
    content: '.';
  }
  40% {
    content: '..';
  }
  60%,
  100% {
    content: '...';
  }
}

/* Custom scrollbar for electron */
.electron-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.electron-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.electron-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.electron-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
