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
  it('renders all four tabs properly', () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
          PathExtractor: {
            template: '<div>PathExtractor</div>',
          },
          JsonExtractor: {
            template: '<div>JsonExtractor</div>',
          },
          JsonFormatter: {
            template: '<div>JsonFormatter</div>',
          },
          ExcelToJson: {
            template: '<div>ExcelToJson</div>',
          },
        },
      },
    })

    // Check that all four tabs are present
    const tabs = wrapper.findAll('button')
    expect(tabs).toHaveLength(4)

    // Check tab labels
    expect(tabs[0].text()).toContain('Path Extractor')
    expect(tabs[1].text()).toContain('Field Extractor')
    expect(tabs[2].text()).toContain('JSON Formatter')
    expect(tabs[3].text()).toContain('Excel to JSON')
  })

  it('switches between tabs correctly', async () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
          PathExtractor: {
            template: '<div>PathExtractor</div>',
          },
          JsonExtractor: {
            template: '<div>JsonExtractor</div>',
          },
          JsonFormatter: {
            template: '<div>JsonFormatter</div>',
          },
          ExcelToJson: {
            template: '<div>ExcelToJson</div>',
          },
        },
      },
    })

    // Check that path tab is active by default
    const firstTab = wrapper.findAll('button')[0]
    expect(firstTab.classes()).toContain('bg-primary-600')

    // Find and click the field extractor tab
    const extractorTab = wrapper.findAll('button')[1]
    await extractorTab.trigger('click')

    // Check that field extractor tab is now active
    expect(extractorTab.classes()).toContain('bg-primary-600')

    // Find and click the formatter tab
    const formatterTab = wrapper.findAll('button')[2]
    await formatterTab.trigger('click')

    // Check that formatter tab is now active
    expect(formatterTab.classes()).toContain('bg-primary-600')

    // Find and click the excel to json tab
    const excelTab = wrapper.findAll('button')[3]
    await excelTab.trigger('click')

    // Check that excel to json tab is now active
    expect(excelTab.classes()).toContain('bg-primary-600')
  })
})
