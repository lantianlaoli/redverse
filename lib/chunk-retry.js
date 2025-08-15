// Chunk loading retry mechanism
if (typeof window !== 'undefined') {
  const originalJsonpFunction = window.__webpack_require__;
  
  if (originalJsonpFunction && originalJsonpFunction.e) {
    const originalE = originalJsonpFunction.e;
    
    originalJsonpFunction.e = function(chunkId) {
      return originalE.call(this, chunkId).catch((error) => {
        console.warn(`Chunk ${chunkId} loading failed, retrying...`, error);
        
        // Retry logic with exponential backoff
        return new Promise((resolve, reject) => {
          let retries = 0;
          const maxRetries = 3;
          
          const retry = () => {
            if (retries >= maxRetries) {
              reject(new Error(`Failed to load chunk ${chunkId} after ${maxRetries} retries`));
              return;
            }
            
            const delay = Math.pow(2, retries) * 1000; // Exponential backoff
            retries++;
            
            setTimeout(() => {
              originalE.call(originalJsonpFunction, chunkId)
                .then(resolve)
                .catch(() => {
                  console.warn(`Retry ${retries} failed for chunk ${chunkId}`);
                  retry();
                });
            }, delay);
          };
          
          retry();
        });
      });
    };
  }
  
  // Handle unhandled chunk loading errors
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.name === 'ChunkLoadError') {
      console.warn('Caught ChunkLoadError:', event.reason);
      // Reload the page as a last resort
      if (confirm('A resource failed to load. Would you like to refresh the page?')) {
        window.location.reload();
      }
      event.preventDefault();
    }
  });
}