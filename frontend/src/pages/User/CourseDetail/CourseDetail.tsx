import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api';
import './CourseDetail.css';

interface Lesson {
  id: number;
  title: string;
  description: string;
  order_index: number;
  completed: boolean;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_own_review: boolean;
}

interface Course {
  id: number;
  title: string;
  description: string;
  language: string;
  level: string;
  image_url: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
  avg_rating: number;
  lessons: Lesson[];
  user_has_reviewed: boolean;
  can_review: boolean;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  
  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId, reviewPage]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${courseId}/`, {
        params: { page: reviewPage, page_size: 10 }
      });
      
      if (response.data.success) {
        setCourse(response.data.data.course);
        setReviews(response.data.data.reviews.items);
        setPagination(response.data.data.reviews.pagination);
      }
    } catch (error: any) {
      console.error('Error fetching course details:', error);
      if (error.response?.status === 403) {
        alert(error.response?.data?.message || 'Bạn chưa đăng ký khóa học này hoặc chưa được phê duyệt.');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating < 1) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await api.post(`/courses/${courseId}/reviews/`, {
        rating,
        comment
      });

      if (response.data.success) {
        alert(response.data.message);
        // Refresh course details to show new review
        setRating(0);
        setComment('');
        fetchCourseDetails();
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, isInteractive: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= (isInteractive ? (hoverRating || rating) : rating);
      stars.push(
        <span
          key={i}
          className={`star ${filled ? 'filled' : ''} ${isInteractive ? 'interactive' : ''}`}
          onClick={isInteractive ? () => setRating(i) : undefined}
          onMouseEnter={isInteractive ? () => setHoverRating(i) : undefined}
          onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (!course) {
    return <div className="error">Không tìm thấy khóa học</div>;
  }

  return (
    <div className="course-detail-container">
      {/* Header */}
      <div className="course-detail-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Quay lại
        </button>
      </div>

      {/* Course Info Frame */}
      <div className="course-info-frame">
        <div className="course-info-top">
          <div className="course-info-left">
            <h1 className="course-title">{course.title}</h1>
          </div>
          <div className="course-info-right">
            <div className="course-stats">
              <div className="stat-item">
                <span className="stat-label">Đã hoàn thành:</span>
                <span className="stat-value">{course.completed_lessons}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tổng số bài học:</span>
                <span className="stat-value">{course.total_lessons}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar - spans full width */}
        <div className="progress-container">
          <div className="progress-bar">
            {course.progress_percent >= 0 && (
              <div 
                className="progress-fill" 
                style={{ width: `${course.progress_percent}%` }}
              >
                <div className="progress-circle">
                  <span className="progress-text">{course.progress_percent.toFixed(0)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single column layout */}
      <div className="course-content">
        {/* Course Description */}
        <div className="course-description-frame">
          <h2>Mô tả khóa học</h2>
          <p>{course.description}</p>
        </div>

        {/* Lessons List */}
        <div className="lessons-frame">
          <h2>Danh sách bài học</h2>
          <div className="lessons-list">
            {course.lessons.map((lesson) => (
              <div key={lesson.id} className="lesson-item" onClick={() => navigate('/lessons/' + lesson.id)}>
                <div className="lesson-info">
                  <h3 className="lesson-title">Bài {lesson.order_index}: {lesson.title}</h3>
                  {lesson.description && (
                    <p className="lesson-description">{lesson.description}</p>
                  )}
                </div>
                <div className="lesson-status-container">
                  <div className={`lesson-status ${lesson.completed ? 'completed' : 'incomplete'}`}>
                    {lesson.completed ? '✓ Đã hoàn thành' : '○ Chưa hoàn thành'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-frame">
          <h2>Đánh giá khóa học</h2>
          
          {/* Average Rating */}
          <div className="average-rating">
            <div className="rating-number">{course.avg_rating}</div>
            <div className="rating-stars">{renderStars(Math.round(course.avg_rating))}</div>
          </div>

          {/* Write Review Form (only if can_review and hasn't reviewed) */}
          {course.can_review && !course.user_has_reviewed && (
            <div className="write-review-frame">
              <h3>Viết đánh giá của bạn</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="rating-input">
                  <label>Chọn số sao:</label>
                  <div className="stars-input">
                    {renderStars(rating, true)}
                  </div>
                </div>
                <div className="comment-input">
                  <label>Nội dung đánh giá:</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Viết đánh giá của bạn..."
                    rows={4}
                  />
                </div>
                <button 
                  type="submit" 
                  className="submit-review-btn"
                  disabled={submittingReview || rating < 1}
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </form>
            </div>
          )}

          {!course.can_review && (
            <div className="cannot-review-message">
              Bạn cần hoàn thành ít nhất 80% khóa học để có thể đánh giá
            </div>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            <h3>Đánh giá từ người học khác ({pagination?.total_items || 0})</h3>
            {reviews.length === 0 ? (
              <p className="no-reviews">Chưa có đánh giá nào</p>
            ) : (
              <>
                {reviews.map((review) => (
                  <div key={review.id} className={`review-item ${review.is_own_review ? 'own-review' : ''}`}>
                    <div className="review-header">
                      <span className="reviewer-name">
                        {review.user_name}
                        {review.is_own_review && <span className="own-badge"> (Bạn)</span>}
                      </span>
                      <div className="review-rating">{review.rating} {renderStars(review.rating)}</div>
                    </div>
                    {review.comment && (
                      <p className="review-comment">{review.comment}</p>
                    )}
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
                
                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setReviewPage(reviewPage - 1)}
                      disabled={!pagination.has_previous}
                      className="pagination-btn"
                    >
                      Trước
                    </button>
                    <span className="page-info">
                      Trang {pagination.current_page} / {pagination.total_pages}
                    </span>
                    <button
                      onClick={() => setReviewPage(reviewPage + 1)}
                      disabled={!pagination.has_next}
                      className="pagination-btn"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
