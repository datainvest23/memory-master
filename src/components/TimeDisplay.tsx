'use client';

import { useState, useEffect } from 'react';

const TimeDisplay = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    // Update immediately
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '8px 16px',
      borderRadius: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      fontSize: '18px',
      fontWeight: '500',
      zIndex: 1000,
      backdropFilter: 'blur(5px)',
    }}>
      {time}
    </div>
  );
};

export default TimeDisplay; 