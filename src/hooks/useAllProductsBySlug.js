// src/hooks/useAllProductsBySlug.js
import { useEffect, useCallback, useMemo, useState } from 'react';
import useProductStore from '@/store/productStore';
import { useParams } from 'next/navigation';

export function useAllProductsBySlug(options = {}) {
  const { page = 1, limit = 40, sortBy = 'newest', autoFetch = true } = options;

  // Product store
  const {
    products,
    pagination,
    loading: productLoading,
    error,
    fetchAllPublicProductBySlug,
    clearError,
    clearProducts,
  } = useProductStore();

  const params = useParams();
  const { slug } = params;

  // Local state untuk sorting
  const [currentSort, setCurrentSort] = useState(sortBy);
  const [hasFetched, setHasFetched] = useState(false);

  // ✅ Pastikan products selalu array
  const rawProducts = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  // ✅ Implementasi sorting di frontend
  const sortedProducts = useMemo(() => {
    if (rawProducts.length === 0) return [];

    const sorted = [...rawProducts].sort((a, b) => {
      switch (currentSort) {
        case 'newest':
          return (
            new Date(b.created_At || b.createdAt || '2024-01-01') -
            new Date(a.created_At || a.createdAt || '2024-01-01')
          );

        case 'oldest':
          return (
            new Date(a.created_At || a.createdAt || '2024-01-01') -
            new Date(b.created_At || b.createdAt || '2024-01-01')
          );

        case 'name':
          return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });

        case 'price_low':
          return (a.harga || 0) - (b.harga || 0);

        case 'price_high':
          return (b.harga || 0) - (a.harga || 0);

        default:
          return 0;
      }
    });

    return sorted;
  }, [rawProducts, currentSort]);

  // ✅ Loading state
  const loading = productLoading;

  // ✅ Fetch products dari API - FIXED untuk reload issue
  const fetchProducts = useCallback(
    async (pageNum = page) => {
      try {
        console.log(
          '🔍 Fetching all products - page:',
          pageNum,
          'limit:',
          limit,
        );

        // Gunakan fetchAllPublicProductBySlug tanpa slug dependency
        await fetchAllPublicProductBySlug(slug, pageNum, limit, '');
        setHasFetched(true);

        console.log('✅ Products fetched successfully');
      } catch (error) {
        console.error(
          '❌ useAllProductsBySlug: Error fetching products:',
          error,
        );
      }
    },
    [limit, fetchAllPublicProductBySlug],
  );

  // ✅ Initial fetch - FIXED untuk reload issue
  useEffect(() => {
    if (autoFetch && !hasFetched) {
      console.log('🚀 Auto-fetching products on component mount');
      // Remove slug dependency untuk fix reload issue
      fetchProducts(page);
    }
  }, [autoFetch, hasFetched, fetchProducts, page]);

  // ✅ Reset saat slug berubah
  useEffect(() => {
    if (slug) {
      console.log('🔄 Slug changed, resetting fetch state');
      setHasFetched(false);
      clearProducts();
    }
  }, [slug, clearProducts]);

  // ✅ Refresh function
  const refresh = useCallback(() => {
    console.log('🔄 Manual refresh products');
    clearProducts();
    setHasFetched(false);
    fetchProducts(1);
  }, [fetchProducts, clearProducts]);

  // ✅ Sort function (frontend only)
  const sortProducts = useCallback((sort) => {
    console.log('🔄 Sorting products:', sort);
    setCurrentSort(sort);
  }, []);

  // ✅ Pagination helpers
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage === pagination.page) return;

      console.log('📄 Changing to page:', newPage);
      fetchProducts(newPage);
    },
    [fetchProducts, pagination.page],
  );

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      handlePageChange(pagination.page + 1);
    }
  }, [pagination.page, pagination.totalPages, handlePageChange]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      handlePageChange(pagination.page - 1);
    }
  }, [pagination.page, handlePageChange]);

  // ✅ Format price helper
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  }, []);

  // ✅ Computed values
  const hasProducts = sortedProducts.length > 0;
  const isEmpty = !loading && sortedProducts.length === 0 && !error;
  const hasError = !!error;
  const hasNextPage = pagination.page < pagination.totalPages;
  const hasPrevPage = pagination.page > 1;

  return {
    // ✅ Data
    products: sortedProducts,
    pagination,
    slug,

    // ✅ States
    loading,
    error,
    hasProducts,
    isEmpty,
    hasError,
    currentSort,

    // ✅ Pagination states
    hasNextPage,
    hasPrevPage,
    currentPage: pagination.page,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,

    // ✅ Actions
    fetchProducts,
    refresh,
    sortProducts,
    handlePageChange,
    nextPage,
    prevPage,
    clearError,
    formatPrice,
  };
}
