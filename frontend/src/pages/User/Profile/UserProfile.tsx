import React, { useEffect, useState } from "react";
import Header from "../../../component/Header/Header";
import { useUser } from "../../../context/UserContext";
import api from "../../../api";
import { User as UserIcon, Edit2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ToastMessage from "../../../component/ToastMessage";
import "./UserProfile.css";

const UserProfile: React.FC = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [name, setName] = useState<string>(user?.name || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
      if (user) setUser({ ...user, name, avatar_url: newAvatar });

      setPreview(null);
      setFile(null);
      setToast({ message: "Cập nhật thông tin thành công!", type: "success" });

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
    }
  };

  return (
    <div className="user-profile-page">
      <Header />

      <div className="user-profile-container">
        {loadingProfile ? (
          <div className="text-center py-5">Đang tải...</div>
        ) : (
          <>
            <h2 className="profile-title">Thông tin cá nhân</h2>

            <div className="profile-grid">
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

                <div className="profile-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? "Đang lưu..." : "Cập nhật thông tin"}
                  </button>

                  <button
                    type="button"
                    className="change-password-btn"
                    onClick={() => navigate("/change-password")}
                  >
                    <Lock size={18} />
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
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

export default UserProfile;
