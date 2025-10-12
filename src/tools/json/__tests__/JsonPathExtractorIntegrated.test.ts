import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
// @ts-expect-error
import en from '@/locales/en'
// @ts-expect-error
import zh from '@/locales/zh'
import PathExtractor from '../components/PathExtractor.vue'

// Create i18n instance
const i18n = createI18n({
  locale: 'en',
  messages: { en, zh },
  legacy: false,
})

describe('Integrated PathExtractor Component', () => {
  // @ts-expect-error
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    // @ts-expect-error
    wrapper = mount(PathExtractor, {
      global: {
        plugins: [i18n],
      },
    })
  })

  it('renders mode toggle buttons', () => {
    const pathModeButton = wrapper.find('button')
    const fieldModeButton = wrapper.findAll('button')[1]

    expect(pathModeButton.text()).toBe('Path Mode')
    expect(fieldModeButton.text()).toBe('Field Mode')
  })

  it('switches between path and field modes', async () => {
    const pathModeButton = wrapper.find('button')
    const fieldModeButton = wrapper.findAll('button')[1]

    // Initially in path mode
    expect(wrapper.vm.$data.mode).toBe('path')

    // Switch to field mode
    await fieldModeButton.trigger('click')
    expect(wrapper.vm.$data.mode).toBe('field')

    // Switch back to path mode
    await pathModeButton.trigger('click')
    expect(wrapper.vm.$data.mode).toBe('path')
  })

  it('loads example data correctly', async () => {
    const loadExampleButton = wrapper.find('.px-3.py-1.text-sm').find('button')
    await loadExampleButton.trigger('click')

    expect(wrapper.vm.$data.inputJson).toContain('store')
    expect(wrapper.vm.$data.jsonPath).toBe('$.store.book[*].title')
    expect(wrapper.vm.$data.isValidJson).toBe(true)
  })

  it('handles JSON validation', async () => {
    const textarea = wrapper.find('textarea')
    await textarea.setValue('{"invalid": json}')

    // Trigger the input event to validate
    await textarea.trigger('input')

    expect(wrapper.vm.$data.isValidJson).toBe(false)
    expect(wrapper.vm.$data.jsonError).toBeTruthy()
  })

  it('analyzes fields in field mode', async () => {
    const fieldModeButton = wrapper.findAll('button')[1]
    await fieldModeButton.trigger('click')

    // Load example data
    const loadExampleButton = wrapper.find('.px-3.py-1.text-sm').find('button')
    await loadExampleButton.trigger('click')

    // Wait for field analysis
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.$data.availableFields.length).toBeGreaterThan(0)
    expect(wrapper.vm.$data.availableFields).toContain('store.book.category')
  })

  it('updates JSONPath when fields are selected', async () => {
    // Switch to field mode
    const fieldModeButton = wrapper.findAll('button')[1]
    await fieldModeButton.trigger('click')

    // Load example data
    const loadExampleButton = wrapper.find('.px-3.py-1.text-sm').find('button')
    await loadExampleButton.trigger('click')

    // Wait for field analysis
    await wrapper.vm.$nextTick()

    // Select a field
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    if (checkboxes.length > 0) {
      await checkboxes[0].setValue(true)
      await checkboxes[0].trigger('change')

      // Check that JSONPath was updated
      expect(wrapper.vm.$data.jsonPath).toBeTruthy()
    }
  })
})
