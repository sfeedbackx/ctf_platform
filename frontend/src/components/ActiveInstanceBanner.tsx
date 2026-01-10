import React, { useState, useEffect } from 'react';
import { type CtfInstance } from '../types/ctf';

interface Props {
  instance: CtfInstance;
  onStop: () => void;
}

export const ActiveInstanceBanner: React.FC<Props> = ({ instance, onStop }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(instance.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [instance.expiresAt]);

  return (
    <div className="bg-blue-600 text-white p-4 rounded-lg mb-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Active Challenge Instance</h3>
          <p className="text-sm opacity-90">
            {instance.status === 'PENDING' ? (
              <span className="animate-pulse">⏳ Starting instance...</span>
            ) : (
              <>
                🔗 <a href={instance.url} target="_blank" rel="noopener noreferrer" 
                     className="underline hover:text-blue-200">
                  Open Challenge
                </a>
              </>
            )}
          </p>
          <p className="text-sm mt-1">
            ⏱️ Expires in: <span className="font-mono font-bold">{timeLeft}</span>
          </p>
        </div>
        <button
          onClick={onStop}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
        >
          Stop Instance
        </button>
      </div>
    </div>
  );
};
