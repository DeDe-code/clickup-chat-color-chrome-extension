/* global chrome */
import { defineStore } from 'pinia'

export const useColorStore = defineStore('ColorStore', {
  /**
   * Store state for color management.
   *
   * backgroundColor: Uses ClickUp's main theme variable. Do not change this default unless user overrides.
   * textColor: Uses ClickUp's main text color variable. Do not change this default unless user overrides.
   * These variables automatically adapt to dark, light, and system themes.
   *
   * Fallbacks are handled in the UI and style logic, not here, to preserve theme integrity.
   */
  state: () => ({
    backgroundColor: 'var(--cu-background-primary)', // Critical: do not replace, theme-driven
    textColor: 'var(--cu-content-primary)', // Critical: do not replace, theme-driven
    useClickUpTextColor: true,
    useClickUpBackgroundColor: true,
  }),

  actions: {
    initFromStorage() {
      if (chrome && chrome.storage) {
        chrome.storage.local.get(
          [
            'effectiveBackgroundColor',
            'effectiveTextColor',
            'useClickUpTextColor',
            'useClickUpBackgroundColor',
          ],
          (result) => {
            if (result.effectiveBackgroundColor) {
              this.backgroundColor = result.effectiveBackgroundColor
            }
            if (result.effectiveTextColor) {
              this.textColor = result.effectiveTextColor
            }
            if (typeof result.useClickUpTextColor !== 'undefined') {
              this.useClickUpTextColor = !!result.useClickUpTextColor
            }
            if (typeof result.useClickUpBackgroundColor !== 'undefined') {
              this.useClickUpBackgroundColor = !!result.useClickUpBackgroundColor
            }
          },
        )
      }
    },

    /**
     * Set custom colors. If a value is a CSS variable, ensure it resolves in the UI logic with a fallback.
     * This preserves theme support and accessibility.
     */
    setColors(newBackgroundColor, newTextColor) {
      this.backgroundColor = newBackgroundColor
      this.textColor = newTextColor
      if (chrome && chrome.storage) {
        chrome.storage.local.set({
          effectiveBackgroundColor: newBackgroundColor,
          effectiveTextColor: newTextColor,
        })
      }
    },

    setUseClickUpTextColor(value) {
      this.useClickUpTextColor = value
      if (chrome && chrome.storage) {
        chrome.storage.local.set({
          useClickUpTextColor: value,
        })
      }
    },

    setUseClickUpBackgroundColor(value) {
      this.useClickUpBackgroundColor = value
      if (chrome && chrome.storage) {
        chrome.storage.local.set({
          useClickUpBackgroundColor: value,
        })
      }
    },
  },
})
