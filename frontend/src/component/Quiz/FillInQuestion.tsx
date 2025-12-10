import React from "react";
import "./FillInQuestion.css";

interface Question {
  question_id: number;
  content: string;
}

interface Props {
  question: Question;
  userAnswer?: string;
  onAnswerChange: (answer: string) => void;
}

const FillInQuestion: React.FC<Props> = ({
  question,
  userAnswer = "",
  onAnswerChange,
}) => {
  return (
    <div className="fill-in-question">
      <h2 className="question-content">{question.content}</h2>
      
      <div className="answer-input-container">
        <input
          type="text"
          className="answer-input"
          placeholder="Nhập đáp án tại đây"
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default FillInQuestion;
