import React, { useState } from "react";
import "./DragDropQuestion.css";

interface Question {
  question_id: number;
  content: string;
  side_a_items?: string[];
  side_b_items?: string[];
}

interface Props {
  question: Question;
  userPairs?: Record<string, string>;
  onAnswerChange: (answer: Record<string, string>) => void;
}

const DragDropQuestion: React.FC<Props> = ({
  question,
  userPairs = {},
  onAnswerChange,
}) => {
  const [pairs, setPairs] = useState<Record<string, string>>(userPairs);
  const [selectedSideA, setSelectedSideA] = useState<string | null>(null);

  const handleSideAClick = (item: string) => {
    setSelectedSideA(item);
  };

  const handleSideBClick = (item: string) => {
    if (!selectedSideA) {
      alert("Vui lòng chọn một mục từ cột Tiếng Anh trước!");
      return;
    }

    const newPairs = { ...pairs };
    
    // Remove old pairing if the selected side_b item was already paired
    Object.keys(newPairs).forEach((key) => {
      if (newPairs[key] === item) {
        delete newPairs[key];
      }
    });

    // Add new pairing
    newPairs[selectedSideA] = item;
    setPairs(newPairs);
    onAnswerChange(newPairs);
    setSelectedSideA(null);
  };

  const handleRemovePair = (sideAItem: string) => {
    const newPairs = { ...pairs };
    delete newPairs[sideAItem];
    setPairs(newPairs);
    onAnswerChange(newPairs);
  };

  // Get available side_b items (not yet paired)
  const pairedValues = new Set(Object.values(pairs));
  const availableSideBItems = question.side_b_items?.filter(
    (item) => !pairedValues.has(item)
  ) || [];

  return (
    <div className="drag-drop-question">
      <h2 className="question-content">{question.content}</h2>
      <p className="instruction">Chọn một mục từ cột Tiếng Anh, sau đó chọn đáp án tương ứng từ cột Tiếng Việt</p>

      <div className="drag-drop-container">
        <div className="pairs-section">
          <h3>Tiếng Anh</h3>
          {question.side_a_items?.map((item) => (
            <div key={item} className="droppable-row">
              <div
                className={`side-a-label ${selectedSideA === item ? "selected" : ""} ${pairs[item] ? "paired" : ""}`}
                onClick={() => handleSideAClick(item)}
              >
                {item}
              </div>
              <div
                className={`droppable-slot ${pairs[item] ? "has-item" : ""}`}
                onClick={() => pairs[item] && handleRemovePair(item)}
                title={pairs[item] ? "Nhấp để xóa" : ""}
              >
                {pairs[item] || "?"}
              </div>
            </div>
          ))}
        </div>

        <div className="items-section">
          <h3>Tiếng Việt</h3>
          <div className="items-pool">
            {availableSideBItems.map((item) => (
              <div
                key={item}
                className="draggable-item"
                onClick={() => handleSideBClick(item)}
              >
                {item}
              </div>
            ))}
            {availableSideBItems.length === 0 && (
              <div className="no-items">Tất cả đã được ghép đôi</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragDropQuestion;
