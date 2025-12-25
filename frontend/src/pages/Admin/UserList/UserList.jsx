import React, { useEffect, useState } from "react";
import AdminHeader from "../../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../../component/Sidebar/Sidebar";
import api from "../../../api";
import { Link } from "react-router-dom";
import { Lock, Unlock, Search } from "lucide-react";
import ConfirmModal from "../../../component/ConfirmModal/ConfirmModal";
import ChristmasLoader from '../../../component/ChristmasTheme/ChristmasLoader';

const Badge = ({ status }) => {
  const isActive = status === "active";
  const style = {
    padding: "4px 10px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "0.85rem",
    backgroundColor: isActive ? "rgba(40,167,69,0.12)" : "rgba(220,53,69,0.12)",
    color: isActive ? "#28a745" : "#dc3545",
    border: `1px solid ${isActive ? "#28a745" : "#dc3545"}`,
  };
  return <span style={style}>{isActive ? "Active" : "Locked"}</span>;
};

const UserList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const fetchLearners = async (targetPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admins/learners/", {
        params: { page: targetPage, page_size: 10, search: search.trim() || undefined },
      });
      setLearners(res.data.results || []);
      setPage(res.data.page || targetPage);
      setTotalPages(res.data.total_pages || 1);
    } catch (e) {
      setError(e?.response?.data?.detail || "Không tải được danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners(1);
  }, []);

  const toggleStatus = async (u) => {
    const action = u.status === "active" ? "lock" : "unlock";
    try {
      await api.post(`/admins/learners/${u.id}/status/`, { action });
      // cập nhật nhanh giao diện (optimistic)
      setLearners((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, status: action === "lock" ? "inactive" : "active" } : item))
      );
    } catch (e) {
      alert(e?.response?.data?.error || "Không thể cập nhật trạng thái");
    }
  };

  const onRequestToggle = (u) => {
    setConfirmTarget(u);
    setConfirmOpen(true);
  };

  const doConfirmToggle = async () => {
    if (!confirmTarget) return;
    await toggleStatus(confirmTarget);
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const tableStyle = {
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #e7e7e7",
    borderTop: "4px solid #5E3C86", // gạch tím phía trên
  };

  const thStyle = {
    backgroundColor: "#5E3C86",
    color: "white",
    fontWeight: 700,
    fontSize: "0.9rem",
    borderBottom: "none"
  };

  return (
    <><div className="admin-dashboard-page">
      <style>{`
        .table-custom-header th {
          background-color: #5E3C86 !important;
          color: white !important;
        }
      `}</style>
      <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="container" style={{ marginTop: 40, maxWidth: 1100 }}>
        <h3 className="fw-bold mb-3">Danh sách học viên</h3>

        <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
          <div
            className="d-flex align-items-center"
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: 24,
              padding: "6px 10px",
              width: 320,
              background: "#f5f6f8",
            }}
          >
            <Search size={18} color="#777" style={{ marginRight: 6 }} />
            <input
              type="text"
              placeholder="Nhập Tên, Email, Số điện thoại"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLearners(1)}
              style={{ border: "none", background: "transparent", boxShadow: "none" }} />
          </div>
          <button className="btn btn-primary" style={{ backgroundColor: "#5E3C86", borderColor: "#5E3C86" }} onClick={() => fetchLearners(1)}>
            Tìm kiếm
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="text-center py-4"><ChristmasLoader /></div>
        ) : (
          <div className="card shadow-sm" style={tableStyle}>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead className="table-custom-header">
                  <tr>
                    <th style={{ ...thStyle, width: 60 }}>STT</th>
                    <th style={thStyle}>Họ Và Tên</th>
                    <th style={thStyle}>Email</th>
                    <th style={{ ...thStyle, width: 140 }}>Trạng thái</th>
                    <th style={{ ...thStyle, width: 140 }}>Ngày tạo</th>
                    <th style={{ ...thStyle, width: 100, textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {learners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        Không có học viên
                      </td>
                    </tr>
                  ) : (
                    learners.map((u, idx) => (
                      <tr key={u.id}>
                        <td>{(page - 1) * 10 + idx + 1}</td>
                        <td className="fw-semibold">
                          <Link to={`/admin/learners/${u.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {u.name}
                          </Link>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <Badge status={u.status} />
                        </td>
                        <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}</td>
                        <td className="text-center">
                          {u.status === "active" ? (
                            <button className="btn btn-link" title="Khóa tài khoản" onClick={() => onRequestToggle(u)}>
                              <Lock size={20} color="#5b5b5b" />
                            </button>
                          ) : (
                            <button className="btn btn-link" title="Mở khóa tài khoản" onClick={() => onRequestToggle(u)}>
                              <Unlock size={20} color="#5b5b5b" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-light'}`}
                    style={p === page ? { backgroundColor: "#5E3C86", borderColor: "#5E3C86" } : {}}
                    onClick={() => fetchLearners(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div><ConfirmModal
        isOpen={confirmOpen}
        title={confirmTarget && confirmTarget.status === 'active' ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
        message={confirmTarget && confirmTarget.status === 'active' ? 'Bạn có chắc muốn khóa tài khoản này?' : 'Bạn có chắc muốn mở khóa tài khoản này?'}
        confirmLabel={confirmTarget && confirmTarget.status === 'active' ? 'Khóa' : 'Mở khóa'}
        cancelLabel={'Hủy'}
        onConfirm={doConfirmToggle}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); } } /></>
  );
};

export default UserList;

