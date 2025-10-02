"use client";

import { useEffect, useState } from "react";
import "./dashboard.scss";

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

  if (!user) return <p className="arta-loading">Loading...</p>;

  return (
    <div className="arta-dashboard">
      <header className="arta-dashboard__header">
        <h1 className="arta-dashboard__title">Welcome to Admin Dashboard</h1>
      </header>
      <main className="arta-dashboard__content">
        <p className="arta-dashboard__user">User: {user.email}</p>
      </main>
    </div>
  );
}
