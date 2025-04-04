import React, { useEffect, useState } from 'react';
import { useIsOnline } from '../hooks/useIsOnline';

/**
 * Offline indicator component.
 * Shows information about connection status and offline mode availability.
 */
const OfflineIndicator: React.FC = () => {
  const isOnline = useIsOnline();
  const [serviceWorkerActive, setServiceWorkerActive] = useState(false);
  const [serviceWorkerVersion, setServiceWorkerVersion] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check Service Worker status
    const checkServiceWorker = () => {
      const isActive = !!navigator.serviceWorker && !!navigator.serviceWorker.controller;
      setServiceWorkerActive(isActive);
      
      if (isActive && navigator.serviceWorker.controller) {
        // Request version from Service Worker
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data && event.data.type === 'VERSION_INFO') {
            setServiceWorkerVersion(event.data.payload.version);
          }
        };
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_VERSION', messageId: Date.now().toString() },
          [messageChannel.port2]
        );
      }
    };
    
    // Check Service Worker status on load
    checkServiceWorker();
    
    // And check periodically 
    const intervalId = setInterval(checkServiceWorker, 10000);

    // Message handler for Service Worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_ACTIVATED') {
        setServiceWorkerActive(true);
        setServiceWorkerVersion(event.data.version);
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      clearInterval(intervalId);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  // Don't show indicator if online and not in debug mode
  if (isOnline && !showDetails && !window.location.search.includes('debug=true')) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg z-50 
        ${!isOnline ? 'bg-orange-100 border-orange-400' : 'bg-green-100 border-green-400'} 
        border-l-4 flex items-center`}
      onClick={() => setShowDetails(!showDetails)}
    >
      <span className={`material-icons mr-2 ${!isOnline ? 'text-orange-500' : 'text-green-500'}`}>
        {!isOnline ? 'wifi_off' : 'offline_pin'}
      </span>
      <div>
        {!isOnline ? (
          <div>
            <p className="font-medium">Offline Mode</p>
            <p className="text-sm text-gray-600">App is working without internet connection</p>
            {serviceWorkerActive && (
              <p className="text-xs text-gray-500">
                <span id="service-worker-status">Service Worker active</span>
                {serviceWorkerVersion && ` (v${serviceWorkerVersion})`}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="font-medium">Online Mode</p>
            <p className="text-sm text-gray-600">
              {serviceWorkerActive 
                ? 'Offline mode available' 
                : 'Offline mode not activated'}
            </p>
            {serviceWorkerActive && (
              <p className="text-xs text-gray-500">
                <span id="service-worker-status">Service Worker active</span>
                {serviceWorkerVersion && ` (v${serviceWorkerVersion})`}
              </p>
            )}
          </div>
        )}
        
        {/* Debug information */}
        {showDetails && (
          <div className="text-xs mt-2 pt-2 border-t border-gray-200">
            <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
            <p>SW: {serviceWorkerActive ? 'Active' : 'Inactive'}</p>
            <p>Controller: {navigator.serviceWorker?.controller ? 'Yes' : 'No'}</p>
            <p className="mt-1 text-[10px] opacity-70 italic">Tap to hide</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;