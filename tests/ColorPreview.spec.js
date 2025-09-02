import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorPreview from '../src/components/ColorPreview.vue'

describe('ColorPreview.vue', () => {
  it('renders preview with correct colors', () => {
    const wrapper = mount(ColorPreview, {
      props: { backgroundColor: '#fff', textColor: '#000' },
    })
    expect(wrapper.html()).toContain('background-color: rgb(255, 255, 255);')
    expect(wrapper.html()).toContain('color: rgb(0, 0, 0);')
  })
})
