import React, { useEffect, useState } from "react";
import AdminHeader from "../../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../../component/Sidebar/Sidebar";
import api from "../../../api";
import { Lock, Unlock, Search } from "lucide-react";

const Badge = ({ status }: { status: string }) => {
  const isActive = status === "active";
  return <span style={{
    padding: "4px 10px", borderRadius: 999, fontWeight: 600, fontSize: "0.85rem",
    backgroundColor: isActive ? "rgba(40,167,69,0.12)" : "rgba(220,53,69,0.12)",
    color: isActive ? "#28a745" : "#dc3545", border: `1px solid ${isActive ? "#28a745" : "#dc3545"}`
  }}>{isActive ? "Active" : "Locked"}</span>;
};

export default function AdminList() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchAdmins = async (targetPage = 1) => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/admins/admins/", {
        params: { page: targetPage, page_size: 10, search: search.trim() || undefined },
      });
      setAdmins(res.data.results || []);
      setPage(res.data.page || targetPage);
      setTotalPages(res.data.total_pages || 1);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Không tải được danh sách admin");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(1); }, []);

  const toggleStatus = async (u: any) => {
    const action = u.status === "active" ? "lock" : "unlock";
    try {
      await api.post(`/admins/admins/${u.id}/status/`, { action });
      setAdmins(prev => prev.map(item => item.id === u.id
        ? { ...item, status: action === "lock" ? "inactive" : "active" } : item));
    } catch (e: any) {
      alert(e?.response?.data?.error || "Không thể cập nhật trạng thái");
    }
  };

  const thStyle = {
    backgroundColor: "#6f42c1",
    color: "white",
    fontWeight: 700,
    fontSize: "0.9rem",
    borderBottom: "none"
  };

  return (
    <div className="admin-dashboard-page">
      <style>{`
        .table-custom-header th {
          background-color: #6f42c1 !important;
          color: white !important;
        }
      `}</style>
      <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="container" style={{ marginTop: 40, maxWidth: 1100 }}>
        <h3 className="fw-bold mb-3">Danh sách admin</h3>
        <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
          <div className="d-flex align-items-center" style={{ border: "1px solid #e0e0e0", borderRadius: 24, padding: "6px 10px", width: 320, background: "#f5f6f8" }}>
            <Search size={18} color="#777" style={{ marginRight: 6 }} />
            <input type="text" placeholder="Nhập Tên, Email"
              className="form-control" value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchAdmins(1)}
              style={{ border: "none", background: "transparent", boxShadow: "none" }} />
          </div>
          <button className="btn btn-primary" style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1" }} onClick={() => fetchAdmins(1)}>Tìm kiếm</button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? <div className="text-center py-4">Đang tải...</div> : (
          <div className="card shadow-sm" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e7e7e7", borderTop: "4px solid #6f42c1" }}>
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
                  {admins.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4">Không có admin</td></tr>
                  ) : admins.map((u, idx) => (
                    <tr key={u.id}>
                      <td>{(page - 1) * 10 + idx + 1}</td>
                      <td className="fw-semibold">{u.name}</td>
                      <td>{u.email}</td>
                      <td><Badge status={u.status} /></td>
                      <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}</td>
                      <td className="text-center">
                        {u.status === "active" ? (
                          <button className="btn btn-link" title="Khóa tài khoản" onClick={() => toggleStatus(u)}>
                            <Lock size={20} color="#5b5b5b" />
                          </button>
                        ) : (
                          <button className="btn btn-link" title="Mở khóa tài khoản" onClick={() => toggleStatus(u)}>
                            <Unlock size={20} color="#5b5b5b" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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
                            style={p === page ? { backgroundColor: "#6f42c1", borderColor: "#6f42c1" } : {}}
                            onClick={() => fetchAdmins(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}