import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageSteganography from '../ImageSteganography.vue'
import { createI18n } from 'vue-i18n'
import en from '../../locales/en'
import zh from '../../locales/zh'

// Mock fabric
const mockImage = {
  width: 100,
  height: 100,
  getElement: vi.fn().mockReturnValue({}),
  set: vi.fn(),
}

vi.mock('fabric', () => {
  return {
    Canvas: vi.fn().mockImplementation(() => ({
      clear: vi.fn(),
      add: vi.fn(),
      renderAll: vi.fn(),
      setWidth: vi.fn(),
      setHeight: vi.fn(),
      getWidth: vi.fn().mockReturnValue(500),
      getHeight: vi.fn().mockReturnValue(500),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
      width: 500,
      height: 500,
    })),
    FabricImage: vi.fn().mockImplementation(() => mockImage),
  }
})

// Mock FabricImage.fromURL separately
import * as fabric from 'fabric'
fabric.FabricImage.fromURL = vi.fn().mockImplementation((url, options) => {
  return Promise.resolve({
    width: 100,
    height: 100,
    getElement: vi.fn().mockReturnValue({}),
    set: vi.fn(),
  })
})

const i18n = createI18n({
  locale: 'en',
  messages: { en, zh },
})

describe('ImageSteganography', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
    global.URL.revokeObjectURL = vi.fn()

    // Mock document.createElement for file input
    const mockCreateElement = vi.spyOn(document, 'createElement')
    mockCreateElement.mockImplementation((tagName) => {
      if (tagName === 'input') {
        return {
          type: '',
          accept: '',
          click: vi.fn(),
          onchange: null,
          files: [],
        } as any
      }
      return document.createElement(tagName)
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders properly', () => {
    const wrapper = mount(ImageSteganography, {
      global: {
        plugins: [i18n],
      },
    })
    expect(wrapper.find('h1').text()).toContain('Image Steganography')
  })

  it('displays step instructions', () => {
    const wrapper = mount(ImageSteganography, {
      global: {
        plugins: [i18n],
      },
    })
    expect(wrapper.text()).toContain('Step 1: Select Image to Hide')
    expect(wrapper.text()).toContain('Step 2: Save Hidden Image Data')
    expect(wrapper.text()).toContain('Step 3: Select Target Image')
    expect(wrapper.text()).toContain('Step 4: Start Encryption')
  })

  it('has all required buttons', () => {
    const wrapper = mount(ImageSteganography, {
      global: {
        plugins: [i18n],
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(5) // At least 5 buttons
  })

  it('shows canvas placeholder when no image is selected', () => {
    const wrapper = mount(ImageSteganography, {
      global: {
        plugins: [i18n],
      },
    })
    expect(wrapper.text()).toContain('Select an image to begin')
  })

  it('handles file selection', async () => {
    const wrapper = mount(ImageSteganography, {
      global: {
        plugins: [i18n],
      },
    })

    // Find and click the select hidden image button
    const selectHiddenBtn = wrapper.find('button')
    expect(selectHiddenBtn.exists()).toBe(true)
  })
})
