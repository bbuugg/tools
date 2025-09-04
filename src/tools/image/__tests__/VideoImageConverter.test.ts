import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoImageConverter from '../VideoImageConverter.vue'

describe('VideoImageConverter', () => {
  it('renders correctly', () => {
    // Simple test to check if component mounts without errors
    const wrapper = mount(VideoImageConverter)
    expect(wrapper.exists()).toBe(true)
  })
})
