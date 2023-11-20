/**
 * Popup script for a Chrome Extension.
 * Manages the user interface interactions including color picking and displaying saved highlights.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI elements
    const colorPicker = document.getElementById('colorPicker');
    const highlightList = document.getElementById('highlightList');

    // Load the stored highlight color when the popup is opened.
    function loadStoredHighlightColor() {
        chrome.storage.sync.get(['highlightColor'], (result) => {
            if (result.highlightColor) {
                colorPicker.value = result.highlightColor;
            }
        });
    }

    // Load and display saved highlights.
    function fetchAndDisplayHighlights() {
        chrome.storage.local.get(['highlights'], (result) => {
            const allHighlights = result.highlights || {};

            if (Object.keys(allHighlights).length === 0) {
                highlightList.textContent = 'No saved highlights.';
                return;
            }

            Object.entries(allHighlights).forEach(([url, highlights]) => {
                const count = highlights.length;
                const entry = createHighlightEntry(url, count);
                highlightList.appendChild(entry);
            });
        });
    }

    // Creates a div element representing a highlight entry.
    function createHighlightEntry(url, count) {
        const entry = document.createElement('div');
        entry.className = 'highlight-entry';
        entry.textContent = `${url} (${count} highlights)`;
        entry.onclick = () => chrome.tabs.create({ url });
        return entry;
    }

    // Listen for color picker changes and handle them.
    colorPicker.addEventListener('input', function() {
        const chosenColor = colorPicker.value;
        storeSelectedColor(chosenColor);
        sendColorToContentScript(chosenColor);
    });

    // Store the selected highlight color in Chrome's local storage.
    function storeSelectedColor(color) {
        chrome.storage.sync.set({'highlightColor': color}, () => {
            console.log('Highlight color saved:', color);
        });
    }

    // Send the selected color to the active content script.
    function sendColorToContentScript(color) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'colorChange',
                    color: color
                });
            }
        });
    }

    // Initial function calls
    loadStoredHighlightColor();
    fetchAndDisplayHighlights();
});
