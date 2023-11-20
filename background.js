// Object to store highlights per page
let pageHighlights = {};

function saveHighlight(url, text, color, sendResponse) {
  // Load existing highlights, then save the new one
  chrome.storage.local.get(['highlights'], function(result) {
    let highlights = result.highlights || {};
    if (!highlights[url]) {
      highlights[url] = [];
    }
    highlights[url].push({ text, color });

    // Save the updated highlights object to local storage
    chrome.storage.local.set({ 'highlights': highlights }, () => {
      console.log('Highlight saved:', text);
      if (sendResponse) {
        sendResponse({ status: "Highlight saved" });
      }
    });
  });
}

function fetchHighlights(url, sendResponse) {
  chrome.storage.local.get(['highlights'], (result) => {
    const highlightsForPage = result.highlights && result.highlights[url] ? result.highlights[url] : [];
    sendResponse({ highlights: highlightsForPage });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let url = sender.tab ? sender.tab.url : 'unknown_page';
  if (request.type === 'saveHighlight') {
    saveHighlight(url, request.text, request.color, sendResponse);
    return true; // Important for async response
  } else if (request.type === 'getHighlights') {
    fetchHighlights(url, sendResponse);
    return true; // Keep the message channel open for async response
  }
  // Other message handling...
});
