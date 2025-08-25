import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TextSteganography from '../TextSteganography.vue'
import { createI18n } from 'vue-i18n'
import en from '../../locales/en'
import zh from '../../locales/zh'

const i18n = createI18n({
  locale: 'en',
  messages: { en, zh },
})

describe('TextSteganography', () => {
  it('renders properly', () => {
    const wrapper = mount(TextSteganography, {
      global: {
        plugins: [i18n],
      },
    })
    expect(wrapper.find('h1').text()).toContain('Text Steganography')
  })

  it('encodes and decodes text correctly', async () => {
    const wrapper = mount(TextSteganography, {
      global: {
        plugins: [i18n],
      },
    })

    // Set visible text
    const visibleInput = wrapper.findAll('textarea').at(0)
    await visibleInput?.setValue('Hello World')

    // Set hidden text
    const hiddenInput = wrapper.findAll('textarea').at(1)
    await hiddenInput?.setValue('Secret')

    // Click encode button
    const encodeButton = wrapper.find('button')
    await encodeButton.trigger('click')

    // Check that steganography text is generated
    const resultTextarea = wrapper.findAll('textarea').at(2)
    expect(resultTextarea?.element.value).toBeTruthy()

    // Copy steganography text to decode input
    const decodeInput = wrapper.findAll('textarea').at(3)
    await decodeInput?.setValue(resultTextarea?.element.value)

    // Check that decoded text matches original hidden text
    const decodedText = wrapper.find('.whitespace-pre-wrap')
    expect(decodedText.text()).toBe('Secret')
  })

  it('resets all fields when reset button is clicked', async () => {
    const wrapper = mount(TextSteganography, {
      global: {
        plugins: [i18n],
      },
    })

    // Fill in some data
    const visibleInput = wrapper.findAll('textarea').at(0)
    await visibleInput?.setValue('Hello World')

    const hiddenInput = wrapper.findAll('textarea').at(1)
    await hiddenInput?.setValue('Secret')

    // Click encode button
    const encodeButton = wrapper.find('button')
    await encodeButton.trigger('click')

    // Click reset button
    const resetButtons = wrapper.findAll('button')
    const resetButton = resetButtons[resetButtons.length - 1]
    await resetButton.trigger('click')

    // Check that all fields are cleared
    const textareas = wrapper.findAll('textarea')
    expect(textareas.at(0)?.element.value).toBe('')
    expect(textareas.at(1)?.element.value).toBe('')
    expect(textareas.at(2)?.element.value).toBe('')
    expect(textareas.at(3)?.element.value).toBe('')

    const decodedText = wrapper.find('.whitespace-pre-wrap')
    expect(decodedText.text()).toBe('')
  })
})
