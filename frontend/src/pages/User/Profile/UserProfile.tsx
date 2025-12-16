import React, { useEffect, useState } from "react";
import Header from "../../../component/Header/Header";
import { useUser } from "../../../context/UserContext";
import api from "../../../api";
import { User as UserIcon, Edit2, Lock, Sparkles, Trophy, GraduationCap, ClipboardList, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ToastMessage from "../../../component/ToastMessage";
import QuizHistoryTab from "./QuizHistory/QuizHistoryTab";
import LeaderboardTab from "./Leaderboard/LeaderboardTab";
import "./UserProfile.css";

const UserProfile: React.FC = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "history" | "leaderboard">("profile");
  const [name, setName] = useState<string>(user?.name || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [totalWordsLearned, setTotalWordsLearned] = useState<number>(0);
  const [totalQuizzesTaken, setTotalQuizzesTaken] = useState<number>(0);
  const [coursesProgress, setCoursesProgress] = useState<any[]>([]);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile/");
        setAvatarUrl(res.data.avatar_url || null);
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setTotalWordsLearned(res.data.total_words_learned || 0);
        setTotalQuizzesTaken(res.data.total_quizzes_taken || 0);
        setCoursesProgress(res.data.courses_progress || []);
      } catch (e: any) {
        setToast({
          message: e?.response?.data?.error || "Không thể tải thông tin hồ sơ",
          type: "error",
        });
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Preload quiz history when switching to history tab
  useEffect(() => {
    if (activeTab === "history" && !historyLoaded) {
      const fetchHistory = async () => {
        try {
          const res = await api.get("/users/quiz-history/");
          setQuizHistory(res.data.history || []);
          setHistoryLoaded(true);
        } catch (err: any) {
          console.error("Error fetching quiz history:", err);
        }
      };
      fetchHistory();
    }
  }, [activeTab, historyLoaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (file) formData.append("avatar", file);

      const res = await api.patch("/users/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newAvatar = res.data.user?.avatar_url || avatarUrl;
      setAvatarUrl(newAvatar);
      if (user) setUser({ ...user, name, avatar_url: newAvatar });

      setPreview(null);
      setFile(null);
      setToast({ message: "Cập nhật thông tin thành công!", type: "success" });

      // Nếu email đổi
      if (email !== user?.email) {
        try {
          await api.post("/users/request-email-change/", { new_email: email });
          setToast({ message: "Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư.", type: "success" });
        } catch (e: any) {
          setToast({ message: e?.response?.data?.error || "Không gửi được email xác nhận.", type: "error" });
        }
      }
    } catch (err: any) {
      setToast({ message: err?.response?.data?.error || "Có lỗi xảy ra khi lưu thông tin.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="user-profile-page">
      <Header />

      <div className="user-profile-container">
        {loadingProfile ? (
          <div className="text-center py-5">Đang tải...</div>
        ) : (
          <>
            <h2 className="profile-title">Hồ sơ học tập</h2>

            {/* Tab Navigation */}
            <div className="profile-tabs">
              <button
                className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <UserIcon size={20} />
                Thông tin cá nhân
              </button>
              <button
                className={`tab-button ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                <ClipboardList size={20} />
                Lịch sử làm bài
              </button>
              <button
                className={`tab-button ${activeTab === "leaderboard" ? "active" : ""}`}
                onClick={() => setActiveTab("leaderboard")}
              >
                <Award size={20} />
                Bảng xếp hạng
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "profile" ? (
              <div className="profile-tab-content" key="profile-tab">

            {/* Statistics Cards */}
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "linear-gradient(135deg, #4d2775 0%, #764ba2 100%)" }}>
                  <Sparkles size={28} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{totalWordsLearned}</div>
                  <div className="stat-label">Tổng số từ đã học</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" }}>
                  <Trophy size={28} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{totalQuizzesTaken}</div>
                  <div className="stat-label">Tổng số quiz đã làm</div>
                </div>
              </div>
            </div>

            <div className="profile-grid">
              <div className="avatar-section">
                <div className="avatar-placeholder">
                  {preview ? (
                    <img src={preview} alt="preview" className="avatar-img" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="avatar-img" />
                  ) : (
                    <UserIcon size={90} strokeWidth={1.5} />
                  )}
                </div>
                <label className="upload-btn">
                  Upload avatar
                  <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                </label>
                {file && (
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    Hủy
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="profile-form">
                <div className="profile-field">
                  <label>Tên</label>
                  <div className="input-with-icon">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Edit2 size={18} className="field-icon" />
                  </div>
                </div>

                <div className="profile-field">
                  <label>Email</label>
                  <div className="input-with-icon">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Edit2 size={18} className="field-icon" />
                  </div>
                  {email !== user?.email && (
                    <small className="text-warning">
                      Email sẽ được cập nhật sau khi xác nhận qua mail.
                    </small>
                  )}
                </div>

                <div className="profile-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? "Đang lưu..." : "Cập nhật thông tin"}
                  </button>

                  <button
                    type="button"
                    className="change-password-btn"
                    onClick={() => navigate("/change-password")}
                  >
                    <Lock size={18} />
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
            </div>

            {/* Courses Progress Section */}
            {coursesProgress.length > 0 && (
              <div className="courses-progress-section">
                <div className="section-header">
                  <h3 className="section-title">
                    <GraduationCap size={24} />
                    Các khóa học của tôi
                  </h3>
                  <button
                    className="view-all-btn"
                    onClick={() => navigate("/my-courses")}
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="courses-scroll-container">
                  {coursesProgress.map((course) => (
                    <div
                      key={course.course_id}
                      className="course-progress-card"
                      onClick={() => navigate(`/courses/${course.course_id}`)}
                    >
                      {course.course_image && (
                        <div className="course-image-wrapper">
                          <img src={course.course_image} alt={course.course_name} className="course-image" />
                        </div>
                      )}
                      <div className="course-info">
                        <h4 className="course-name">{course.course_name}</h4>
                        <div className="course-stats">
                          <div className="course-stat-item">
                            <span className="course-stat-label">Điểm TB:</span>
                            <span className="course-stat-value">{course.average_quiz_score}/10</span>
                          </div>
                          <div className="course-stat-item">
                            <span className="course-stat-label">Bài học:</span>
                            <span className="course-stat-value">{course.completed_lessons}/{course.total_lessons}</span>
                          </div>
                        </div>
                        <div className="progress-info">
                          <span className="progress-text">Hoàn thành</span>
                          <span className="progress-percent">{course.progress}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </div>
            ) : activeTab === "history" ? (
              <QuizHistoryTab history={quizHistory} historyLoaded={historyLoaded} />
            ) : (
              <LeaderboardTab courses={coursesProgress} />
            )}
          </>
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

export default UserProfile;
