import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../../component/Sidebar/Sidebar";
import api from "../../../api";
import { Search, Eye, Edit, Trash2, Plus, Upload } from "lucide-react";

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

  useEffect(() => {
    fetchCourses(1);
  }, [level, language]); // Refetch when filters change

  const handleSearch = () => {
    fetchCourses(1);
  };

  const handleDelete = (id: number) => {
    setCourseToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/admins/courses/${courseToDelete}/`);
      fetchCourses(page);
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (e: any) {
      alert("Không thể xóa khóa học");
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing && currentCourse.id) {
        await api.put(`/admins/courses/${currentCourse.id}/`, currentCourse);
      } else {
        await api.post("/admins/courses/", currentCourse);
      }
      setShowModal(false);
      fetchCourses(page);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Có lỗi xảy ra");
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
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold">Danh sách khóa học</h3>
          <button 
            className="btn btn-primary" 
            style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1" }}
            onClick={openAddModal}
          >
            <Plus size={18} className="me-2" />
            Thêm khóa học
          </button>
        </div>

        <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: 10 }}>
          <div className="d-flex align-items-center" style={{ border: "1px solid #e0e0e0", borderRadius: 24, padding: "6px 10px", width: 300, background: "#f5f6f8" }}>
            <Search size={18} color="#777" style={{ marginRight: 6 }} />
            <input
              type="text"
              placeholder="Nhập Tên, Mức độ, Ngôn ngữ"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ border: "none", background: "transparent", boxShadow: "none" }}
            />
          </div>
          
          <select 
            className="form-select" 
            style={{ width: 150, borderRadius: 24, background: "#f5f6f8", border: "1px solid #e0e0e0" }}
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
            style={{ width: 200, borderRadius: 24, background: "#f5f6f8", border: "1px solid #e0e0e0" }}
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
          <div className="text-center py-4">Đang tải...</div>
        ) : (
          <div className="card shadow-sm" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e7e7e7", borderTop: "4px solid #6f42c1" }}>
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
                        <td className="fw-semibold">{c.title}</td>
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
                        style={p === page ? { backgroundColor: "#6f42c1", borderColor: "#6f42c1" } : {}}
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
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16, overflow: "hidden" }}>
              <div className="modal-header text-white" style={{ backgroundColor: "#5a32a3" }}>
                <h5 className="modal-title fw-bold">{isEditing ? "Chỉnh sửa khóa học" : "Thêm khóa học"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4" style={{ backgroundColor: "#5a32a3" }}>
                <div className="mb-3">
                  <label className="form-label text-white">Tên khóa học</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentCourse.title}
                    onChange={(e) => setCurrentCourse({...currentCourse, title: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white">Mô tả</label>
                  <textarea 
                    className="form-control" 
                    rows={2}
                    value={currentCourse.description}
                    onChange={(e) => setCurrentCourse({...currentCourse, description: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white">Mức độ</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentCourse.level}
                    onChange={(e) => setCurrentCourse({...currentCourse, level: e.target.value})}
                  />
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label text-white">Ảnh bìa</label>
                    <div className="input-group">
                       <input 
                          type="text" 
                          className="form-control" 
                          placeholder="URL ảnh"
                          value={currentCourse.image_url || ""}
                          onChange={(e) => setCurrentCourse({...currentCourse, image_url: e.target.value})}
                       />
                       <button className="btn btn-light" onClick={handleUploadClick}><Upload size={16}/></button>
                       <input 
                          type="file" 
                          ref={fileInputRef} 
                          style={{ display: "none" }} 
                          accept="image/*"
                          onChange={handleFileChange}
                       />
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label text-white">Ngôn ngữ</label>
                    <select 
                      className="form-select"
                      value={currentCourse.language}
                      onChange={(e) => setCurrentCourse({...currentCourse, language: e.target.value})}
                    >
                      <option value="English">English</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Vietnamese">Vietnamese</option>
                    </select>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                   <button className="btn btn-light fw-bold" style={{ width: 100 }} onClick={handleSave}>Lưu</button>
                   <button className="btn btn-secondary fw-bold" style={{ width: 100, backgroundColor: "rgba(255,255,255,0.3)", border: "none" }} onClick={() => setShowModal(false)}>Huỷ</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {showDeleteModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16, overflow: "hidden", backgroundColor: "#5a32a3" }}>
              <div className="modal-body p-4 text-center">
                <h4 className="text-white fw-bold mb-4">Bạn có chắc chắn muốn xóa ?</h4>
                <div className="d-flex justify-content-center gap-3">
                   <button className="btn fw-bold px-4" style={{ backgroundColor: "white", color: "#5a32a3", width: 100 }} onClick={() => setShowDeleteModal(false)}>Hủy</button>
                   <button className="btn fw-bold px-4" style={{ backgroundColor: "#b19cd9", color: "white", width: 100 }} onClick={confirmDelete}>Xóa</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
