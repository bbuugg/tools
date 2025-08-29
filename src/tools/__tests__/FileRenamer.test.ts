import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FileRenamer from '../FileRenamer.vue'
import { createI18n } from 'vue-i18n'
import en from '../../locales/en'
import zh from '../../locales/zh'

// Mock the useToast composable
vi.mock('../../composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  }),
}))

// Create i18n instance with proper configuration
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en, zh },
})

describe('FileRenamer', () => {
  it('should render correctly', () => {
    const wrapper = mount(FileRenamer, {
      global: {
        plugins: [i18n],
        stubs: {
          draggable: true,
        },
      },
    })

    expect(wrapper.find('h1').text()).toBe('File Renamer Tool')
    expect(wrapper.find('p').text()).toBe('Batch rename files with multiple modes - local processing for privacy')
  })

  it('should have upload area with correct text', () => {
    const wrapper = mount(FileRenamer, {
      global: {
        plugins: [i18n],
        stubs: {
          draggable: true,
        },
      },
    })

    expect(wrapper.find('.border-dashed').exists()).toBe(true)
    expect(wrapper.text()).toContain('Drag & Drop Files Here')
    expect(wrapper.text()).toContain('or click to select files')
    expect(wrapper.text()).toContain('Select Files')
  })

  it('should have all renaming tabs', () => {
    const wrapper = mount(FileRenamer, {
      global: {
        plugins: [i18n],
        stubs: {
          draggable: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Sequential')
    expect(wrapper.text()).toContain('Find & Replace')
    expect(wrapper.text()).toContain('Case Transform')
    expect(wrapper.text()).toContain('Insert Text')
    expect(wrapper.text()).toContain('Truncate')
  })

  it('should show file count when files are added', async () => {
    const wrapper = mount(FileRenamer, {
      global: {
        plugins: [i18n],
        stubs: {
          draggable: true,
        },
      },
    })

    // Simulate adding a file
    const file = new File([''], 'test.txt', { type: 'text/plain' })
    // @ts-ignore
    wrapper.vm.files = [{ 
      id: '1', 
      file, 
      originalName: 'test.txt', 
      currentName: 'test.txt', 
      size: 0, 
      type: 'text/plain', 
      lastModified: Date.now() 
    }]

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Total files: 1')
  })

  it('should have sorting options when files are added', async () => {
    const wrapper = mount(FileRenamer, {
      global: {
        plugins: [i18n],
        stubs: {
          draggable: true,
        },
      },
    })

    // Simulate adding a file
    const file = new File([''], 'test.txt', { type: 'text/plain' })
    // @ts-ignore
    wrapper.vm.files = [{ 
      id: '1', 
      file, 
      originalName: 'test.txt', 
      currentName: 'test.txt', 
      size: 0, 
      type: 'text/plain', 
      lastModified: Date.now() 
    }]

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Sorting')
    expect(wrapper.text()).toContain('Natural Sort')
    expect(wrapper.text()).toContain('Filename Order')
    expect(wrapper.text()).toContain('Modified Time')
  })

  it('should have action buttons when files are added', async () => {
    const wrapper = mount(FileRenamer, {
      global: {
        plugins: [i18n],
        stubs: {
          draggable: true,
        },
      },
    })

    // Simulate adding a file
    const file = new File([''], 'test.txt', { type: 'text/plain' })
    // @ts-ignore
    wrapper.vm.files = [{ 
      id: '1', 
      file, 
      originalName: 'test.txt', 
      currentName: 'test.txt', 
      size: 0, 
      type: 'text/plain', 
      lastModified: Date.now() 
    }]

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Clear Files')
    expect(wrapper.text()).toContain('Download Script')
  })
})