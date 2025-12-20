import React from "react";
import styles from './ConfirmModal.module.css';

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
    <div className={styles['confirm-modal-backdrop']} onClick={onCancel}>
      <div className={styles['confirm-modal']} onClick={e => e.stopPropagation()}>
        <div className={styles['confirm-modal__header']}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#5E3C86' }}>{title}</h2>
        </div>
        <div className={styles['confirm-modal__body']}>
          <p style={{ margin: 0, fontSize: '1rem', color: '#333' }}>{message}</p>
        </div>
        <div className={styles['confirm-modal__footer']}>
          <button
            type="button"
            className={styles['confirm-modal__button'] + ' ' + styles['confirm-modal__button--secondary']}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={styles['confirm-modal__button'] + ' ' + (isDangerous ? styles['confirm-modal__button--primary'] : styles['confirm-modal__button--primary'])}
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
