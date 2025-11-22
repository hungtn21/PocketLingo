import React from "react";
import { UserCircle } from "lucide-react";
import { useUser } from "../../context/UserContext";
import "./Sidebar.css";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();

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
          <button className="sidebar-item">Dashboard</button>
          <button className="sidebar-item">Quản lý học viên</button>
          <button className="sidebar-item">Quản lý admin</button>
          <button className="sidebar-item">Quản lý khóa học</button>
          <button className="sidebar-item">Duyệt yêu cầu tham gia</button>
        </div>

        <div className="sidebar-footer">
          <UserCircle size={32} className="me-2" />
          <span>{user?.name || "User"}</span>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
};

export default Sidebar;
