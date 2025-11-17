import React, { useEffect } from "react";

type ToastMessageProps = {
  message: string;
  type: "success" | "error";
  duration?: number; // tự ẩn sau n giây
  onClose: () => void;
};

const ToastMessage: React.FC<ToastMessageProps> = ({
  message,
  type,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: "4.5rem",
        right: "0.5rem",
        background: type === "success" ? "#4caf50" : "#f44336",
        color: "#fff",
        padding: "1rem 1.5rem",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 9999,
        minWidth: "250px",
      }}
    >
      {message}
    </div>
  );
};

export default ToastMessage;
