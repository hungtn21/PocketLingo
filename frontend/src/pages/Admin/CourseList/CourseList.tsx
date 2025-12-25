import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../../component/Sidebar/Sidebar";
import api from "../../../api";
import { Search, Eye, Edit, Trash2, Plus, Upload } from "lucide-react";
import ConfirmModal from "../../../component/ConfirmModal/ConfirmModal";
import ToastMessage from "../../../component/ToastMessage";
import ChristmasLoader from "../../../component/ChristmasTheme/ChristmasLoader";

const CourseList = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [language, setLanguage] = useState("");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDangerous: false,
    onConfirm: () => {},
  });
  const [toast, setToast] = useState<null | { message: string; type: "success" | "error" }>(null);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<any>({
    title: "",
    description: "",
    level: "Sơ cấp",
    language: "English",
    image_url: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/admins/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCurrentCourse({ ...currentCourse, image_url: res.data.url });
    } catch (e) {
      alert("Upload ảnh thất bại");
    }
  };

  const fetchCourses = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/admins/courses/", {
        params: { 
          page: targetPage, 
          page_size: 10, 
          search: search.trim() || undefined,
          level: level || undefined,
          language: language || undefined
        },
      });
      setCourses(res.data.results || []);
      setPage(res.data.page || targetPage);
      setTotalPages(res.data.total_pages || 1);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Không tải được danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const getExportParams = () => {
    return {
      search: search.trim() || undefined,
      level: level || undefined,
      language: language || undefined,
    };
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  };

  const getFilenameFromHeader = (header: any, fallback: string) => {
    try {
      const cd = header['content-disposition'] || header['Content-Disposition'];
      if (!cd) return fallback;
      const match = /filename\*=UTF-8''(.+)$/.exec(cd) || /filename="?([^";]+)"?/.exec(cd);
      if (match) return decodeURIComponent(match[1]);
    } catch (e) {}
    return fallback;
  };

  const exportCSV = async () => {
    try {
      const res = await api.get('/admins/stats/courses/export/', { params: getExportParams(), responseType: 'blob' });
      const filename = getFilenameFromHeader(res.headers, 'courses_stats.csv');
      downloadBlob(res.data, filename);
    } catch (e: any) {
      setToast({ message: e?.response?.data?.detail || 'Xuất CSV thất bại', type: 'error' });
    }
  };

  const exportExcel = async () => {
    try {
      const res = await api.get('/admins/stats/courses/export-excel/', { params: getExportParams(), responseType: 'blob' });
      const filename = getFilenameFromHeader(res.headers, 'courses_stats.xlsx');
      downloadBlob(res.data, filename);
    } catch (e: any) {
      setToast({ message: e?.response?.data?.detail || 'Xuất Excel thất bại', type: 'error' });
    }
  };

  useEffect(() => {
    fetchCourses(1);
  }, [level, language]); // Refetch when filters change

  const handleSearch = () => {
    fetchCourses(1);
  };

  const handleDelete = (id: number) => {
    setCourseToDelete(id);
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      isDangerous: true,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setTimeout(() => confirmDelete(id), 0);
      },
    });
  };

  const confirmDelete = async (id?: number) => {
    const deleteId = typeof id === 'number' ? id : courseToDelete;
    if (!deleteId) return;
    try {
      await api.delete(`/admins/courses/${deleteId}/`);
      fetchCourses(page);
      setToast({ message: "Xóa khóa học thành công", type: "success" });
    } catch (e: any) {
      setToast({ message: e?.response?.data?.detail || "Không thể xóa khóa học", type: "error" });
    } finally {
      setCourseToDelete(null);
    }
  };

  const handleSave = async () => {
    if (isEditing && currentCourse.id) {
      setConfirmModal({
        isOpen: true,
        title: 'Xác nhận chỉnh sửa',
        message: 'Bạn có chắc chắn muốn cập nhật thông tin khóa học này?',
        confirmText: 'Cập nhật',
        isDangerous: false,
        onConfirm: () => doEditCourse(),
      });
    } else {
      doAddCourse();
    }
  };

  const doEditCourse = async () => {
    try {
      await api.put(`/admins/courses/${currentCourse.id}/`, currentCourse);
      setToast({ message: "Cập nhật khóa học thành công", type: "success" });
      setShowModal(false);
      fetchCourses(page);
    } catch (e: any) {
      setToast({ message: e?.response?.data?.detail || "Có lỗi xảy ra", type: "error" });
    } finally {
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const doAddCourse = async () => {
    try {
      await api.post("/admins/courses/", currentCourse);
      setToast({ message: "Thêm khóa học thành công", type: "success" });
      setShowModal(false);
      fetchCourses(page);
    } catch (e: any) {
      setToast({ message: e?.response?.data?.detail || "Có lỗi xảy ra", type: "error" });
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentCourse({
      title: "",
      description: "",
      level: "Sơ cấp",
      language: "English",
      image_url: ""
    });
    setShowModal(true);
  };

  const openEditModal = (course: any) => {
    setIsEditing(true);
    setCurrentCourse({ ...course });
    setShowModal(true);
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
        .export-btn {
          border-radius: 999px;
          border-color: #5E3C86 !important;
          color: #5E3C86 !important;
          background: transparent !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 8px 16px !important;
          height: 40px !important;
          font-size: 1rem !important;
          line-height: 1 !important;
        }
        .export-btn:hover {
          background-color: #efe5fb !important;
          border-color: #d5bdf6 !important;
          color: #5E3C86 !important;
        }
      `}</style>
      <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="container" style={{ marginTop: 40, maxWidth: 1100 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold">Danh sách khóa học</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-outline-secondary export-btn"
              onClick={() => exportCSV()}
            >
              Xuất CSV
            </button>
            <button
              className="btn btn-outline-secondary export-btn"
              onClick={() => exportExcel()}
            >
              Xuất Excel
            </button>
            <button 
              className="btn btn-primary" 
              style={{ backgroundColor: "#5E3C86", borderColor: "#5E3C86" }}
              onClick={openAddModal}
            >
              <Plus size={18} className="me-2" />
              Thêm khóa học
            </button>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: 10 }}>
          <div className="d-flex align-items-center" style={{ border: "1px solid #e0e0e0", borderRadius: 24, padding: "6px 10px", width: 300, background: "#f5f6f8", height: 40 }}>
            <Search size={18} color="#777" style={{ marginRight: 6 }} />
            <input
              type="text"
              placeholder="Nhập Tên, Mức độ, Ngôn ngữ"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ border: "none", background: "transparent", boxShadow: "none", height: 28 }}
            />
          </div>
          <select 
            className="form-select" 
            style={{ width: 150, borderRadius: 24, background: "#f5f6f8", border: "1px solid #e0e0e0", height: 40, padding: "6px 10px" }}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">Tất cả mức độ</option>
            <option value="Sơ cấp">Sơ cấp</option>
            <option value="Trung cấp">Trung cấp</option>
            <option value="Cao cấp">Cao cấp</option>
          </select>
          <select 
            className="form-select" 
            style={{ width: 200, borderRadius: 24, background: "#f5f6f8", border: "1px solid #e0e0e0", height: 40, padding: "6px 10px" }}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">Tất cả ngôn ngữ</option>
            <option value="English">English</option>
            <option value="Japanese">Japanese</option>
            <option value="Vietnamese">Vietnamese</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-4"><ChristmasLoader /></div>
        ) : (
          <div className="card shadow-sm" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e7e7e7", borderTop: "4px solid #5E3C86" }}>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead className="table-custom-header">
                  <tr>
                    <th style={{ ...thStyle, width: 60 }}>STT</th>
                    <th style={thStyle}>Tên khóa học</th>
                    <th style={thStyle}>Mức độ</th>
                    <th style={thStyle}>Ngôn ngữ</th>
                    <th style={thStyle} className="text-center">Số bài học</th>
                    <th style={{ ...thStyle, width: 120, textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4">Không có khóa học nào</td></tr>
                  ) : (
                    courses.map((c, idx) => (
                      <tr key={c.id}>
                        <td>{(page - 1) * 10 + idx + 1}</td>
                        <td className="fw-semibold">
                          <span
                            style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
                            onClick={() => navigate(`/admin/courses/${c.id}`)}
                            title="Xem chi tiết khóa học"
                          >
                            {c.title}
                          </span>
                        </td>
                        <td>{c.level}</td>
                        <td>{c.language}</td>
                        <td className="text-center">{c.lesson_count}</td>
                        <td className="text-center">
                          <button className="btn btn-link p-1" title="Xem chi tiết" onClick={() => navigate(`/admin/courses/${c.id}`)}>
                            <Eye size={18} color="#5b5b5b" />
                          </button>
                          <button className="btn btn-link p-1" title="Chỉnh sửa" onClick={() => openEditModal(c)}>
                            <Edit size={18} color="#5b5b5b" />
                          </button>
                          <button className="btn btn-link p-1" title="Xóa" onClick={() => handleDelete(c.id)}>
                            <Trash2 size={18} color="#dc3545" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button 
                        key={p} 
                        className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-light'}`}
                        style={p === page ? { backgroundColor: "#5E3C86", borderColor: "#5E3C86" } : {}}
                        onClick={() => fetchCourses(p)}
                    >
                        {p}
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, minWidth: 600, maxWidth: 700, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', padding: 0, overflow: 'hidden', border: '7px solid #5E3C86' }} onClick={e => e.stopPropagation()}>
            <div style={{ color: '#5E3C86', padding: '24px 32px 0 32px', fontSize: '1.2rem', fontWeight: 'bold', background: 'none', borderBottom: 'none' }}>
              {isEditing ? "Chỉnh sửa khóa học" : "Thêm khóa học"}
            </div>
            <div style={{ padding: '24px 32px 12px 32px' }}>
              <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Tên khóa học</label>
                  <input
                    style={{ borderRadius: 8, width: '100%', padding: 8, fontSize: '1rem', border: '1px solid #d1d1d1', marginBottom: 0 }}
                    type="text"
                    value={currentCourse.title}
                    onChange={e => setCurrentCourse({ ...currentCourse, title: e.target.value })}
                    required
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Mô tả</label>
                  <textarea
                    style={{ borderRadius: 8, width: '100%', padding: 8, fontSize: '1rem', border: '1px solid #d1d1d1', marginBottom: 0 }}
                    rows={2}
                    value={currentCourse.description}
                    onChange={e => setCurrentCourse({ ...currentCourse, description: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Mức độ</label>
                  <select
                    style={{ borderRadius: 8, width: '100%', padding: 8, fontSize: '1rem', border: '1px solid #d1d1d1', marginBottom: 0 }}
                    value={currentCourse.level}
                    onChange={e => setCurrentCourse({ ...currentCourse, level: e.target.value })}
                    required
                  >
                    <option value="Sơ cấp">Sơ cấp</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Cao cấp">Cao cấp</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16, display: 'flex', gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Ảnh bìa</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {currentCourse.image_url && (
                        <img src={currentCourse.image_url} alt="Ảnh bìa" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, marginBottom: 4, border: '1px solid #eee' }} />
                      )}
                      <button type="button" style={{ borderRadius: 8, padding: '8px 12px', fontWeight: 600, fontSize: '1rem', background: '#eee', border: 'none', cursor: 'pointer', width: 'fit-content' }} onClick={handleUploadClick}><Upload size={16}/> Upload ảnh</button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Ngôn ngữ</label>
                    <select
                      style={{ borderRadius: 8, width: '100%', padding: 8, fontSize: '1rem', border: '1px solid #d1d1d1', marginBottom: 0 }}
                      value={currentCourse.language}
                      onChange={e => setCurrentCourse({ ...currentCourse, language: e.target.value })}
                      required
                    >
                      <option value="English">English</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Vietnamese">Vietnamese</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 0 0 0', background: '#fff' }}>
                  <button
                    type="button"
                    style={{ border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', background: '#fff', color: '#5E3C86', borderColor: '#5E3C86', borderWidth: 1.5, borderStyle: 'solid' }}
                    onClick={() => setShowModal(false)}
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    style={{ border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', background: '#5E3C86', color: '#fff' }}
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ConfirmModal for delete and future actions */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDangerous={confirmModal.isDangerous}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* ToastMessage for notifications */}
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CourseList;
