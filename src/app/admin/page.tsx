"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    } else {
      setUser({ email: "admin@example.com" });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Admin Dashboard</h1>
      <p>User: {user.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
