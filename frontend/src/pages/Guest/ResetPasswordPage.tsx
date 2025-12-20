import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../../api";
import LandingHeader from "../../component/LandingPage/Header";
import ToastMessage from "../../component/ToastMessage";
import "./LandingPage.css";

const HERO_LOGO_URL =
  "https://res.cloudinary.com/dytfwdgzc/image/upload/v1763300982/logo_pbhiqx.png";

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();

  // Verify token validity on mount (just check if token is valid, no need to decode client-side)
  useEffect(() => {
    if (!token) {
      setToast({ message: "Token không hợp lệ.", type: "error" });
      setValidating(false);
      return;
    }
    // Token sẽ được verify server-side khi submit, vậy chỉ cần set ready
    setValidating(false);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (password !== confirmPassword) {
      setToast({ message: "Mật khẩu xác nhận không khớp.", type: "error" });
      return;
    }

    if (password.length < 6) {
      setToast({ message: "Mật khẩu phải có ít nhất 6 ký tự.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/users/reset-password/", {
        token,
        password,
      });

      if (response.data?.message) {
        setToast({ message: response.data.message, type: "success" });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Đã có lỗi xảy ra. Vui lòng thử lại.";
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p>Đang xác minh...</p>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <LandingHeader />

      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container my-5 d-flex flex-column align-items-center">
        {/* Logo */}
        <div
          className="mb-4"
          style={{
            width: "280px",
            height: "100px",
            background: "#5E3C86",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={HERO_LOGO_URL}
            alt="Logo"
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Form */}
        <div
          className="w-100"
          style={{
            maxWidth: "420px",
            background: "#fff",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          <h2 className="guest-form-title" style={{ textAlign: "center" }}>Đặt lại mật khẩu</h2>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Mật khẩu */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Mật khẩu mới</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-purple-outline"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>

            <div className="mt-3 text-center">
              <Link to="/login" className="text-decoration-none" style={{ color: "#5E3C86" }}>
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
