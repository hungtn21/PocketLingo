import React, { useEffect, useState } from "react";
import Header from "../../../component/Header/Header";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowLeft, Search } from "lucide-react";
import api from "../../../api";
import ToastMessage from "../../../component/ToastMessage";
import ChristmasLoader from "../../../component/ChristmasTheme/ChristmasLoader";
import "./MyCourses.css";

interface CourseProgress {
  course_id: number;
  course_name: string;
  course_image: string | null;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  average_quiz_score: number;
}

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState<CourseProgress[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseProgress[]>([]);
  const [coursesProgress, setCoursesProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    page_size: 6,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/users/profile/");
        const courses = res.data.courses_progress || [];
        setAllCourses(courses);
        setFilteredCourses(courses);
        
        // Tính toán phân trang
        const totalPages = Math.ceil(courses.length / pagination.page_size);
        setPagination(prev => ({ ...prev, total_pages: totalPages }));
        
        // Lấy courses cho trang hiện tại
        const startIndex = (pagination.current_page - 1) * pagination.page_size;
        const endIndex = startIndex + pagination.page_size;
        setCoursesProgress(courses.slice(startIndex, endIndex));
      } catch (e: any) {
        setToast({
          message: e?.response?.data?.error || "Không thể tải khóa học",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [pagination.current_page, pagination.page_size]);

  useEffect(() => {
    // Filter courses khi search query thay đổi
    const filtered = allCourses.filter(course => 
      course.course_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
    
    // Cập nhật phân trang
    const totalPages = Math.ceil(filtered.length / pagination.page_size);
    setPagination(prev => ({ ...prev, total_pages: totalPages, current_page: 1 }));
    
    // Lấy courses cho trang đầu tiên
    const startIndex = 0;
    const endIndex = pagination.page_size;
    setCoursesProgress(filtered.slice(startIndex, endIndex));
  }, [searchQuery, allCourses, pagination.page_size]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }));
    const startIndex = (page - 1) * pagination.page_size;
    const endIndex = startIndex + pagination.page_size;
    setCoursesProgress(filteredCourses.slice(startIndex, endIndex));
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= pagination.total_pages; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn ${i === pagination.current_page ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="my-courses-page">
      <div className="simple-header">
        <button className="back-btn" onClick={() => navigate("/profile")}>
          <ArrowLeft size={22} />
        </button>
        <span className="header-title">Khóa học của tôi</span>
      </div>

      <div className="my-courses-container">
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm khóa học theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <ChristmasLoader size="large" text="Đang tải khóa học của bạn..." />
        ) : coursesProgress.length === 0 ? (
          <div className="empty-state">
            <GraduationCap size={64} strokeWidth={1} />
            {allCourses.length === 0 ? (
              <>
                <h3>Bạn chưa đăng ký khóa học nào</h3>
                <p>Hãy khám phá và đăng ký các khóa học để bắt đầu học tập!</p>
                <button className="browse-btn" onClick={() => navigate("/")}>
                  Khám phá khóa học
                </button>
              </>
            ) : (
              <>
                <h3>Không tìm thấy khóa học</h3>
                <p>Không có khóa học nào phù hợp với từ khóa "{searchQuery}"</p>
              </>
            )}
          </div>
        ) : (
          <div className="courses-grid">
            {coursesProgress.map((course) => (
              <div
                key={course.course_id}
                className="course-card"
                onClick={() => navigate(`/courses/${course.course_id}`)}
              >
                <div className="course-image">
                  {course.course_image ? (
                    <img src={course.course_image} alt={course.course_name} />
                  ) : (
                    <div className="placeholder-image">Hình ảnh khóa học</div>
                  )}
                </div>

                <div className="course-info">
                  <h3 className="course-title">{course.course_name}</h3>

                  <div className="course-details">
                    <div className="detail-item">
                      <span className="detail-label">Điểm TB</span>
                      <span className="detail-value">{course.average_quiz_score}/10</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Bài học</span>
                      <span className="detail-value">{course.completed_lessons}/{course.total_lessons}</span>
                    </div>
                  </div>

                  <div className="course-footer">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <div className="progress-info">
                      <span>Hoàn thành</span>
                      <span>{course.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCourses.length > 0 && pagination.total_pages > 1 && (
          <div className="pagination">{renderPagination()}</div>
        )}
      </div>

      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  );
};

export default MyCourses;
