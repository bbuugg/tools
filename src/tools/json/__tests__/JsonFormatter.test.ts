import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonFormatter from '../JsonFormatter.vue'
import { createI18n } from 'vue-i18n'
import en from '../../../locales/en'
import zh from '../../../locales/zh'

const i18n = createI18n({
  locale: 'en',
  messages: { en, zh },
})

describe('JsonFormatter', () => {
  it('renders properly', () => {
    const wrapper = mount(JsonFormatter, {
      global: {
        plugins: [i18n],
      },
    })
    expect(wrapper.find('h1').text()).toContain('JSON Formatter')
  })

  it('formats JSON correctly', async () => {
    const wrapper = mount(JsonFormatter, {
      global: {
        plugins: [i18n],
      },
    })

    const input = wrapper.find('textarea')
    await input.setValue('{"name":"test","value":"example"}')

    const button = wrapper.find('button')
    await button.trigger('click')

    const output = wrapper.find('textarea[readonly]')
    expect(output.element.value).toContain('"name": "test"')
  })

  it('converts keys to uppercase', async () => {
    const wrapper = mount(JsonFormatter, {
      global: {
        plugins: [i18n],
      },
    })

    // Set key case to uppercase
    const keyCaseSelect = wrapper.findAll('select').at(2) // Key case select
    if (keyCaseSelect) {
      await keyCaseSelect.setValue('upper')
    }

    const input = wrapper.find('textarea')
    await input.setValue('{"name":"test","value":"example"}')

    const button = wrapper.find('button')
    await button.trigger('click')

    const output = wrapper.find('textarea[readonly]')
    expect(output.element.value).toContain('"NAME": "test"')
    expect(output.element.value).toContain('"VALUE": "example"')
  })

  it('converts values to uppercase', async () => {
    const wrapper = mount(JsonFormatter, {
      global: {
        plugins: [i18n],
      },
    })

    // Set value case to uppercase
    const valueCaseSelect = wrapper.findAll('select').at(3) // Value case select
    if (valueCaseSelect) {
      await valueCaseSelect.setValue('upper')
    }

    const input = wrapper.find('textarea')
    await input.setValue('{"name":"test","value":"example"}')

    const button = wrapper.find('button')
    await button.trigger('click')

    const output = wrapper.find('textarea[readonly]')
    expect(output.element.value).toContain('"name": "TEST"')
    expect(output.element.value).toContain('"value": "EXAMPLE"')
  })

  it('converts keys to lowercase', async () => {
    const wrapper = mount(JsonFormatter, {
      global: {
        plugins: [i18n],
      },
    })

    // Set key case to lowercase
    const keyCaseSelect = wrapper.findAll('select').at(2) // Key case select
    if (keyCaseSelect) {
      await keyCaseSelect.setValue('lower')
    }

    const input = wrapper.find('textarea')
    await input.setValue('{"NAME":"test","VALUE":"example"}')

    const button = wrapper.find('button')
    await button.trigger('click')

    const output = wrapper.find('textarea[readonly]')
    expect(output.element.value).toContain('"name": "test"')
    expect(output.element.value).toContain('"value": "example"')
  })

  it('converts values to lowercase', async () => {
    const wrapper = mount(JsonFormatter, {
      global: {
        plugins: [i18n],
      },
    })

    // Set value case to lowercase
    const valueCaseSelect = wrapper.findAll('select').at(3) // Value case select
    if (valueCaseSelect) {
      await valueCaseSelect.setValue('lower')
    }

    const input = wrapper.find('textarea')
    await input.setValue('{"name":"TEST","value":"EXAMPLE"}')

    const button = wrapper.find('button')
    await button.trigger('click')

    const output = wrapper.find('textarea[readonly]')
    expect(output.element.value).toContain('"name": "test"')
    expect(output.element.value).toContain('"value": "example"')
  })
})
