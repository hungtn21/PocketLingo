import React, { useState } from "react";
import { api } from "../../api";
import EnrollmentConfirmModal from "../Homepage/EnrollmentConfirmModal";
import ToastMessage from "../ToastMessage";
import "./AIChatBot.css";

interface Course {
  id: number;
  title: string;
  description: string;
  language: string;
  level: string;
  thumbnail: string;
  rating: number;
  total_lessons: number;
  duration: string;
  user_status?: string | null;
}

interface AISuggestionResponse {
  explanation: string;
  courses: Course[];
}

const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AISuggestionResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{
    show: boolean;
    courseId: number;
    courseName: string;
  }>({ show: false, courseId: 0, courseName: "" });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post("/courses/ai-suggestions/", {
        prompt: prompt.trim(),
      });
      setResult(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Đã có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPrompt("");
    setResult(null);
    setError("");
  };

  const handleShowConfirmModal = (courseId: number, courseName: string) => {
    setShowConfirmModal({ show: true, courseId, courseName });
  };

  const handleEnrollCourse = async () => {
    const { courseId } = showConfirmModal;
    setEnrollingCourseId(courseId);
    setShowConfirmModal({ show: false, courseId: 0, courseName: "" });
    
    try {
      await api.post(`/courses/${courseId}/enroll/`);
      
      // Update course status to pending instead of removing it
      if (result) {
        setResult({
          ...result,
          courses: result.courses.map(course =>
            course.id === courseId
              ? { ...course, user_status: "pending" }
              : course
          )
        });
      }
      
      setToast({
        message: "Đăng ký thành công! Vui lòng chờ admin phê duyệt.",
        type: "success"
      });
      setError("");
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || "Đã có lỗi xảy ra khi đăng ký khóa học.",
        type: "error"
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const getButtonConfig = (course: Course) => {
    if (course.user_status === "pending") {
      return {
        text: "Chờ duyệt",
        className: "ai-course-btn pending",
        disabled: true,
      };
    }
    return {
      text: "Đăng ký",
      className: "ai-course-btn",
      disabled: false,
    };
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        className="ai-floating-button"
        onClick={() => setIsOpen(true)}
        title="AI gợi ý khóa học"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-lucide="bot-message-square"
        >
          <path d="M12 6V2H8"/>
          <path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/>
          <path d="M2 12h2"/>
          <path d="M9 11v2"/>
          <path d="M15 11v2"/>
          <path d="M20 12h2"/>
        </svg>
      </button>

      {/* AI Popup */}
      {isOpen && (
        <div className="ai-popup-overlay" onClick={handleClose}>
          <div
            className="ai-popup-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button className="ai-popup-close" onClick={handleClose}>
              ✕
            </button>

            {/* Header */}
            <div className="ai-popup-header">
              <div className="ai-popup-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                    fill="#5E3C86"
                  />
                  <circle cx="9" cy="9" r="1.5" fill="white" />
                  <circle cx="15" cy="9" r="1.5" fill="white" />
                  <path
                    d="M12 17C14 17 15.5 15.5 15.5 14H8.5C8.5 15.5 10 17 12 17Z"
                    fill="white"
                  />
                </svg>
              </div>
              <h3>AI gợi ý khóa học</h3>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="ai-popup-form">
              <textarea
                className="ai-popup-textarea"
                placeholder="Nhập yêu cầu về khóa học bạn muốn. Ví dụ: Tôi muốn học tiếng Anh giao tiếp cho người đi làm"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                disabled={loading}
              />
              <button
                type="submit"
                className="ai-popup-submit"
                disabled={loading || !prompt.trim()}
              >
                {loading ? "Đang xử lý..." : "Tìm kiếm"}
              </button>
            </form>

            {/* Error Message */}
            {error && <div className="ai-popup-error">{error}</div>}

            {/* Results */}
            {result && (
              <div className="ai-popup-results">
                {/* AI Explanation */}
                <div className="ai-explanation">
                  <div className="ai-message-header">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" fill="#5E3C86" />
                      <circle cx="9" cy="10" r="1.5" fill="white" />
                      <circle cx="15" cy="10" r="1.5" fill="white" />
                      <path
                        d="M12 16C13.5 16 14.5 15 14.5 14H9.5C9.5 15 10.5 16 12 16Z"
                        fill="white"
                      />
                    </svg>
                    <span>AI Assistant</span>
                  </div>
                  <p>{result.explanation}</p>
                </div>

                {/* Course Cards */}
                {result.courses.length > 0 && (
                  <div className="ai-courses-grid">
                    {result.courses.map((course) => (
                      <div key={course.id} className="ai-course-card">
                        <div className="ai-course-thumbnail">
                          <img
                            src={course.thumbnail || "https://via.placeholder.com/300x180"}
                            alt={course.title}
                          />
                        </div>
                        <div className="ai-course-info">
                          <h4 className="ai-course-title">{course.title}</h4>
                          <div className="ai-course-meta">
                            <span className="ai-course-language">
                              {course.language}
                            </span>
                            <span className="ai-course-level">
                              {course.level}
                            </span>
                          </div>
                          <div className="ai-course-stats">
                            <span>⭐ {course.rating.toFixed(1)}</span>
                            <span>📚 {course.total_lessons} bài</span>
                            <span>⏱️ {course.duration}</span>
                          </div>
                          <button
                            className={getButtonConfig(course).className}
                            disabled={
                              getButtonConfig(course).disabled ||
                              enrollingCourseId === course.id
                            }
                            onClick={() => handleShowConfirmModal(course.id, course.title)}
                          >
                            {enrollingCourseId === course.id
                              ? "Đang xử lý..."
                              : getButtonConfig(course).text}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enrollment Confirmation Modal */}
      {showConfirmModal.show && (
        <EnrollmentConfirmModal
          courseName={showConfirmModal.courseName}
          onConfirm={handleEnrollCourse}
          onCancel={() => setShowConfirmModal({ show: false, courseId: 0, courseName: "" })}
        />
      )}

      {/* Toast Message */}
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default AIChatBot;
