import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../../component/Sidebar/Sidebar";
import api from "../../../api";
import { Lock, Unlock, User as UserIcon } from "lucide-react";
import ConfirmModal from "../../../component/ConfirmModal/ConfirmModal";
import ChristmasLoader from '../../../component/ChristmasTheme/ChristmasLoader';

const Badge = ({ status }) => {
  const isActive = status === "active";
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    padding: "0 12px",
    borderRadius: 999,
    fontWeight: 600,
    backgroundColor: isActive ? "rgba(40,167,69,0.12)" : "rgba(220,53,69,0.12)",
    color: isActive ? "#28a745" : "#dc3545",
    border: `1px solid ${isActive ? "#28a745" : "#dc3545"}`,
  };
  return <span style={style}>{isActive ? "Activate" : "Locked"}</span>;
};

const UserDetail = () => {
  const { learnerId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchUser = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/admins/learners/${learnerId}/`);
      setUser(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || "Không tải được thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [learnerId]);

  const toggleStatus = async () => {
    if (!user) return;
    const action = user.status === "active" ? "lock" : "unlock";
    // show confirm modal
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const doConfirmAction = async () => {
    if (!user || !confirmAction) return;
    try {
      await api.post(`/admins/learners/${learnerId}/status/`, { action: confirmAction });
      setUser((u) => ({ ...u, status: confirmAction === "lock" ? "inactive" : "active" }));
    } catch (e) {
      alert(e?.response?.data?.error || "Không thể cập nhật trạng thái");
    } finally {
      setConfirmOpen(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="admin-dashboard-page">
      <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="container" style={{ marginTop: 40, maxWidth: 1000 }}>
        <div className="d-flex align-items-center mb-3">
          <button className="btn btn-light btn-sm me-3" onClick={() => navigate('/admin/learners')}>
            ← Quay lại
          </button>
          <h3 className="fw-bold mb-0">Chi tiết học viên</h3>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="text-center py-4"><ChristmasLoader /></div>
        ) : !user ? (
          <div className="text-center py-4">Không tìm thấy người dùng</div>
        ) : (
          <div className="card p-4 shadow-sm">
            <div className="d-flex align-items-center" style={{ gap: 20 }}>
              <div style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={56} strokeWidth={1.5} color="#5E3C86" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 className="mb-1">{user.name}</h4>
                <div className="text-muted">{user.email}</div>
                {user.phone && <div className="text-muted">{user.phone}</div>}
                <div style={{ marginTop: 8 }}><Badge status={user.status} /></div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                {user.status === 'active' ? (
                  <button
                    className="lesson-management__edit-button"
                    type="button"
                    onClick={toggleStatus}
                    title="Khóa tài khoản"
                  >
                    <span className="lesson-management__edit-icon">
                      <Lock size={16} />
                    </span>
                    Khóa tài khoản
                  </button>
                ) : (
                  <button
                    className="lesson-management__edit-button"
                    type="button"
                    style={{ backgroundColor: '#2e7d32' }}
                    onClick={toggleStatus}
                    title="Mở khóa tài khoản"
                  >
                    <span className="lesson-management__edit-icon">
                      <Unlock size={16} />
                    </span>
                    Mở khóa tài khoản
                  </button>
                )}
              </div>
            </div>

            <hr />

            <div>
              <h5>Tổng số khóa học: {user.courses_progress ? user.courses_progress.length : 0}</h5>
              <div className="mt-3">
                {user.courses_progress && user.courses_progress.length > 0 ? (
                  user.courses_progress.map((c) => {
                    const parseProgress = (val) => {
                      if (val === null || val === undefined) return 0;
                      if (typeof val === 'number') return val;
                      if (typeof val === 'string') {
                        // format: "54.6/100" -> take left part
                        if (val.includes('/')) {
                          const left = val.split('/')[0];
                          const num = parseFloat(left);
                          return Number.isFinite(num) ? num : 0;
                        }
                        // remove percent sign
                        const cleaned = val.replace('%', '').trim();
                        const num = parseFloat(cleaned);
                        return Number.isFinite(num) ? num : 0;
                      }
                      return 0;
                    };

                    const progressNum = Math.max(0, Math.min(100, parseProgress(c.progress)));
                    return (
                      <div key={c.course_id} className="card p-3 mb-2">
                        <div className="d-flex align-items-center">
                          {c.course_image && (
                            <img src={c.course_image} alt={c.course_name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, marginRight: 12 }} />
                          )}
                          <div style={{ flex: 1 }}>
                            <div className="fw-semibold">{c.course_name || 'Không tên khóa học'}</div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 6, alignItems: 'center' }}>
                              <div style={{ color: '#6c757d' }}>Hoàn thành</div>
                              <div style={{ fontWeight: 700 }}>{progressNum}%</div>
                              <div style={{ marginLeft: 'auto', color: '#6c757d' }}>Điểm TB: {typeof c.average_quiz_score === 'number' ? `${c.average_quiz_score}/100` : '—'}</div>
                            </div>
                            <div style={{ height: 8, background: '#e9ecef', borderRadius: 6, overflow: 'hidden', marginTop: 8 }}>
                              <div style={{ height: '100%', background: '#5E3C86', width: `${progressNum}%` }} />
                            </div>
                            <div style={{ marginTop: 6, color: '#6c757d', fontSize: 13 }}>{c.completed_lessons || 0}/{c.total_lessons || 0} bài</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-muted">Chưa có khóa học</div>
                )}
              </div>
            </div>
            <ConfirmModal
              isOpen={confirmOpen}
              title={confirmAction === 'lock' ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
              message={confirmAction === 'lock' ? 'Bạn có chắc muốn khóa tài khoản này?' : 'Bạn có chắc muốn mở khóa tài khoản này?'}
              confirmLabel={confirmAction === 'lock' ? 'Khóa' : 'Mở khóa'}
              cancelLabel={'Hủy'}
              onConfirm={doConfirmAction}
              onCancel={() => { setConfirmOpen(false); setConfirmAction(null); }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
