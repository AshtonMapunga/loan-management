import React, { useState, useEffect } from 'react';

const EnhancedLoadingSpinner = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white z-50" style={{ transition: 'opacity 0.5s ease-out' }}>
      <div style={{
        position: 'absolute',
        right: '33%',  // Adjust this value to control distance from right edge
        top: '50%',
        transform: 'translateY(-50%)',
        textAlign: 'center'
      }}>
        <style>{`
          @keyframes movePulse {
            0% { transform: scale(0.6) translateY(0px); opacity: 0.4; }
            25% { transform: scale(0.9) translateY(-10px); opacity: 0.7; }
            50% { transform: scale(1.3) translateY(-20px); opacity: 1; }
            75% { transform: scale(0.9) translateY(-10px); opacity: 0.7; }
            100% { transform: scale(0.6) translateY(0px); opacity: 0.4; }
          }
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          .spinner-container {
            position: relative;
            width: 120px;
            height: 120px;
            animation: rotate 4s linear infinite;
            margin: 0 auto;
          }
          .square {
            position: absolute;
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #ff6b35, #ff8c42);
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
            animation: movePulse 2s ease-in-out infinite;
          }
          .square:nth-child(1) { top: 10px; left: 46px; animation-delay: 0s; }
          .square:nth-child(2) { top: 46px; right: 10px; animation-delay: 0.25s; }
          .square:nth-child(3) { bottom: 10px; left: 46px; animation-delay: 0.5s; }
          .square:nth-child(4) { top: 46px; left: 10px; animation-delay: 0.75s; }
          .square:nth-child(5) { 
            top: 46px; 
            left: 46px; 
            animation-delay: 1s; 
            background: linear-gradient(135deg, #ff8c42, #ffad42); 
          }
          .progress-dots {
            display: flex;
            gap: 8px;
            margin-top: 20px;
            justify-content: center;
          }
          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff6b35, #ff8c42);
            animation: fadeInOut 1.5s ease-in-out infinite;
          }
          .dot:nth-child(1) { animation-delay: 0s; }
          .dot:nth-child(2) { animation-delay: 0.3s; }
          .dot:nth-child(3) { animation-delay: 0.6s; }
          .dot:nth-child(4) { animation-delay: 0.9s; }
          .dot:nth-child(5) { animation-delay: 1.2s; }
        `}</style>
        
        <div className="spinner-container">
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
        </div>
        
        <div className="progress-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoadingSpinner;