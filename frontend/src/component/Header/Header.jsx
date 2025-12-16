import React, { useState } from "react";
import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logo.png";
import { api } from "../../api";
import { useUser } from "../../context/UserContext.tsx";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { setUser, user } = useUser();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest(".profile-container")) {
      setIsDropdownOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/users/logout/");
      setUser(null); // Remove user information from context
      setIsDropdownOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  React.useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <img 
            src={logo} 
            alt="PocketLingo Logo" 
            className="logo" 
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
        </div>

        <div className="header-actions">
          <button className="notification-button" aria-label="Thông báo">
            <Bell size={24} />
          </button>

          <div className="profile-container">
            <button
              className="profile-button"
              onClick={toggleDropdown}
              aria-label="Profile"
            >
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
                <button className="custom-dropdown-item" onClick={() => navigate('/profile')}>
                  Hồ sơ cá nhân
                </button>
                <button className="custom-dropdown-item" onClick={() => navigate('/change-password')}>
                  Đổi mật khẩu
                </button>
                <button className="custom-dropdown-item" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
