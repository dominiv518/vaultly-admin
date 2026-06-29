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

// Outlet = the "slot" where child page components are injected
import { Outlet } from 'react-router-dom';

// TODO: These will be imported once the components are built.
// import Sidebar from '../components/Sidebar';
// import Navbar from '../components/Navbar';

export default function DashboardLayout() {
  return (
    // `app-shell` is a CSS class from index.css.
    // It sets: display: flex  so the sidebar and content
    // sit side by side horizontally.
    <div className="app-shell">

      {/*
        SIDEBAR — fixed on the left side.
        Contains the logo and navigation links.
        Uncomment when Sidebar.jsx is built:
      */}
      {/* <Sidebar /> */}

      {/*
        MAIN CONTENT AREA — takes up the rest of the screen.
        `main-content` in CSS sets: margin-left: var(--sidebar-w)
        so it starts after the sidebar.
      */}
      <div className="main-content">

        {/*
          NAVBAR — sticky at the top of the content area.
          Contains search, notifications bell, admin avatar.
          Uncomment when Navbar.jsx is built:
        */}
        {/* <Navbar /> */}

        {/*
          PAGE BODY — the scrollable content zone.
          <Outlet /> renders the currently active page here.
          `page-body` in CSS adds consistent padding around it.
        */}
        <main className="page-body">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
