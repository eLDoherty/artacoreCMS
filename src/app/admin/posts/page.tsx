"use client";

import { useEffect, useState } from "react";
import "./posts.scss";

interface Post {
  id: number;
  title: string;
  createdDate: string;
  author: string;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch("/api/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to load posts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <p className="arta-loading">Loading...</p>;
  }

  return (
    <div className="arta-admin-posts">
      <header className="arta-admin-posts__header">
        <h1 className="arta-admin-posts__title">Post List</h1>
        <button className="arta-button arta-button--primary">+ Add Post</button>
      </header>

      <main className="arta-admin-posts__content">
        {posts.length === 0 ? (
          <p className="arta-empty">Currently there haven't any post yet</p>
        ) : (
          <table className="arta-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>{post.title}</td>
                  <td>{post.author}</td>
                  <td>{new Date(post.createdDate).toLocaleDateString()}</td>
                  <td>
                    <button className="arta-button arta-button--small">Edit</button>
                    <button className="arta-button arta-button--small arta-button--danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
