import React, { useState, useEffect } from "react";

export default function RemoteApp({ scope, module, url, fallback = null }) {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let script = null;

    const loadRemoteComponent = async () => {
      try {
        setLoading(true);
        setError(null);

        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
        } else {
          await new Promise((resolve, reject) => {
            script = document.createElement('script');
            script.src = url;
            script.type = 'text/javascript';
            script.async = true;

            script.onload = () => {
              resolve();
            };

            script.onerror = () => {
              reject(new Error(`Failed to load script: ${url}`));
            };

            document.head.appendChild(script);
          });
        }

        await waitForContainer(scope, 10000);
        await initializeContainer(scope);

        const moduleFactory = await window[scope].get(module);
        if (!moduleFactory) {
          throw new Error(`Module ${module} not found in container ${scope}`);
        }

        const moduleObject = moduleFactory();
        if (!moduleObject || !moduleObject.default) {
          throw new Error(`Invalid module exported from ${scope}/${module}`);
        }

        if (isMounted) {
          setComponent(() => moduleObject.default);
        }

      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRemoteComponent();

    return () => {
      isMounted = false;
    };
  }, [scope, module, url]);

  const waitForContainer = (scope, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkContainer = () => {
        if (window[scope] && typeof window[scope].init === 'function') {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for container ${scope} after ${timeout}ms`));
        } else {
          setTimeout(checkContainer, 100);
        }
      };
      
      checkContainer();
    });
  };

  const initializeContainer = async (scope) => {
    const container = window[scope];
    if (!container) {
      throw new Error(`Container ${scope} not found`);
    }

    if (typeof __webpack_init_sharing__ === 'function') {
      if (!window.__webpack_share_scopes__?.default) {
        await __webpack_init_sharing__('default');
      }
    }

    if (typeof container.init === 'function') {
      const shareScope = window.__webpack_share_scopes__?.default || {};
      await container.init(shareScope);
    }
  };

  if (loading) {
    return <div>Loading {module}...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', border: '1px solid red' }}>
        <h3>Error Loading Module</h3>
        <p><strong>Error:</strong> {error}</p>
        <p><strong>Scope:</strong> {scope}</p>
        <p><strong>Module:</strong> {module}</p>
        <p><strong>URL:</strong> {url}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '10px' }}>
          Retry
        </button>
      </div>
    );
  }

  return Component ? <Component /> : <div>Module loaded but no component found</div>;
}