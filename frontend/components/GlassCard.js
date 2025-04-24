import React from 'react';

const GlassCard = ({ children, className = '' }) => {
  return (
    <div 
      className={`
        rounded-xl 
        p-6 
        shadow-lg 
        backdrop-blur-xl 
        border 
        border-solid 
        border-glassBorder 
        bg-glassBg 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
