import { ChevronDown } from "lucide-react";

interface EditLessonModalProps {
  isOpen: boolean;
  editForm: {
    title: string;
    description: string;
    order_index: number | "";
    status: "active" | "inactive";
  } | null;
  saving: boolean;
  isStatusDropdownOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: "title" | "description" | "order_index" | "status", value: string) => void;
  onStatusDropdownToggle: (isOpen: boolean) => void;
}

const EditLessonModal = ({
  isOpen,
  editForm,
  saving,
  isStatusDropdownOpen,
  onClose,
  onSave,
  onChange,
  onStatusDropdownToggle,
}: EditLessonModalProps) => {
  if (!isOpen || !editForm) return null;

  return (
    <div className="lesson-management__modal-backdrop" onClick={onClose}>
      <div
        className="lesson-management__modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className="lesson-management__modal-title">Chỉnh sửa thông tin bài học</h2>

        <div className="lesson-management__modal-body">
          <div className="lesson-management__field">
            <label className="lesson-management__field-label" htmlFor="lesson-title">
              Tên bài học
            </label>
            <input
              id="lesson-title"
              className="lesson-management__input"
              type="text"
              value={editForm.title}
              onChange={(e) => onChange("title", e.target.value)}
            />
          </div>

          <div className="lesson-management__field">
            <label className="lesson-management__field-label" htmlFor="lesson-description">
              Mô tả bài học
            </label>
            <textarea
              id="lesson-description"
              className="lesson-management__textarea"
              rows={4}
              value={editForm.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </div>

          <div className="lesson-management__field-group">
            <div className="lesson-management__field lesson-management__field--half">
              <label className="lesson-management__field-label" htmlFor="lesson-order">
                Thứ tự bài học
              </label>
              <input
                id="lesson-order"
                className="lesson-management__input"
                type="number"
                value={editForm.order_index === "" ? "" : String(editForm.order_index)}
                onChange={(e) => onChange("order_index", e.target.value)}
              />
            </div>

            <div className="lesson-management__field lesson-management__field--half lesson-management__field-status">
              <label className="lesson-management__field-label" htmlFor="lesson-status-display">
                Trạng thái
              </label>
              <div
                id="lesson-status-display"
                className="lesson-management__select-display lesson-management__input"
                onClick={() => onStatusDropdownToggle(!isStatusDropdownOpen)}
              >
                <span>
                  {editForm.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </span>
                <span className="lesson-management__select-arrow">
                  <ChevronDown size={16} />
                </span>
              </div>
              {isStatusDropdownOpen && (
                <div className="lesson-management__select-menu">
                  <button
                    type="button"
                    className={
                      "lesson-management__select-option" +
                      (editForm.status === "active"
                        ? " lesson-management__select-option--active"
                        : "")
                    }
                    onClick={() => onChange("status", "active")}
                  >
                    Hoạt động
                  </button>
                  <button
                    type="button"
                    className={
                      "lesson-management__select-option" +
                      (editForm.status === "inactive"
                        ? " lesson-management__select-option--active"
                        : "")
                    }
                    onClick={() => onChange("status", "inactive")}
                  >
                    Không hoạt động
                  </button>
                </div>
              )}
            </div>
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
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLessonModal;
