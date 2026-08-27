import React, { useState, useEffect } from 'react';

const messages = [
  "VERIFIED COD AVAILABLE   |    LIVE SALE 15% OFF ON ODYSSEY FRAMES   |    EASY 30-DAY RETURN   |    PRECISION CUTS"
];

const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      backgroundColor: 'var(--color-text)',
      color: 'var(--color-bg)',
      padding: '8px',
      textAlign: 'center',
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      <div key={currentIndex} style={{ animation: 'fadeIn 0.5s ease' }}>
        {messages[currentIndex]}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
