// ============================================================
//  api.js  —  ONE place that knows how to talk to the backend
// ============================================================
//
//  Every fetch() call to the Vaultly backend lives here instead of
//  being scattered across components. Components import the
//  functions below instead of hardcoding URLs.
//
//  BASE URL:
//  Reads VITE_API_URL from the environment. Locally, Vite falls
//  back to http://localhost:3000 (where backend/src/server.js
//  listens) if the variable isn't set. When deployed, set
//  VITE_API_URL in the Vercel dashboard to point at wherever the
//  backend is actually hosted.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// --- LOGIN --------------------------------------------------------------
// POST /api/auth/login  ->  { success: true }
//                        or { success: false, error: { message } }
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// --- TRANSACTIONS ---------------------------------------------------------
// GET /transactions  ->  { vaults, transactions, settings } (the full data.json)
export async function getTransactions() {
  const res = await fetch(`${API_BASE}/transactions`);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

// POST /transactions  ->  adds one transaction, replies with the updated
// { vaults, transactions, settings } object.
export async function addTransaction(transaction) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  if (!res.ok) throw new Error('Failed to add transaction');
  return res.json();
}

// DELETE /transactions/:id  ->  replies with the updated
// { vaults, transactions, settings } object.
export async function deleteTransaction(id) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete transaction');
  return res.json();
}
