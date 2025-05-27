import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useState, useCallback, useEffect } from 'react';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated,
    isAdmin,
    isPenjual,
    isPembeli,
  } = useAuthStore();

  const [loginError, setLoginError] = useState(null);

  // Login dengan redirect
  const loginWithRedirect = useCallback(
    async (email, password) => {
      setLoginError(null);

      try {
        await login(email, password);

        // Jika login berhasil, redirect sesuai peran
        const user = useAuthStore.getState().user;
        if (user) {
          if (user.role === 'admin') {
            router.push('/admin/dashboard');
            router.refresh(); // Force refresh untuk update UI
          } else if (user.role === 'penjual') {
            router.push('/penjual/dashboard');
            router.refresh();
          } else {
            router.push('/'); // Pembeli ke halaman utama
            router.refresh();
          }
        }
      } catch (error) {
        setLoginError(error.message || 'Login failed');
      }
    },
    [login, router],
  );

  // Logout dengan redirect
  const logoutWithRedirect = useCallback(() => {
    logout();
    router.push('/login');
    router.refresh();
  }, [logout, router]);

  // Protect dashboard routes
  const protectRoute = useCallback(
    (requiredRole) => {
      if (!isAuthenticated()) {
        router.push('/login');
        return false;
      }

      if (requiredRole && user?.role !== requiredRole) {
        // Redirect ke dashboard yang sesuai
        if (user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user?.role === 'penjual') {
          router.push('/penjual/dashboard');
        } else {
          router.push('/');
        }
        return false;
      }

      return true;
    },
    [isAuthenticated, user, router],
  );

  return {
    user,
    token,
    isLoading,
    error: error || loginError,
    loginWithRedirect,
    logoutWithRedirect,
    clearError,
    isAuthenticated,
    isAdmin,
    isPenjual,
    isPembeli,
    protectRoute,
  };
}
