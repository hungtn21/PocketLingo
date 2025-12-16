import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import api from "../../../api";
import ToastMessage from "../../../component/ToastMessage";
import "./UserChangePassword.css";

const UserChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);

    if (newPassword !== confirmPassword) {
      setToast({ message: "Mật khẩu mới không khớp", type: "error" });
      setChangingPassword(false);
      return;
    }

    if (newPassword.length < 8) {
      setToast({ message: "Mật khẩu phải có ít nhất 8 ký tự", type: "error" });
      setChangingPassword(false);
      return;
    }

    try {
      await api.post("/users/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToast({ message: "Đổi mật khẩu thành công!", type: "success" });
      
      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err: any) {
      const message = err?.response?.data?.error || "Có lỗi xảy ra khi đổi mật khẩu.";
      setToast({ message, type: "error" });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="change-password-page">
      {/* Simple header with back button only */}
      <div className="simple-header">
        <button className="back-btn" onClick={() => navigate("/profile")}>
          ←
        </button>
      </div>

      <div className="change-password-container">

        <div className="change-password-card">
          <div className="card-header">
            <div className="icon-wrapper">
              <Lock size={32} />
            </div>
            <h2 className="card-title">Đổi mật khẩu</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label>Mật khẩu cũ</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
              />
              <small className="form-hint">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
              </small>
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={changingPassword}>
              {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>

      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  );
};

export default UserChangePassword;
