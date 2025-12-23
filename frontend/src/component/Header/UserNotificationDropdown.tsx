import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UserNotificationDropdown.css';
import { api } from '../../api';
import { initUserNotificationSocket, subscribeUserNotification } from '../../utils/userNotificationSocket';
import RejectionReasonModal from '../Homepage/RejectionReasonModal';

interface Notification {
  id: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
  status?: 'approved' | 'rejected' | string;
  reason?: string;
  course_title?: string;
  course_id?: string | number;
}

const UserNotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    initUserNotificationSocket();
    const unsub = subscribeUserNotification((payload) => {
      if (payload && typeof payload.unread_count === 'number') {
        setUnreadCount(payload.unread_count);
      }
      if (payload && payload.notification) {
        setNotifications((prev) => [payload.notification, ...prev]);
      } else {
        fetchNotifications();
      }
    });
    return () => unsub();
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
    // 1. Xử lý logic hiển thị/điều hướng TRƯỚC
    if (n.status === 'rejected') {
      // Nếu là từ chối -> hiện modal lý do (cả đã đọc và chưa đọc)
      setSelectedNotif(n);
      setShowModal(true);
      setOpen(false); // Đóng dropdown để hiện modal cho rõ
    } else if (n.status === 'approved') {
      // Nếu là đồng ý -> điều hướng đến trang chi tiết khóa học
      setOpen(false);
      if (n.course_id) {
        navigate(`/courses/${n.course_id}`);
      } else if (n.link) {
        navigate(n.link);
      }
    } else {
      // Kiểm tra nếu là thông báo ôn tập hàng ngày (Daily Review)
      // Dựa vào nội dung description từ send_daily_reminders.py
      const isReviewNotif = 
        n.message?.toLowerCase().includes('ôn tập') || 
        n.message?.toLowerCase().includes('review');
      
      if (isReviewNotif) {
        // Điều hướng tới Daily Review screen
        setOpen(false);
        navigate('/daily-review');
      } else {
        // Các thông báo thường khác
        setOpen(false);
        if (n.link) navigate(n.link);
      }
    }

    // 2. Đánh dấu đã đọc nếu chưa đọc
    if (!n.is_read) {
      try {
        await api.post('/users/notifications/mark-read/', { id: n.id });
        setNotifications((prev) => 
          prev.map(x => x.id === n.id ? { ...x, is_read: true } : x)
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleModalConfirm = () => {
    if (selectedNotif) {
      const link = selectedNotif.link;
      setShowModal(false);
      setSelectedNotif(null);
      // Điều hướng đến trang đăng ký lại
      navigate(link);
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
    } catch (e) {}
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
              {notifications.map(n => {
                // Xác định class màu sắc dựa trên status và trạng thái đọc
                let statusClass = '';
                if (!n.is_read) {
                  // CHƯA ĐỌC: có nền màu
                  if (n.status === 'rejected') {
                    statusClass = 'status-rejected-unread'; // Nền đỏ khi chưa đọc
                  } else if (n.status === 'approved') {
                    statusClass = 'status-approved-unread'; // Nền tím khi chưa đọc
                  }
                } else {
                  // ĐÃ ĐỌC: chỉ text màu
                  if (n.status === 'rejected') statusClass = 'status-rejected-text';
                  else if (n.status === 'approved') statusClass = 'status-approved-text';
                }

                return (
                  <li
                    key={n.id}
                    className={`notification-item ${n.is_read ? 'read' : 'unread'} ${statusClass}`}
                  >
                    <div onClick={() => handleClick(n)} style={{ flex: 1, cursor: 'pointer' }}>
                      <div className="notification-message">{n.message}</div>
                      <div className="notification-time">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                    <button
                      type="button"
                      className="notification-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(n.id);
                      }}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Modal hiển thị lý do từ chối (hiện cho cả đã đọc và chưa đọc) */}
      {selectedNotif && showModal && (
        <RejectionReasonModal
          courseName={selectedNotif.course_title || 'Khóa học'}
          reason={selectedNotif.reason || 'Nội dung đăng ký chưa phù hợp'}
          onReregister={handleModalConfirm}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default UserNotificationDropdown;