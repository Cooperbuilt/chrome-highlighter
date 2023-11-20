document.addEventListener('DOMContentLoaded', function() {
    var colorPicker = document.getElementById('colorPicker');
    var highlightList = document.getElementById('highlightList');
  
    // Load the stored highlight color when the popup is opened
    chrome.storage.local.get(['highlightColor'], function(result) {
        if (result.highlightColor) {
            colorPicker.value = result.highlightColor;
        }
    });

    // Load and display saved highlights
    function fetchAndDisplayHighlights() {
        chrome.storage.local.get(['highlights'], function(result) {
            const allHighlights = result.highlights || {};

            // Check if there are any saved highlights
            if (Object.keys(allHighlights).length === 0) {
                highlightList.textContent = 'No saved highlights.';
                return;
            }

            // Iterate over each page's highlights and display them
            Object.entries(allHighlights).forEach(([url, highlights]) => {
                const count = highlights.length;
                const entry = document.createElement('div');
                entry.className = 'highlight-entry';
                entry.textContent = `${url} (${count} highlights)`;
                entry.onclick = () => chrome.tabs.create({ url: url });
                highlightList.appendChild(entry);
            });
        });
    }

    fetchAndDisplayHighlights();

    // Listen for color picker changes
    colorPicker.addEventListener('input', function() {
        let chosenColor = colorPicker.value;

        // Store the selected color
        chrome.storage.local.set({'highlightColor': chosenColor}, function() {
            console.log('Highlight color saved: ' + chosenColor);
        });

        // Send the color to the content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'colorChange',
                color: chosenColor
            });
        });
    });
});
