(function() {
  console.log('Content script injected');

  // Detect localStorage usage
  (function() {
    console.log('Setting up localStorage detection');

    function reportLocalStorage() {
      try {
        let localStorageKeys = Object.keys(localStorage);
        console.log('Local Storage Keys:', localStorageKeys);

        browser.runtime.sendMessage({
          type: 'localStorageData',
          data: localStorageKeys
        }).then(() => {
          console.log('Sent localStorageData message to background script');
        }).catch((error) => {
          console.error('Error sending localStorageData message:', error);
        });
      } catch (e) {
        console.error('SecurityError accessing localStorage: ', e);
      }
    }

    // Report local storage usage immediately
    reportLocalStorage();

    // Listen for storage events to capture any changes
    window.addEventListener('storage', function(event) {
      console.log('Storage event detected:', event);
      reportLocalStorage();
    });

    // For pages that use local storage asynchronously, poll for changes
    let previousLength = 0;
    setInterval(function() {
      try {
        let currentLength = Object.keys(localStorage).length;
        if (currentLength !== previousLength) {
          previousLength = currentLength;
          console.log('Detected change in localStorage size');
          reportLocalStorage();
        }
      } catch (e) {
        console.error('Error accessing localStorage in setInterval:', e);
      }
    }, 1000);
  })();

  // Detect canvas fingerprinting
  (function() {
    console.log('Setting up canvas fingerprinting detection');
    const canvasMethods = ['toDataURL', 'toBlob', 'getContext'];

    canvasMethods.forEach(function(method) {
      const original = HTMLCanvasElement.prototype[method];
      HTMLCanvasElement.prototype[method] = function() {
        if (method === 'getContext') {
          const context = arguments[0];
          if (context === '2d' || context === 'webgl' || context === 'experimental-webgl') {
            console.log(`Canvas getContext called with context: ${context}`);
            // Monitor context methods
            monitorCanvasContext(this.getContext(context));
          }
        } else {
          console.log(`HTMLCanvasElement.${method} called`);
          browser.runtime.sendMessage({ type: 'canvasFingerprinting', url: window.location.href })
            .then(() => {
              console.log('Sent canvasFingerprinting message to background script');
            })
            .catch((error) => {
              console.error('Error sending canvasFingerprinting message:', error);
            });
        }
        return original.apply(this, arguments);
      };
    });

    function monitorCanvasContext(ctx) {
      if (!ctx) return;

      const methodsToMonitor = [
        'getImageData',
        'fillText',
        'strokeText',
        'measureText',
        'getLineDash',
        'getParameter',
        'getExtension',
        'readPixels',
        'drawImage'
      ];

      methodsToMonitor.forEach(function(method) {
        if (ctx[method]) {
          const original = ctx[method];
          ctx[method] = function() {
            console.log(`Canvas context method ${method} called`);
            browser.runtime.sendMessage({ type: 'canvasFingerprinting', url: window.location.href })
              .then(() => {
                console.log('Sent canvasFingerprinting message to background script');
              })
              .catch((error) => {
                console.error('Error sending canvasFingerprinting message:', error);
              });
            return original.apply(this, arguments);
          };
        }
      });
    }

    // Monitor WebGLRenderingContext
    if (window.WebGLRenderingContext) {
      console.log('Setting up WebGL context monitoring');
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, attrs) {
        const context = originalGetContext.call(this, type, attrs);
        if (type === 'webgl' || type === 'experimental-webgl') {
          console.log(`WebGL getContext called with type: ${type}`);
          monitorWebGLContext(context);
        }
        return context;
      };

      function monitorWebGLContext(gl) {
        if (!gl) return;

        const methodsToMonitor = ['getParameter', 'getSupportedExtensions', 'getShaderPrecisionFormat'];

        methodsToMonitor.forEach(function(method) {
          if (gl[method]) {
            const original = gl[method];
            gl[method] = function() {
              console.log(`WebGL context method ${method} called`);
              browser.runtime.sendMessage({ type: 'canvasFingerprinting', url: window.location.href })
                .then(() => {
                  console.log('Sent canvasFingerprinting message to background script');
                })
                .catch((error) => {
                  console.error('Error sending canvasFingerprinting message:', error);
                });
              return original.apply(this, arguments);
            };
          }
        });
      }
    }
  })();

  // Detect potential browser hijacking via script injections or modifications
  (function() {
    console.log('Setting up potential hijacking detection');
    // Monitor for script injections
    let originalAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function(element) {
      if (element && element.tagName === 'SCRIPT') {
        console.log('Script element appended:', element.src || element.textContent);
        browser.runtime.sendMessage({ type: 'potentialHijack', url: window.location.href })
          .then(() => {
            console.log('Sent potentialHijack message to background script');
          })
          .catch((error) => {
            console.error('Error sending potentialHijack message:', error);
          });
      }
      return originalAppendChild.apply(this, arguments);
    };
  })();
})();
