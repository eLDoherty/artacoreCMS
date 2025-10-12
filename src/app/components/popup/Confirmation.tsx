"use client";

import React from "react";
import "./Confirmation.scss";

interface PopupProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function PopupConfirmation({
  isOpen,
  title = "Confirmation",
  message,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
}: PopupProps) {
  if (!isOpen) return null;

  return (
    <div className="arta-popup-overlay">
      <div className="arta-popup">
        <h3 className="arta-popup-title">{title}</h3>
        <p className="arta-popup-message">{message}</p>
        <div className="arta-popup-actions">
          {onConfirm && (
            <button className="arta-btn-primary" onClick={onConfirm}>
              {confirmText}
            </button>
          )}
          <button className="arta-btn-danger" onClick={onClose}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
