import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Homepage from '../Homepage.vue'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import en from '../../locales/en'
import zh from '../../locales/zh'

// Create i18n instance
const i18n = createI18n({
  locale: 'en',
  messages: { en, zh },
})

// Create router instance
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      component: Homepage,
    },
  ],
})

describe('Homepage', () => {
  it('renders correctly', () => {
    const wrapper = mount(Homepage, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.find('h1').text()).toBe('Developer Tools Collection')
    expect(wrapper.find('p').text()).toContain('Powerful online tools for developers')
  })

  it('shows recommended tools section', () => {
    const wrapper = mount(Homepage, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.text()).toContain('Recommended Tools')
  })

  it('shows categories overview section', () => {
    const wrapper = mount(Homepage, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.text()).toContain('Explore Categories')
  })

  it('shows quick stats section', () => {
    const wrapper = mount(Homepage, {
      global: {
        plugins: [i18n, router],
      },
    })

    expect(wrapper.text()).toContain('Platform Statistics')
  })
})
