(function() {
    // Notify background script about potential hijacking
    function reportHijackAttempt(methodName) {
      try {
        browser.runtime.sendMessage({
          action: 'hijackAttempt',
          method: methodName
        });
      } catch (e) {
        // Handle error silently
      }
    }
  
    // Monitor window.location modifications
    function monitorLocation() {
      ['assign', 'replace', 'reload'].forEach((method) => {
        const originalMethod = window.location[method];
        if (originalMethod) {
          window.location[method] = function() {
            reportHijackAttempt(`window.location.${method}`);
            return originalMethod.apply(window.location, arguments);
          };
        }
      });
  
      // Monitor setting of window.location.href
      try {
        const hrefDescriptor = Object.getOwnPropertyDescriptor(window.location.__proto__, 'href');
        if (hrefDescriptor && hrefDescriptor.set) {
          Object.defineProperty(window.location, 'href', {
            configurable: true,
            enumerable: true,
            get: function() {
              return hrefDescriptor.get.call(window.location);
            },
            set: function(value) {
              reportHijackAttempt('window.location.href');
              return hrefDescriptor.set.call(window.location, value);
            }
          });
        }
      } catch (e) {
        // Handle error silently
      }
    }
  
    // Execute the monitoring function
    monitorLocation();
  })();
  