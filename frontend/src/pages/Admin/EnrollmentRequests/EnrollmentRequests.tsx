import { useEffect, useState, useRef } from "react";
import ToastMessage from "../../../component/ToastMessage";
import styles from "./EnrollmentRequests.module.css";
import AdminHeader from "../../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../../component/Sidebar/Sidebar";
import api from "../../../api";
import { useLocation } from "react-router-dom";
import "./highlight-row.css";
import { Search, Check, X } from "lucide-react";

const EnrollmentRequests = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const location = useLocation();
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const rowRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});

  const fetchRequests = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/admins/enrollments/requests/", {
        params: {
          page: targetPage,
          page_size: 10,
          search: search.trim() || undefined,
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

  // Load data + lấy highlight id
  useEffect(() => {
    fetchRequests(1);
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    setHighlightId(id ? Number(id) : null);
  }, [location.search]);

  // Scroll tới dòng highlight
  useEffect(() => {
    if (highlightId !== null && rowRefs.current[highlightId]) {
      rowRefs.current[highlightId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [requests, highlightId]);

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
      await api.post(`/admins/enrollments/${selectedRequest}/action/`, {
        action: "approve",
      });
      setShowApproveModal(false);
      setToast({ message: "Duyệt yêu cầu thành công!", type: "success" });
      fetchRequests(page);
    } catch {
      setToast({ message: "Có lỗi xảy ra khi duyệt", type: "error" });
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
        reason: rejectReason,
      });
      setShowRejectModal(false);
      setToast({ message: "Từ chối yêu cầu thành công!", type: "success" });
      fetchRequests(page);
    } catch {
      setToast({ message: "Có lỗi xảy ra khi từ chối", type: "error" });
    }
  };

  const thStyle = {
    backgroundColor: "#5E3C86",
    color: "white",
    fontWeight: 700,
    fontSize: "0.9rem",
    borderBottom: "none",
  };

  return (
    <div className="admin-dashboard-page">
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="container" style={{ marginTop: 40, maxWidth: 1100 }}>
        <h3 className="fw-bold mb-4">Yêu cầu tham gia</h3>

        {/* Search */}
        <div
          className="d-flex align-items-center mb-4"
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: 24,
            padding: "6px 10px",
            width: 300,
            background: "#f5f6f8",
          }}
        >
          <Search size={18} color="#777" style={{ marginRight: 6 }} />
          <input
            type="text"
            placeholder="Nhập Tên khoá học, Tên học viên"
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{
              border: "none",
              background: "transparent",
              boxShadow: "none",
            }}
          />
        </div>

        {/* Table */}
        <div
          className="card shadow-sm"
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #e7e7e7",
            borderTop: "4px solid #5E3C86",
          }}
        >
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 60 }}>STT</th>
                  <th style={thStyle}>Tên khoá học</th>
                  <th style={thStyle}>Tên học viên</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Ngày yêu cầu</th>
                  <th
                    style={{
                      ...thStyle,
                      width: 120,
                      textAlign: "center",
                    }}
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Đang tải...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Không có yêu cầu nào
                    </td>
                  </tr>
                ) : (
                  requests.map((req, idx) => (
                    <tr
                      key={req.id} 
                      ref={(el) => {
                        rowRefs.current[req.id] = el;
                      }}
                      className={
                        highlightId === req.id ? "highlight-row" : undefined
                      }
                    >
                      <td>{(page - 1) * 10 + idx + 1}</td>
                      <td className="fw-semibold">{req.course_title}</td>
                      <td>{req.user_name}</td>
                      <td>{req.user_email}</td>
                      <td>
                        {new Date(req.requested_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-link p-1 me-2"
                          onClick={() => handleApprove(req.id)}
                        >
                          <Check size={22} color="#5E3C86" strokeWidth={3} />
                        </button>
                        <button
                          className="btn btn-link p-1"
                          onClick={() => openRejectModal(req.id)}
                        >
                          <X size={22} color="#f44336" strokeWidth={3} />
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
                className={`btn btn-sm ${
                  p === page ? "btn-primary" : "btn-light"
                }`}
                style={
                  p === page
                    ? { backgroundColor: "#5E3C86", borderColor: "#5E3C86" }
                    : {}
                }
                onClick={() => fetchRequests(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className={styles["enrollment-modal-backdrop"]}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className={styles["enrollment-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["enrollment-modal__header"]}>
              Lý do từ chối
            </div>
            <div className={styles["enrollment-modal__body"]}>
              <textarea
                className={styles["enrollment-modal__textarea"]}
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
              />
            </div>
            <div className={styles["enrollment-modal__footer"]}>
              <button
                className={`${styles["enrollment-modal__button"]} ${styles["enrollment-modal__button--secondary"]}`}
                onClick={() => setShowRejectModal(false)}
              >
                Huỷ
              </button>
              <button
                className={`${styles["enrollment-modal__button"]} ${styles["enrollment-modal__button--primary"]}`}
                onClick={handleReject}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div
          className={styles["enrollment-modal-backdrop"]}
          onClick={() => setShowApproveModal(false)}
        >
          <div
            className={styles["enrollment-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["enrollment-modal__header"]}>
              Xác nhận duyệt yêu cầu
            </div>
            <div
              className={styles["enrollment-modal__body"]}
              style={{ textAlign: "center" }}
            >
              Bạn có chắc chắn muốn duyệt yêu cầu?
            </div>
            <div className={styles["enrollment-modal__footer"]}>
              <button
                className={`${styles["enrollment-modal__button"]} ${styles["enrollment-modal__button--secondary"]}`}
                onClick={() => setShowApproveModal(false)}
              >
                Huỷ
              </button>
              <button
                className={`${styles["enrollment-modal__button"]} ${styles["enrollment-modal__button--primary"]}`}
                onClick={confirmApprove}
              >
                Duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentRequests;
