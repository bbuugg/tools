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

describe('JsonPathExtractor', () => {
  it('renders properly', () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
        },
      },
    })
    expect(wrapper.find('h1').text()).toContain('JSON Path Extractor')
  })

  it('validates JSON input correctly', async () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
        },
      },
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('{"invalid": json}')

    // Find the error message element
    const errorElement = wrapper.find('.bg-red-500\\/10 p.font-medium')
    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toContain('Invalid JSON format')
  })

  it('extracts data with JSONPath correctly', async () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
        },
      },
    })

    // Set valid JSON input
    const jsonInput = wrapper.find('textarea')
    await jsonInput.setValue('{"store":{"book":[{"title":"Test Book"}]}}')

    // Set JSONPath expression
    const pathInput = wrapper.find('input[type="text"]')
    await pathInput.setValue('$.store.book[*].title')

    // Click extract button
    const extractButton = wrapper.find('button.bg-primary-500')
    await extractButton.trigger('click')

    // Check that results are displayed
    const resultElement = wrapper.find('pre')
    expect(resultElement.exists()).toBe(true)
    expect(resultElement.text()).toContain('Test Book')
  })

  it('loads example data correctly', async () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
        },
      },
    })

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

  it('uses quick path templates', async () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
        },
      },
    })

    // Set valid JSON input first
    const jsonInput = wrapper.find('textarea')
    await jsonInput.setValue('{"test":"value"}')

    // Click the first quick path button (root path)
    const quickPathButton = wrapper.find('button.font-mono')
    await quickPathButton.trigger('click')

    // Check that path is set to root
    const pathInput = wrapper.find('input[type="text"]')
    expect(pathInput.element.value).toBe('$')
  })

  it('switches between tabs correctly', async () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
        },
      },
    })

    // Check that extractor tab is active by default
    expect(wrapper.find('.border-primary-500').text()).toContain('Path Extractor')

    // Find and click the formatter tab
    const formatterTab = wrapper.findAll('button')[1]
    await formatterTab.trigger('click')

    // Check that formatter tab is now active
    expect(wrapper.find('.border-primary-500').text()).toContain('JSON Formatter')
  })

  it('formats JSON correctly in formatter tab', async () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
        stubs: {
          ToolLayout: {
            template: '<div><slot></slot></div>',
          },
        },
      },
    })

    // Switch to formatter tab
    const formatterTab = wrapper.findAll('button')[1]
    await formatterTab.trigger('click')

    // Find the formatter textarea and input JSON
    const formatterTextarea = wrapper.find('textarea')
    await formatterTextarea.setValue('{"name":"John","age":30}')

    // Wait for formatting to complete
    await wrapper.vm.$nextTick()

    // Check that formatted JSON is displayed
    const formattedOutput = wrapper.findAll('textarea')[1]
    expect(formattedOutput.element.value).toContain('"name": "John"')
    expect(formattedOutput.element.value).toContain('"age": 30')
  })
})
