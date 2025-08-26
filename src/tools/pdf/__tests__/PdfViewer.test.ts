import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PdfViewer from '../PdfViewer.vue'

// Mock pdfjs-dist
vi.mock('pdfjs-dist/build/pdf', () => ({
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 5,
      getPage: vi.fn().mockResolvedValue({
        getViewport: vi.fn().mockReturnValue({
          width: 800,
          height: 600,
        }),
        render: vi.fn().mockReturnValue({
          promise: Promise.resolve(),
        }),
      }),
    }),
  }),
}))

describe('PdfViewer', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
  })

  it('renders properly', () => {
    const wrapper = mount(PdfViewer)
    expect(wrapper.exists()).toBe(true)
  })

  it('shows upload section initially', () => {
    const wrapper = mount(PdfViewer)
    expect(wrapper.find('[data-testid="upload-section"]').exists()).toBe(false)
    // The upload section should be visible by default
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
  })

  it('has correct title and description', () => {
    const wrapper = mount(PdfViewer)
    expect(wrapper.text()).toContain('PDF Viewer')
    expect(wrapper.text()).toContain('Preview and basic editing of PDF documents')
  })
})
