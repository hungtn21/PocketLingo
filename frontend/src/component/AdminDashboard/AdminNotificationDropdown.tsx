import React, { useEffect, useState, useRef } from "react";
import { api } from "../../api";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import "../AdminDashboard/AdminNotificationDropdown.css";
import { initNotificationSocket, subscribeNotification } from "../../utils/notificationSocket";

interface Notification {
  id: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
  status?: 'approved' | 'rejected' | string;
  request_id?: string | number;
}

const AdminNotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    initNotificationSocket();
    const unsubscribe = subscribeNotification((payload) => {
      // If server sends unread_count update, apply it
      if (payload && typeof payload.unread_count === 'number') {
        setUnreadCount(payload.unread_count);
      }

      // If server provided a notification payload, persist it for this admin
      if (payload && payload.notification) {
        (async () => {
          try {
            const msg = payload.notification.message || payload.notification.description || '';
            const res = await api.post('/admins/notifications/create/', { message: msg });
            const created = res.data.notification;
            const count = res.data.unread_count || 0;
            setNotifications((prev) => [created, ...prev]);
            setUnreadCount(count);
          } catch (e) {
            console.warn('Failed to persist admin notification, refreshing list', e);
            fetchNotifications();
          }
        })();
      } else if (!payload || (typeof payload.unread_count !== 'number' && !payload.notification)) {
        // Fallback: refresh from server when payload is unexpected
        fetchNotifications();
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/admins/notifications/db/");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    setOpen(false);
    
    // Điều hướng đến trang duyệt yêu cầu (cả đã đọc và chưa đọc)
    let url = "/admin/enrollments";
    if (notif.request_id) {
      url += `?id=${notif.request_id}`;
    }
    navigate(url);
    
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notif.is_read) {
      try {
        await api.post("/admins/notifications/mark-read/", { id: notif.id });
        setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {}
    }
  };

  const handleDeleteNotification = async (notifId: string) => {
    try {
      await api.delete(`/admins/notifications/${notifId}/delete/`);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (e) {
      // handle error if needed
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.post('/admins/notifications/mark-all-read/');
      // optimistically update UI
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(res.data.unread_count ?? 0);
    } catch (e) {
      // fallback: refetch list
      fetchNotifications();
    }
  };

  return (
    <div className="admin-notification-dropdown-wrapper" ref={dropdownRef}>
      <button className="notification-button" onClick={() => setOpen((o) => !o)}>
        <Bell size={24} color="#fff" />
        {unreadCount > 0 && <span className="notification-dot" />}
      </button>
      {open && (
        <div className="admin-notification-dropdown">
          {notifications.length === 0 ? (
            <div className="no-notification">Không có thông báo nào</div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px' }}>
                <button
                  className="mark-all-read-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAllRead();
                  }}
                >
                  Đánh dấu tất cả là đã đọc
                </button>
              </div>
              <ul className="notification-list">
              {notifications.map((notif) => {
                // Logic màu sắc:
                // - Chưa đọc: nền tím (status-approved-unread)
                // - Đã đọc: nền trắng (read)
                let statusClass = '';
                if (!notif.is_read) {
                  statusClass = 'status-approved-unread'; // Nền tím khi chưa đọc
                }

                return (
                  <li
                    key={notif.id}
                    className={`notification-item ${notif.is_read ? 'read' : 'unread'} ${statusClass}`}
                  >
                    <div onClick={() => handleNotificationClick(notif)} style={{ flex: 1, cursor: 'pointer' }}>
                      <div className="notification-message">{notif.message}</div>
                      <div className="notification-time">{new Date(notif.created_at).toLocaleString()}</div>
                    </div>
                    <button
                      className="notification-delete-btn"
                      title="Xóa thông báo"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notif.id);
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationDropdown;