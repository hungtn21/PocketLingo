import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LandingHeader from "../../component/LandingPage/Header";
import ToastMessage from "../../component/ToastMessage";
import "./LandingPage.css";
import { api } from "../../api";

const HERO_LOGO_URL =
  "https://res.cloudinary.com/dytfwdgzc/image/upload/v1763300982/logo_pbhiqx.png";

const SignupPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const response = await api.post(`/users/register/`, {
        name,
        email,
      });

      if (response.data?.message) {
        setToast({ message: response.data.message, type: "success" });
        // Clear form
        setName("");
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
    <div className="signup-page">
      <LandingHeader />

      {/* Toast message */}
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
          <h2 className="section-title">Đăng ký</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Họ và tên</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
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
              {loading ? "Đang gửi..." : "Đăng ký"}
            </button>

            <div className="mt-3 text-center">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-decoration-none" style={{ color: "#5E3C86" }}>
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
