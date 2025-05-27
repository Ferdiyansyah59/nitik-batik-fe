// // src/hooks/useArticles.js
// import { useEffect } from 'react';
// import useStoreStore from '@/store/storeStore';
import useStoreStore from '@/store/storeStore';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';

export function useStoreHooks() {
  const router = useRouter();
  const { createStore, loading, error } = useStoreStore();
  const [createError, setCreateError] = useState(null);

  const createStoreRedirect = useCallback(async (formData) => {
    setCreateError(null);

    try {
      await createStore(formData);
      router.push('/penjual/dashboard');
      router.refresh();
    } catch (err) {
      setCreateError(err.message);
    }
  });

  return {
    loading,
    error: error,
    createStoreRedirect,
  };
}
