import React, { useState, useEffect } from "react";

export default function RemoteApp({ scope, module, url }) {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRemoteComponent();
  }, [scope, module, url]);

  const loadRemoteComponent = async () => {
    try {
      if (window[scope]) {
        const component = await loadComponent(scope, module);
        setComponent(() => component);
        return;
      }

      const script = document.createElement("script");
      script.src = url;
      script.onload = async () => {
        const component = await loadComponent(scope, module);
        setComponent(() => component);
      };
      script.onerror = () => {
        setError(new Error(`Failed to load remote: ${url}`));
      };
      document.head.appendChild(script);
    } catch (err) {
      setError(err);
    }
  };

  if (error) {
    console.error("Failed to load remote component:", error);
    return null; 
  }

  if (!Component) {
    return null; 
  }

  return <Component />;
}

async function loadComponent(scope, module) {
  await __webpack_init_sharing__("default");
  const container = window[scope];
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(module);
  return factory();
}