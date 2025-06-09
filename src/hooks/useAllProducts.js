// src/hooks/useAllProducts.js - FIXED for search functionality
import { useEffect, useCallback, useMemo, useState } from 'react';
import useProductStore from '@/store/productStore';

export function useAllProducts(options = {}) {
  const {
    page = 1,
    limit = 12,
    search = '',
    sortBy = 'newest',
    autoFetch = true,
    categorySlug = null,
  } = options || {};

  // Product store
  const {
    products,
    pagination,
    loading: productLoading,
    error,
    fetchAllPublicProduct,
    fetchAllPublicProductBySlug,
    clearError,
    clearProducts,
  } = useProductStore();

  // Local state for UI features
  const [hasFetched, setHasFetched] = useState(false);
  const [currentSort, setCurrentSort] = useState(sortBy);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Pastikan products selalu array
  const safeProducts = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  // ✅ FIXED: Fetch function yang simple dan reliable
  const fetchProducts = useCallback(
    async (pageNum = 1, searchTerm = '') => {
      try {
        console.log('🔍 fetchProducts called with:', {
          pageNum,
          searchTerm,
          categorySlug,
        });

        setIsSearching(true);

        if (categorySlug) {
          await fetchAllPublicProductBySlug(
            categorySlug,
            pageNum,
            limit,
            searchTerm,
          );
        } else {
          await fetchAllPublicProduct(pageNum, limit, searchTerm);
        }

        setHasFetched(true);
        setSearchQuery(searchTerm);
        console.log('✅ Products fetched successfully');
      } catch (error) {
        console.error('❌ Error fetching products:', error);
      } finally {
        setIsSearching(false);
      }
    },
    [limit, categorySlug, fetchAllPublicProduct, fetchAllPublicProductBySlug],
  );

  // ✅ Auto-fetch saat component mount
  useEffect(() => {
    if (autoFetch && !hasFetched) {
      console.log('🚀 Auto-fetching products on mount');
      fetchProducts(page, search);
    }
  }, [autoFetch, hasFetched, page, search, fetchProducts]);

  // ✅ Manual refresh
  const refresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    setHasFetched(false);
    setIsSearching(false);
    fetchProducts(page, searchQuery);
  }, [fetchProducts, page, searchQuery]);

  // ✅ Search function - mirip Article Card
  const searchProducts = useCallback(
    (searchTerm = '') => {
      console.log('🔍 Search products:', searchTerm);
      setIsSearching(true);
      setHasFetched(false);
      fetchProducts(1, searchTerm);
    },
    [fetchProducts],
  );

  // ✅ Sort function - Frontend sorting
  const sortProducts = useCallback((sortType) => {
    console.log('🔄 Sorting products by:', sortType);
    setCurrentSort(sortType);
  }, []);

  // ✅ Sorted products berdasarkan currentSort
  const sortedProducts = useMemo(() => {
    if (!currentSort || safeProducts.length === 0) {
      return safeProducts;
    }

    const sorted = [...safeProducts].sort((a, b) => {
      switch (currentSort) {
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price_low':
          return (a.harga || 0) - (b.harga || 0);
        case 'price_high':
          return (b.harga || 0) - (a.harga || 0);
        case 'store_name':
          return (a.store_name || '').localeCompare(b.store_name || '');
        case 'category':
          return (a.category_name || '').localeCompare(b.category_name || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [safeProducts, currentSort]);

  // ✅ Pagination helpers
  const handlePageChange = useCallback(
    (newPage) => {
      console.log('📄 Page change to:', newPage);
      setHasFetched(false);
      fetchProducts(newPage, searchQuery);
    },
    [fetchProducts, searchQuery],
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
    const safePrice = price !== null && price !== undefined ? price : 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(safePrice);
  }, []);

  // ✅ Computed values
  const hasProducts = sortedProducts.length > 0;
  const isEmpty =
    !productLoading && !isSearching && sortedProducts.length === 0 && !error;
  const hasError = !!error;
  const hasNextPage = pagination.page < pagination.totalPages;
  const hasPrevPage = pagination.page > 1;
  const isLoading = productLoading || isSearching;

  return {
    // ✅ Data - menggunakan sortedProducts
    products: sortedProducts,
    pagination,

    // ✅ States
    loading: isLoading,
    error,
    hasProducts,
    isEmpty,
    hasError,
    hasFetched,
    currentSort,
    searchQuery,
    isSearching,

    // ✅ Pagination states
    hasNextPage,
    hasPrevPage,
    currentPage: pagination.page,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,

    // ✅ Actions
    fetchProducts,
    refresh,
    searchProducts,
    sortProducts,
    handlePageChange,
    nextPage,
    prevPage,
    clearError,
    formatPrice,
  };
}

// ✅ Export sebagai named dan default export
// export { useAllProducts };
export default useAllProducts;
