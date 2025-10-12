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

describe('ColorPickerTool - Modal', () => {
  it('should show modal when "More" button is clicked', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Find the "More" button and click it
    const moreButton = wrapper.find('button.inline-flex.items-center.justify-center.border')
    await moreButton.trigger('click')

    // Check that the modal is visible
    expect(wrapper.find('[data-testid="color-modal"]').exists()).toBe(true)
  })

  it('should have material color groups in the modal', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Find the "More" button and click it
    const moreButton = wrapper.find('button.inline-flex.items-center.justify-center.border')
    await moreButton.trigger('click')

    // Check that material color groups are rendered
    const colorGroups = wrapper.findAll('[data-testid="color-group"]')
    expect(colorGroups.length).toBeGreaterThan(0)
  })

  it('should close modal when close button is clicked', async () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    // Find the "More" button and click it
    const moreButton = wrapper.find('button.inline-flex.items-center.justify-center.border')
    await moreButton.trigger('click')

    // Find the close button and click it
    const closeButton = wrapper.find('button[aria-label="Close"]')
    await closeButton.trigger('click')

    // Check that the modal is closed
    expect(wrapper.find('[data-testid="color-modal"]').exists()).toBe(false)
  })
})
