// src/hooks/useAuth.js
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useState, useCallback, useEffect } from 'react';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    token,
    store,
    isLoading,
    isLoadingStore, // ✅ Tambahkan loading state untuk store
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated,
    isAdmin,
    isPenjual,
    isPembeli,
    hasStore,
    getStore,
    updateStore,
    clearStore,
    setStore,
    isStoreLoading,
  } = useAuthStore();

  const [loginError, setLoginError] = useState(null);
  const [registerError, setRegisterError] = useState(null);

  // Login dengan redirect yang lebih smart
  const loginWithRedirect = useCallback(
    async (email, password) => {
      setLoginError(null);

      try {
        await login(email, password);

        // ✅ Tunggu sebentar untuk memastikan state sudah terupdate
        setTimeout(() => {
          const currentUser = useAuthStore.getState().user;
          const currentStore = useAuthStore.getState().store;
          const isStoreLoading = useAuthStore.getState().isLoadingStore;

          console.log('Login redirect check:', {
            user: currentUser,
            store: currentStore,
            isStoreLoading,
            hasStore: useAuthStore.getState().hasStore(),
          });

          if (currentUser) {
            if (currentUser.role === 'admin') {
              router.push('/admin/dashboard');
              router.refresh();
            } else if (currentUser.role === 'penjual') {
              // ✅ Jika masih loading store data, tunggu
              if (isStoreLoading) {
                console.log('Store data still loading, waiting...');
                // Akan di-handle oleh useEffect yang mendengarkan perubahan isLoadingStore
                return;
              }

              // ✅ Check store status setelah loading selesai
              if (useAuthStore.getState().hasStore()) {
                console.log('User has store, redirecting to dashboard');
                router.push('/penjual/dashboard');
              } else {
                console.log('User has no store, redirecting to create store');
                router.push('/penjual/store');
              }
              router.refresh();
            } else {
              router.push('/');
              router.refresh();
            }
          }
        }, 100); // Small delay untuk memastikan state terupdate
      } catch (error) {
        console.error('Login error:', error);
        setLoginError(error.message || 'Gagal Login');
      }
    },
    [login, router],
  );

  // ✅ Effect untuk handle redirect setelah store loading selesai
  useEffect(() => {
    if (user && user.role === 'penjual' && !isLoadingStore) {
      // Hanya lakukan redirect jika:
      // 1. User adalah penjual
      // 2. Store loading sudah selesai
      // 3. Belum ada redirect sebelumnya (check current path)

      const currentPath = window.location.pathname;
      const shouldRedirect = currentPath === '/login' || currentPath === '/';

      if (shouldRedirect) {
        console.log('Store loading finished, checking redirect...', {
          hasStore: hasStore(),
          store: store,
          currentPath,
        });

        if (hasStore()) {
          console.log('Redirecting to dashboard after store check');
          router.push('/penjual/dashboard');
        } else {
          console.log('Redirecting to create store after store check');
          router.push('/penjual/store');
        }
      }
    }
  }, [user, isLoadingStore, hasStore, store, router]);

  // Register dengan redirect
  const registerWithRedirect = useCallback(
    async (name, email, password) => {
      setRegisterError(null);

      try {
        await register(name, email, password);
        // ✅ Setelah register, user pasti belum punya toko
        router.push('/penjual/store');
        router.refresh();
      } catch (err) {
        setRegisterError(err.message || 'Gagal Registrasi');
        console.log('Register error:', err);
      }
    },
    [register, router],
  );

  // Logout dengan redirect
  const logoutWithRedirect = useCallback(() => {
    logout();
    router.push('/login');
    router.refresh();
  }, [logout, router]);

  // ✅ Method untuk create store dan update auth store
  const createStoreAndRedirect = useCallback(
    async (newStoreData) => {
      try {
        // Update store di auth store
        setStore(newStoreData);

        // Redirect ke dashboard setelah berhasil buat toko
        router.push('/penjual/dashboard');
        router.refresh();
      } catch (error) {
        console.error('Error after creating store:', error);
      }
    },
    [setStore, router],
  );

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
          // ✅ Check store status untuk penjual, tapi tunggu loading selesai
          if (!isLoadingStore) {
            if (hasStore()) {
              router.push('/penjual/dashboard');
            } else {
              router.push('/penjual/store');
            }
          }
        } else {
          router.push('/');
        }
        return false;
      }

      // ✅ Additional check untuk penjual dashboard
      if (requiredRole === 'penjual' && user?.role === 'penjual') {
        if (!isLoadingStore && !hasStore()) {
          router.push('/penjual/store');
          return false;
        }
      }

      return true;
    },
    [isAuthenticated, user, router, hasStore, isLoadingStore],
  );

  // ✅ Helper untuk check apakah user perlu buat toko
  const needsToCreateStore = useCallback(() => {
    return user?.role === 'penjual' && !isLoadingStore && !hasStore();
  }, [user, hasStore, isLoadingStore]);

  // ✅ Helper untuk check apakah sedang loading (user atau store)
  const isLoadingAuth = useCallback(() => {
    return isLoading || (user?.role === 'penjual' && isLoadingStore);
  }, [isLoading, isLoadingStore, user]);

  return {
    user,
    token,
    store,
    isLoading: isLoadingAuth(), // ✅ Combined loading state
    isLoadingStore, // ✅ Expose store loading state
    error: error || loginError || registerError,
    loginWithRedirect,
    registerWithRedirect,
    logoutWithRedirect,
    createStoreAndRedirect,
    clearError,
    isAuthenticated,
    isAdmin,
    isPenjual,
    isPembeli,
    hasStore,
    getStore,
    needsToCreateStore,
    protectRoute,
  };
}
