import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../../component/Sidebar/Sidebar";
import api from "../../../api";
import { Trash2, Plus, ArrowLeft, Eye, Edit } from "lucide-react";

const AdminCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);
  const [currentLesson, setCurrentLesson] = useState<any>({
    title: "",
    description: "",
    order_index: 1,
    status: "active"
  });

  const fetchCourseDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admins/courses/${courseId}/`);
      setCourse(res.data.course);
      setLessons(res.data.lessons);
    } catch (e) {
      alert("Không tải được thông tin khóa học");
      navigate("/admin/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchCourseDetail();
  }, [courseId]);

  const handleSaveLesson = async () => {
    try {
      await api.post(`/admins/courses/${courseId}/lessons/`, currentLesson);
      setShowModal(false);
      fetchCourseDetail();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Có lỗi xảy ra");
    }
  };

  const handleDeleteLesson = (id: number) => {
    setLessonToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!lessonToDelete) return;
    try {
      await api.delete(`/admins/lessons/${lessonToDelete}/`);
      fetchCourseDetail();
      setShowDeleteModal(false);
      setLessonToDelete(null);
    } catch (e) {
      alert("Không thể xóa bài học");
    }
  };

  const openAddModal = () => {
    setCurrentLesson({
      title: "",
      description: "",
      order_index: lessons.length + 1,
      status: "active"
    });
    setShowModal(true);
  };

  const thStyle = {
    backgroundColor: "#6f42c1",
    color: "white",
    fontWeight: 700,
    fontSize: "0.9rem",
    borderBottom: "none"
  };

  if (loading) return <div className="text-center py-5">Đang tải...</div>;

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
        <button className="btn btn-link text-decoration-none mb-3 ps-0" onClick={() => navigate("/admin/courses")}>
           <ArrowLeft size={18} className="me-1"/> Quay lại danh sách
        </button>

        {course && (
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body d-flex align-items-center gap-4">
               <div style={{ width: 120, height: 80, backgroundColor: "#e0e0e0", borderRadius: 8, overflow: "hidden" }}>
                  {course.image_url ? <img src={course.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
               </div>
               <div>
                 <h4 className="fw-bold mb-1">Khóa học {course.title}</h4>
                 <div className="text-muted small">
                    <span className="me-3">Mức độ: <span className="fw-semibold text-dark">{course.level}</span></span>
                    <span className="me-3">Ngôn ngữ: <span className="fw-semibold text-dark">{course.language}</span></span>
                    <span>Số bài học: <span className="fw-semibold text-dark">{lessons.length}</span></span>
                 </div>
               </div>
               <div className="ms-auto">
                 <button 
                    className="btn btn-primary" 
                    style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1" }}
                    onClick={openAddModal}
                 >
                    <Plus size={18} className="me-2" />
                    Thêm bài học
                 </button>
               </div>
            </div>
          </div>
        )}

        <div className="card shadow-sm" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e7e7e7", borderTop: "4px solid #6f42c1" }}>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead className="table-custom-header">
                  <tr>
                    <th style={{ ...thStyle, width: 60 }}>STT</th>
                    <th style={thStyle}>Tên bài học</th>
                    <th style={thStyle} className="text-center">Số lượng flashcard</th>
                    <th style={thStyle} className="text-center">Số lượng quizz</th>
                    <th style={thStyle} className="text-center">Trạng thái</th>
                    <th style={thStyle} className="text-center">Thứ tự</th>
                    <th style={{ ...thStyle, width: 120, textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-4">Chưa có bài học nào</td></tr>
                  ) : (
                    lessons.map((l, idx) => (
                      <tr key={l.id}>
                        <td>{idx + 1}</td>
                        <td className="fw-semibold">{l.title}</td>
                        <td className="text-center">0</td> {/* Placeholder for flashcard count */}
                        <td className="text-center">0</td> {/* Placeholder for quiz count */}
                        <td className="text-center">
                           <span className={`badge ${l.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                             {l.status === 'active' ? 'Active' : 'Inactive'}
                           </span>
                        </td>
                        <td className="text-center">{l.order_index}</td>
                        <td className="text-center">
                          <button className="btn btn-link p-1" title="Xem chi tiết" style={{ cursor: "default", opacity: 0.5 }}>
                            <Eye size={18} color="#5b5b5b" />
                          </button>
                          <button className="btn btn-link p-1" title="Chỉnh sửa" style={{ cursor: "default", opacity: 0.5 }}>
                            <Edit size={18} color="#5b5b5b" />
                          </button>
                          <button className="btn btn-link p-1" title="Xóa" onClick={() => handleDeleteLesson(l.id)}>
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
      </div>

      {/* Modal Add/Edit Lesson */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16, overflow: "hidden" }}>
              <div className="modal-header text-white" style={{ backgroundColor: "#5a32a3" }}>
                <h5 className="modal-title fw-bold">Thêm bài học</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4" style={{ backgroundColor: "#5a32a3" }}>
                <div className="mb-3">
                  <label className="form-label text-white">Tên bài học</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentLesson.title}
                    onChange={(e) => setCurrentLesson({...currentLesson, title: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white">Mô tả bài học</label>
                  <textarea 
                    className="form-control" 
                    rows={2}
                    value={currentLesson.description}
                    onChange={(e) => setCurrentLesson({...currentLesson, description: e.target.value})}
                  />
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                   <button className="btn btn-light fw-bold" style={{ width: 100 }} onClick={handleSaveLesson}>Lưu</button>
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

export default AdminCourseDetail;
