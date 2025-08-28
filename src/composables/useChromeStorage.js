/* global chrome */
export function useChromeStorage() {
  // Read from chrome.storage.local
  function getStorage(keys) {
    return new Promise((resolve, reject) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve(result)
          }
        })
      } else {
        reject(new Error('chrome.storage.local not available'))
      }
    })
  }

  // Write to chrome.storage.local
  function setStorage(data) {
    return new Promise((resolve, reject) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(data, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve()
          }
        })
      } else {
        reject(new Error('chrome.storage.local not available'))
      }
    })
  }

  return {
    getStorage,
    setStorage,
  }
}
