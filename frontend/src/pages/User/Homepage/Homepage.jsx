import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../../component/Header/Header";
import SearchBar from "../../../component/Homepage/SearchBar";
import FilterPanel from "../../../component/Homepage/FilterPanel";
import CourseCard from "../../../component/Homepage/CourseCard";
import ToastMessage from "../../../component/ToastMessage";
import { useUser } from "../../../context/UserContext.tsx";
import "./Homepage.css";

const Homepage = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    level: "",
    language: "",
    rating: { min: "", max: "" },
  });
  const [filterOptions, setFilterOptions] = useState({
    levels: [],
    languages: [],
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    page_size: 6,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const API_BASE_URL = "http://localhost:8000/api";

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch courses when filters or pagination change
  useEffect(() => {
    fetchCourses();
  }, [filters, pagination.current_page]);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/courses/filter-options/`
      );
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current_page,
        page_size: pagination.page_size,
        user_id: user?.id, // Thêm user_id để lấy trạng thái đăng ký
      };

      // console.log("Fetching courses with params:", params); // Debug log

      if (searchQuery) params.search = searchQuery;
      if (filters.level) params.level = filters.level;
      if (filters.language) params.language = filters.language;
      if (filters.rating.min) params.min_rating = filters.rating.min;
      if (filters.rating.max) params.max_rating = filters.rating.max;

      const response = await axios.get(`${API_BASE_URL}/courses/`, { params });

      if (response.data.success) {
        setCourses(response.data.data.courses);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current_page: 1 });
    fetchCourses();
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, current_page: page });
  };

  const handleEnrollmentChange = (result) => {
    // Show toast message
    setToast({
      message: result.message,
      type: result.success ? "success" : "error",
    });

    // Refresh courses if enrollment was successful
    if (result.success) {
      fetchCourses();
    }
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= pagination.total_pages; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn ${
            i === pagination.current_page ? "active" : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="homepage">
      <Header />

      {/* Toast Message */}
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="homepage-content">
        <div className="search-filter-section">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            filterOptions={filterOptions}
          />
        </div>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            <div className="courses-grid">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnrollmentChange={handleEnrollmentChange}
                  />
                ))
              ) : (
                <div className="no-courses">Không tìm thấy khóa học nào</div>
              )}
            </div>

            {pagination.total_pages > 1 && (
              <div className="pagination">{renderPagination()}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Homepage;
