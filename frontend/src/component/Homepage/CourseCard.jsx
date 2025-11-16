import React from "react";
import { Star } from "lucide-react";
import "./CourseCard.css";

const CourseCard = ({ course }) => {
  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} fill="currentColor" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} size={16} fill="currentColor" className="half-star" />
        );
      } else {
        stars.push(<Star key={i} size={16} />);
      }
    }
    return stars;
  };

  return (
    <div className="course-card">
      <div className="course-image">
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} />
        ) : (
          <div className="placeholder-image">Ảnh đại diện khóa học</div>
        )}
      </div>

      <div className="course-info">
        <h3 className="course-title">{course.title}</h3>

        <div className="course-details">
          <div className="detail-item">
            <span className="detail-label">Số lượng bài học</span>
            <span className="detail-value">{course.lesson_count}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Mức độ</span>
            <span className="detail-value">{course.level}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Ngôn ngữ</span>
            <span className="detail-value">{course.language}</span>
          </div>
        </div>

        <div className="course-footer">
          <div className="rating">
            <span className="rating-number">{course.rating.toFixed(1)}</span>
            <div className="stars">{renderStars(course.rating)}</div>
          </div>
          <button className="register-btn">Đăng ký</button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
