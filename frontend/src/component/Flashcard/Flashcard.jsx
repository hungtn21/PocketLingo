import React, { useState } from 'react';
import './Flashcard.css';

const Flashcard = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`flashcard-wrapper ${isFlipped ? 'flipped' : ''}`} 
      onClick={handleClick}
    >
      <div className="flashcard-inner">
        {/* MẶT TRƯỚC: Hiển thị từ vựng */}
        <div className="flashcard-front">
          <span className="flashcard-word">{data.word}</span>
        </div>

        {/* MẶT SAU: Hiển thị ảnh + nghĩa */}
        <div className="flashcard-back">
          {data.image_url && (
            <img src={data.image_url} alt={data.word} className="flashcard-image" />
          )}
          <span className="flashcard-meaning">{data.meaning}</span>
          {data.example && (
             <span className="flashcard-hint">Ex: {data.example}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;