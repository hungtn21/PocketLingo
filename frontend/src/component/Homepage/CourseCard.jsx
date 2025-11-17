import React, { useState } from "react";
import { Star } from "lucide-react";
import { api } from "../../api";
import EnrollmentConfirmModal from "./EnrollmentConfirmModal";
import RejectionReasonModal from "./RejectionReasonModal";
import "./CourseCard.css";

const CourseCard = ({ course, onEnrollmentChange }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [enrollmentReason, setEnrollmentReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // Get button config based on enrollment status
  const getButtonConfig = () => {
    const status = course.user_status;
    switch (status) {
      case "pending":
        return {
          text: "Chờ duyệt",
          className: "register-btn pending",
          disabled: true,
        };
      case "approved":
        return {
          text: "Học",
          className: "register-btn approved",
          disabled: false,
        };
      case "rejected":
        return {
          text: "Bị từ chối",
          className: "register-btn rejected",
          disabled: false, // Enable so user can click to view the reason
        };
      case "completed":
        return {
          text: "Đã hoàn thành",
          className: "register-btn completed",
          disabled: true,
        };
      default:
        // null or not enrolled
        return {
          text: "Đăng ký",
          className: "register-btn",
          disabled: false,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  const handleEnrollCourse = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(`/courses/${course.id}/enroll/`);

      // Delegate toast notification to parent for centralized user feedback handling
      if (onEnrollmentChange) {
        onEnrollmentChange({
          success: true,
          message:
            response.data.message || "Đăng ký thành công. Vui lòng chờ duyệt.",
          courseId: course.id,
        });
      }

      setShowConfirmModal(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Đã có lỗi xảy ra. Vui lòng thử lại.";
      if (onEnrollmentChange) {
        onEnrollmentChange({
          success: false,
          message: errorMessage,
          courseId: course.id,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowRejectionReason = async () => {
    try {
      const response = await api.get(
        `/courses/${course.id}/enrollment-status/`
      );
      setEnrollmentReason(response.data.reason || "Không có lý do cụ thể");
      setShowRejectionModal(true);
    } catch (error) {
      console.error("Error fetching rejection reason:", error);
      setEnrollmentReason("Không thể tải lý do từ chối");
      setShowRejectionModal(true);
    }
  };

  const handleReregister = () => {
    setShowRejectionModal(false);
    setShowConfirmModal(true);
  };

  const handleButtonClick = () => {
    if (course.user_status === "approved") {
      // Navigate to learning page (will implement later)
      console.log("Navigate to course:", course.id);
    } else if (course.user_status === "rejected") {
      // Show rejection reason modal
      handleShowRejectionReason();
    } else if (!course.user_status) {
      // Show confirmation modal for registration
      setShowConfirmModal(true);
    }
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
          <button
            className={buttonConfig.className}
            disabled={buttonConfig.disabled || isLoading}
            onClick={handleButtonClick}
          >
            {isLoading ? "Đang xử lý..." : buttonConfig.text}
          </button>
        </div>
      </div>

      {/* Enrollment Confirmation Modal */}
      {showConfirmModal && (
        <EnrollmentConfirmModal
          courseName={course.title}
          onConfirm={handleEnrollCourse}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <RejectionReasonModal
          courseName={course.title}
          reason={enrollmentReason}
          onReregister={handleReregister}
          onClose={() => setShowRejectionModal(false)}
        />
      )}
    </div>
  );
};

export default CourseCard;
