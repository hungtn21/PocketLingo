import React, { useEffect, useState } from "react";
import AdminHeader from "../../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../../component/Sidebar/Sidebar";
import api from "../../../api";
import { Search, CheckSquare, MinusSquare } from "lucide-react";

const EnrollmentRequests = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Modal Reject
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchRequests = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/admins/enrollments/requests/", {
        params: { 
          page: targetPage, 
          page_size: 10, 
          search: search.trim() || undefined
        },
      });
      setRequests(res.data.results || []);
      setPage(res.data.current_page || targetPage);
      setTotalPages(res.data.total_pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, []);

  const handleSearch = () => {
    fetchRequests(1);
  };

  const handleApprove = (id: number) => {
    setSelectedRequest(id);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    try {
      await api.post(`/admins/enrollments/${selectedRequest}/action/`, { action: "approve" });
      setShowApproveModal(false);
      fetchRequests(page);
    } catch (e) {
      alert("Có lỗi xảy ra khi duyệt");
    }
  };

  const openRejectModal = (id: number) => {
    setSelectedRequest(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      await api.post(`/admins/enrollments/${selectedRequest}/action/`, { 
        action: "reject",
        reason: rejectReason
      });
      setShowRejectModal(false);
      fetchRequests(page);
    } catch (e) {
      alert("Có lỗi xảy ra khi từ chối");
    }
  };

  const thStyle = {
    backgroundColor: "#6f42c1", // Purple header
    color: "white",
    fontWeight: 700,
    fontSize: "0.9rem",
    borderBottom: "none"
  };

  return (
    <div className="admin-dashboard-page">
      <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="container" style={{ marginTop: 40, maxWidth: 1100 }}>
        <h3 className="fw-bold mb-4">Yêu cầu tham gia</h3>

        <div className="d-flex align-items-center mb-4" style={{ border: "1px solid #e0e0e0", borderRadius: 24, padding: "8px 16px", width: 400, background: "#e0e0e0" }}>
            <Search size={18} color="#555" style={{ marginRight: 8 }} />
            <input
              type="text"
              placeholder="Nhập Tên khoá học, Tên học viên"
              className="form-control p-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ border: "none", background: "transparent", boxShadow: "none", fontSize: "0.95rem" }}
            />
        </div>

        <div className="card shadow-sm" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e7e7e7", borderTop: "4px solid #6f42c1" }}>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 60 }}>STT</th>
                    <th style={thStyle}>Tên khoá học</th>
                    <th style={thStyle}>Tên học viên</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Ngày yêu cầu</th>
                    <th style={{ ...thStyle, width: 120, textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                  ) : requests.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4">Không có yêu cầu nào</td></tr>
                  ) : (
                    requests.map((req, idx) => (
                      <tr key={req.id}>
                        <td>{(page - 1) * 10 + idx + 1}</td>
                        <td className="fw-semibold">{req.course_title}</td>
                        <td>{req.user_name}</td>
                        <td>{req.user_email}</td>
                        <td>{new Date(req.requested_at).toLocaleDateString('vi-VN')}</td>
                        <td className="text-center">
                          <button className="btn btn-link p-1 me-2" title="Duyệt" onClick={() => handleApprove(req.id)}>
                            <CheckSquare size={20} color="#000" />
                          </button>
                          <button className="btn btn-link p-1" title="Từ chối" onClick={() => openRejectModal(req.id)}>
                            <MinusSquare size={20} color="#000" style={{ backgroundColor: "black", color: "white", borderRadius: 2 }} /> 
                            {/* Using MinusSquare filled black to match design roughly, or just use icon */}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button 
                        key={p} 
                        className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-light'}`}
                        style={p === page ? { backgroundColor: "#6f42c1", borderColor: "#6f42c1" } : {}}
                        onClick={() => fetchRequests(p)}
                    >
                        {p}
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Modal Reject */}
      {showRejectModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16, overflow: "hidden", backgroundColor: "#5a32a3" }}>
              <div className="modal-body p-4 text-center">
                <h4 className="text-white fw-bold mb-4">Lý do từ chối</h4>
                <textarea 
                    className="form-control mb-4" 
                    rows={4} 
                    style={{ borderRadius: 8 }}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                ></textarea>
                <div className="d-flex justify-content-center gap-3">
                   <button className="btn fw-bold px-4" style={{ backgroundColor: "white", color: "#5a32a3", width: 100 }} onClick={() => setShowRejectModal(false)}>Huỷ</button>
                   <button className="btn fw-bold px-4" style={{ backgroundColor: "#b19cd9", color: "white", width: 100 }} onClick={handleReject}>Lưu</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Approve */}
      {showApproveModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16, overflow: "hidden", backgroundColor: "#5a32a3" }}>
              <div className="modal-body p-4 text-center">
                <h4 className="text-white fw-bold mb-4">Bạn có chắc chắn muốn duyệt ?</h4>
                <div className="d-flex justify-content-center gap-3">
                   <button className="btn fw-bold px-4" style={{ backgroundColor: "white", color: "#5a32a3", width: 100 }} onClick={() => setShowApproveModal(false)}>Huỷ</button>
                   <button className="btn fw-bold px-4" style={{ backgroundColor: "#b19cd9", color: "white", width: 100 }} onClick={confirmApprove}>Duyệt</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentRequests;
