import React, { useEffect, useState } from 'react';

const ServerStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data.status === 'ok') {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      })
      .catch(() => setStatus('offline'));
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#1A1128] border border-gaming-accent/30 px-3 py-1.5 rounded-full shadow-lg shadow-gaming-accent/10 text-xs font-medium">
      <div className={`w-2 h-2 rounded-full ${
        status === 'online' ? 'bg-green-500' : 
        status === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
      }`} />
      <span className="text-gray-300">
        MongoDB: {status === 'online' ? 'Connected' : status === 'offline' ? 'Disconnected' : 'Checking...'}
      </span>
    </div>
  );
};

export default ServerStatus;
