import React from "react";
import { createPortal } from "react-dom";
import "./EnrollmentModal.css";

const EnrollmentConfirmModal = ({ courseName, onConfirm, onCancel }) => {
  return createPortal(
    <div className="enrollment-modal-backdrop" onClick={onCancel}>
      <div
        className="enrollment-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="enrollment-modal-title fw-bold">
          Bạn có chắc chắn muốn đăng ký khóa học {courseName} không?
        </h2>
        <div className="d-flex gap-3 justify-content-center mt-4">
          <button
            className="btn btn-secondary enrollment-btn-cancel px-4 py-2"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            className="btn btn-primary enrollment-btn-confirm px-4 py-2"
            onClick={onConfirm}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EnrollmentConfirmModal;
