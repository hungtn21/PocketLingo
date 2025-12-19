import React, { useEffect, useState } from "react";
import AdminHeader from "../../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../../component/Sidebar/Sidebar";
import { useUser } from "../../../context/UserContext";
import api from "../../../api";
import { User as UserIcon, Edit2 } from "lucide-react";
import ToastMessage from "../../../component/ToastMessage";
import ConfirmModal from "../../../component/ConfirmModal/ConfirmModal";
import ChristmasAvatar from "../../../component/ChristmasTheme/ChristmasAvatar";
import "./AdminProfile.css";

const AdminProfile: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, setUser } = useUser();
  const [name, setName] = useState<string>(user?.name || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Confirm modals
  const [showConfirmProfile, setShowConfirmProfile] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile/");
        setAvatarUrl(res.data.avatar_url || null);
        setName(res.data.name || "");
        setEmail(res.data.email || "");
      } catch (e: any) {
        setToast({
          message: e?.response?.data?.error || "Không thể tải thông tin hồ sơ",
          type: "error",
        });
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmProfile(true);
  };

  const confirmSaveProfile = async () => {
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (file) formData.append("avatar", file);

      const res = await api.patch("/users/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newAvatar = res.data.user?.avatar_url || avatarUrl;
      setAvatarUrl(newAvatar);
      if (user) setUser({ ...user, name }); // update local user

      setPreview(null);
      setFile(null);
      setToast({ message: "Cập nhật thông tin ảnh/tên thành công!", type: "success" });

      // Nếu email đổi
      if (email !== user?.email) {
        try {
          await api.post("/users/request-email-change/", { new_email: email });
          setToast({ message: "Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư.", type: "success" });
        } catch (e: any) {
          setToast({ message: e?.response?.data?.error || "Không gửi được email xác nhận.", type: "error" });
        }
      }
    } catch (err: any) {
      setToast({ message: err?.response?.data?.error || "Có lỗi xảy ra khi lưu thông tin.", type: "error" });
    } finally {
      setSaving(false);
      setShowConfirmProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setToast({ message: "Mật khẩu mới không khớp", type: "error" });
      return;
    }

    setShowConfirmPassword(true);
  };

  const confirmPasswordChange = async () => {
    setChangingPassword(true);

    try {
      await api.post("/users/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToast({ message: "Đổi mật khẩu thành công!", type: "success" });
    } catch (err: any) {
      const message = err?.response?.data?.error || "Có lỗi xảy ra khi đổi mật khẩu.";
      setToast({ message, type: "error" });
    } finally {
      setChangingPassword(false);
      setShowConfirmPassword(false);
    }
  };

  return (
    <div className="admin-profile">
      <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {loadingProfile ? (
        <div className="text-center py-5">Đang tải...</div>
      ) : (
        <div className="admin-profile-wrapper">
          <h2 className="mb-4 fw-bold text-center">Thông tin cá nhân</h2>

          <div className="admin-profile-grid">
            <div className="avatar-section">
              <div className="avatar-placeholder">
                {preview ? (
                  <img src={preview} alt="preview" className="avatar-img" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="avatar-img" />
                ) : (
                  <UserIcon size={90} strokeWidth={1.5} />
                )}
              </div>
              <label className="upload-btn">
                Upload avatar
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </label>
              {file && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  Hủy
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-field">
                <label>Tên</label>
                <div className="input-with-icon">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Edit2 size={18} className="field-icon" />
                </div>
              </div>

              <div className="profile-field">
                <label>Email</label>
                <div className="input-with-icon">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Edit2 size={18} className="field-icon" />
                </div>
                {email !== user?.email && (
                  <small className="text-warning">
                    Email sẽ được cập nhật sau khi xác nhận qua mail.
                  </small>
                )}
              </div>

              <div className="profile-field">
                <label>Role</label>
                <input type="text" value={user?.role || ""} disabled />
              </div>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "Đang lưu..." : "Cập nhật thông tin"}
              </button>
            </form>
          </div>

          <div className="password-section mt-5" id="change-password">
            <hr className="my-4" />
            <h3 className="mb-4 fw-bold text-center">Đổi mật khẩu</h3>

            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="row g-3">
                <div className="col-12">
                  <label>Mật khẩu cũ</label>
                  <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                </div>

                <div className="col-md-6">
                  <label>Mật khẩu mới</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>

                <div className="col-md-6">
                  <label>Xác nhận mật khẩu mới</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>

              <div className="text-center mt-4">
                <button type="submit" className="save-btn" disabled={changingPassword}>
                  {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      <ConfirmModal
        isOpen={showConfirmProfile}
        title="Xác nhận cập nhật thông tin"
        message="Bạn chắc chắn muốn cập nhật thông tin cá nhân này?"
        confirmText="Cập nhật"
        cancelText="Hủy"
        onConfirm={confirmSaveProfile}
        onCancel={() => setShowConfirmProfile(false)}
        isLoading={saving}
      />

      <ConfirmModal
        isOpen={showConfirmPassword}
        title="Xác nhận đổi mật khẩu"
        message="Bạn chắc chắn muốn đổi mật khẩu? Vui lòng đăng nhập lại sau khi đổi."
        confirmText="Đổi mật khẩu"
        cancelText="Hủy"
        onConfirm={confirmPasswordChange}
        onCancel={() => setShowConfirmPassword(false)}
        isLoading={changingPassword}
      />
    </div>
  );
};

export default AdminProfile;
