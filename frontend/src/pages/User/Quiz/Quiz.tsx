import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api";
import MultipleChoiceQuestion from "../../../component/Quiz/MultipleChoiceQuestion";
import DragDropQuestion from "../../../component/Quiz/DragDropQuestion";
import FillInQuestion from "../../../component/Quiz/FillInQuestion";
import "./Quiz.css";

interface Question {
  question_id: number;
  type: "multiple_choice" | "drag_drop" | "fill_in";
  content: string;
  order_index: number;
  options?: Array<{ id: string; text: string }>;
  side_a_items?: string[];
  side_b_items?: string[];
}

interface QuizData {
  quiz_id: number;
  lesson_id: number;
  lesson_title: string;
  time_limit: number;
  passed_score: number;
  total_questions: number;
  questions: Question[];
}

interface UserAnswer {
  question_id: number;
  answer: string | Record<string, string>;
}

const Quiz: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, string | Record<string, string>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/lessons/${lessonId}/quiz/`);
        setQuizData(response.data);
        setTimeRemaining(response.data.time_limit);
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
        alert(`Không thể tải quiz. Vui lòng thử lại.`);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchQuiz();
    }
  }, [lessonId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!quizData || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizData, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: number, answer: string | Record<string, string>) => {
    setUserAnswers((prev) => new Map(prev).set(questionId, answer));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (quizData && currentQuestionIndex < quizData.total_questions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const confirmed = window.confirm("Bạn có chắc chắn muốn nộp bài?");
    if (!confirmed) return;

    try {
      setIsSubmitting(true);

      const answers: UserAnswer[] = Array.from(userAnswers.entries()).map(
        ([question_id, answer]) => ({
          question_id,
          answer,
        })
      );

      const response = await api.post(`/lessons/${lessonId}/quiz/submit/`, {
        quiz_id: quizData?.quiz_id,
        answers,
      });

      // Chuyển hướng đến trang kết quả thay vì hiển thị alert
      navigate(`/quiz-result/${response.data.attempt_id}`);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Không thể nộp bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading">Đang tải quiz...</div>
      </div>
    );
  }

  if (!quizData || quizData.questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="error">Không có câu hỏi nào trong quiz này.</div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const currentAnswer = userAnswers.get(currentQuestion.question_id);

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="timer">{formatTime(timeRemaining)}</div>
        <button className="submit-button" onClick={handleSubmit} disabled={isSubmitting}>
          Nộp bài
        </button>
      </div>

      <div className="quiz-content">
        <div className="question-card">
          <div className="question-number">
            Câu {currentQuestionIndex + 1}/{quizData.total_questions}
          </div>

          {currentQuestion.type === "multiple_choice" && (
            <MultipleChoiceQuestion
              question={currentQuestion}
              selectedAnswer={currentAnswer as string}
              onAnswerChange={(answer) =>
                handleAnswerChange(currentQuestion.question_id, answer)
              }
            />
          )}

          {currentQuestion.type === "drag_drop" && (
            <DragDropQuestion
              question={currentQuestion}
              userPairs={currentAnswer as Record<string, string>}
              onAnswerChange={(answer) =>
                handleAnswerChange(currentQuestion.question_id, answer)
              }
            />
          )}

          {currentQuestion.type === "fill_in" && (
            <FillInQuestion
              question={currentQuestion}
              userAnswer={currentAnswer as string}
              onAnswerChange={(answer) =>
                handleAnswerChange(currentQuestion.question_id, answer)
              }
            />
          )}
        </div>

        <div className="navigation-buttons">
          <button
            className="nav-button"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Câu trước
          </button>
          <button
            className="nav-button"
            onClick={handleNext}
            disabled={currentQuestionIndex === quizData.total_questions - 1}
          >
            Câu tiếp theo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
