import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api"; 
import Flashcard from "../../../component/Flashcard/Flashcard";
import "./LessonDetail.css";

const LessonDetail = () => {
  const { lessonId, courseId } = useParams();
  const navigate = useNavigate();
  
  const [lessonData, setLessonData] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/lessons/${lessonId}/`);
        
        if (response.data.success) {
          setLessonData(response.data.data.lesson);
          setFlashcards(response.data.data.flashcards);
        }
      } catch (error) {
        console.error("Failed to fetch lesson details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonDetails();
    }
  }, [lessonId]);

  const handleStartLearning = () => {
    navigate(`/lessons/${lessonId}/learn`);
  };

  const handleStartQuiz = () => {
    navigate(`/lessons/${lessonId}/quiz`);
  };

  const handleBack = () => {
    if (lessonData?.course_id) {
      navigate(`/courses/${lessonData.course_id}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="lesson-page">
        <div className="lesson-header-bar">
          <button className="back-button" onClick={handleBack}>← Quay lại</button>
        </div>
        <div className="loading-container">Đang tải nội dung bài học...</div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="lesson-page">
        <div className="lesson-header-bar">
          <button className="back-button" onClick={handleBack}>← Quay lại</button>
        </div>
        <div className="loading-container">Không tìm thấy bài học.</div>
      </div>
    );
  }

  return (
    <div className="lesson-page">
      <div className="lesson-header-bar">
        <button className="back-button" onClick={handleBack}>← Quay lại</button>
      </div>
      
      <div className="lesson-container">
        {/* 1. Top Section: Flashcard Preview (Hàng ngang) */}
        <div className="flashcard-preview-list">
          {flashcards.length > 0 ? (
            flashcards.map((card) => (
              <Flashcard key={card.id} data={card} />
            ))
          ) : (
            <div className="flashcard-preview-item" style={{background: '#eee', minWidth: '200px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius: '12px'}}>
                Chưa có từ vựng
            </div>
          )}
        </div>

        {/* 2. Middle Section: Info & Buttons */}
        <div className="lesson-header">
          <h1 className="lesson-title">{lessonData.title}</h1>
          <p className="term-count">{flashcards.length} thuật ngữ</p>
        </div>

        <div className="action-buttons">
          <button className="action-btn btn-start" onClick={handleStartLearning}>
            Vào học
          </button>
          <button className="action-btn btn-quiz" onClick={handleStartQuiz}>
            Làm Quiz
          </button>
        </div>

        {/* 3. Bottom Section: Term List (Danh sách thuật ngữ) */}
        <h3 className="term-section-title">Thuật ngữ</h3>
        <div className="term-list">
          {flashcards.map((card) => (
            <div key={card.id} className="term-item">
              {card.image_url && (
                <img src={card.image_url} alt={`Image illustrating ${card.word}`} className="term-image" />
              )}
              <div className="term-content">
                <div className="term-word">{card.word}</div>
                <div className="term-definition">
                  {card.meaning}
                  {card.example && (
                      <div style={{fontSize: '0.9rem', color: '#777', marginTop: '4px'}}>
                          <em>Ví dụ: {card.example}</em>
                      </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;