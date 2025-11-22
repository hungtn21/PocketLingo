import React, { useState, useEffect } from "react";
import { Bell, User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../Header/Header.css";
import "../AdminDashboard/AdminHeader.css";
import logo from "../../assets/logo.png";
import { api } from "../../api";
import { useUser } from "../../context/UserContext";

interface AdminHeaderProps {
  onHamburgerClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onHamburgerClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout/");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
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

          <img src={logo} alt="Logo" className="logo" />
        </div>

        {/* Nhóm icon bên phải */}
        <div className="header-actions header-right">
          <button className="notification-button">
            <Bell size={24} />
          </button>

          <div className="profile-container">
            <button className="profile-button" onClick={toggleDropdown}>
              <User size={24} />
            </button>

            {isDropdownOpen && (
              <div className="custom-dropdown-menu">
                <button className="custom-dropdown-item">Hồ sơ cá nhân</button>
                <button className="custom-dropdown-item">Đổi mật khẩu</button>
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

export default AdminHeader;
