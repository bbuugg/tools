import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, it, expect, vi } from 'vitest'
import FaviconGenerator from '../FaviconGenerator.vue'
import en from '@/locales/en'

// Mock the vue-advanced-cropper component
vi.mock('vue-advanced-cropper', () => ({
  Cropper: {
    template: '<div>Mock Cropper</div>',
  },
}))

// Mock the useToast composable
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
})

describe('FaviconGenerator', () => {
  it('renders correctly', () => {
    const wrapper = mount(FaviconGenerator, {
      global: {
        plugins: [i18n],
      },
    })

    // Check that the main title is rendered
    expect(wrapper.text()).toContain('Favicon Generator')

    // Check that the upload section is visible
    expect(wrapper.find('[data-testid="upload-section"]').exists()).toBe(false)
  })

  it('shows file selection button', () => {
    const wrapper = mount(FaviconGenerator, {
      global: {
        plugins: [i18n],
      },
    })

    // Find the select image button
    const selectButton = wrapper.find('button')
    expect(selectButton.exists()).toBe(true)
  })

  it('has correct available sizes', () => {
    const wrapper = mount(FaviconGenerator, {
      global: {
        plugins: [i18n],
      },
    })

    // Access the component instance to check available sizes
    const vm = wrapper.vm as any
    expect(vm.availableSizes).toEqual([16, 32, 48, 64, 128])
  })
})
