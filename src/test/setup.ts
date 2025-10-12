import { vi } from 'vitest'

// Mock browser APIs that are not available in Node.js
Object.defineProperty(global, 'RTCPeerConnection', {
  value: vi.fn().mockImplementation(() => ({
    createOffer: vi.fn().mockResolvedValue({ sdp: 'test-offer-sdp' }),
    createAnswer: vi.fn().mockResolvedValue({ sdp: 'test-answer-sdp' }),
    setLocalDescription: vi.fn().mockResolvedValue(undefined),
    setRemoteDescription: vi.fn().mockResolvedValue(undefined),
    addIceCandidate: vi.fn().mockResolvedValue(undefined),
    createDataChannel: vi.fn().mockReturnValue({
      send: vi.fn(),
      close: vi.fn(),
      readyState: 'open',
    }),
    close: vi.fn(),
    onicecandidate: null,
    onconnectionstatechange: null,
  })),
  writable: true,
})

Object.defineProperty(global, 'WebSocket', {
  value: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
    close: vi.fn(),
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
  })),
  writable: true,
})
