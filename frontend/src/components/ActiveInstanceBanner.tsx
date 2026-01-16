import React, { useState, useEffect } from 'react';
import { type CtfInstance } from '../types/ctf';
import './ActiveInstanceBanner.css';

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
    <div className="active-instance-banner">
      <div className="info">
        <h3>Active Challenge Instance</h3>
        <p>
          {instance.status === 'PENDING' ? (
            <span className="pulse">⏳ Starting instance...</span>
          ) : (
            <>
              🔗{' '}
              <a href={instance.url} target="_blank" rel="noopener noreferrer">
                Open Challenge
              </a>
            </>
          )}
        </p>
        <p className="timer">⏱️ Expires in: {timeLeft}</p>
      </div>
      <button onClick={onStop}>Stop Instance</button>
    </div>
  );
};
