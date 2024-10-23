(function() {
    // Report localStorage data
    function reportLocalStorage() {
      try {
        const itemCount = Object.keys(localStorage).length;
        browser.runtime.sendMessage({
          action: 'localStorageData',
          count: itemCount
        });
      } catch (e) {
        // Handle error silently
      }
    }
  
    // Execute the reporting function
    reportLocalStorage();
  })();
  