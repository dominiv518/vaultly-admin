// ============================================================
//  AuthLayout.jsx  —  LAYOUT FOR PUBLIC PAGES (e.g. Login)
// ============================================================
//
//  WHAT IS A LAYOUT?
//  A layout is a "wrapper" component that provides shared
//  structure around multiple pages. Instead of copy-pasting
//  the same header/sidebar into every page, you define it once
//  in a layout and all child pages automatically get it.
//
//  WHY TWO LAYOUTS?
//  This app has two distinct visual zones:
//    1. AuthLayout      → Public pages (Login). No sidebar.
//                         Just a centred card on a dark background.
//    2. DashboardLayout → Protected pages. Has sidebar + navbar.
//
//  HOW LAYOUTS WORK WITH REACT ROUTER:
//  In App.jsx, a layout is set as the `element` of a parent <Route>.
//  Its child <Route>s render inside the layout via <Outlet />.
//
//  EXAMPLE from App.jsx:
//    <Route element={<AuthLayout />}>         ← layout renders
//      <Route path="/login" element={<Login />} /> ← Login goes into <Outlet />
//    </Route>
//
// ============================================================

// `Outlet` is a special React Router component.
// It acts as a placeholder — it renders whichever child route
// currently matches the URL. Think of it like a "slot" in the layout.
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  // This layout is intentionally minimal.
  // The Login page handles its own full-screen background and centering.
  // We just pass through to <Outlet /> which renders <Login />.
  //
  // In the future, you could add things here that ALL public pages
  // share — like a "Back to website" link or a maintenance banner.
  return <Outlet />;
}
