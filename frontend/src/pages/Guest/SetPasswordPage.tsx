import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import LandingHeader from "../../component/LandingPage/Header";
import ToastMessage from "../../component/ToastMessage";
import "./LandingPage.css";
import { api } from "../../api";

const HERO_LOGO_URL =
  "https://res.cloudinary.com/dytfwdgzc/image/upload/v1763300982/logo_pbhiqx.png";

// Decode JWT (không verify)
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const SetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [userName, setUserName] = useState("");
  const [isAdminInvite, setIsAdminInvite] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setToast({ message: "Token không hợp lệ.", type: "error" });
      return;
    }

    const decoded = decodeJWT(token);
    if (!decoded) {
      setToast({ message: "Token không hợp lệ.", type: "error" });
      return;
    }

    // Check expire
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      setToast({ message: "Token đã hết hạn.", type: "error" });
      return;
    }

    setUserName(decoded.name || "");

    if (decoded.purpose === "create_admin_by_superadmin") {
      setIsAdminInvite(true);
      return;
    }

    // Signup flow → verify email
    api
      .get("/users/verify-email/", { params: { token } })
      .then((res) => {
        setUserName(res.data.name || "");
        setIsAdminInvite(false);
      })
      .catch(() => {
        setToast({ message: "Token không hợp lệ hoặc hết hạn.", type: "error" });
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (password !== confirmPassword) {
      setToast({ message: "Mật khẩu xác nhận không khớp.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/users/set-password/", {
        token,
        password,
      });

      if (res.data?.message) {
        setToast({ message: res.data.message, type: "success" });
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

  return (
    <div className="set-password-page">
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
          <h2 className="guest-form-title">Đặt mật khẩu mới</h2>

          {isAdminInvite && (
            <>
              <p>Xin chào <strong>{userName}</strong>!</p>
              <p>Bạn đã được mời làm <strong>quản trị viên</strong> PocketLingo. Hãy thiết lập mật khẩu để hoàn tất đăng ký.</p>
            </>
          )}

          {!isAdminInvite && (
            <>
              <p>Xin chào <strong>{userName}</strong>!</p>
              <p>Hãy thiết lập mật khẩu để hoàn tất đăng ký.</p>
            </>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Mật khẩu mới
              </label>
              <div className="input-group">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Xác nhận mật khẩu
              </label>
              <div className="input-group">
                <input
                  type="password"
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
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>

            {!isAdminInvite && (
              <div className="mt-3 text-center">
                Quay lại{" "}
                <Link
                  to="/signup"
                  className="text-decoration-none"
                  style={{ color: "#5E3C86" }}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetPasswordPage;
