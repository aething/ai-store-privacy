import React, { useState, useEffect } from 'react';

interface RippleProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
}

interface RippleStyle {
  left: number;
  top: number;
  width: number;
  height: number;
  backgroundColor?: string;
}

const RippleEffect: React.FC<RippleProps> = ({ 
  children, 
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 600 
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number, style: RippleStyle }>>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ripples.length > 0) {
        setRipples([]);
      }
    }, duration * 2);
    
    return () => clearTimeout(timer);
  }, [ripples, duration]);
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    
    const left = e.clientX - rect.left;
    const top = e.clientY - rect.top;
    const width = Math.max(rect.width, rect.height) * 2;
    const height = width;
    
    const newRipple = {
      id: Date.now(),
      style: {
        left,
        top,
        width,
        height,
        backgroundColor: color
      }
    };
    
    setRipples([...ripples, newRipple]);
  };
  
  return (
    <div 
      className="ripple-container"
      onClick={handleClick}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            position: 'absolute',
            borderRadius: '50%',
            transform: 'scale(0)',
            animation: `ripple ${duration}ms linear`,
            left: ripple.style.left - ripple.style.width / 2,
            top: ripple.style.top - ripple.style.height / 2,
            width: ripple.style.width,
            height: ripple.style.height,
            backgroundColor: ripple.style.backgroundColor
          }}
        />
      ))}
    </div>
  );
};

export default RippleEffect;