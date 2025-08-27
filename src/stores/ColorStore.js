/* global chrome */
import { defineStore } from 'pinia'

export const useColorStore = defineStore('ColorStore', {
  state: () => ({
    backgroundColor: 'var(--cu-background-primary)',
    textColor: 'var(--cu-content-primary)',
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
