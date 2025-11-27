import React, { useState, useEffect } from "react";

export default function RemoteApp({ scope, module, url, fallback = null }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadRemote = async () => {
      try {
        setStatus('loading');
        setError(null);

        console.log(`Starting to load remote: ${scope}/${module} from ${url}`);

        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
          console.log('Script already exists, reusing...');
        } else {
          console.log('Loading remote entry script...');
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => {
              console.log('Remote entry script loaded successfully');
              resolve();
            };
            script.onerror = () => {
              reject(new Error(`Failed to load script: ${url}`));
            };
            document.head.appendChild(script);
          });
        }
        console.log('Waiting for container to be available...');
        await waitForContainer(scope, 20000);

        console.log('Container found, initializing...');
        await initializeContainer(scope);
        console.log('Getting module...');
        const factory = await window[scope].get(module);
        const Module = factory();
        
        if (mounted) {
          setStatus('loaded');
          console.log('Module loaded successfully!');
        }

      } catch (err) {
        console.error('Remote loading failed:', err);
        if (mounted) {
          setError(err.message);
          setStatus('error');
        }
      }
    };

    const waitForContainer = (scope, timeout) => {
      return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
          if (window[scope]) {
            console.log(`Container ${scope} detected after ${Date.now() - start}ms`);
            resolve();
          } else if (Date.now() - start > timeout) {
            reject(new Error(`Timeout: Container ${scope} never appeared`));
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    };

    const initializeContainer = async (scope) => {
      if (!window[scope]) {
        throw new Error(`Container ${scope} not found in window object`);
      }

      if (typeof __webpack_init_sharing__ === 'function') {
        await __webpack_init_sharing__('default');
      }

      if (typeof window[scope].init === 'function') {
        try {
          await window[scope].init(__webpack_share_scopes__.default);
        } catch (initErr) {
          console.warn('Container init warning (may be already initialized):', initErr);
        }
      }
    };

    loadRemote();

    return () => {
      mounted = false;
    };
  }, [scope, module, url]);

  if (status === 'loading') {
    return fallback || (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div>Loading {module}...</div>
        <div style={{ fontSize: '0.8em', color: '#666', marginTop: 10 }}>
          Scope: {scope}, URL: {url}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ 
        padding: 20, 
        border: '2px solid #ff4444', 
        borderRadius: 8,
        backgroundColor: '#ffeaea',
        color: '#cc0000'
      }}>
        <h3>Failed to load module</h3>
        <p><strong>Error:</strong> {error}</p>
        <p><strong>Scope:</strong> {scope}</p>
        <p><strong>Module:</strong> {module}</p>
        <p><strong>URL:</strong> {url}</p>
        
        <div style={{ marginTop: 20, padding: 10, backgroundColor: '#fff', borderRadius: 4 }}>
          <h4>Debugging Steps:</h4>
          <ol style={{ textAlign: 'left' }}>
            <li>Check if remote app is running on port 3002</li>
            <li>Verify {url} loads in browser</li>
            <li>Check browser console for CORS errors</li>
            <li>Verify remote webpack config has correct exposes</li>
          </ol>
        </div>

        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: 15,
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return <div>Module should be loaded now!</div>;
}