import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorPickerTool from '../ColorPickerTool.vue'
import { createI18n } from 'vue-i18n'
import en from '../../locales/en'

// Mock the useToast composable
vi.mock('../../composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

// Create i18n instance with proper configuration
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
})

describe('ColorPickerTool Slider Fix Tests', () => {
  it('should not reset slider values when dragging to maximum for HSL', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Switch to HSL mode
    const hslButtons = wrapper.findAll('button')
    const hslButton = hslButtons.find((button) => button.text() === 'HSL')
    expect(hslButton).toBeDefined()
    if (hslButton) {
      await hslButton.trigger('click')
    }

    // Find the H slider (first range input in HSL mode)
    const hSliders = wrapper.findAll('input[type="range"]')
    const hSlider = hSliders[0]

    // Simulate dragging to maximum value
    await hSlider.setValue('360')

    // Check that the value is still 360
    expect(hSlider.element.value).toBe('360')
  })

  it('should not reset slider values when dragging to maximum for HSV', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Switch to HSV mode
    const hsvButtons = wrapper.findAll('button')
    const hsvButton = hsvButtons.find((button) => button.text() === 'HSV')
    expect(hsvButton).toBeDefined()
    if (hsvButton) {
      await hsvButton.trigger('click')
    }

    // Find the H slider (first range input in HSV mode)
    const hSliders = wrapper.findAll('input[type="range"]')
    const hSlider = hSliders[0]

    // Simulate dragging to maximum value
    await hSlider.setValue('360')

    // Check that the value is still 360
    expect(hSlider.element.value).toBe('360')
  })

  it('should not reset slider values when dragging to maximum for CMYK', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Switch to CMYK mode
    const cmykButtons = wrapper.findAll('button')
    const cmykButton = cmykButtons.find((button) => button.text() === 'CMYK')
    expect(cmykButton).toBeDefined()
    if (cmykButton) {
      await cmykButton.trigger('click')
    }

    // Find the C slider (first range input in CMYK mode)
    const cSliders = wrapper.findAll('input[type="range"]')
    const cSlider = cSliders[0]

    // Simulate dragging to maximum value
    await cSlider.setValue('100')

    // Check that the value is still 100
    expect(cSlider.element.value).toBe('100')
  })
})
