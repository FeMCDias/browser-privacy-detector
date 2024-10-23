(function() {
    // Notify background script about canvas fingerprinting
    function reportCanvasFingerprinting(methodName) {
      try {
        browser.runtime.sendMessage({
          action: 'canvasFingerprintEvent',
          method: methodName
        });
      } catch (e) {
        // Handle error silently
      }
    }
  
    // Monitor canvas methods
    function monitorCanvas() {
      const methodsToOverride = ['toDataURL', 'toBlob'];
      methodsToOverride.forEach((method) => {
        const originalMethod = HTMLCanvasElement.prototype[method];
        if (originalMethod) {
          HTMLCanvasElement.prototype[method] = function() {
            reportCanvasFingerprinting(`HTMLCanvasElement.${method}`);
            return originalMethod.apply(this, arguments);
          };
        }
      });
  
      const contextMethods = ['getImageData', 'getContext'];
      contextMethods.forEach((method) => {
        const originalMethod = CanvasRenderingContext2D.prototype[method];
        if (originalMethod) {
          CanvasRenderingContext2D.prototype[method] = function() {
            reportCanvasFingerprinting(`CanvasRenderingContext2D.${method}`);
            return originalMethod.apply(this, arguments);
          };
        }
      });
    }
  
    // Execute the monitoring function
    monitorCanvas();
  })();
  