import React, { useState } from "react";
import api from "../../api";
import "./AIExplainModal.css";

const AIExplainModal = ({ word, meaning, onClose }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;

    const userMessage = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);

    setLoading(true);
    try {
      const response = await api.post("/flashcards/ai-explain/", {
        word,
        meaning,
        user_question: userMessage,
      });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          { type: "ai", content: response.data.data.explanation },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal-header">
          <div className="ai-modal-header-content">
            <div className="ai-modal-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                  fill="white"
                />
                <circle cx="9" cy="10" r="1.5" fill="#5E3C86" />
                <circle cx="15" cy="10" r="1.5" fill="#5E3C86" />
                <path
                  d="M12 16C13.5 16 14.5 15 14.5 14H9.5C9.5 15 10.5 16 12 16Z"
                  fill="#5E3C86"
                />
              </svg>
            </div>
            <h3>AI Giải thích</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Current Word Info */}
        <div className="current-word-info">
          <div className="word-label">Từ đang học:</div>
          <div className="word-content">
            <strong>{word}</strong> - {meaning}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="ai-messages">
          {messages.length === 0 && (
            <div className="ai-hint">
              Hỏi bất cứ điều gì về từ này, ví dụ:
              <ul>
                <li>"Cho tôi thêm ví dụ"</li>
                <li>"Từ này khác gì với..."</li>
                <li>"Giải thích cách dùng"</li>
              </ul>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.type === "ai" && (
                <div className="message-icon">
                  <svg
                    width="20"
                    height="20"
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
                </div>
              )}
              <div className="message-content">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="message ai loading">
              <div className="message-icon">
                <svg
                  width="20"
                  height="20"
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
              </div>
              <div className="message-content">
                <span className="typing-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="ai-input-area">
          <input
            type="text"
            placeholder="Nhập câu hỏi của bạn..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !question.trim()}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIExplainModal;