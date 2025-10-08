"use client";

import React from "react";
import { usePathname } from "next/navigation";
import "./layout.scss";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const pathname = usePathname();

  return (
    <div className="arta-layout">
      {/* Sidebar */}
      <aside className="arta-layout__sidebar">
        <div className="arta-sidebar__logo">Artacore CMS V.2</div>
        <ul className="arta-sidebar__nav">
          <li>
            <a href="/admin" className={pathname === "/admin" ? "active" : ""}>
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/admin/posts"
              className={pathname.startsWith("/admin/posts") ? "active" : ""}
            >
              Posts
            </a>
          </li>
          <li>
            <a
              href="/admin/pages"
              className={pathname.startsWith("/admin/pages") ? "active" : ""}
            >
              Pages
            </a>
          </li>
          <li>
            <a
              href="/admin/users"
              className={pathname.startsWith("/admin/users") ? "active" : ""}
            >
              Users
            </a>
          </li>
          <li>
            <a
              href="/admin/media"
              className={pathname.startsWith("/admin/media") ? "active" : ""}
            >
              Media
            </a>
          </li>
        </ul>
      </aside>

      <div className="arta-layout__main">
        <header className="arta-header">
          <h1 className="arta-header__title">Dashboard</h1>
          <button
            className="arta-button arta-button--logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <main className="arta-content">{children}</main>
      </div>
    </div>
  );
}
