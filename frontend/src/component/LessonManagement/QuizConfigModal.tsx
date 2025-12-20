import { ChevronDown } from "lucide-react";

interface QuizConfigModalProps {
  isOpen: boolean;
  editQuizForm: {
    hours: number | "";
    minutes: number | "";
    seconds: number | "";
    passed_score: number | "";
    noTimeLimit: boolean;
  } | null;
  quiz: { id: number; time_limit: number | null; passed_score: number } | null;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: "hours" | "minutes" | "seconds" | "passed_score" | "noTimeLimit", value: string | boolean) => void;
}

const QuizConfigModal = ({
  isOpen,
  editQuizForm,
  quiz,
  saving,
  onClose,
  onSave,
  onChange,
}: QuizConfigModalProps) => {
  if (!isOpen || !editQuizForm) return null;

  return (
    <div className="lesson-management__modal-backdrop" onClick={onClose}>
      <div
        className="lesson-management__modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className="lesson-management__modal-title">
          {quiz ? "Chỉnh sửa cấu hình quiz" : "Tạo quiz"}
        </h2>

        <div className="lesson-management__modal-body">
          <div className="lesson-management__field">
            <label className="lesson-management__field-label">Thời gian làm bài</label>
            <div className="lesson-management__time-inputs">
              <div className="lesson-management__time-input-group">
                <input
                  className="lesson-management__input lesson-management__input--time"
                  type="number"
                  min="0"
                  disabled={editQuizForm.noTimeLimit}
                  value={editQuizForm.noTimeLimit ? "0" : (editQuizForm.hours === "" ? "" : String(editQuizForm.hours))}
                  onChange={(e) => onChange("hours", e.target.value)}
                  placeholder="0"
                />
                <span className="lesson-management__time-label">h</span>
              </div>
              <div className="lesson-management__time-input-group">
                <input
                  className="lesson-management__input lesson-management__input--time"
                  type="number"
                  min="0"
                  max="59"
                  disabled={editQuizForm.noTimeLimit}
                  value={editQuizForm.noTimeLimit ? "0" : (editQuizForm.minutes === "" ? "" : String(editQuizForm.minutes).padStart(2, '0'))}
                  onChange={(e) => onChange("minutes", e.target.value)}
                  placeholder="0"
                />
                <span className="lesson-management__time-label">m</span>
              </div>
              <div className="lesson-management__time-input-group">
                <input
                  className="lesson-management__input lesson-management__input--time"
                  type="number"
                  min="0"
                  max="59"
                  disabled={editQuizForm.noTimeLimit}
                  value={editQuizForm.noTimeLimit ? "0" : (editQuizForm.seconds === "" ? "" : String(editQuizForm.seconds).padStart(2, '0'))}
                  onChange={(e) => onChange("seconds", e.target.value)}
                  placeholder="0"
                />
                <span className="lesson-management__time-label">s</span>
              </div>
            </div>
            <label className="lesson-management__checkbox-label">
              <input
                type="checkbox"
                className="lesson-management__checkbox-input"
                checked={editQuizForm.noTimeLimit}
                onChange={(e) => onChange("noTimeLimit", e.target.checked)}
              />
              <span>Không giới hạn thời gian làm bài</span>
            </label>
          </div>

          <div className="lesson-management__field">
            <label className="lesson-management__field-label">Điểm đặt yêu cầu</label>
            <input
              className="lesson-management__input"
              type="number"
              min="0"
              value={editQuizForm.passed_score === "" ? "" : String(editQuizForm.passed_score)}
              onChange={(e) => onChange("passed_score", e.target.value)}
            />
          </div>
        </div>

        <div className="lesson-management__modal-footer">
          <button
            type="button"
            className="lesson-management__button lesson-management__button--secondary"
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </button>
          <button
            type="button"
            className="lesson-management__button lesson-management__button--primary"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizConfigModal;
