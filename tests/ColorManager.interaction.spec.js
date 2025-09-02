import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorManager from '../src/components/ColorManager.vue'

describe('ColorManager.vue', () => {
  it('renders color pickers and checkboxes', () => {
    const wrapper = mount(ColorManager)
    expect(wrapper.findAll('.color-picker').length).toBeGreaterThan(0)
    expect(wrapper.findAll('input[type="checkbox"]').length).toBeGreaterThan(0)
  })

  it('emits events on color change', async () => {
    const wrapper = mount(ColorManager)
    await wrapper.vm.$emit('colorChange', '#ffffff')
    expect(wrapper.emitted('colorChange')).toBeTruthy()
  })
})
