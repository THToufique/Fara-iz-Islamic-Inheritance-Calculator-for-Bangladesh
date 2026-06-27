// lib/auth.js
// Simple auth helpers for localStorage-based JWT management
// Tested: login saves token, logout clears it, isLoggedIn returns correct state ✓

export const saveAuth = (token, user) => {
  localStorage.setItem('faraiz_token', token);
  localStorage.setItem('faraiz_user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('faraiz_token');
  localStorage.removeItem('faraiz_user');
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const u = localStorage.getItem('faraiz_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const isLoggedIn = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('faraiz_token');
};

export const isAdmin = () => {
  const user = getStoredUser();
  return user?.role === 'admin';
};
