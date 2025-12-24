import React, { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import AddAdminModal from "./AddAdminModal";
import ConfirmModal from "../../../component/ConfirmModal/ConfirmModal";
import AdminHeader from "../../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../../component/Sidebar/Sidebar";
import api from "../../../api";
import ToastMessage from "../../../component/ToastMessage";
import ChristmasLoader from "../../../component/ChristmasTheme/ChristmasLoader";
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
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchAdmins = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/admins/admins/", {
        params: { page: targetPage, page_size: 10, search: search.trim() || undefined },
      });
      setAdmins(res.data.results || []);
      setPage(res.data.page || targetPage);
      setTotalPages(res.data.total_pages || 1);
    } catch (e: any) {
      setToast({ message: e?.response?.data?.detail || "Không tải được danh sách admin", type: "error" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(1); }, []);

  const toggleStatus = async (u: any) => {
    setConfirmTarget(u);
    setConfirmOpen(true);
  };

  const doConfirmToggle = async () => {
    if (!confirmTarget) return;
    const action = confirmTarget.status === "active" ? "lock" : "unlock";
    try {
      await api.post(`/admins/admins/${confirmTarget.id}/status/`, { action });
      setAdmins(prev => prev.map(item => item.id === confirmTarget.id
        ? { ...item, status: action === "lock" ? "inactive" : "active" } : item));
      setToast({ message: `Đã ${action === "lock" ? "khóa" : "mở khóa"} tài khoản admin thành công`, type: "success" });
    } catch (e: any) {
      setToast({ message: e?.response?.data?.error || "Không thể cập nhật trạng thái", type: "error" });
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const thStyle = {
    backgroundColor: "#5E3C86",
    color: "white",
    fontWeight: 700,
    fontSize: "0.9rem",
    borderBottom: "none"
  };

  return (
    <div className="admin-dashboard-page">
      <style>{`
        .table-custom-header th {
          background-color: #5E3C86 !important;
          color: white !important;
        }
      `}</style>
      <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="container" style={{ marginTop: 40, maxWidth: 1100, position: 'relative' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="fw-bold mb-0">Danh sách admin</h3>
          {user?.role === "superadmin" && (
            <button
              className="btn btn-primary"
              style={{ backgroundColor: "#5E3C86", borderColor: "#5E3C86", borderRadius: 6, fontWeight: 600, padding: '6px 18px' }}
              onClick={() => setAddModalOpen(true)}
            >
              + Thêm Admin
            </button>
          )}
        </div>
        <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
          <div className="d-flex align-items-center" style={{ border: "1px solid #e0e0e0", borderRadius: 24, padding: "6px 10px", width: 320, background: "#f5f6f8" }}>
            <Search size={18} color="#777" style={{ marginRight: 6 }} />
            <input type="text" placeholder="Nhập Tên, Email"
              className="form-control" value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchAdmins(1)}
              style={{ border: "none", background: "transparent", boxShadow: "none" }} />
          </div>
          <button className="btn btn-primary" style={{ backgroundColor: "#5E3C86", borderColor: "#5E3C86" }} onClick={() => fetchAdmins(1)}>Tìm kiếm</button>
        </div>
        {loading ? <div className="text-center py-4"><ChristmasLoader /></div> : (
          <div className="card shadow-sm" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e7e7e7", borderTop: "4px solid #5E3C86" }}>
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
                            style={p === page ? { backgroundColor: "#5E3C86", borderColor: "#5E3C86" } : {}}
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
      <AddAdminModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => { 
          setAddModalOpen(false); 
          fetchAdmins(1); 
        }}
        onError={(error) => setToast({ message: error, type: "error" })}
      />
      <ConfirmModal
        isOpen={confirmOpen}
        title={confirmTarget && confirmTarget.status === 'active' ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
        message={confirmTarget && confirmTarget.status === 'active' ? 'Bạn có chắc muốn khóa tài khoản admin này?' : 'Bạn có chắc muốn mở khóa tài khoản admin này?'}
        confirmText={confirmTarget && confirmTarget.status === 'active' ? 'Khóa' : 'Mở khóa'}
        cancelText={'Hủy'}
        isDangerous={confirmTarget && confirmTarget.status === 'active'}
        onConfirm={doConfirmToggle}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
      />
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}