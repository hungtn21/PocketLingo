import "./ConfirmModal.css";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal__backdrop" onClick={onCancel}>
      <div
        className="confirm-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-modal__header">
          <h2 className="confirm-modal__title">{title}</h2>
        </div>

        <div className="confirm-modal__body">
          <p className="confirm-modal__message">{message}</p>
        </div>

        <div className="confirm-modal__footer">
          <button
            className="confirm-modal__button confirm-modal__button--cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={
              "confirm-modal__button" +
              (isDangerous
                ? " confirm-modal__button--danger"
                : " confirm-modal__button--primary")
            }
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
