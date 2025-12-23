import React from 'react';
import './ChristmasLoader.css';

interface ChristmasLoaderProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const ChristmasLoader: React.FC<ChristmasLoaderProps> = ({
  size = 'medium',
  text = 'Đang tải...'
}) => {
  const sizeMap = {
    small: '30px',
    medium: '50px',
    large: '70px',
  };

  return (
    <div className="christmas-loader-container">
      <div
        className="christmas-tree-loader"
        style={{ fontSize: sizeMap[size] }}
      >
        🎄
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default ChristmasLoader;
