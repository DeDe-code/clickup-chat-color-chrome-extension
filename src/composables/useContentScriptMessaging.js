/* global chrome */
export function useContentScriptMessaging() {
  // Send a message to all ClickUp tabs
  function sendMessageToContentScript(message) {
    return new Promise((resolve, reject) => {
      if (!chrome || !chrome.tabs) {
        reject(new Error('chrome.tabs not available'))
        return
      }
      chrome.tabs.query({ url: 'https://app.clickup.com/*' }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          reject(new Error('No ClickUp tabs found'))
          return
        }
        let responses = []
        let errors = []
        let completed = 0
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, message, (response) => {
            completed++
            if (chrome.runtime.lastError) {
              errors.push({ tabId: tab.id, error: chrome.runtime.lastError })
            } else {
              responses.push({ tabId: tab.id, response })
            }
            if (completed === tabs.length) {
              if (errors.length > 0) {
                reject(errors)
              } else {
                resolve(responses)
              }
            }
          })
        })
      })
    })
  }

  return {
    sendMessageToContentScript,
  }
}
