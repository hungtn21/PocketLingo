import React from "react";
import "./StudyResult.css";

const StudyResult = ({
  rememberedCount,
  notRememberedCount,
  onReviewAgain,
  onFinish,
  mode,
}) => {
  
  return (
    <div className="study-result">
      <div className="result-icon">✓</div>

      <h2 className="result-title">Hoàn thành phiên học!</h2>

      <p className="result-description">
        Bạn đã hoàn thành phiên học hôm nay.
        {notRememberedCount > 0 && (
          <>
            <br />
            Có <strong>{notRememberedCount}</strong> từ bạn cần ôn tập lại ngay
            lập tức.
          </>
        )}
      </p>

      <div className="result-stats">
        <div className="stat-item remembered">
          <span className="stat-number">{rememberedCount}</span>
          <span className="stat-label">Đã nhớ</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item not-remembered">
          <span className="stat-number">{notRememberedCount}</span>
          <span className="stat-label">Chưa nhớ</span>
        </div>
      </div>

      {mode === "learn_new" && (
        <div className="xp-badge">+40 XP</div>
      )}

      <div className="result-actions">
        <button className="result-btn secondary" onClick={onFinish}>
          KẾT THÚC
        </button>
        {notRememberedCount > 0 && (
          <button className="result-btn primary" onClick={onReviewAgain}>
            ÔN TẬP LẠI
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyResult;