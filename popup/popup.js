document.addEventListener('DOMContentLoaded', function() {
  const scanButton = document.getElementById('scan-button');
  scanButton.addEventListener('click', performScan);

  function performScan() {
    // Reset UI elements
    document.getElementById('privacy-score').textContent = '--';
    document.getElementById('score-bar').value = 0;
    document.getElementById('third-party-list').innerHTML = '<li>--</li>';
    document.getElementById('local-storage-count').textContent = '--';
    document.getElementById('canvas-fp-count').textContent = '0';
    document.getElementById('canvas-fp-list').innerHTML = '';
    document.getElementById('hijack-count').textContent = '0';
    document.getElementById('hijack-list').innerHTML = '';
    document.getElementById('cookies-info').textContent = '--';

    // Start scanning
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const tab = tabs[0];
      const tabId = tab.id;

      // Request detection data from background script
      browser.runtime.sendMessage({ action: 'getDetectionData', tabId: tabId }).then(data => {
        updateUI(data, tab);
      });
    });
  }

  function updateUI(data, tab) {
    let privacyScore = 100; // Start at 100

    // Third-Party Connections
    const thirdPartyList = document.getElementById('third-party-list');
    thirdPartyList.innerHTML = '';
    const thirdPartyDomains = data.thirdPartyDomains || [];
    if (thirdPartyDomains.length === 0) {
      thirdPartyList.innerHTML = '<li>None</li>';
    } else {
      thirdPartyDomains.forEach(domain => {
        const li = document.createElement('li');
        li.textContent = domain;
        thirdPartyList.appendChild(li);
      });
    }
    // Deduct points
    const thirdPartyDeduction = Math.min(thirdPartyDomains.length * 1, 20);
    privacyScore -= thirdPartyDeduction;

    // Local Storage Items
    const localStorageCount = data.localStorageItems || 0;
    document.getElementById('local-storage-count').textContent = localStorageCount;
    // Deduct points
    const storageDeduction = Math.min(localStorageCount * 0.5, 10);
    privacyScore -= storageDeduction;

    // Canvas Fingerprinting
    const canvasFpEvents = data.canvasFingerprintingEvents || [];
    const canvasFpCount = canvasFpEvents.length;
    document.getElementById('canvas-fp-count').textContent = canvasFpCount;
    const canvasFpList = document.getElementById('canvas-fp-list');
    canvasFpList.innerHTML = '';
    if (canvasFpCount > 0) {
      canvasFpEvents.forEach(event => {
        const li = document.createElement('li');
        li.textContent = `${event.method} called on ${event.url}`;
        canvasFpList.appendChild(li);
      });
      privacyScore -= Math.min(canvasFpCount * 5, 30);
    } else {
      canvasFpList.innerHTML = '<li>None</li>';
    }

    // Potential Browser Hijacking
    const hijackEvents = data.hijackAttempts || [];
    const hijackCount = hijackEvents.length;
    document.getElementById('hijack-count').textContent = hijackCount;
    const hijackList = document.getElementById('hijack-list');
    hijackList.innerHTML = '';
    if (hijackCount > 0) {
      hijackEvents.forEach(event => {
        const li = document.createElement('li');
        li.textContent = `${event.method} called on ${event.url}`;
        hijackList.appendChild(li);
      });
      privacyScore -= Math.min(hijackCount * 5, 40);
    } else {
      hijackList.innerHTML = '<li>None</li>';
    }

    // Cookies
    browser.cookies.getAll({ url: tab.url }).then(cookies => {
      let firstPartyCookies = 0;
      let thirdPartyCookies = 0;
      let superCookies = 0;

      const tabDomain = new URL(tab.url).hostname;

      cookies.forEach(cookie => {
        if (cookie.domain.includes(tabDomain) || tabDomain.includes(cookie.domain)) {
          firstPartyCookies++;
        } else {
          thirdPartyCookies++;
        }
        if (cookie.expirationDate && cookie.expirationDate > (Date.now() / 1000 + 31536000)) {
          superCookies++;
        }
      });

      document.getElementById('cookies-info').textContent =
        `First-party: ${firstPartyCookies}, Third-party: ${thirdPartyCookies}, Supercookies: ${superCookies}`;

      // Deduct points
      const cookiesDeduction = Math.min((thirdPartyCookies * 0.5 + superCookies * 1), 20);
      privacyScore -= cookiesDeduction;

      // Update privacy score
      updatePrivacyScore(privacyScore);
    });
  }

  function updatePrivacyScore(score) {
    if (score < 0) score = 0;
    document.getElementById('privacy-score').textContent = score;
    document.getElementById('score-bar').value = score;
  }
});
