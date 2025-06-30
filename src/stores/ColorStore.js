/* global chrome */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useColorStore = defineStore('ColorStore', {
  state: () => {
    const backgroundColor = ref('#fe5722')
    const textColor = ref('#2097f3')

    // Load colors from Chrome storage on store initialization
    if (chrome && chrome.storage) {
      chrome.storage.local.get(['effectiveBackgroundColor', 'effectiveTextColor'], (result) => {
        if (result.effectiveBackgroundColor) {
          backgroundColor.value = result.effectiveBackgroundColor
        }
        if (result.effectiveTextColor) {
          textColor.value = result.effectiveTextColor
        }
      })
    }

    return {
      backgroundColor,
      textColor,
    }
  },

  actions: {
    setColors(newBackgroundColor, newTextColor) {
      this.backgroundColor = newBackgroundColor
      this.textColor = newTextColor

      // Save to Chrome storage whenever colors change via the store
      if (chrome && chrome.storage) {
        chrome.storage.local.set({
          effectiveBackgroundColor: newBackgroundColor,
          effectiveTextColor: newTextColor,
        })
      }
    },
  },
})
