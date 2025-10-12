import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import WsTool from '../WsTool.vue'
import { createI18n } from 'vue-i18n'
import en from '../../locales/en'
import zh from '../../locales/zh'

// Mock the Toast composable
vi.mock('../../composables/useToast', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  }),
}))

// Create i18n instance
const i18n = createI18n({
  locale: 'en',
  messages: { en, zh },
})

describe('WsTool', () => {
  beforeEach(() => {
    // Mock WebSocket
    global.WebSocket = vi.fn(() => ({
      close: vi.fn(),
      send: vi.fn(),
      readyState: WebSocket.OPEN,
    })) as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(WsTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('h1').text()).toBe('WebSocket Tool')
    expect(wrapper.find('p').text()).toBe('Test WebSocket connections and send/receive messages')
  })

  it('shows server configuration section', () => {
    const wrapper = mount(WsTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Server Configuration')
    expect(wrapper.text()).toContain('Status:')
  })

  it('shows packet settings section', () => {
    const wrapper = mount(WsTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Packet Settings')
    expect(wrapper.text()).toContain('Auto Send')
    expect(wrapper.text()).toContain('Manual Send')
  })

  it('shows message history section', () => {
    const wrapper = mount(WsTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Message History')
    expect(wrapper.text()).toContain('Clear Messages')
  })

  it('shows debug messages section', () => {
    const wrapper = mount(WsTool, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Debug Messages')
  })

  it('updates connection status when connecting', async () => {
    const wrapper = mount(WsTool, {
      global: {
        plugins: [i18n],
      },
    })

    const input = wrapper.find('input[type="text"]')
    await input.setValue('ws://example.com')

    const button = wrapper.find('button')
    await button.trigger('click')

    // Check that the button text changes to "Close Connection"
    expect(wrapper.text()).toContain('Close Connection')
  })
})
