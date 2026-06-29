// ============================================================
//  AuthContext.jsx  —  GLOBAL LOGIN STATE (React Context)
// ============================================================
//
//  WHAT IS REACT CONTEXT?
//  Normally, to pass data from a parent to a child component,
//  you use "props". But if you need data deep in your tree
//  (e.g. the Navbar needs to know who's logged in), passing
//  props through every layer is tedious — this is called
//  "prop drilling".
//
//  Context solves this. It lets you:
//  1. Create a "store" of shared data (createContext)
//  2. Wrap your app in a "Provider" that holds that data
//  3. Read that data from ANY component — no props needed (useContext)
//
//  IN THIS FILE we manage:
//  - Whether the user is logged in (isAuthenticated)
//  - Who the logged-in admin is (admin object)
//  - login() and logout() functions
//
//  FLOW:
//  User fills login form → calls login() → admin state is set →
//  isAuthenticated becomes true → PrivateRoute in App.jsx lets
//  them through → Dashboard renders.
//
// ============================================================

// createContext  → creates the Context object (the "store")
// useContext     → lets any component READ from the store
// useState       → local state inside the Provider component
import { createContext, useContext, useState } from 'react';

// ── Step 1: CREATE THE CONTEXT ───────────────────────────────
// This creates an empty "container". We export it so that
// useAuth() below can connect to it. The `null` is just the
// default value before the Provider sets real data.
const AuthContext = createContext(null);


// ── Step 2: THE PROVIDER COMPONENT ──────────────────────────
// AuthProvider wraps the whole app (see App.jsx).
// It holds the real state and passes it down via Context.
//
// `children` = everything rendered inside <AuthProvider>...</AuthProvider>
// This is a special React prop — it represents nested JSX.
export function AuthProvider({ children }) {

  // `admin` holds the logged-in admin's data (name, email, role).
  // When null, nobody is logged in.
  // When set to an object, the admin is authenticated.
  const [admin, setAdmin] = useState(null);

  // `loading` will be true while we're checking if a saved
  // login token (JWT) is still valid on page refresh.
  // Right now it's always false — we'll implement token
  // validation here later when the backend is ready.
  const [loading] = useState(false);

  // A simple boolean derived from admin state.
  // If `admin` has a value → true. If null → false.
  // This is what PrivateRoute checks to decide access.
  const isAuthenticated = !!admin;
  //  !! converts any value to boolean:
  //  !!null  → false
  //  !!{...} → true


  // ── login() ───────────────────────────────────────────────
  // Called from the Login page after a successful API response.
  // It receives the admin's data from the server and stores it.
  //
  // TODO (when backend is ready):
  //   - The backend will return an "access token" (JWT)
  //   - Store that token in memory (not localStorage — security!)
  //   - Set the admin state with the decoded admin info
  function login(adminData) {
    setAdmin(adminData);
  }


  // ── logout() ──────────────────────────────────────────────
  // Called when the admin clicks "Sign Out".
  // Clears admin state, which triggers PrivateRoute to
  // redirect back to /login.
  //
  // TODO (when backend is ready):
  //   - Call POST /api/auth/logout to invalidate the refresh token
  //   - Clear the access token from memory
  function logout() {
    setAdmin(null);
  }


  // ── The value object ──────────────────────────────────────
  // This is what every component gets when they call useAuth().
  // We expose: the admin data, the boolean flag, the loading
  // state, and the two action functions.
  return (
    <AuthContext.Provider value={{ admin, isAuthenticated, loading, login, logout }}>
      {/*
        `children` renders everything nested inside <AuthProvider>
        in App.jsx — meaning the entire Routes tree gets access
        to the auth state above.
      */}
      {children}
    </AuthContext.Provider>
  );
}


// ── Step 3: THE CUSTOM HOOK ───────────────────────────────────
// Instead of writing `useContext(AuthContext)` in every component,
// we create a named hook: useAuth().
//
// USAGE IN ANY COMPONENT:
//   import { useAuth } from '../context/AuthContext';
//   const { isAuthenticated, admin, logout } = useAuth();
//
// The error guard ensures useAuth() is only called inside the
// AuthProvider tree — gives a clear message if misused.
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth() was called outside of <AuthProvider>. ' +
      'Make sure AuthProvider wraps your app in App.jsx.'
    );
  }

  return ctx;
}
