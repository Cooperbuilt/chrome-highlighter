// Function to get the current highlight color from storage
function getCurrentHighlightColor(callback) {
    chrome.storage.sync.get(["highlightColor"], (result) => {
      const color = result.highlightColor || "#ffff00";
      callback(color);
    });
  }
  
  // Function to apply a highlight to a text node in the document
  function applyHighlight(text, color) {
    // Search the document body for the text and apply a span with background color
    const bodyText = document.body.innerText;
    const startIndex = bodyText.indexOf(text);
    if (startIndex !== -1) {
      const range = document.createRange();
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      let node = walker.nextNode();
      let nodeIndex = 0;
  
      while (node != null) {
        if (nodeIndex + node.textContent.length > startIndex) {
          range.setStart(node, startIndex - nodeIndex);
          range.setEnd(node, startIndex - nodeIndex + text.length);
          const span = document.createElement("span");
          span.style.backgroundColor = color;
          range.surroundContents(span);
          break;
        }
        nodeIndex += node.textContent.length;
        node = walker.nextNode();
      }
    }
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
  