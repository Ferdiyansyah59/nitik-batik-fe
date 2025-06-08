// src/hooks/useStoreProducts.js - FIXED VERSION with storeData handling
import { useEffect, useCallback, useMemo, useState } from 'react';
import useProductStore from '@/store/productStore';
import { useParams } from 'next/navigation';

export function useStoreProducts(options = {}) {
  const { page = 1, limit = 12, search = '', autoFetch = true } = options;

  const {
    products,
    storeData: rawStoreData, // ✅ Rename untuk clarity
    pagination,
    loading,
    error,
    fetchPublicProductsByStore,
    clearError,
  } = useProductStore();

  // ✅ Get params dan handle empty params pada first render
  const params = useParams();
  const storeId = params?.id; // Safe access

  // ✅ Local state untuk search functionality
  const [hasFetched, setHasFetched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isParamsReady, setIsParamsReady] = useState(false);

  // ✅ Check if params are ready (Next.js behavior fix)
  useEffect(() => {
    // Wait for params to be available
    if (storeId && storeId !== '') {
      console.log('✅ Params ready, storeId:', storeId);
      setIsParamsReady(true);
    } else {
      console.log('⏳ Waiting for params... current storeId:', storeId);
      setIsParamsReady(false);
    }
  }, [storeId]);

  // ✅ Debug effect
  useEffect(() => {
    console.log('🔍 Debug useStoreProducts:', {
      storeId,
      isParamsReady,
      hasFetched,
      autoFetch,
      productsLength: products?.length,
      storeData: rawStoreData, // ✅ Log raw store data
    });
  }, [
    storeId,
    isParamsReady,
    hasFetched,
    autoFetch,
    products?.length,
    rawStoreData,
  ]);

  // ✅ Pastikan products selalu array
  const safeProducts = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  // ✅ Pastikan storeData selalu object dan safe untuk diakses
  const storeData = useMemo(() => {
    // Jika rawStoreData null/undefined, return empty object dengan default values
    if (!rawStoreData || typeof rawStoreData !== 'object') {
      return {
        id: null,
        name: '',
        description: '',
        whatsapp: '',
        alamat: '',
        avatar: '',
        banner: '',
        user_id: null,
        created_At: '',
        updated_At: '',
      };
    }

    // Return the actual data jika ada
    return {
      id: rawStoreData.id || null,
      name: rawStoreData.name || '',
      description: rawStoreData.description || '',
      whatsapp: rawStoreData.whatsapp || '',
      alamat: rawStoreData.alamat || '',
      avatar: rawStoreData.avatar || '',
      banner: rawStoreData.banner || '',
      user_id: rawStoreData.user_id || null,
      created_At: rawStoreData.created_At || '',
      updated_At: rawStoreData.updated_At || '',
    };
  }, [rawStoreData]);

  // ✅ Helper untuk check apakah store data sudah loaded
  const isStoreDataLoaded = useMemo(() => {
    return !!(rawStoreData && rawStoreData.id && rawStoreData.name);
  }, [rawStoreData]);

  // ✅ Fetch products untuk store tertentu - STABLE dependencies
  const fetchProducts = useCallback(
    async (pageNum = page, searchTerm = search) => {
      if (!storeId || storeId === '') {
        console.warn('❌ useStoreProducts: storeId not available:', storeId);
        return;
      }

      try {
        console.log('🔍 fetchProducts called with:', {
          storeId,
          pageNum,
          searchTerm,
        });

        setIsSearching(true);
        await fetchPublicProductsByStore(storeId, pageNum, limit, searchTerm);

        setHasFetched(true);
        setSearchQuery(searchTerm);
        console.log('✅ Products fetched successfully for store:', storeId);
      } catch (error) {
        console.error('❌ useStoreProducts: Error fetching products:', error);
      } finally {
        setIsSearching(false);
      }
    },
    [storeId, limit, fetchPublicProductsByStore], // Stable dependencies only
  );

  // ✅ Auto-fetch ketika params ready - FIX untuk timing issue
  useEffect(() => {
    if (
      autoFetch &&
      isParamsReady &&
      storeId &&
      !hasFetched &&
      !loading &&
      !isSearching
    ) {
      console.log('🚀 Auto-fetching products for store:', storeId);
      fetchProducts(page, search);
    }
  }, [
    autoFetch,
    isParamsReady, // ✅ Wait untuk params ready
    storeId,
    hasFetched,
    loading,
    isSearching,
    // Jangan include fetchProducts di dependency untuk avoid loop
  ]);

  // ✅ Reset state ketika storeId berubah
  useEffect(() => {
    if (storeId && isParamsReady) {
      console.log('🔄 Store ID changed, resetting fetch state');
      setHasFetched(false);
      setSearchQuery('');
    }
  }, [storeId, isParamsReady]);

  // ✅ Manual refresh
  const refresh = useCallback(() => {
    if (!storeId) {
      console.warn('❌ Cannot refresh: storeId not available');
      return;
    }

    console.log('🔄 Manual refresh triggered for store:', storeId);
    setHasFetched(false);
    setIsSearching(false);
    fetchProducts(page, searchQuery);
  }, [storeId, page, searchQuery, fetchProducts]);

  // ✅ Search function
  const searchProducts = useCallback(
    (searchTerm = '') => {
      if (!storeId) {
        console.warn('❌ Cannot search: storeId not available');
        return;
      }

      console.log('🔍 Search products in store:', storeId, 'term:', searchTerm);
      setIsSearching(true);
      setHasFetched(false);
      fetchProducts(1, searchTerm);
    },
    [storeId, fetchProducts],
  );

  // ✅ Pagination helpers
  const handlePageChange = useCallback(
    (newPage) => {
      if (!storeId) {
        console.warn('❌ Cannot change page: storeId not available');
        return;
      }

      console.log('📄 Page change to:', newPage, 'for store:', storeId);
      setHasFetched(false);
      fetchProducts(newPage, searchQuery);
    },
    [storeId, searchQuery, fetchProducts],
  );

  // ✅ Computed values
  const hasProducts = safeProducts.length > 0;
  const isEmpty =
    !loading && !isSearching && safeProducts.length === 0 && !error;
  const hasError = !!error;
  const isLoading = loading || isSearching || !isParamsReady; // ✅ Include params loading

  return {
    // Data
    products: safeProducts,
    storeData, // ✅ Safe store data dengan fallbacks
    rawStoreData, // ✅ Raw data untuk debugging
    isStoreDataLoaded, // ✅ Helper untuk check loading state
    pagination,
    storeId, // ✅ Expose storeId untuk debugging

    // States
    loading: isLoading,
    error,
    hasProducts,
    isEmpty,
    hasError,
    hasFetched,
    searchQuery,
    isSearching,
    isParamsReady, // ✅ Expose untuk debugging

    // Actions
    fetchProducts,
    refresh,
    searchProducts,
    handlePageChange,
    clearError,
  };
}
