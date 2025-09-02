import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Checkbox from '../src/components/CustomCheckbox.vue'

describe('Checkbox.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(Checkbox, { props: { modelValue: false } })
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('toggles value on click', async () => {
    const wrapper = mount(Checkbox, { props: { modelValue: false } })
    const input = wrapper.find('input[type="checkbox"]')
    await input.setValue(true)
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([true])
  })

  it('reflects checked state from props', async () => {
    const wrapper = mount(Checkbox, { props: { modelValue: true } })
    const input = wrapper.find('input[type="checkbox"]')
    expect(input.element.checked).toBe(true)
  })
})
