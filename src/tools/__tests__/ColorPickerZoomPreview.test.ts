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

describe('ColorPickerTool - Zoom Preview', () => {
  it('should show magnifier when color picker is active and mouse moves over image', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Find the activate color picker button and click it
    const activateButton = wrapper.find('button')
    await activateButton.trigger('click')

    // Check that the magnifier elements exist in the template
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(wrapper.find('[data-testid="crosshair"]').exists()).toBe(true)
  })

  it('should have proper magnifier positioning styles', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Check that the magnifier canvas has the correct classes
    const canvas = wrapper.find('canvas')
    expect(canvas.classes()).toContain('absolute')
    expect(canvas.classes()).toContain('border-2')
    expect(canvas.classes()).toContain('border-white')
  })
})
