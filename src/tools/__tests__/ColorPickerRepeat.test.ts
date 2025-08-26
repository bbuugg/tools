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

describe('ColorPickerTool Repeat Picking Tests', () => {
  it('should allow repeated color picking until cancel is clicked', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Check that the color picker is initially not active
    expect(wrapper.vm.isColorPickerActive).toBe(false)

    // Activate the color picker
    const pickColorButton = wrapper.find('button.bg-blue-600')
    await pickColorButton.trigger('click')

    // Check that the color picker is now active
    expect(wrapper.vm.isColorPickerActive).toBe(true)

    // Check that the message about repeated picking is displayed
    expect(wrapper.text()).toContain('Keep picking colors until you click Cancel Pick')
  })
})
