/**
 * Background script for a Chrome Extension.
 * Manages the storage and retrieval of text highlights on different web pages.
 */

// In-memory cache to store highlights per page.
let pageHighlights = {};

/**
 * Saves a text highlight to Chrome's local storage.
 * @param {string} url - The URL of the page where the highlight is made.
 * @param {string} text - The text that was highlighted.
 * @param {string} color - The color used for the highlight.
 * @param {function} sendResponse - Callback function to send a response.
 */
function saveHighlight(url, text, color, sendResponse) {
  chrome.storage.local.get(['highlights'], (result) => {
    const highlights = result.highlights || {};
    highlights[url] = highlights[url] || [];
    highlights[url].push({ text, color });

    chrome.storage.local.set({ 'highlights': highlights }, () => {
      console.log('Highlight saved:', text);
      sendResponse?.({ status: "Highlight saved" });
    });
  });
}

/**
 * Fetches stored highlights for a specific URL.
 * @param {string} url - The URL to retrieve highlights for.
 * @param {function} sendResponse - Callback function to send a response.
 */
function fetchHighlights(url, sendResponse) {
  chrome.storage.local.get(['highlights'], (result) => {
    const highlightsForPage = result.highlights?.[url] || [];
    sendResponse({ highlights: highlightsForPage });
  });
}

// Listens for messages from the content scripts.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const url = sender.tab?.url || 'unknown_page';

  switch (request.type) {
    case 'saveHighlight':
      saveHighlight(url, request.text, request.color, sendResponse);
      break;
    case 'getHighlights':
      fetchHighlights(url, sendResponse);
      break;
    // Add additional message types as needed
    default:
      // Handle other types of messages or log an unhandled message
      console.warn('Unhandled message type:', request.type);
  }

  // Return true to indicate an asynchronous response (important for async sendResponse)
  return true;
});
