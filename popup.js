document.addEventListener('DOMContentLoaded', () => {
    getCurrentTab().then((tab) => {
      browser.runtime.sendMessage({ type: 'getData', tabId: tab.id }).then((data) => {
        updateUI(data);
      }).catch((error) => {
        console.error('Error retrieving data:', error);
      });
    }).catch((error) => {
      console.error('Error getting current tab:', error);
    });
  });
  
  function getCurrentTab() {
    return browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      return tabs[0];
    });
  }
  
  function updateUI(data) {
    // Update privacy score
    document.getElementById('privacy-score').textContent = data.privacyScore;
    document.getElementById('score-bar').value = data.privacyScore;
  
    // Update third-party connections
    let thirdPartyList = document.getElementById('third-party-list');
    thirdPartyList.innerHTML = '';
    if (data.thirdPartyConnections.length > 0) {
      data.thirdPartyConnections.forEach((domain) => {
        let li = document.createElement('li');
        li.textContent = domain;
        thirdPartyList.appendChild(li);
      });
    } else {
      thirdPartyList.textContent = 'None';
    }
  
    // Update local storage count
    let localStorageCount = data.localStorageItems !== undefined ? data.localStorageItems : '--';
    document.getElementById('local-storage-count').textContent = localStorageCount;
  
    // Update canvas fingerprinting detection
    document.getElementById('canvas-fingerprinting').textContent = data.canvasFingerprinting ? 'Yes' : 'No';
  
    // Update potential hijack detection
    document.getElementById('potential-hijack').textContent = data.potentialHijack ? 'Yes' : 'No';
  }
  