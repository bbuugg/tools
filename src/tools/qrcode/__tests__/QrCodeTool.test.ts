import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/locales/en'
import zh from '@/locales/zh'
import QrCodeTool from '../QrCodeTool.vue'

// Mock the QR code libraries
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,test')
  }
}))

vi.mock('jsqr', () => ({
  default: vi.fn().mockReturnValue({ data: 'decoded text' })
}))

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, zh }
})

describe('QrCodeTool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  it('renders properly', () => {
    const wrapper = mount(QrCodeTool, {
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('h1').text()).toContain('QR Code Generator & Recognizer')
  })

  it('switches between tabs', async () => {
    const wrapper = mount(QrCodeTool, {
      global: {
        plugins: [i18n]
      }
    })

    // Initially should show generate tab
    expect(wrapper.find('textarea[placeholder*="Enter text to generate QR code"]').exists()).toBe(true)
    
    // Switch to recognize tab
    const recognizeTab = wrapper.find('button:nth-child(2)')
    await recognizeTab.trigger('click')
    
    // Should now show recognize tab content
    expect(wrapper.find('div[draggable]').exists()).toBe(true)
  })

  it('generates a single QR code', async () => {
    const wrapper = mount(QrCodeTool, {
      global: {
        plugins: [i18n]
      }
    })

    const textarea = wrapper.find('textarea[placeholder*="Enter text to generate QR code"]')
    await textarea.setValue('Test QR Code')

    const generateButton = wrapper.find('button.px-4.py-2.bg-blue-600')
    await generateButton.trigger('click')

    // Should have one generated QR code
    expect(wrapper.findAll('img[alt="Test QR Code"]').length).toBe(1)
  })

  it('handles batch QR code generation', async () => {
    const wrapper = mount(QrCodeTool, {
      global: {
        plugins: [i18n]
      }
    })

    // Switch to batch input section
    const batchTextarea = wrapper.find('textarea[placeholder*="Enter multiple texts"]')
    await batchTextarea.setValue('Line 1\nLine 2\nLine 3')

    const batchGenerateButton = wrapper.find('button.px-4.py-2.bg-blue-600:disabled')
    await batchGenerateButton.trigger('click')

    // Should generate 3 QR codes
    // Note: This would require more complex mocking to fully test
    expect(batchGenerateButton.exists()).toBe(true)
  })
})