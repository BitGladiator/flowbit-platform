import React, { Suspense, lazy } from 'react';

export default function RemoteApp({ scope, module, url }) {
  const RemoteComponent = lazy(() => {
    return new Promise((resolve, reject) => {
      // Check if remote is already loaded
      if (window[scope]) {
        resolve(loadComponent(scope, module));
        return;
      }

      // Load remote script
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        resolve(loadComponent(scope, module));
      };
      script.onerror = () => {
        reject(new Error(`Failed to load remote: ${url}`));
      };
      document.head.appendChild(script);
    });
  });

  return (
    <Suspense fallback={<div style={styles.loading}>Loading module...</div>}>
      <RemoteComponent />
    </Suspense>
  );
}

async function loadComponent(scope, module) {
  await __webpack_init_sharing__('default');
  const container = window[scope];
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(module);
  return factory();
}

const styles = {
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    fontSize: '16px',
    color: '#666',
  },
};