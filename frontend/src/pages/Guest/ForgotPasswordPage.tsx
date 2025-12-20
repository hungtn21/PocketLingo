import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import LandingHeader from "../../component/LandingPage/Header";
import ToastMessage from "../../component/ToastMessage";
import "./LandingPage.css";

const HERO_LOGO_URL =
  "https://res.cloudinary.com/dytfwdgzc/image/upload/v1763300982/logo_pbhiqx.png";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const response = await api.post("/users/forgot-password/", { email });
      if (response.data?.message) {
        setToast({ message: response.data.message, type: "success" });
        setEmailSent(true);
        setEmail("");
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

  return (
    <div className="forgot-password-page">
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
          <h2 className="guest-form-title" style={{ textAlign: "center" }}>Quên mật khẩu</h2>

          {emailSent ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#666", marginBottom: "1rem" }}>
                ✓ Link đặt lại mật khẩu đã được gửi đến email của bạn.
              </p>
              <p style={{ color: "#999", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Vui lòng kiểm tra hộp thư đến hoặc thư rác trong 1 giờ.
              </p>
              <Link
                to="/login"
                className="text-decoration-none"
                style={{ color: "#5E3C86", fontWeight: "bold" }}
              >
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: "#666", marginBottom: "1rem", fontSize: "0.95rem" }}>
                Nhập email của bạn để nhận link đặt lại mật khẩu.
              </p>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-purple-outline"
                disabled={loading}
                style={{ width: "100%" }}
              >
                {loading ? "Đang gửi..." : "Gửi link"}
              </button>

              <div className="mt-3 text-center">
                Nhớ mật khẩu?{" "}
                <Link
                  to="/login"
                  className="text-decoration-none"
                  style={{ color: "#5E3C86" }}
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
