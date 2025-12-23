import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyReviewSummary } from '../../../api';
import ChristmasLoader from '../../../component/ChristmasTheme/ChristmasLoader';
import './DailyReview.css';

interface LessonSummary {
  lesson_id: number;
  lesson_title: string;
  count: number;
}

interface ReviewSummary {
  total: number;
  by_lesson: LessonSummary[];
}

const DailyReview: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await getDailyReviewSummary();
      if (res.success) {
        setSummary(res.data);
      }
    } catch (error) {
      console.error('Lỗi tải daily review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = () => {
    // Tận dụng StudySession với mode daily_review
    navigate('/study-session?mode=daily_review');
  };

  if (loading) {
    return (
      <div className="daily-review-container">
        <ChristmasLoader size="large" text="Đang tải dữ liệu ôn tập..." />
      </div>
    );
  }

  return (
    <div className="daily-review-container">
      <div className="daily-review-card">
        <h1 className="review-title">📚 Ôn Tập Hàng Ngày</h1>
        
        <div className="review-stats-card">
          <div className="stats-number">{summary?.total || 0}</div>
          <p className="stats-label">Từ vựng cần ôn hôm nay</p>
        </div>

        {summary && summary.total > 0 ? (
          <>
            <div className="lesson-breakdown">
              <h3>Chi tiết theo bài học</h3>
              <ul className="lesson-list">
                {summary.by_lesson.map((item) => (
                  <li key={item.lesson_id} className="lesson-item">
                    <span className="lesson-name">{item.lesson_title}</span>
                    <span className="lesson-count">{item.count} từ</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button className="start-review-btn" onClick={handleStartReview}>
              Bắt đầu ôn tập 🚀
            </button>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <p className="empty-message">Tuyệt vời! Bạn đã hoàn thành hết bài ôn tập hôm nay.</p>
            <button className="secondary-btn" onClick={() => navigate('/dashboard')}>
              Quay về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReview;
