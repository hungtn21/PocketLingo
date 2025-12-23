import React from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Calendar, Award, BookOpen } from "lucide-react";
import ChristmasLoader from "../../../../component/ChristmasTheme/ChristmasLoader";
import "./QuizHistoryTab.css";

interface QuizAttempt {
  attempt_id: number;
  lesson_id: number;
  lesson_title: string;
  course_name: string | null;
  score: number;
  status: "passed" | "failed";
  submitted_at: string;
  attempt_no: number;
}

interface QuizHistoryTabProps {
  history: QuizAttempt[];
  historyLoaded: boolean;
}

const QuizHistoryTab: React.FC<QuizHistoryTabProps> = ({ history, historyLoaded }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (attemptId: number) => {
    navigate(`/quiz-result/${attemptId}`);
  };

  if (!historyLoaded) {
    return (
      <div className="quiz-history-loading">
        <ChristmasLoader size="medium" text="Đang tải lịch sử..." />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="quiz-history-empty">
        <ClipboardList size={64} strokeWidth={1.5} />
        <h3>Chưa có lịch sử làm quiz</h3>
        <p>Hãy bắt đầu học và làm quiz để xem kết quả tại đây!</p>
      </div>
    );
  }

  return (
    <div className="quiz-history-container">
      <div className="quiz-history-header">
        <h3>
          <ClipboardList size={24} />
          Lịch sử làm bài
        </h3>
        <p className="total-attempts">Tổng số lần làm bài: {history.length}</p>
      </div>

      <div className="quiz-history-table-wrapper">
        <table className="quiz-history-table">
          <thead>
            <tr>
              <th>Tên bài học</th>
              <th>Điểm số</th>
              <th>Thời gian làm bài</th>
              <th>Kết quả</th>
              <th>Lần thứ</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {history.map((attempt) => (
              <tr key={attempt.attempt_id}>
                <td className="lesson-info">
                  <div className="lesson-title">{attempt.lesson_title}</div>
                  {attempt.course_name && (
                    <div className="course-name">{attempt.course_name}</div>
                  )}
                </td>
                <td className="score-cell">
                  <span className={`score-badge ${attempt.status}`}>
                    {attempt.score.toFixed(0)}%
                  </span>
                </td>
                <td className="date-cell">{formatDate(attempt.submitted_at)}</td>
                <td>
                  <span className={`status-badge ${attempt.status}`}>
                    {attempt.status === "passed" ? "Đạt" : "Chưa đạt"}
                  </span>
                </td>
                <td className="attempt-no">{attempt.attempt_no}</td>
                <td>
                  <button
                    className="view-details-btn"
                    onClick={() => handleViewDetails(attempt.attempt_id)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuizHistoryTab;
