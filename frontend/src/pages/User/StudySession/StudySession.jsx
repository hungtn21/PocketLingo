import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../api";
import Flashcard from "../../../component/Flashcard/Flashcard";
import AIExplainModal from "../../../component/AIExplainModal/AIExplainModal";
import StudyResult from "../StudyResult/StudyResult";
import ToastMessage from "../../../component/ToastMessage";
import "./StudySession.css";

const StudySession = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  // Data states
  const [lessonData, setLessonData] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [originalFlashcards, setOriginalFlashcards] = useState([]);
  const [mode, setMode] = useState("learn_new");

  // Session states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShuffleAnimating, setIsShuffleAnimating] = useState(false);

  // UI states
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Get mode from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode") || "learn_new";
    setMode(modeParam);
  }, []);

  // Fetch flashcards
  useEffect(() => {
    const fetchStudySession = async () => {
      try {
        setLoading(true);

        let endpoint;
        if (mode === "daily_review") {
          endpoint = `/review/session/`;
        } else if (mode === "practice") {
          endpoint = `/lessons/${lessonId}/practice/`;
        } else {
          endpoint = `/lessons/${lessonId}/learn-new/`;
        }

        const response = await api.get(endpoint);

        if (response.data.success) {
          const data = response.data.data;
          
          // Nếu backend suggest redirect sang practice (đã học hết từ mới)
          if (data.redirect === "practice" && mode === "learn_new") {
            setToast({
              message: data.message || "Bạn đã học hết từ mới. Chuyển sang luyện tập!",
              type: "success",
            });
            setMode("practice");
            return; // Không set flashcards, đợi useEffect chạy lại với mode mới
          }
          
          // Daily review không có lesson data
          if (mode !== "daily_review") {
            setLessonData(data.lesson);
          } else {
            setLessonData({ title: "Ôn Tập Hàng Ngày" });
          }
          
          setFlashcards(data.flashcards);
          setOriginalFlashcards(data.flashcards);
          
          // Reset states khi fetch data mới
          setCurrentIndex(0);
          setResults([]);
          setIsCompleted(false);
          setIsShuffled(false);
        }
      } catch (error) {
        console.error("Failed to fetch study session:", error);
        setToast({
          message: error.response?.data?.error || "Có lỗi xảy ra",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (mode === "daily_review" || lessonId) {
      fetchStudySession();
    }
  }, [lessonId, mode]);

  const currentCard = flashcards[currentIndex];
  const progress =
    flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  // Shuffle function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Shuffle handler với animation mượt mà (sử dụng React state thay vì DOM manipulation)
  const handleToggleShuffle = useCallback(() => {
    // Nếu đã học một số thẻ, hỏi xác nhận
    if (results.length > 0) {
      if (!window.confirm("Trộn từ sẽ reset tiến độ hiện tại. Tiếp tục?")) {
        return;
      }
    }

    // Bắt đầu animation
    setIsShuffleAnimating(true);

    // Delay để animation mượt mà
    setTimeout(() => {
      if (isShuffled) {
        // Quay lại thứ tự gốc
        setFlashcards([...originalFlashcards]);
        setIsShuffled(false);
        setToast({ message: "Đã sắp xếp theo thứ tự gốc", type: "success" });
      } else {
        // Trộn ngẫu nhiên
        setFlashcards(shuffleArray(originalFlashcards));
        setIsShuffled(true);
        setToast({ message: "Đã trộn ngẫu nhiên", type: "success" });
      }

      // Reset progress
      setCurrentIndex(0);
      setResults([]);
      setIsShuffleAnimating(false);
    }, 150);
  }, [isShuffled, results, originalFlashcards]);

  // Handlers
  const handleMark = (remembered) => {
    // Safety check: nếu currentCard undefined, không làm gì
    if (!currentCard) {
      console.warn('handleMark called but currentCard is undefined');
      return;
    }

    // Kiểm tra xem card này đã được mark chưa
    const alreadyMarked = results.some(r => r.flashcard_id === currentCard.id);
    
    if (alreadyMarked) {
      // Không cho đổi ý
      setToast({
        message: "Bạn đã đánh dấu thẻ này rồi!",
        type: "error",
      });
      return;
    }

    // Lưu kết quả mới
    setResults((prev) => [
      ...prev,
      { flashcard_id: currentCard.id, remembered },
    ]);

    // Hiện toast thông báo
    setToast({
      message: remembered ? "Đã nhớ! 👍" : "Chưa nhớ, cố lên! 💪",
      type: remembered ? "success" : "error",
    });

    // Kiểm tra xem đã mark đủ hết chưa
    const totalMarked = results.length + 1;
    
    if (totalMarked === flashcards.length) {
      // Đã mark hết tất cả card → Hoàn thành
      setTimeout(() => {
        setIsCompleted(true);
      }, 300);
    } else if (currentIndex < flashcards.length - 1) {
      // Chưa hết → Tự động chuyển thẻ tiếp theo
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmitResults = useCallback(async () => {
    if (results.length === 0) return;

    try {
      let endpoint, requestData;
      
      if (mode === "daily_review") {
        endpoint = "/review/submit/";
        requestData = { results };
      } else if (mode === "learn_new") {
        endpoint = `/lessons/${lessonId}/learn-new/submit/`;
        requestData = { results };
      } else {
        return; // Practice mode không submit
      }

      const response = await api.post(endpoint, requestData);

      if (response.data.success) {
        setToast({
          message: `+${response.data.data.xp_gained} XP!`,
          type: "success",
        });
      }
    } catch (error) {
      console.error("Failed to submit results:", error);
    }
  }, [mode, results, lessonId]);

  const handleReviewNotRemembered = () => {
    const notRememberedIds = results
      .filter((r) => !r.remembered)
      .map((r) => r.flashcard_id);

    const notRememberedCards = originalFlashcards.filter((fc) =>
      notRememberedIds.includes(fc.id)
    );

    if (notRememberedCards.length > 0) {
      setFlashcards(notRememberedCards);
      setOriginalFlashcards(notRememberedCards);
      setCurrentIndex(0);
      setResults([]);
      setIsCompleted(false);
      setIsShuffled(false);
    } else {
      // Nếu không có thẻ nào chưa nhớ, quay về lesson
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (mode === "daily_review") {
      // Xóa notification daily review của ngày hôm nay
      try {
        const notifRes = await api.get('/users/notifications/db/');
        const dailyReviewNotif = notifRes.data.notifications?.find(
          n => n.message?.toLowerCase().includes('ôn tập') || n.message?.toLowerCase().includes('review')
        );
        if (dailyReviewNotif) {
          await api.delete(`/users/notifications/${dailyReviewNotif.id}/delete/`);
        }
      } catch (e) {
        console.error('Failed to delete notification:', e);
      }
      navigate("/");
    } else {
      navigate(`/lessons/${lessonId}`);
    }
  };

  const handleBack = () => {
    if (results.length > 0 && !isCompleted) {
      if (
        window.confirm("Bạn có chắc muốn thoát? Tiến độ sẽ không được lưu.")
      ) {
        if (mode === "daily_review") {
          navigate("/daily-review");
        } else {
          navigate(`/lessons/${lessonId}`);
        }
      }
    } else {
      if (mode === "daily_review") {
        navigate("/daily-review");
      } else {
        navigate(`/lessons/${lessonId}`);
      }
    }
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    setToast({
      message: isBookmarked ? "Đã bỏ lưu bài học" : "Đã lưu bài học",
      type: "success",
    });
  };

  // Submit results when completed
  useEffect(() => {
    if (isCompleted && (mode === "learn_new" || mode === "daily_review")) {
      handleSubmitResults();
    }
  }, [isCompleted, mode, handleSubmitResults]);

  // Render loading
  if (loading) {
    return (
      <div className="study-session">
        <div className="study-header">
          <button className="back-btn" onClick={handleBack}>
            ←
          </button>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "0%" }}></div>
          </div>
          <button className="bookmark-btn">
            <Bookmark size={20} />
          </button>
        </div>
        <div className="loading-container">Đang tải...</div>
      </div>
    );
  }

  // Render no flashcards
  if (!flashcards.length && !isCompleted) {
    return (
      <div className="study-session">
        <div className="study-header">
          <button className="back-btn" onClick={handleBack}>
            ←
          </button>
          <div className="lesson-title">{lessonData?.title}</div>
          <div style={{ width: 40 }}></div>
        </div>
        <div className="empty-container">
          <p>Không có flashcard để học.</p>
          <button className="primary-btn" onClick={handleFinish}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Render completed
  if (isCompleted) {
    const rememberedCount = results.filter((r) => r.remembered).length;
    const notRememberedCount = results.filter((r) => !r.remembered).length;

    return (
      <div className="study-session">
        <div className="study-header">
          <button className="back-btn" onClick={handleFinish}>
            ←
          </button>
          <div className="lesson-title">{lessonData?.title}</div>
          <div style={{ width: 40 }}></div>
        </div>

        <StudyResult
          rememberedCount={rememberedCount}
          notRememberedCount={notRememberedCount}
          onReviewAgain={handleReviewNotRemembered}
          onFinish={handleFinish}
          mode={mode}
        />

        {toast && (
          <ToastMessage
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  // Render study session (Flashcard component tự handle null data)
return (
    <div className="study-session">
      {/* Header */}
      <div className="study-header">
        <button className="back-btn" onClick={handleBack}>
          ←
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="header-actions">
          <button
            className={`header-icon-btn ${isShuffled ? "active" : ""}`}
            onClick={handleToggleShuffle}
            title={isShuffled ? "Thứ tự gốc" : "Trộn từ"}
          >
            🔀
          </button>
          <button
            className={`header-icon-btn ${isBookmarked ? "active" : ""}`}
            onClick={handleToggleBookmark}
            title={isBookmarked ? "Bỏ lưu" : "Lưu bài học"}
          >
            <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Lesson Title */}
      <div className="study-lesson-info">
        <h1 className="lesson-title">{lessonData?.title}</h1>
        {mode === "practice" && (
          <span className="mode-badge">Luyện tập tự do</span>
        )}
      </div>

      {/* Flashcard */}
      <div className={`flashcard-container ${isShuffleAnimating ? 'animating' : ''}`}>
        <Flashcard data={currentCard} />
      </div>

      {/* Navigation */}
      <div className="card-navigation">
        <button
          className="nav-btn"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="card-counter-group">
          <span className="card-counter">
            {currentIndex + 1}/{flashcards.length}
          </span>
          <span className="marked-counter">
            Đã đánh dấu: {results.length}/{flashcards.length}
          </span>
        </div>
        <button
          className="nav-btn"
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="action-btn not-remembered"
          onClick={() => handleMark(false)}
        >
          CHƯA NHỚ
        </button>
        <button
          className="action-btn remembered"
          onClick={() => handleMark(true)}
        >
          ĐÃ NHỚ
        </button>
      </div>

      {/* AI Button */}
      <button
        className="ai-btn"
        onClick={() => setShowAIModal(true)}
        title="AI Giải thích"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 6V2H8"/>
          <path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/>
          <path d="M2 12h2"/>
          <path d="M9 11v2"/>
          <path d="M15 11v2"/>
          <path d="M20 12h2"/>
        </svg>
      </button>

      {/* AI Modal */}
      {showAIModal && (
        <AIExplainModal
          word={currentCard?.word}
          meaning={currentCard?.meaning}
          onClose={() => setShowAIModal(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          duration={1500}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default StudySession;