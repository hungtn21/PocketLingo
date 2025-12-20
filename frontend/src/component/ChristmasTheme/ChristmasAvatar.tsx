import React from 'react';
import './ChristmasAvatar.css';

interface ChristmasAvatarProps {
  children: React.ReactNode;
  showHat?: boolean;
  className?: string;
  size?: number; // Approximate size of the avatar to scale the hat
  style?: React.CSSProperties;
}

const ChristmasAvatar: React.FC<ChristmasAvatarProps> = ({ children, showHat = true, className = '', size = 32, style = {} }) => {
  // Calculate hat size based on avatar size
  // Adjusted to sit better "on top" of the head
  const hatSize = size * 0.85; 
  const topOffset = -size * 0.45; 
  const leftOffset = -size * 0.12;

  return (
    <div className={`christmas-avatar-container ${className}`} style={{ width: size, height: size, ...style }}>
      {children}
      {showHat && (
        <div 
          className="christmas-hat" 
          style={{ 
            width: hatSize, 
            height: hatSize,
            top: topOffset,
            left: leftOffset
          }} 
        />
      )}
    </div>
  );
};

export default ChristmasAvatar;
