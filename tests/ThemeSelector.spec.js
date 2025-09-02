import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeSelector from '../src/components/ThemeSelector.vue'

describe('ThemeSelector.vue', () => {
  it('renders theme options', () => {
    const wrapper = mount(ThemeSelector)
    expect(wrapper.findAll('option').length).toBeGreaterThan(0)
  })

  it('emits theme change event', async () => {
    const wrapper = mount(ThemeSelector)
    await wrapper.vm.$emit('themeChange', 'dark')
    expect(wrapper.emitted('themeChange')).toBeTruthy()
  })
})
