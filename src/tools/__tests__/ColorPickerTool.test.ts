import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorPickerTool from '../ColorPickerTool.vue'
import { createI18n } from 'vue-i18n'
import en from '@/locales/en'

const i18n = createI18n({
  locale: 'en',
  messages: { en },
})

describe('ColorPickerTool', () => {
  it('should render correctly', () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('h2').text()).toBe('Color Picker')
    expect(wrapper.find('p').text()).toBe(
      'Advanced color picker with support for multiple color formats and image color extraction',
    )
  })

  it('should have color picker section', () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('.bg-gray-50').exists()).toBe(true)
    expect(wrapper.text()).toContain('Color Picker')
  })

  it('should have image color picker section with pick color button', () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Image Color Picker')
    expect(wrapper.text()).toContain('Drop an image here or click to select')
    expect(wrapper.text()).toContain('Select Image')
    expect(wrapper.text()).toContain('Pick Color')
  })

  it('should have common colors section', () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Common Colors')
  })

  it('should have color conversions section with input fields', () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Color Conversions')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('HEX')
    expect(wrapper.text()).toContain('RGB')
    expect(wrapper.text()).toContain('HSL')
    expect(wrapper.text()).toContain('HSV')
    expect(wrapper.text()).toContain('CMYK')
  })

  it('should have color preview section', () => {
    const wrapper = mount(ColorPickerTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Preview')
    expect(wrapper.text()).toContain('On Light Background')
    expect(wrapper.text()).toContain('On Dark Background')
  })
})
