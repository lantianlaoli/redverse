'use client';

export const isAdminAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('adminAuth') === 'true';
};

export const logoutAdmin = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminAuth');
  }
};

export const useAdminAuth = () => {
  const checkAuth = () => isAdminAuthenticated();
  const logout = () => {
    logoutAdmin();
    window.location.href = '/admin/login';
  };
  
  return { checkAuth, logout };
};