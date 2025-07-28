/* global chrome */

// Background script to handle extension installation and tab injection

// When extension is installed or enabled, inject content script into existing ClickUp tabs
chrome.runtime.onInstalled.addListener(async () => {
  console.log('ClickUp Extender installed/enabled')

  try {
    // Get all tabs
    const tabs = await chrome.tabs.query({})

    // Filter for ClickUp tabs
    const clickupTabs = tabs.filter((tab) => tab.url && tab.url.includes('app.clickup.com'))

    console.log(`Found ${clickupTabs.length} ClickUp tabs`)

    // Inject content script into each ClickUp tab
    for (const tab of clickupTabs) {
      try {
        // Check if content script is already injected by trying to send a message
        await chrome.tabs.sendMessage(tab.id, { type: 'ping' })
        console.log(`Content script already active in tab ${tab.id}`)
      } catch {
        // Content script not active, inject it
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js'],
          })
          console.log(`Injected content script into tab ${tab.id}`)
        } catch (injectionError) {
          console.log(`Failed to inject into tab ${tab.id}:`, injectionError.message)
        }
      }
    }
  } catch (error) {
    console.error('Error during content script injection:', error)
  }
})

// Listen for tab updates to inject content script into newly navigated ClickUp pages
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only act when page has finished loading and URL is ClickUp
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('app.clickup.com')) {
    try {
      // Check if content script is already active
      await chrome.tabs.sendMessage(tabId, { type: 'ping' })
      console.log(`Content script already active in updated tab ${tabId}`)
    } catch {
      // Content script not active, inject it
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js'],
        })
        console.log(`Injected content script into updated tab ${tabId}`)
      } catch (injectionError) {
        console.log(`Failed to inject into updated tab ${tabId}:`, injectionError.message)
      }
    }
  }
})

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ping') {
    sendResponse({ status: 'pong' })
    return true
  }

  // Handle other message types as needed
  return false
})
