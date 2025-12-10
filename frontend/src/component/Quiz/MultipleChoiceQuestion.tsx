import React from "react";
import "./MultipleChoiceQuestion.css";

interface Option {
  id: string;
  text: string;
}

interface Question {
  question_id: number;
  content: string;
  options?: Option[];
}

interface Props {
  question: Question;
  selectedAnswer?: string;
  onAnswerChange: (answer: string) => void;
}

const MultipleChoiceQuestion: React.FC<Props> = ({
  question,
  selectedAnswer,
  onAnswerChange,
}) => {
  return (
    <div className="multiple-choice-question">
      <h2 className="question-content">{question.content}</h2>
      
      <div className="options-grid">
        {question.options?.map((option) => (
          <button
            key={option.id}
            className={`option-button ${selectedAnswer === option.id ? "selected" : ""}`}
            onClick={() => onAnswerChange(option.id)}
          >
            <span className="option-label">{option.id}.</span> {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;
