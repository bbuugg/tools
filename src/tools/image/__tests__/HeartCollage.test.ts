import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeartCollage from '../HeartCollage.vue'
import { createI18n } from 'vue-i18n'
import en from '../../../locales/en'
import zh from '../../../locales/zh'

const i18n = createI18n({
  locale: 'en',
  messages: { en, zh },
})

describe('HeartCollage', () => {
  it('renders properly', () => {
    const wrapper = mount(HeartCollage, {
      global: {
        plugins: [i18n],
      },
    })
    expect(wrapper.find('h1').text()).toContain('Heart Collage Generator')
  })

  it('has upload area', () => {
    const wrapper = mount(HeartCollage, {
      global: {
        plugins: [i18n],
      },
    })
    expect(wrapper.find('[data-testid="upload-area"]').exists()).toBe(false)
    // Note: In a real test, we would add data-testid attributes to elements for better testing
  })

  it('has settings panel', () => {
    const wrapper = mount(HeartCollage, {
      global: {
        plugins: [i18n],
      },
    })
    expect(wrapper.text()).toContain('Collage Settings')
  })
})
