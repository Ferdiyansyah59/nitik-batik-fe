// src/hooks/useStore.js
import useStoreStore from '@/store/storeStore';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';

export function useStoreHooks() {
  const router = useRouter();
  const {
    createStore,
    updateStore,
    deleteStore,
    loading,
    error,
    clearError,
    getCurrentStore,
    hasStore: storeHasStore,
    fetchStoreByUserId,
    refreshStore,
  } = useStoreStore();

  const {
    user,
    store: authStore,
    hasStore: authHasStore,
    setStore: setAuthStore,
  } = useAuthStore();

  const [createError, setCreateError] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // ✅ Get current store (prioritize auth store)
  const currentStore = authStore || getCurrentStore();

  // ✅ Check if has store (use auth store method)
  const hasStore = authHasStore;

  // ✅ Create store dengan redirect yang benar
  const createStoreRedirect = useCallback(
    async (formData) => {
      setCreateError(null);

      try {
        console.log('useStoreHooks: Creating store with data:', formData);

        // Call create store API
        const newStore = await createStore(formData);
        console.log('useStoreHooks: Store created successfully:', newStore);

        // Store sudah diupdate di auth store melalui createStore method
        // Redirect ke dashboard
        router.push('/penjual/dashboard');
        router.refresh();

        return newStore;
      } catch (err) {
        console.error('useStoreHooks: Error creating store:', err);
        setCreateError(err.message);
        throw err;
      }
    },
    [createStore, router],
  );

  // ✅ Update store
  const updateStoreData = useCallback(
    async (storeData) => {
      setUpdateError(null);

      if (!currentStore?.id) {
        throw new Error('No store found to update');
      }

      try {
        const updatedStore = await updateStore(currentStore.id, storeData);
        return updatedStore;
      } catch (err) {
        setUpdateError(err.message);
        throw err;
      }
    },
    [updateStore, currentStore],
  );

  // ✅ Delete store dengan redirect
  const deleteStoreAndRedirect = useCallback(async () => {
    if (!currentStore?.id) {
      throw new Error('No store found to delete');
    }

    try {
      await deleteStore(currentStore.id);

      // Redirect ke halaman buat toko setelah hapus
      router.push('/penjual/store');
      router.refresh();
    } catch (err) {
      console.error('Error deleting store:', err);
      throw err;
    }
  }, [deleteStore, currentStore, router]);

  // ✅ Refresh store data
  const refreshStoreData = useCallback(async () => {
    if (!user?.id) return;

    try {
      await fetchStoreByUserId(user.id);
    } catch (err) {
      console.error('Error refreshing store data:', err);
    }
  }, [fetchStoreByUserId, user]);

  // ✅ Clear all errors
  const clearAllErrors = useCallback(() => {
    clearError();
    setCreateError(null);
    setUpdateError(null);
  }, [clearError]);

  // ✅ Check if user needs to create store
  const needsToCreateStore = useCallback(() => {
    return user?.role === 'penjual' && !hasStore;
  }, [user, hasStore]);

  // ✅ Sync with auth store on mount and when auth store changes
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      // Sync ketika auth store berubah
      if (state.store !== currentStore) {
        useStoreStore.getState().syncWithAuthStore();
      }
    });

    return unsubscribe;
  }, [currentStore]);

  // ✅ Initial store data fetch if needed
  useEffect(() => {
    if (user?.role === 'penjual' && user?.id && !hasStore && !loading) {
      console.log(
        'useStoreHooks: Attempting to fetch store data for user:',
        user.id,
      );
      refreshStoreData();
    }
  }, [user, hasStore, loading, refreshStoreData]);

  return {
    // Data
    currentStore,
    hasStore,
    needsToCreateStore,

    // Loading states
    loading,

    // Errors
    error: error || createError || updateError,
    createError,
    updateError,

    // Actions
    createStoreRedirect,
    updateStoreData,
    deleteStoreAndRedirect,
    refreshStoreData,
    clearAllErrors,
  };
}

// ✅ Hook terpisah untuk komponen yang hanya perlu read store data
export function useStoreData() {
  const { store, hasStore, getStore, isStoreLoading } = useAuthStore();

  return {
    store: store || getStore(),
    hasStore: hasStore(),
    loading: isStoreLoading(),
  };
}

// ✅ Hook untuk debugging store state
export function useStoreDebug() {
  const authState = useAuthStore();
  const storeState = useStoreStore();

  return {
    auth: {
      user: authState.user,
      store: authState.store,
      hasStore: authState.hasStore(),
      isLoadingStore: authState.isLoadingStore,
    },
    store: {
      store: storeState.store,
      hasStore: storeState.hasStore(),
      loading: storeState.loading,
      error: storeState.error,
    },
    timestamp: new Date().toISOString(),
  };
}
