"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "./addPost.scss";

const Editor = dynamic(() => import("@/app/components/editor/Editor"), {
  ssr: false,
});

export default function AddPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categoryID, setCategoryID] = useState<number | "">("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [categories, setCategories] = useState<{ categoryID: number; name: string }[]>([]);
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

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        } else {
          setCategories([
            { categoryID: 1, name: "Technology" },
            { categoryID: 2, name: "Business" },
            { categoryID: 3, name: "Lifestyle" },
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, []);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = "";
      if (thumbnail) {
        const formData = new FormData();
        formData.append("upload", thumbnail);

        const uploadRes = await fetch("/api/upload/thumbnail", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          thumbnailUrl = uploadData.url;
        }
      }

      const token = localStorage.getItem("token");
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          content,
          description,
          categoryID,
          thumbnail: thumbnailUrl,
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
        console.error("Error save posts");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="arta-add-post">
      <form onSubmit={handleSubmit} className="arta-new-post">
        <div className="arta-add-post__wrapper">
          <div className="arta-add-post__wrapper--left">
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
          <div className="arta-add-post__wrapper--right">
            <div className="form-group">
              <label>Thumbnail</label>
              <input type="file" accept="image/*" onChange={handleThumbnailChange} />
              {thumbnail && (
                <div className="thumbnail-preview">
                  <img
                    src={URL.createObjectURL(thumbnail)}
                    alt="Thumbnail preview"
                  />
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
                {categories.map((cat) => (
                  <option key={cat.categoryID} value={cat.categoryID}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Publish"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
