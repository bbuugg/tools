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

describe('ColorPickerTool Slider Tests', () => {
  it('should not reset slider values when dragging to maximum', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Switch to HSL mode
    const hslButtons = wrapper.findAll('button')
    const hslButton = hslButtons[1] // HSL button is the second button
    await hslButton.trigger('click')

    // Find the H slider (first range input in HSL mode)
    const hSliders = wrapper.findAll('input[type="range"]')
    const hSlider = hSliders[0]

    // Simulate dragging to maximum value
    await hSlider.setValue('360')

    // Check that the value is still 360
    expect(hSlider.element.value).toBe('360')
  })

  it('should handle slider events correctly', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Switch to HSV mode
    const hsvButtons = wrapper.findAll('button')
    const hsvButton = hsvButtons[2] // HSV button is the third button
    await hsvButton.trigger('click')

    // Find the H slider (first range input in HSV mode)
    const hSliders = wrapper.findAll('input[type="range"]')
    const hSlider = hSliders[0]

    // Simulate changing the slider value
    await hSlider.setValue('180')

    // Check that the value is updated
    expect(hSlider.element.value).toBe('180')
  })
})
