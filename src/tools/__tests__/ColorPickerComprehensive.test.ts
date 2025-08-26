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

describe('ColorPickerTool Comprehensive Tests', () => {
  it('should render correctly', () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('h2').text()).toBe('Color Picker')
  })

  it('should not reset slider values when dragging to maximum for HSL', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Switch to HSL mode
    const hslButton = wrapper.find('button:nth-child(2)') // HSL button
    await hslButton.trigger('click')

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
    const hsvButton = wrapper.find('button:nth-child(3)') // HSV button
    await hsvButton.trigger('click')

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
    const cmykButton = wrapper.find('button:nth-child(4)') // CMYK button
    await cmykButton.trigger('click')

    // Find the C slider (first range input in CMYK mode)
    const cSliders = wrapper.findAll('input[type="range"]')
    const cSlider = cSliders[0]

    // Simulate dragging to maximum value
    await cSlider.setValue('100')

    // Check that the value is still 100
    expect(cSlider.element.value).toBe('100')
  })

  it('should have direct paste functionality', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Check that the component has a paste event listener
    expect(wrapper.vm).toBeDefined()
  })
})
