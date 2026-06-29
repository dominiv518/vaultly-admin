// ============================================================
//  App.jsx  —  THE ROOT OF THE ENTIRE APPLICATION
// ============================================================
//
//  This is the first real React file that runs after main.jsx.
//  Its only job is to set up ROUTING — meaning: which URL path
//  shows which page/component.
//
//  ROUTING IN REACT:
//  In a normal HTML website, every page is a separate .html file.
//  In React, we have ONE index.html but we swap out components
//  depending on the URL. This is called a "Single Page Application"
//  (SPA). The library that handles this is: react-router-dom.
//
//  HOW REACT-ROUTER-DOM WORKS:
//  - <BrowserRouter>  → wraps everything; watches the URL bar
//  - <Routes>         → container for all your route definitions
//  - <Route>          → maps one URL path to one component/page
//  - <Navigate>       → programmatically redirects to another path
//  - <Outlet>         → placeholder inside a layout where child
//                       routes get rendered (like a "slot")
//
// ============================================================

// React Router imports — we get these from "react-router-dom"
// (already installed via: npm install react-router-dom)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// AuthProvider  → the component that holds login state for the whole app
// useAuth       → a custom hook to READ that login state anywhere
// Both live in AuthContext.jsx — we'll explain that file separately
import { AuthProvider, useAuth } from './context/AuthContext';

// ── LAYOUTS ──────────────────────────────────────────────────
// Layouts are "wrapper" components. They define the shared
// structure around pages.
//   AuthLayout     → used for Login page (no sidebar/navbar)
//   DashboardLayout → used for all admin pages (has sidebar + navbar)
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// ── PAGES ────────────────────────────────────────────────────
// Each page is a React component that fills the main content area.
// We import them all here so the router knows about them.
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Analytics from './pages/Analytics';
import AppVersions from './pages/AppVersions';
import Notifications from './pages/Notifications';
import Feedback from './pages/Feedback';
import FeedbackDetail from './pages/FeedbackDetail';
import Logs from './pages/Logs';
import AdminAccounts from './pages/AdminAccounts';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// ============================================================
//  ROUTE GUARD #1 — PrivateRoute
// ============================================================
//  This component PROTECTS pages that require login.
//  If the user IS logged in  → show the page (children)
//  If the user is NOT logged in → redirect them to /login
//
//  HOW IT WORKS:
//  It reads `isAuthenticated` from our AuthContext (via useAuth).
//  Then it either renders `children` (the protected page) OR
//  uses <Navigate> to push the user to /login.
//
//  `replace` means the redirect replaces the current history entry
//  so the user can't click "back" to sneak past it.
// ============================================================
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // While we're checking if the user is logged in (e.g. validating
  // a saved token), render nothing to avoid a flash of wrong content
  if (loading) return null;

  // If authenticated, render the actual page. Otherwise, redirect.
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ============================================================
//  ROUTE GUARD #2 — PublicRoute
// ============================================================
//  This is the opposite: it wraps the Login page.
//  If the user is ALREADY logged in → redirect to dashboard (/)
//  If the user is NOT logged in     → show the Login page
//
//  This prevents a logged-in admin from seeing the login form again.
// ============================================================
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  // If already authenticated, skip login and go to dashboard
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

// ============================================================
//  THE MAIN APP COMPONENT
// ============================================================
//  This is the default export — React renders this at the root.
//
//  STRUCTURE EXPLAINED:
//
//  <BrowserRouter>
//    Enables URL-based navigation. Must wrap everything.
//
//  <AuthProvider>
//    Provides login state to the whole app via React Context.
//    Any component inside can call useAuth() to get/set auth state.
//
//  <Routes>
//    React Router looks through all <Route> children and renders
//    the FIRST one whose `path` matches the current URL.
//
//  NESTED ROUTES:
//    When a <Route> has an `element` that contains <Outlet />,
//    its child <Route>s render inside that <Outlet />.
//    This is how layouts work — the layout renders once, and the
//    page content swaps inside it as you navigate.
// ============================================================
export default function App() {
  return (
    // BrowserRouter must be the outermost wrapper for routing to work
    <BrowserRouter>

      {/*
        AuthProvider wraps everything inside BrowserRouter so that
        all pages — and the route guards — can access auth state.
      */}
      <AuthProvider>
        <Routes>

          {/* ══════════════════════════════════════════════
              PUBLIC ROUTES  (no sidebar, no navbar)
              These use AuthLayout, which is a plain wrapper.
          ══════════════════════════════════════════════ */}
          <Route element={<AuthLayout />}>

            {/* /login → shows the Login page
                Wrapped in <PublicRoute> so logged-in users
                get bounced to the dashboard automatically */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
          </Route>

          {/* ══════════════════════════════════════════════
              PROTECTED ROUTES  (with sidebar + navbar)
              These use DashboardLayout as the wrapper.
              The whole block is wrapped in <PrivateRoute>
              so unauthenticated users can't reach ANY of them.
          ══════════════════════════════════════════════ */}
          <Route
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            {/* Each child route renders inside DashboardLayout's <Outlet /> */}
            <Route path="/"              element={<Dashboard />}    />
            <Route path="/users"         element={<Users />}        />
            <Route path="/users/:id"     element={<UserDetail />}   />  {/* :id is a URL parameter */}
            <Route path="/analytics"     element={<Analytics />}    />
            <Route path="/versions"      element={<AppVersions />}  />
            <Route path="/notifications" element={<Notifications />}/>
            <Route path="/feedback"      element={<Feedback />}     />
            <Route path="/feedback/:id"  element={<FeedbackDetail />} />
            <Route path="/logs"          element={<Logs />}         />
            <Route path="/admins"        element={<AdminAccounts />}/>
            <Route path="/settings"      element={<Settings />}     />
            <Route path="/profile"       element={<Profile />}      />
          </Route>

          {/* ══════════════════════════════════════════════
              CATCH-ALL / 404
              If no route above matches, redirect to dashboard.
              `*` is a wildcard that matches anything.
          ══════════════════════════════════════════════ */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
