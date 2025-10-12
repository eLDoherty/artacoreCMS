"use client";

import { useState } from "react";
import "./PopupUpload.scss";

interface Props {
  onClose: () => void;
  onUploaded?: () => void;
}

export default function PopupUpload({ onClose, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const allowedImage = ["jpg", "jpeg", "png", "webp", "gif"];
  const allowedVideo = ["mp4", "mov", "avi", "mkv"];
  const allowedFile = ["pdf", "xls", "xlsx", "csv", "doc", "docx", "txt", "zip"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";

    if (
      !allowedImage.includes(ext) &&
      !allowedVideo.includes(ext) &&
      !allowedFile.includes(ext)
    ) {
      alert(
        "You can only upload of these type of file: " +
          [...allowedImage, ...allowedVideo, ...allowedFile].join(", ")
      );
      e.target.value = "";
      return;
    }

    setFile(selectedFile);

    if (allowedImage.includes(ext) || allowedVideo.includes(ext)) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    let fileType = "file";
    let uploadPath = "/uploads/file";

    if (allowedImage.includes(ext)) {
      fileType = "image";
      uploadPath = "/uploads/image";
    } else if (allowedVideo.includes(ext)) {
      fileType = "video";
      uploadPath = "/uploads/video";
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);
    formData.append("uploadPath", uploadPath);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      onUploaded?.();
      onClose();
    } else {
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div className="arta-upload-popup-overlay">
      <div className="arta-upload-popup">
        <div className="arta-upload-header">
          <h3>Upload Media</h3>
          <button onClick={onClose}>✖</button>
        </div>
        <div className="arta-upload-body">
          <input
            type="file"
            onChange={handleFileChange}
            accept={[
              ...allowedImage.map((e) => `.${e}`),
              ...allowedVideo.map((e) => `.${e}`),
              ...allowedFile.map((e) => `.${e}`),
            ].join(",")}
          />

          {file && (
            <div className="arta-upload-preview">
              {previewUrl && allowedImage.includes(file.name.split(".").pop()?.toLowerCase() || "") && (
                <img src={previewUrl} alt="Preview" />
              )}
              {previewUrl && allowedVideo.includes(file.name.split(".").pop()?.toLowerCase() || "") && (
                <video src={previewUrl} controls />
              )}
              {!previewUrl && (
                <div className="arta-file-card">
                  <div className="arta-file-icon">📄</div>
                  <div className="arta-file-info">
                    <span className="arta-file-name">
                      {file.name.length > 25 ? file.name.substring(0, 25) + "..." : file.name}
                    </span>
                    <span className="arta-file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="arta-upload-footer">
          <button
            className="arta-btn-primary"
            onClick={handleUpload}
            disabled={loading || !file}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
