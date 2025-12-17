import React, { useState, useEffect } from "react";
import { Bell, User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../Header/Header.css";
import "../AdminDashboard/AdminHeader.css";
import logo from "../../assets/logo.png";
import { api } from "../../api";
import { useUser } from "../../context/UserContext";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

interface AdminHeaderProps {
  onHamburgerClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onHamburgerClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { setUser, user } = useUser();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = async () => {
    setShowConfirmLogout(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/users/logout/");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
      setShowConfirmLogout(false);
    }
  };

  const navigateToPasswordChange = () => {
    navigate("/admin/profile");
    setTimeout(() => {
      const el = document.getElementById("change-password");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest(".profile-container")) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [isDropdownOpen]);

  return (
    <header className="header">
      <div className="header-container admin-header-layout">

        {/* Gộp hamburger + logo vào một nhóm trái */}
        <div className="left-group">
          <button className="header-icon-button hamburger-left"
            onClick={onHamburgerClick}
            aria-label="Menu"
          >
            <Menu size={26} />
          </button>

          <button
            className="logo-button"
            onClick={() => navigate("/")}
            aria-label="Trang chủ"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <img src={logo} alt="Logo" className="logo" />
          </button>
        </div>

        {/* Nhóm icon bên phải */}
        <div className="header-actions header-right">
          <button className="notification-button">
            <Bell size={24} />
          </button>

          <div className="profile-container">
            <button className="profile-button" onClick={toggleDropdown}>
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user?.name || "Avatar"}
                  style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <User size={24} />
              )}
            </button>

            {isDropdownOpen && (
              <div className="custom-dropdown-menu">
                <button className="custom-dropdown-item" onClick={() => navigate('/admin/profile')}>Hồ sơ cá nhân</button>
                <button className="custom-dropdown-item" onClick={navigateToPasswordChange}>Đổi mật khẩu</button>
                <button className="custom-dropdown-item" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={showConfirmLogout}
        title="Xác nhận đăng xuất"
        message="Bạn chắc chắn muốn đăng xuất?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        isDangerous={true}
        onConfirm={confirmLogout}
        onCancel={() => setShowConfirmLogout(false)}
        isLoading={isLoggingOut}
      />
    </header>
  );
};

export default AdminHeader;