import { beforeEach, describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useColorStore } from '../src/stores/ColorStore'

describe('ColorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default theme variables', () => {
    const store = useColorStore()
    expect(store.backgroundColor).toBe('var(--cu-background-primary)')
    expect(store.textColor).toBe('var(--cu-content-primary)')
    expect(store.useClickUpTextColor).toBe(true)
    expect(store.useClickUpBackgroundColor).toBe(true)
  })

  it('updates background and text color', () => {
    const store = useColorStore()
    store.backgroundColor = '#fff'
    store.textColor = '#222'
    expect(store.backgroundColor).toBe('#fff')
    expect(store.textColor).toBe('#222')
  })
})
