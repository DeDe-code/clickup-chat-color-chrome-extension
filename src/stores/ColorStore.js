import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useColorStore = defineStore('ColorStore', {
  state: () => ({
    backgroundColor: useLocalStorage('ColorStore:BackgroundColor', '#ffff'),
    textColor: useLocalStorage('ColorStore:textColor', '#0000'),
  }),
  actions: {
    setColors(backgroundColor, textColor) {
      this.backgroundColor = backgroundColor
      this.textColor = textColor
    },
  },
})
