import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../../component/Sidebar/Sidebar";
import api from "../../../api";
import { Trash2, Plus, ArrowLeft, Eye, Edit } from "lucide-react";
import ConfirmModal from "../../../component/ConfirmModal/ConfirmModal";
import ToastMessage from "../../../component/ToastMessage";

const AdminCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);
  const [currentLesson, setCurrentLesson] = useState<any>({
    id: null,
    title: "",
    description: "",
    order_index: 1,
    status: "active"
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDangerous: false,
    onConfirm: () => {},
  });
  const [toast, setToast] = useState<null | { message: string; type: "success" | "error" }>(null);

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

  const exportParticipantsCSV = async () => {
    try {
      const res = await api.get(`/admins/courses/${courseId}/export/participants/csv/`, { responseType: 'blob' });
      const filename = getFilenameFromHeader(res.headers, `course_${courseId}_participants.csv`);
      downloadBlob(res.data, filename);
    } catch (e: any) {
      setToast({ message: e?.response?.data?.detail || 'Xuất CSV thất bại', type: 'error' });
    }
  };

  const exportParticipantsExcel = async () => {
    try {
      const res = await api.get(`/admins/courses/${courseId}/export/participants/excel/`, { responseType: 'blob' });
      const filename = getFilenameFromHeader(res.headers, `course_${courseId}_participants.xlsx`);
      downloadBlob(res.data, filename);
    } catch (e: any) {
      setToast({ message: e?.response?.data?.detail || 'Xuất Excel thất bại', type: 'error' });
    }
  };

  useEffect(() => {
    if (courseId) fetchCourseDetail();
  }, [courseId]);

  const handleSaveLesson = async () => {
    if (!currentLesson.title.trim()) {
      setToast({ message: "Tên bài học không được để trống.", type: "error" });
      return;
    }
    if (isEditing) {
      setConfirmModal({
        isOpen: true,
        title: 'Xác nhận cập nhật',
        message: 'Bạn chắc chắn muốn cập nhật thông tin bài học?',
        confirmText: 'Cập nhật',
        isDangerous: false,
        onConfirm: () => doEditLesson(),
      });
    } else {
      doAddLesson();
    }
  };

  const doAddLesson = async () => {
    try {
      await api.post(`/admins/courses/${courseId}/lessons/`, currentLesson);
      setShowModal(false);
      setToast({ message: "Thêm bài học thành công", type: "success" });
      fetchCourseDetail();
    } catch (e: any) {
      setToast({ message: e?.response?.data?.detail || "Có lỗi xảy ra", type: "error" });
    }
  };

  const doEditLesson = async () => {
    try {
      await api.put(`/admins/lessons/${currentLesson.id}/update/`, currentLesson);
      setShowModal(false);
      setToast({ message: "Cập nhật bài học thành công", type: "success" });
      fetchCourseDetail();
    } catch (e: any) {
      setToast({ message: e?.response?.data?.detail || "Có lỗi xảy ra", type: "error" });
    } finally {
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
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
    setIsEditing(false);
    setCurrentLesson({
      id: null,
      title: "",
      description: "",
      order_index: lessons.length + 1,
      status: "active"
    });
    setShowModal(true);
  };

  const openEditModal = (lesson: any) => {
    setIsEditing(true);
    setCurrentLesson({ ...lesson });
    setShowModal(true);
  };

  const thStyle = {
    backgroundColor: "#5E3C86",
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
          background-color: #5E3C86 !important;
          color: white !important;
        }
        .export-btn {
          border-radius: 6px;
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
        <button className="btn btn-light btn-sm me-3 mb-3" onClick={() => navigate('/admin/courses')}>
          <span style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 4 }}>←</span> Quay lại
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
                 <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                   <button className="btn btn-outline-secondary btn-sm export-btn" onClick={exportParticipantsCSV}>
                     Xuất CSV
                   </button>
                   <button className="btn btn-outline-secondary btn-sm export-btn" onClick={exportParticipantsExcel}>
                     Xuất Excel
                   </button>
                   <button 
                      className="btn btn-primary" 
                      style={{ backgroundColor: "#5E3C86", borderColor: "#5E3C86" }}
                      onClick={openAddModal}
                   >
                      <Plus size={18} className="me-2" />
                      Thêm bài học
                   </button>
                 </div>
               </div>
            </div>
          </div>
        )}

        <div className="card shadow-sm" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e7e7e7", borderTop: "4px solid #5E3C86" }}>
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
                      <tr key={l.id} style={{ cursor: 'pointer' }}
                        onClick={e => {
                          // Prevent navigation if clicking delete button
                          if ((e.target as HTMLElement).closest('.lesson-delete-btn')) return;
                          navigate(`/admin/lessons/${l.id}/manage`);
                        }}
                      >
                        <td>{idx + 1}</td>
                        <td className="fw-semibold">
                          <span
                            style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
                            onClick={() => openEditModal(l)}
                            title="Chỉnh sửa bài học"
                          >
                            {l.title}
                          </span>
                        </td>
                        <td className="text-center">{l.flashcard_count ?? 0}</td>
                        <td className="text-center">{l.quiz_question_count ?? 0}</td>
                        <td className="text-center">
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              backgroundColor: l.status === 'active' ? 'rgba(40,167,69,0.12)' : 'rgba(220,53,69,0.12)',
                              color: l.status === 'active' ? '#28a745' : '#dc3545',
                              border: `1px solid ${l.status === 'active' ? '#28a745' : '#dc3545'}`
                            }}
                          >
                            {l.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-center">{l.order_index}</td>
                        <td className="text-center" onClick={e => e.stopPropagation()}>
                          <button className="btn btn-link p-1" title="Xem chi tiết" style={{ cursor: "pointer", opacity: 0.7 }} onClick={() => navigate(`/admin/lessons/${l.id}/manage`)}>
                            <Eye size={18} color="#5b5b5b" />
                          </button>
                          <button className="btn btn-link p-1" title="Chỉnh sửa" style={{ cursor: "pointer", opacity: 0.7 }} onClick={() => openEditModal(l)}>
                            <Edit size={18} color="#5b5b5b" />
                          </button>
                          <button className="btn btn-link p-1 lesson-delete-btn" title="Xóa" onClick={() => handleDeleteLesson(l.id)}>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, minWidth: 400, maxWidth: 500, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', padding: 0, overflow: 'hidden', border: '7px solid #5E3C86' }} onClick={e => e.stopPropagation()}>
            <div style={{ color: '#5E3C86', padding: '24px 32px 0 32px', fontSize: '1.2rem', fontWeight: 'bold', background: 'none', borderBottom: 'none' }}>
              {isEditing ? 'Chỉnh sửa bài học' : 'Thêm bài học'}
            </div>
            <div style={{ padding: '24px 32px 12px 32px' }}>
              <form onSubmit={e => { e.preventDefault(); handleSaveLesson(); }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Tên bài học</label>
                  <input
                    style={{ borderRadius: 8, width: '100%', padding: 8, fontSize: '1rem', border: '1px solid #d1d1d1', marginBottom: 0 }}
                    type="text"
                    value={currentLesson.title}
                    onChange={e => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                    required
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Mô tả bài học</label>
                  <textarea
                    style={{ borderRadius: 8, width: '100%', padding: 8, fontSize: '1rem', border: '1px solid #d1d1d1', marginBottom: 0 }}
                    rows={2}
                    value={currentLesson.description}
                    onChange={e => setCurrentLesson({ ...currentLesson, description: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Trạng thái</label>
                  <select
                    style={{ borderRadius: 8, width: '100%', padding: 8, fontSize: '1rem', border: '1px solid #d1d1d1', marginBottom: 0 }}
                    value={currentLesson.status}
                    onChange={e => setCurrentLesson({ ...currentLesson, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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

export default AdminCourseDetail;
