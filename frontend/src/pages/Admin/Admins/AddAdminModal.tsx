import React, { useState, useEffect } from "react";
import api from '../../../api';
import ToastMessage from '../../../component/ToastMessage';
import styles from './AddAdminModal.module.css';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError?: (error: string) => void;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose, onSuccess, onError }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Reset toast mỗi khi modal mở lại
  useEffect(() => {
    if (isOpen) {
      setToast(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi API tạo admin mới, gửi mail xác nhận
      const response = await api.post("/users/register-admin/", { name, email });
      
      setSuccess(true);
      setToast({ 
        message: response.data.message || "Đã gửi email mời. Admin mới sẽ nhận link để đặt mật khẩu.", 
        type: "success" 
      });
      
      // Reset form
      setName("");
      setEmail("");
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose(); // Close modal
        onSuccess(); // Refresh admin list
      }, 2000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || "Không thể thêm admin mới";
      if (onError) {
        onError(errorMsg);
      } else {
        setToast({ message: errorMsg, type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles['add-admin-modal-backdrop']} onClick={onClose}>
        <div className={styles['add-admin-modal']} onClick={e => e.stopPropagation()}>
          <div className={styles['add-admin-modal__header']}>Thêm Admin mới</div>
          <div className={styles['add-admin-modal__body']}>
            {success ? (
              <div className="alert alert-success" style={{ marginBottom: 0 }}>
                <i className="bi bi-check-circle-fill me-2"></i>
                Đã gửi email mời! Admin mới sẽ nhận được link để đặt mật khẩu.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Họ và tên</label>
                  <input
                    className={styles['add-admin-modal__input']}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Nhập họ tên admin"
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Email</label>
                  <input
                    className={styles['add-admin-modal__input']}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="admin@example.com"
                  />
                </div>
                <div className={styles['add-admin-modal__footer']}>
                  <button
                    type="button"
                    className={styles['add-admin-modal__button'] + ' ' + styles['add-admin-modal__button--secondary']}
                    onClick={onClose}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={styles['add-admin-modal__button'] + ' ' + styles['add-admin-modal__button--primary']}
                    disabled={loading}
                  >
                    {loading ? (
                      <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>Đang gửi...</span>
                    ) : (
                      'Gửi lời mời'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default AddAdminModal;