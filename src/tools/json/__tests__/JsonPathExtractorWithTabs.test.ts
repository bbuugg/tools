import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonPathExtractor from '../JsonPathExtractor.vue'
import { createI18n } from 'vue-i18n'
import en from '../../../locales/en'
import zh from '../../../locales/zh'

// Create i18n instance with global scope for testing
const i18n = createI18n({
  locale: 'en',
  messages: { en, zh },
  legacy: false, // Required for proper composition API support
})

describe('JsonPathExtractorWithTabs', () => {
  it('renders all three tabs properly', () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
          JsonExtractorTab: {
            template: '<div>JsonExtractorTab</div>',
          },
          JsonFormatterTab: {
            template: '<div>JsonFormatterTab</div>',
          },
        },
      },
    })

    // Check that all three tabs are present
    const tabs = wrapper.findAll('button')
    expect(tabs).toHaveLength(3)

    // Check tab labels
    expect(tabs[0].text()).toContain('Path Extractor')
    expect(tabs[1].text()).toContain('Field Extractor')
    expect(tabs[2].text()).toContain('JSON Formatter')
  })

  it('switches between tabs correctly', async () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
          JsonExtractorTab: {
            template: '<div>JsonExtractorTab</div>',
          },
          JsonFormatterTab: {
            template: '<div>JsonFormatterTab</div>',
          },
        },
      },
    })

    // Check that path tab is active by default
    expect(wrapper.find('.border-primary-500').text()).toContain('Path Extractor')

    // Find and click the field extractor tab
    const extractorTab = wrapper.findAll('button')[1]
    await extractorTab.trigger('click')

    // Check that field extractor tab is now active
    expect(wrapper.find('.border-primary-500').text()).toContain('Field Extractor')

    // Find and click the formatter tab
    const formatterTab = wrapper.findAll('button')[2]
    await formatterTab.trigger('click')

    // Check that formatter tab is now active
    expect(wrapper.find('.border-primary-500').text()).toContain('JSON Formatter')
  })

  it('loads example data in path extractor tab', async () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
          JsonExtractorTab: {
            template: '<div>JsonExtractorTab</div>',
          },
          JsonFormatterTab: {
            template: '<div>JsonFormatterTab</div>',
          },
        },
      },
    })

    // Make sure we're on the path tab
    expect(wrapper.find('.border-primary-500').text()).toContain('Path Extractor')

    // Find and click the "Load Example" button
    const exampleButton = wrapper.find('button')
    await exampleButton.trigger('click')

    // Check that JSON input is populated
    const textarea = wrapper.find('textarea')
    expect(textarea.element.value).toContain('store')

    // Check that JSONPath is set
    const pathInput = wrapper.find('input[type="text"]')
    expect(pathInput.element.value).toBe('$.store.book[*].title')
  })
})
