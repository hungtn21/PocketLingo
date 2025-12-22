import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../api';
import './QuizResult.css';

interface Question {
  question_id: number;
  type: string;
  content: string;
  order_index: number;
  user_answer: any;
  is_correct: boolean;
  options?: Array<string | { text?: string } | any>;
  correct_answer?: any;
  correct_pairs?: Array<{ left: string; right: string }>
  correct_answers?: string[];
}

interface QuizResultData {
  attempt_id: number;
  lesson_id: number;
  lesson_title: string;
  quiz_id: number;
  submitted_at: string;
  score: number;
  status: string;
  passed_score: number;
  correct_count: number;
  total_questions: number;
  attempt_no: number;
  questions: Question[];
}

const QuizResult = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSanta, setShowSanta] = useState(false);

  // Put the provided image at: frontend/public/santa-sleigh.png
  // Then we can reference it by absolute path.
  const SANTA_SLEIGH_SRC = '../../public/santa-sleigh.png';

  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        const response = await api.get(`/quiz-attempts/${attemptId}/`);
        setResult(response.data);
      } catch (error) {
        console.error('Error fetching quiz result:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResult();
  }, [attemptId]);

  // UI only: show the celebration effect for ~5–8s after loading the result
  useEffect(() => {
    if (!result) return;

    if (result.status !== 'passed') {
      setShowSanta(false);
      return;
    }

    setShowSanta(true);
    const timeoutId = window.setTimeout(() => setShowSanta(false), 7500);
    return () => window.clearTimeout(timeoutId);
  }, [result?.attempt_id, result?.status]);

  const handleBackToLesson = () => {
    if (result) {
      navigate(`/lessons/${result.lesson_id}`);
    }
  };

  const handleBackToProfile = () => {
    navigate('/profile');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderQuestionAnswer = (question: Question, index: number) => {
    const { type, content, user_answer, is_correct, options, correct_answer, correct_pairs, correct_answers } = question;

    return (
      <div key={question.question_id} className={`question-result ${is_correct ? 'correct' : 'incorrect'}`}>
        <div className="question-header">
          <span className={`question-status-icon ${is_correct ? 'correct' : 'incorrect'}`}>
            {is_correct ? '✓' : '✕'}
          </span>
          <h3>Câu {index + 1}: {content}</h3>
        </div>

        <div className="question-content">
          {type === 'multiple_choice' && (
            <div className="multiple-choice-result">
              {options?.map((option, idx) => {
                const optionLetter = String.fromCharCode(65 + idx);
                const isUserAnswer = user_answer === optionLetter;
                const isCorrectAnswer = correct_answer === optionLetter;
                // Handle both string and object format
                const optionText = typeof option === 'string' ? option : (option as any)?.text || option;

                return (
                  <div
                    key={idx}
                    className={`option-result ${isCorrectAnswer ? 'correct-answer' : ''} ${
                      isUserAnswer && !isCorrectAnswer ? 'wrong-answer' : ''
                    }`}
                  >
                    <span className="option-letter">{optionLetter}.</span>
                    <span className="option-text">{optionText}</span>
                    {isCorrectAnswer && <span className="check-icon">✓</span>}
                    {isUserAnswer && !isCorrectAnswer && <span className="cross-icon">✕</span>}
                  </div>
                );
              })}
            </div>
          )}

          {type === 'fill_in' && (
            <div className="fill-in-result">
              <div className="answer-section">
                <p className="answer-label">Câu trả lời: {user_answer || '(Không trả lời)'}</p>
                <p className="answer-label">Đáp án: {correct_answers?.join(', ')}</p>
              </div>
            </div>
          )}

          {type === 'drag_drop' && (
            <div className="drag-drop-result">
              <div className="answer-section">
                <p className="answer-label">Câu trả lời của bạn:</p>
                {user_answer && typeof user_answer === 'object' ? (
                  <ul className="pairs-list">
                    {Object.entries(user_answer).map(([key, value], idx) => (
                      <li key={idx}>
                        {key} - {value as string}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>(Không trả lời)</p>
                )}
              </div>
              <div className="answer-section">
                <p className="answer-label">Đáp án:</p>
                <ul className="pairs-list">
                    {/* Hiển thị từ user_answer nếu correct_pairs rỗng */}
                    {(question.correct_pairs && question.correct_pairs.length > 0) 
                      ? question.correct_pairs.map((pair: any, idx: number) => (
                          <li key={idx}>
                            {pair.left || pair.side_a || ""} - {pair.right || pair.side_b || ""}
                          </li>
                        ))
                      : user_answer && typeof user_answer === 'object'
                      ? Object.entries(user_answer).map(([key, value], idx) => (
                          <li key={idx}>
                            {key} - {value as string}
                          </li>
                        ))
                      : <li>Không có dữ liệu đáp án</li>
                    }
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Đang tải kết quả...</div>;
  }

  if (!result) {
    return <div className="error">Không tìm thấy kết quả bài làm</div>;
  }

  const isPassed = result.status === 'passed';
  const percentage = Math.round((result.correct_count / result.total_questions) * 100);

  return (
    
    <div className="quiz-result-page">
      <div className="result-header-bar">
        <button className="back-button" onClick={handleBackToLesson}>
        ← Quay lại bài học
        </button>
        <button className="back-button" onClick={handleBackToProfile}>
        ← Quay lại hồ sơ
        </button>
        </div>
      <div className="result-container">
        {/* Header Section */}
        <div className="result-header">
          {/* Santa Animation - Only show when passed */}
          {isPassed && showSanta && (
            <div className="santa-animation" aria-hidden="true">
              <span className="santa-sleigh">
                <img className="santa-sleigh-img" src={SANTA_SLEIGH_SRC} alt="" />
              </span>
            </div>
          )}
          
          <div className="header-top">
            <div className="title-section">
              <h1 className="lesson-title">{result.lesson_title}</h1>
              <p className="submitted-date">Ngày làm bài: {formatDate(result.submitted_at)}</p>
            </div>
            <div className={`result-status ${isPassed ? 'passed' : 'failed'}`}>
              {isPassed ? '✓ Vượt qua' : '✕ Không vượt qua'}
            </div>
          </div>
          
          <div className="result-summary">
            <div className="score-card">
              <span className="score-label">Điểm số</span>
              <span className="score-value">{percentage}%</span>
              <span className="score-detail">{result.correct_count}/{result.total_questions} câu đúng</span>
            </div>
          </div>
        </div>

        {/* Questions and Answers Section */}
        <div className="questions-section">
          {result.questions.map((question, index) => renderQuestionAnswer(question, index))}
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
