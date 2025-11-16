import React, { useState } from "react";
import { Bell, User } from "lucide-react";
import "./Header.css";
import logo from "../../assets/logo.png";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest(".profile-container")) {
      setIsDropdownOpen(false);
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
          <img src={logo} alt="PocketLingo Logo" className="logo" />
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
              <User size={24} />
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item">Hồ sơ cá nhân</button>
                <button className="dropdown-item">Đổi mật khẩu</button>
                <button className="dropdown-item">Đăng xuất</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
