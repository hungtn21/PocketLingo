import React, { useState, useEffect } from "react";
import api from '../../../api';
import ToastMessage from '../../../component/ToastMessage';

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
      <div 
        className="modal-backdrop" 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.25)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        onClick={onClose} // Close when clicking backdrop
      >
        <div 
          className="modal-content" 
          style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: 32, 
            minWidth: 350, 
            maxWidth: 400, 
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)' 
          }}
          onClick={(e) => e.stopPropagation()} // Prevent close when clicking modal content
        >
          <h4 className="fw-bold mb-3">Thêm Admin mới</h4>
          {success ? (
            <div className="alert alert-success">
              <i className="bi bi-check-circle-fill me-2"></i>
              Đã gửi email mời! Admin mới sẽ nhận được link để đặt mật khẩu.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Họ và tên</label>
                <input 
                  className="form-control" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  disabled={loading}
                  placeholder="Nhập họ tên admin"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  className="form-control" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  disabled={loading}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onClose} 
                  disabled={loading}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ backgroundColor: '#5E3C86', borderColor: '#5E3C86' }} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi lời mời'
                  )}
                </button>
              </div>
            </form>
          )}
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