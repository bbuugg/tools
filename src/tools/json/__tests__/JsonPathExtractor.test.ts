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
      },
    })
    expect(wrapper.find('h1').text()).toContain('JSON Path Extractor')
  })

  it('validates JSON input correctly', async () => {
    const wrapper = mount(JsonPathExtractor, {
      global: {
        plugins: [i18n],
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
})
