"use client";

import { useEffect, useState } from "react";
import PopupUpload from "@/app/components/popup/PopupUpload";
import PopupConfirmation from "@/app/components/popup/Confirmation";
import "./Media.scss";

interface Media {
  id: number;
  url: string;
  title: string;
  fileType: string;
  fileExtension: string;
  altImage?: string;
}

export default function ArtaMediaPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");

  const [showUpload, setShowUpload] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [altInput, setAltInput] = useState("");

  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/media", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setMediaList(data);
      setFilteredMedia(data);
      if (selectedMedia) {
        const updated = data.find((m: Media) => m.id === selectedMedia.id);
        if (updated) setSelectedMedia(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/media/type", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setTypes(data.map((item: { fileType: string }) => item.fileType));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMedia();
      fetchTypes();
    }
  }, [token]);

  useEffect(() => {
    if (selectedType === "all") {
      setFilteredMedia(mediaList);
    } else {
      setFilteredMedia(mediaList.filter((m) => m.fileType === selectedType));
    }
    setCurrentPage(1);
  }, [selectedType, mediaList]);

  const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMedia = filteredMedia.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      await fetch(`/api/media`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: deleteTargetId }),
      });

      await fetchMedia();
      setSelectedMedia(null);
    } catch (err) {
      console.error(err);
    } finally {
      setShowDeletePopup(false);
    }
  };

  const startEditingAlt = () => {
    if (selectedMedia) {
      setAltInput(selectedMedia.altImage || "");
      setIsEditingAlt(true);
    }
  };

  const saveAltText = async () => {
    if (!selectedMedia) return;
    try {
      await fetch(`/api/media`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: selectedMedia.id, altImage: altInput }),
      });
      await fetchMedia();
      setIsEditingAlt(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="arta-media-page">
      <div className="arta-media-header">
        <h1>Media Library</h1>
        <div className="arta-media-actions">
          <select
            className="arta-dropdown"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            className="arta-btn-primary"
            onClick={() => setShowUpload(true)}
          >
            + Upload File
          </button>
        </div>
      </div>

      <div className="arta-media-content">
        <div className="arta-media-flex">
          {currentMedia.length === 0 ? (
            <p className="arta-empty">No file found.</p>
          ) : (
            currentMedia.map((media) => (
              <div
                key={media.id}
                className={`arta-media-item ${
                  selectedMedia?.id === media.id ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedMedia(media);
                  setIsEditingAlt(false);
                }}
              >
                {media.fileExtension.match(/(jpg|jpeg|png|gif)/i) ? (
                  <img src={media.url} alt={media.title} />
                ) : (
                  <div className="arta-file-icon">
                    <span>{media.fileExtension.toUpperCase()}</span>
                  </div>
                )}
                <div className="arta-media-title">
                  {media.title || media.url.split("/").pop()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="arta-media-detail">
          {selectedMedia ? (
            <>
              <div className="arta-preview">
                {selectedMedia.fileExtension.match(/(jpg|jpeg|png|gif)/i) ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.altImage || ""}
                  />
                ) : (
                  <div className="arta-file-icon-preview">
                    {selectedMedia.fileExtension.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="arta-detail-info">
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedMedia.title || selectedMedia.url.split("/").pop()}
                </p>
                <p>
                  <strong>Type:</strong> {selectedMedia.fileType}
                </p>
                <p>
                  <strong>Extension:</strong> {selectedMedia.fileExtension}
                </p>

                <div className="arta-alt-edit">
                  <strong>Alt Text:</strong>
                  {isEditingAlt ? (
                    <div className="arta-alt-input-row">
                      <input
                        type="text"
                        className="arta-input"
                        value={altInput}
                        onChange={(e) => setAltInput(e.target.value)}
                        placeholder="Enter alt text..."
                      />
                      <div className="arta-alt-edit__buttons">
                        <button
                          className="arta-btn-primary"
                          onClick={saveAltText}
                        >
                          Save
                        </button>
                        <button
                          className="arta-btn-danger"
                          onClick={() => setIsEditingAlt(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="arta-alt-text">
                      {selectedMedia.altImage || "-"}
                      <button
                        className="arta-btn-text"
                        onClick={startEditingAlt}
                      >
                        ✏️ Edit
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <div className="arta-detail-actions">
                <button
                  className="arta-btn-danger"
                  onClick={() => handleDeleteClick(selectedMedia.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </>
          ) : (
            <div className="arta-empty-detail">
              <p>Select a file to preview</p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="arta-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showUpload && (
        <PopupUpload onClose={() => setShowUpload(false)} onUploaded={fetchMedia} />
      )}

      <PopupConfirmation
        isOpen={showDeletePopup}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        onClose={() => setShowDeletePopup(false)}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
