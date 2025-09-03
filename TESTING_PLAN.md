# Testing Implementation Plan

## Overview
This document outlines how to implement comprehensive testing for the ClickUp Chat Color Chrome Extension.

## Test Infrastructure Setup

### 1. Install Testing Dependencies
```bash
npm install -D vitest @vue/test-utils jsdom @testing-library/vue @testing-library/jest-dom
```

### 2. Vitest Configuration
Create `vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

### 3. Test Setup File
Create `src/test/setup.js`:
```javascript
import { beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock Chrome APIs
const mockChromeApi = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
    sendMessage: vi.fn(),
  },
  tabs: {
    query: vi.fn(),
  },
}

beforeEach(() => {
  global.chrome = mockChromeApi
  vi.clearAllMocks()
})
```

## Test Categories

### 1. Unit Tests for Components

#### Example: CustomCheckbox.test.js
```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomCheckbox from '@/components/CustomCheckbox.vue'

describe('CustomCheckbox', () => {
  it('renders with label', () => {
    const wrapper = mount(CustomCheckbox, {
      props: {
        modelValue: false,
        label: 'Test Checkbox',
        id: 'test-checkbox',
      },
    })
    
    expect(wrapper.text()).toContain('Test Checkbox')
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('emits update:modelValue when clicked', async () => {
    const wrapper = mount(CustomCheckbox, {
      props: {
        modelValue: false,
        label: 'Test Checkbox',
        id: 'test-checkbox',
      },
    })
    
    await wrapper.find('input').trigger('change')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('shows checkmark when checked', () => {
    const wrapper = mount(CustomCheckbox, {
      props: {
        modelValue: true,
        label: 'Test Checkbox',
        id: 'test-checkbox',
      },
    })
    
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
```

#### Example: NotificationMessage.test.js
```javascript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationMessage from '@/components/NotificationMessage.vue'

describe('NotificationMessage', () => {
  it('renders different notification types', () => {
    const types = ['success', 'warning', 'error', 'info']
    
    types.forEach(type => {
      const wrapper = mount(NotificationMessage, {
        props: {
          type,
          message: `Test ${type} message`,
        },
      })
      
      expect(wrapper.classes()).toContain(`notification--${type}`)
      expect(wrapper.text()).toContain(`Test ${type} message`)
    })
  })

  it('auto-dismisses after timeout', async () => {
    vi.useFakeTimers()
    
    const wrapper = mount(NotificationMessage, {
      props: {
        message: 'Test message',
        timeout: 1000,
      },
    })
    
    expect(wrapper.isVisible()).toBe(true)
    
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.emitted('close')).toBeTruthy()
    vi.useRealTimers()
  })

  it('can be manually dismissed', async () => {
    const wrapper = mount(NotificationMessage, {
      props: {
        message: 'Test message',
        dismissible: true,
      },
    })
    
    await wrapper.find('.notification__close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
```

### 2. Integration Tests for Composables

#### Example: useChromeStorage.test.js
```javascript
import { describe, it, expect, vi } from 'vitest'
import { useChromeStorage } from '@/composables/useChromeStorage.js'

describe('useChromeStorage', () => {
  it('gets storage data successfully', async () => {
    const mockData = { backgroundColor: '#ff0000' }
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback(mockData)
    })
    
    const { getStorage } = useChromeStorage()
    const result = await getStorage(['backgroundColor'])
    
    expect(result).toEqual(mockData)
    expect(chrome.storage.local.get).toHaveBeenCalledWith(['backgroundColor'], expect.any(Function))
  })

  it('sets storage data successfully', async () => {
    chrome.storage.local.set.mockImplementation((data, callback) => {
      callback()
    })
    
    const { setStorage } = useChromeStorage()
    const testData = { backgroundColor: '#00ff00' }
    
    await setStorage(testData)
    
    expect(chrome.storage.local.set).toHaveBeenCalledWith(testData, expect.any(Function))
  })

  it('handles storage errors', async () => {
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      chrome.runtime.lastError = new Error('Storage error')
      callback({})
    })
    
    const { getStorage } = useChromeStorage()
    
    await expect(getStorage(['backgroundColor'])).rejects.toThrow('Storage error')
  })
})
```

### 3. End-to-End Tests

#### Example: extension.e2e.test.js
```javascript
import { test, expect } from '@playwright/test'

test.describe('ClickUp Extension E2E', () => {
  test.beforeEach(async ({ page, context }) => {
    // Load extension
    await context.addExtension('./dist')
    await page.goto('https://app.clickup.com')
  })

  test('popup opens and displays correctly', async ({ page }) => {
    // Click extension icon
    await page.locator('[data-testid="extension-icon"]').click()
    
    // Verify popup content
    await expect(page.locator('text=Chat channel colors')).toBeVisible()
    await expect(page.locator('select[id="theme-select"]')).toBeVisible()
  })

  test('color changes are applied to ClickUp', async ({ page }) => {
    // Open extension popup
    await page.locator('[data-testid="extension-icon"]').click()
    
    // Change background color
    await page.locator('[data-testid="background-color-picker"]').click()
    await page.locator('[data-testid="color-red"]').click()
    
    // Verify changes are applied
    await expect(page.locator('.cu-sidebar-nav-item.has-unread')).toHaveCSS(
      'background-color', 
      'rgb(255, 0, 0)'
    )
  })
})
```

## Package.json Scripts Update

Add these scripts to package.json:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Benefits of This Testing Approach

1. **Unit Tests**: Ensure individual components work correctly
2. **Integration Tests**: Verify composables and Chrome API integration
3. **E2E Tests**: Validate complete user workflows
4. **Coverage**: Track code coverage to identify untested areas
5. **CI/CD**: Automated testing in pull requests
6. **Regression Prevention**: Catch breaking changes early

## Implementation Priority

1. **Phase 1**: Basic unit tests for components
2. **Phase 2**: Composable integration tests
3. **Phase 3**: E2E testing setup
4. **Phase 4**: Coverage reporting and CI integration

This testing strategy would significantly improve the reliability and maintainability of the Chrome extension.