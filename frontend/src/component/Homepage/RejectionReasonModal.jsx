import React from "react";
import { createPortal } from "react-dom";
import "./EnrollmentModal.css";

const RejectionReasonModal = ({
  courseName,
  reason,
  onReregister,
  onClose,
}) => {
  return createPortal(
    <div className="enrollment-modal-backdrop" onClick={onClose}>
      <div
        className="enrollment-modal-dialog enrollment-rejection-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="enrollment-modal-title fw-bold">
          Yêu cầu đăng ký bị từ chối
        </h2>
        <p className="text-center text-muted mb-3">Khóa học: {courseName}</p>
        <div
          className="alert alert-danger border-start border-danger border-4"
          role="alert"
        >
          <h6 className="alert-heading fw-bold text-danger mb-2">
            Lý do từ chối:
          </h6>
          <p className="mb-0">{reason || "Không có lý do cụ thể"}</p>
        </div>
        <div className="d-flex gap-3 justify-content-center mt-4">
          <button
            className="btn btn-secondary enrollment-btn-cancel px-4 py-2"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            className="btn btn-primary enrollment-btn-confirm px-4 py-2"
            onClick={onReregister}
          >
            Đăng ký lại
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RejectionReasonModal;
