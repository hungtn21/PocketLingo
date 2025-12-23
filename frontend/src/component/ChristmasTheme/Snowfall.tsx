import React, { useEffect, useState } from 'react';
import './Snowfall.css';

interface SnowflakeProps {
  id: number;
}

const Snowflake: React.FC<SnowflakeProps> = ({ id }) => {
  const style = {
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 3 + 2}s`,
    animationDelay: `${Math.random() * 2}s`,
    opacity: Math.random() * 0.6 + 0.4,
    fontSize: `${Math.random() * 10 + 10}px`,
    color: '#ffffff',
  };

  return (
    <div className="snowflake" style={style}>
      ❄
    </div>
  );
};

interface SnowfallProps {
  enabled?: boolean;
  intensity?: 'light' | 'medium' | 'heavy';
}

const Snowfall: React.FC<SnowfallProps> = ({ enabled = true, intensity = 'medium' }) => {
  const [snowflakes, setSnowflakes] = useState<number[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setSnowflakes([]);
      return;
    }

    const counts = {
      light: 20,
      medium: 40,
      heavy: 60,
    };

    const count = counts[intensity];
    setSnowflakes(Array.from({ length: count }, (_, i) => i));

    // Hide after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [enabled, intensity]);

  if (!enabled || !visible) return null;

  return (
    <div className="snowfall-container">
      {snowflakes.map((id) => (
        <Snowflake key={id} id={id} />
      ))}
    </div>
  );
};

export default Snowfall;
