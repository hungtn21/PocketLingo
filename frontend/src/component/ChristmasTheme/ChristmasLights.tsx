import React from 'react';
import './ChristmasLights.css';

const ChristmasLights: React.FC = () => {
  const lights = Array.from({ length: 20 }, (_, i) => i);
  const colors = ['red', 'yellow', 'blue', 'green'];

  return (
    <div className="christmas-lights">
      {lights.map((i) => (
        <div
          key={i}
          className={`light ${colors[i % colors.length]}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
};

export default ChristmasLights;
