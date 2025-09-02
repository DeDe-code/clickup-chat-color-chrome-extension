import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResetButton from '../src/components/ResetButton.vue'

describe('ResetButton.vue', () => {
  it('renders and emits reset event', async () => {
    const wrapper = mount(ResetButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
