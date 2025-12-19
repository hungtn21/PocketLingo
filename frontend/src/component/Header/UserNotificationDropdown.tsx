import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../component/AdminDashboard/AdminNotificationDropdown.css';
import { api } from '../../api';
import { initUserNotificationSocket, subscribeUserNotification } from '../../utils/userNotificationSocket';
import RejectionReasonModal from '../Homepage/RejectionReasonModal';

interface Notification {
  id: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

const UserNotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    initUserNotificationSocket();
    const unsub = subscribeUserNotification((payload) => {
      if (payload && typeof payload.unread_count === 'number') {
        setUnreadCount(payload.unread_count);
      }
      // optionally insert notification preview
      if (payload && payload.notification) {
        setNotifications((prev) => [payload.notification, ...prev]);
      } else {
        // fallback: refetch list
        fetchNotifications();
      }
    });
    return () => unsub();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/users/notifications/db/');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (e) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleClick = async (n: Notification) => {
    // mark read locally and call API to mark as read
    if (!n.is_read) {
      try {
        await api.post('/users/notifications/mark-read/', { id: n.id });
      } catch (e) {
        // ignore
      }
      setNotifications((prev) => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    // If approved -> navigate to course detail. If rejected -> open modal showing reason.
    if ((n as any).status === 'approved') {
      setOpen(false);
      navigate(n.link);
      return;
    }
    if ((n as any).status === 'rejected') {
      // open modal to show reason
      setSelectedNotif(n);
      setShowModal(true);
      return;
    }
    // default behavior
    setOpen(false);
    navigate(n.link);
  };

  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleModalConfirm = () => {
    // 'Đăng ký lại' -> navigate to course detail
    if (selectedNotif) {
      setShowModal(false);
      setSelectedNotif(null);
      navigate(selectedNotif.link);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedNotif(null);
  };

  const handleDeleteNotification = async (notifId: string) => {
    try {
      await api.delete(`/users/notifications/${notifId}/delete/`);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (e) {
      // handle error if needed
    }
  };

  return (
    <div className="admin-notification-dropdown-wrapper" ref={ref}>
      <button className="notification-button" onClick={() => setOpen(o => !o)} aria-label="Thông báo">
        <Bell size={24} />
        {unreadCount > 0 && <span className="notification-dot" />}
      </button>
      {open && (
        <div className="admin-notification-dropdown">
            {notifications.length === 0 ? (
            <div className="no-notification">Không có thông báo nào</div>
          ) : (
            <ul className="notification-list">
              {notifications.map(n => (
                <li key={n.id} className={`notification-item ${n.is_read ? 'read' : 'unread'} ${(n as any).status === 'rejected' ? 'rejected' : (n as any).status === 'approved' ? 'approved' : ''}`}>
                  <div onClick={() => handleClick(n)} style={{ flex: 1, cursor: 'pointer' }}>
                    <div className="notification-message">{n.message}</div>
                    <div className="notification-time">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  <button
                    className="notification-delete-btn"
                    title="Xóa thông báo"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(n.id);
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {selectedNotif && showModal && (
        <RejectionReasonModal
          courseName={(selectedNotif as any).course_title || ''}
          reason={(selectedNotif as any).reason || ''}
          onReregister={handleModalConfirm}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default UserNotificationDropdown;
