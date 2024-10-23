let thirdPartyConnections = {};
let localStorageUsage = {};
let canvasFingerprintAttempts = {};
let potentialHijacks = {};

// Monitor network requests to detect third-party connections
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    let tabId = details.tabId;
    if (tabId === -1) return; // Ignore requests not associated with a tab

    let requestUrl = new URL(details.url);
    let requestDomain = requestUrl.hostname;

    browser.tabs.get(tabId).then((tab) => {
      if (!tab || !tab.url) return;
      let tabUrl = new URL(tab.url);
      let tabDomain = tabUrl.hostname;

      if (requestDomain !== tabDomain && !isSubdomain(requestDomain, tabDomain)) {
        if (!thirdPartyConnections[tabId]) {
          thirdPartyConnections[tabId] = new Set();
        }
        thirdPartyConnections[tabId].add(requestDomain);
      }
    });
  },
  { urls: ["<all_urls>"] },
  []
);

// Utility function to check if a domain is a subdomain of another
function isSubdomain(domain, rootDomain) {
  return domain.endsWith('.' + rootDomain) || domain === rootDomain;
}

// Listen for messages from content scripts and popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let tabId = sender.tab ? sender.tab.id : null;

  if (message.type === 'getData') {
    if (!tabId) {
      console.warn('Received getData message without tabId');
      return;
    }

    let data = {
      thirdPartyConnections: thirdPartyConnections[tabId] ? Array.from(thirdPartyConnections[tabId]) : [],
      localStorageItems: localStorageUsage[tabId] ? localStorageUsage[tabId].size : 0,
      canvasFingerprinting: !!canvasFingerprintAttempts[tabId],
      potentialHijack: !!potentialHijacks[tabId],
      privacyScore: calculatePrivacyScore(tabId)
    };

    sendResponse(data);
    return; // No need to process further
  }

  if (!tabId) {
    console.warn('Received message without tabId:', message);
    return;
  }

  if (message.type === 'localStorageData') {
    console.log('Received localStorageData from tabId:', tabId, 'Data:', message.data);
    if (!localStorageUsage[tabId]) {
      localStorageUsage[tabId] = new Set();
    }
    message.data.forEach(key => localStorageUsage[tabId].add(key));
  }

  if (message.type === 'canvasFingerprinting') {
    console.log('Received canvasFingerprinting message from tabId:', tabId);
    canvasFingerprintAttempts[tabId] = true;
  }

  if (message.type === 'potentialHijack') {
    console.log('Received potentialHijack message from tabId:', tabId);
    potentialHijacks[tabId] = true;
  }
});

// Detect potential browser hijacking by checking browser settings
function checkBrowserSettings(tabId) {
  if (browser.browserSettings && browser.browserSettings.homepageOverride) {
    browser.browserSettings.homepageOverride.get({}).then((result) => {
      if (result.value !== '') {
        potentialHijacks[tabId] = true;
      }
    });

    browser.browserSettings.searchSuggestEnabled.get({}).then((result) => {
      if (!result.value) {
        potentialHijacks[tabId] = true;
      }
    });
  } else {
    console.warn('browser.browserSettings is not available.');
  }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    checkBrowserSettings(tabId);
  }
});

// Function to calculate the privacy score
function calculatePrivacyScore(tabId) {
  let score = 100;

  // Third-party connections
  let thirdPartyCount = thirdPartyConnections[tabId] ? thirdPartyConnections[tabId].size : 0;
  score -= Math.min(thirdPartyCount * 2, 50); // Max deduction of 50 points

  // Local storage usage
  let localStorageItems = localStorageUsage[tabId] ? localStorageUsage[tabId].size : 0;
  score -= Math.min(localStorageItems * 2, 20); // Max deduction of 20 points

  // Canvas fingerprinting
  if (canvasFingerprintAttempts[tabId]) {
    score -= 20;
  }

  // Potential hijacks
  if (potentialHijacks[tabId]) {
    score -= 10;
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, score);
  return score;
}
