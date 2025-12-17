import React from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { useUser } from "../../context/UserContext";
import "./Sidebar.css";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <>
      <div
        className={`custom-sidebar ${isOpen ? "open" : ""}`}
        tabIndex={-1}
        aria-labelledby="sidebarLabel"
      >
        <div className="sidebar-header">
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>

        <div className="sidebar-body">
          <button className="sidebar-item" onClick={() => { navigate("/admin"); onClose(); }}>
          Dashboard
          </button>
          <button className="sidebar-item" onClick={() => { navigate("/admin/learners"); onClose(); }}>
  Quản lý học viên
</button>
          {user?.role === "superadmin" && (
            <button
              className="sidebar-item"
              onClick={() => { navigate("/admin/admins"); onClose(); }}
            >
              Quản lý admin
            </button>
          )} {/* Chỉ hiện cho superadmin */}
          <button className="sidebar-item">Quản lý khóa học</button>
          <button className="sidebar-item">Duyệt yêu cầu tham gia</button>
        </div>

        <div className="sidebar-footer">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user?.name || "Avatar"}
              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", marginRight: 8 }}
            />
          ) : (
            <UserCircle size={32} className="me-2" />
          )}
          <span>{user?.name || "User"}</span>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
};

export default Sidebar;
