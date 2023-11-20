// Function to get the current highlight color from storage
function getCurrentHighlightColor(callback) {
    chrome.storage.sync.get(["highlightColor"], (result) => {
      const color = result.highlightColor || "#ffff00";
      callback(color);
    });
  }
  function applyHighlight(text, color) {
      const context = document.querySelector("body");
      const instance = new Mark(context);
      instance.mark(text, {
        "element": "span",
        "className": "custom-highlight",
        "acrossElements": true,
        "separateWordSearch": false,
        "each": function(element) {
          element.style.backgroundColor = color;
        }
      });
    }
    
  
  // Function to fetch and apply saved highlights
  function fetchAndApplyHighlights() {
    chrome.runtime.sendMessage({ type: "getHighlights" }, (response) => {
      if (response && response.highlights) {
        response.highlights.forEach((highlight) => {
          applyHighlight(highlight.text, highlight.color);
        });
      }
    });
  }
  
  // Function to save highlight
  function saveHighlight(text, color) {
    sendMessageToBackground(
      { type: "saveHighlight", text, color },
      handleHighlightResponse
    );
  }
  
  function handleHighlightResponse(response) {
    if (response && response.status === "Highlight saved") {
      console.log("Highlight was successfully saved.");
    }
  }
  
  // Function to send a message to the background script
  function sendMessageToBackground(message, callback) {
    chrome.runtime.sendMessage(message, function (response) {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError.message);
        if (callback) callback(null);
      } else if (callback) {
        callback(response);
      }
    });
  }
  
  // Storing the last selected text and its color
  let lastSelectedText = "";
  let lastHighlightColor = "";
  
  // Event listener for text selection
  document.addEventListener("mouseup", function () {
    const selectedText = window.getSelection();
    if (selectedText.toString().length > 0) {
      lastSelectedText = selectedText.toString();
      getCurrentHighlightColor((color) => {
        lastHighlightColor = color;
      });
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'colorChange') {
      // Update the color for new highlights
      lastHighlightColor = message.color;
    }
  });
  
  // Keyboard shortcut listener for saving the highlight
  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      if (lastSelectedText) {
        applyHighlight(lastSelectedText, lastHighlightColor);
        saveHighlight(lastSelectedText, lastHighlightColor);
      }
    }
  });
  
  // Fetch and apply highlights when the page is fully loaded
  function loadHandler() {
    if (document.readyState === "complete") {
      fetchAndApplyHighlights();
    }
  }
  
  if (document.readyState === "complete") {
    fetchAndApplyHighlights();
  } else {
    window.addEventListener("load", loadHandler);
  }
  