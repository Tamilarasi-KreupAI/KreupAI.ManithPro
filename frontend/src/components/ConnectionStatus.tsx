import React, { useState, useEffect } from 'react';
import { websocketService } from '../utils/websocketService';

const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // Initial connection
    connectWebSocket();

    // Check connection status periodically
    const interval = setInterval(() => {
      const connected = websocketService.isConnected();
      setIsConnected(connected);

      if (!connected && !isReconnecting) {
        setIsReconnecting(true);
        connectWebSocket();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const connectWebSocket = async () => {
    try {
      await websocketService.connect();
      setIsConnected(true);
      setIsReconnecting(false);
    } catch (error) {
      setIsConnected(false);
      setIsReconnecting(false);
    }
  };

  // Don't show anything if connected
  if (isConnected) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 max-w-sm">
        {isReconnecting ? (
          <>
            <div className="w-5 h-5 border-2 border-yellow-600 dark:border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="flex-1">
              <p className="font-semibold text-yellow-900 dark:text-yellow-100 text-sm">
                Reconnecting...
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Trying to restore real-time features
              </p>
            </div>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-yellow-900 dark:text-yellow-100 text-sm">
                Connection Lost
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Real-time features unavailable
              </p>
            </div>
            <button
              onClick={connectWebSocket}
              className="px-3 py-1 bg-yellow-600 dark:bg-yellow-500 text-white rounded hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
