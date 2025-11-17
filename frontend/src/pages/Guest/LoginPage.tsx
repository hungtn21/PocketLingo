import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LandingHeader from "../../component/LandingPage/Header";
import ToastMessage from "../../component/ToastMessage"; // import component
import "./LandingPage.css";
import { api } from "../../api";
import { useUser } from "../../context/UserContext.tsx";

const HERO_LOGO_URL =
  "https://res.cloudinary.com/dytfwdgzc/image/upload/v1763300982/logo_pbhiqx.png";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const loginResponse = await api.post("/users/login/", 
        { email, password });

      if (loginResponse.data?.role) {
        // Lấy thông tin user từ API /users/me/
        const userResponse = await api.get("/users/me/");
        setUser({
          id: userResponse.data.user_id,
          email: userResponse.data.email,
          role: userResponse.data.role,
        });

        setToast({ message: "Đăng nhập thành công!", type: "success" });

        // Redirect dựa trên role (JWT đã được lưu trong HttpOnly cookie)
        const role = loginResponse.data.role;
        setTimeout(() => {
          if (role === "learner") navigate("/");
          else if (role === "admin" || role === "superadmin") navigate("/admin-dashboard");
        }, 1000); // delay 1s cho toast hiện ra
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
    <div className="login-page">
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
          <h2 className="section-title">Đăng nhập</h2>
          <form onSubmit={handleSubmit}>
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
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
                <Link to="/forgot-password" className="text-decoration-none" style={{ color: "#5E3C86", fontSize: "0.9rem" }}>
                  Quên mật khẩu?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-purple-outline"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <div className="mt-3 text-center">
              Chưa có tài khoản?{" "}
              <Link to="/signup" className="text-decoration-none" style={{ color: "#5E3C86" }}>
                Đăng ký ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
