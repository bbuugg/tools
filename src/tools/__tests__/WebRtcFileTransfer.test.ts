import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '../../locales/en'
import zh from '../../locales/zh'
import WebRtcFileTransfer from '../WebRtcFileTransfer.vue'

// Mock the WebRTC APIs
const mockCreateOffer = vi.fn().mockResolvedValue({ sdp: 'test-offer-sdp' })
const mockCreateAnswer = vi.fn().mockResolvedValue({ sdp: 'test-answer-sdp' })
const mockSetLocalDescription = vi.fn().mockResolvedValue(undefined)
const mockSetRemoteDescription = vi.fn().mockResolvedValue(undefined)
const mockAddIceCandidate = vi.fn().mockResolvedValue(undefined)

const mockCreateDataChannel = vi.fn().mockReturnValue({
  send: vi.fn(),
  close: vi.fn(),
  readyState: 'open',
})

global.RTCPeerConnection = vi.fn().mockImplementation(() => ({
  createOffer: mockCreateOffer,
  createAnswer: mockCreateAnswer,
  setLocalDescription: mockSetLocalDescription,
  setRemoteDescription: mockSetRemoteDescription,
  addIceCandidate: mockAddIceCandidate,
  createDataChannel: mockCreateDataChannel,
  close: vi.fn(),
  onicecandidate: null,
  onconnectionstatechange: null,
})) as any

// Create i18n instance
const i18n = createI18n({
  locale: 'en',
  messages: { en, zh },
})

describe('WebRtcFileTransfer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders properly', () => {
    const wrapper = mount(WebRtcFileTransfer, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('h1').text()).toBe('WebRTC File Transfer')
    expect(wrapper.find('button').text()).toBe('Search for Devices')
  })

  it('formats file sizes correctly', async () => {
    const wrapper = mount(WebRtcFileTransfer, {
      global: {
        plugins: [i18n],
      },
    })

    // @ts-ignore - accessing private method for testing
    const vm = wrapper.vm as any

    expect(vm.formatFileSize(0)).toBe('0 Bytes')
    expect(vm.formatFileSize(1023)).toBe('1023.00 Bytes')
    expect(vm.formatFileSize(1024)).toBe('1.00 KB')
    expect(vm.formatFileSize(1048576)).toBe('1.00 MB')
    expect(vm.formatFileSize(1073741824)).toBe('1.00 GB')
  })

  it('generates device IDs', async () => {
    const wrapper = mount(WebRtcFileTransfer, {
      global: {
        plugins: [i18n],
      },
    })

    // @ts-ignore - accessing private method for testing
    const vm = wrapper.vm as any

    const id1 = vm.generateDeviceId()
    const id2 = vm.generateDeviceId()

    expect(id1).toMatch(/^device_[a-z0-9]{9}$/)
    expect(id2).toMatch(/^device_[a-z0-9]{9}$/)
    expect(id1).not.toBe(id2)
  })

  it('handles file selection', async () => {
    const wrapper = mount(WebRtcFileTransfer, {
      global: {
        plugins: [i18n],
      },
    })

    const fileInput = wrapper.find('input[type="file"]')
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })

    // Mock the event
    const event = {
      target: {
        files: [testFile],
      },
    } as unknown as Event

    // @ts-ignore - accessing private method for testing
    await wrapper.vm.handleFileSelect(event)

    // Check that the file was selected
    // @ts-ignore - accessing private property for testing
    expect(wrapper.vm.selectedFile).toBe(testFile)
  })
})
