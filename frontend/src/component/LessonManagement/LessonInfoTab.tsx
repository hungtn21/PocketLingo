import { Pencil } from "lucide-react";

interface LessonInfo {
  id: number;
  course_id: number;
  course_title: string;
  title: string;
  description: string;
  order_index: number;
  status: string;
}

interface LessonInfoTabProps {
  lesson: LessonInfo | null;
  loading: boolean;
  onEditClick: () => void;
}

const LessonInfoTab = ({ lesson, loading, onEditClick }: LessonInfoTabProps) => {
  if (loading) {
    return <div className="lesson-management__card">Đang tải...</div>;
  }

  if (!lesson) {
    return <div className="lesson-management__card">Không có dữ liệu bài học</div>;
  }

  return (
    <div className="lesson-management__card lesson-management__card--purple">
      <div className="lesson-management__card-header">
        <h3 className="lesson-management__section-title">Thông tin bài học</h3>
        <button
          className="lesson-management__edit-button"
          type="button"
          onClick={onEditClick}
        >
          <span className="lesson-management__edit-icon">
            <Pencil size={18} />
          </span>
          Chỉnh sửa
        </button>
      </div>

      <div className="lesson-info-content">
        <div className="lesson-info-item">
          <span className="lesson-info-label">Tên bài học:</span>
          <span className="lesson-info-value">{lesson.title}</span>
        </div>

        <div className="lesson-info-item">
          <span className="lesson-info-label">Khóa học:</span>
          <span className="lesson-info-value">{lesson.course_title}</span>
        </div>

        <div className="lesson-info-item">
          <span className="lesson-info-label">Mô tả:</span>
          <span className="lesson-info-value">{lesson.description || "Không có mô tả"}</span>
        </div>

        <div className="lesson-info-item">
          <span className="lesson-info-label">Thứ tự:</span>
          <span className="lesson-info-value">{lesson.order_index}</span>
        </div>

        <div className="lesson-info-item">
          <span className="lesson-info-label">Trạng thái:</span>
          <span className="lesson-info-value">
            {lesson.status === "active" ? "Hoạt động" : "Không hoạt động"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonInfoTab;
