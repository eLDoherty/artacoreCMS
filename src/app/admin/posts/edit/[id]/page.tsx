"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import "./editPost.scss";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/app/components/editor/Editor"), {
  ssr: false,
});

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categoryID, setCategoryID] = useState<number | "">("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [statusName, setStatusName] = useState<string>("");
  const [categories, setCategories] = useState<
    { categoryID: number; name: string }[]
  >([]);
  const [statuses, setStatuses] = useState<
    { status : string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/posts/categories", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        } else {
          console.error("Failed to fetch categories", await res.text());
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/posts/status", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setStatuses(data);
        } else {
          console.error("Failed to fetch status", await res.text());
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchStatuses();
  }, []);

  useEffect(() => {
    async function fetchPost() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/posts/${id}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setTitle(data.title);
          setDescription(data.description || "");
          setContent(data.content || "");
          setCategoryID(data.categoryID || "");
          setThumbnailPreview(data.thumbnail || "");
          setStatusName(data.status || "");
        } else {
          console.error("Failed to load post");
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (id) fetchPost();
  }, [id]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    window.location.href = "/admin/posts";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = thumbnailPreview;

      if (thumbnail) {
        const formData = new FormData();
        formData.append("upload", thumbnail);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          thumbnailUrl = uploadData.url;
        }
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          description,
          content,
          categoryID,
          thumbnail: thumbnailUrl,
          status: statusName,
        }),
      });

      if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

      if (res.ok) {
        router.push("/admin/posts");
      } else {
        console.error("Error updating post");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="arta-edit-post">
      <form onSubmit={handleSubmit} className="arta-edit-post__form">
        <div className="arta-edit-post__wrapper">
          <div className="arta-edit-post__wrapper--left">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Judul Artikel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <Editor value={content} onChange={setContent} />
            </div>
          </div>

          <div className="arta-edit-post__wrapper--right">
            <div className="form-group">
              <label>Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview && (
                <div className="thumbnail-preview">
                  <img src={thumbnailPreview} alt="Thumbnail preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Meta Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={categoryID}
                onChange={(e) => setCategoryID(Number(e.target.value))}
                required
              >
                <option value="">Choose Category</option>
                {categories.map((cat, index) => (
                  <option key={cat.categoryID ?? index} value={cat.categoryID}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={statusName}
                onChange={(e) => setStatusName(String(e.target.value))}
                required
              >
                <option value="">Change status</option>
                {statuses.map((item, index) => (
                  <option key={item.status ?? index} value={item.status}>
                    {item.status}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="arta-btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Post"}
            </button>
            <button
              onClick={handleCancel}
              type="button"
              className="arta-btn-danger"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
