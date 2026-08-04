// ============================================================
//  DashboardLayout.jsx  —  LAYOUT FOR ALL PROTECTED PAGES
// ============================================================
//
//  This layout wraps every page that a logged-in admin sees.
//  It provides the consistent shell: sidebar on the left,
//  navbar at the top, and the page content in the middle.
//
//  VISUAL STRUCTURE:
//
//  ┌──────────┬───────────────────────────────────────┐
//  │          │  NAVBAR (top bar)                     │
//  │ SIDEBAR  ├───────────────────────────────────────┤
//  │  (nav)   │                                       │
//  │          │   <Outlet /> ← page renders here      │
//  │          │                                       │
//  └──────────┴───────────────────────────────────────┘
//
//  HOW <Outlet /> WORKS HERE:
//  When the user visits /users, React Router renders:
//    DashboardLayout (this file)  ← outer shell
//      └── Users page             ← inside <Outlet />
//
//  When they go to /analytics, it becomes:
//    DashboardLayout (same shell, stays mounted)
//      └── Analytics page         ← Outlet swaps to this
//
//  This is efficient — the Sidebar and Navbar don't re-render
//  on every navigation. Only the <Outlet /> content changes.
//
// ============================================================

import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="main-content">
        <Navbar onToggleSidebar={toggleSidebar} />

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
