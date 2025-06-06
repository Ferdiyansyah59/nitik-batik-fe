// src/hooks/useAllProducts.js
import { useEffect, useCallback, useMemo, useState } from 'react';
import useProductStore from '@/store/productStore';

export function useAllProducts(options = {}) {
  const {
    page = 1,
    limit = 40,
    search = '',
    sortBy = 'newest',
    autoFetch = true,
  } = options;

  // Product store
  const {
    products,
    pagination,
    loading: productLoading,
    error,
    fetchAllPublicProduct,
    clearError,
    clearProducts,
  } = useProductStore();

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
          // Sort berdasarkan created_at atau id (descending)
          return (
            new Date(b.created_At || b.createdAt || '2024-01-01') -
            new Date(a.created_At || a.createdAt || '2024-01-01')
          );

        case 'oldest':
          // Sort berdasarkan created_at atau id (ascending)
          return (
            new Date(a.created_At || a.createdAt || '2024-01-01') -
            new Date(b.created_At || b.createdAt || '2024-01-01')
          );

        case 'name':
          // Sort berdasarkan nama A-Z
          return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });

        case 'price_low':
          // Sort harga terendah ke tertinggi
          return (a.harga || 0) - (b.harga || 0);

        case 'price_high':
          // Sort harga tertinggi ke terendah
          return (b.harga || 0) - (a.harga || 0);

        case 'store_name':
          // Sort berdasarkan nama toko A-Z
          return (a.store_name || '').localeCompare(b.store_name || '', 'id', {
            sensitivity: 'base',
          });

        case 'category':
          // Sort berdasarkan kategori A-Z
          return (a.category_name || '').localeCompare(
            b.category_name || '',
            'id',
            { sensitivity: 'base' },
          );

        default:
          return 0;
      }
    });

    console.log(`🔄 Sorted ${sorted.length} products by ${currentSort}`);
    return sorted;
  }, [rawProducts, currentSort]);

  // ✅ Loading state
  const loading = productLoading;

  // ✅ Fetch products dari API
  const fetchProducts = useCallback(
    async (pageNum = page, searchTerm = search) => {
      try {
        console.log(
          '🔍 Fetching products from API - page:',
          pageNum,
          'search:',
          searchTerm,
          'limit:',
          limit,
        );

        // Panggil API tanpa storeId (null) untuk semua produk
        await fetchAllPublicProduct(null, pageNum, limit, searchTerm);
        setHasFetched(true);

        console.log('✅ Products fetched successfully');
      } catch (error) {
        console.error('❌ useAllProducts: Error fetching products:', error);
      }
    },
    [limit, fetchAllPublicProduct],
  );

  // ✅ Initial fetch
  useEffect(() => {
    if (autoFetch && !hasFetched) {
      console.log('🚀 Auto-fetching products on component mount');
      fetchProducts(page, search);
    }
  }, [autoFetch, hasFetched, fetchProducts, page, search]);

  // ✅ Refresh function
  const refresh = useCallback(() => {
    console.log('🔄 Manual refresh products');
    clearProducts();
    setHasFetched(false);
    fetchProducts(1, search);
  }, [fetchProducts, search, clearProducts]);

  // ✅ Search function
  const searchProducts = useCallback(
    (searchTerm) => {
      console.log('🔍 Searching products:', searchTerm);
      setHasFetched(false);
      fetchProducts(1, searchTerm);
    },
    [fetchProducts],
  );

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
      fetchProducts(newPage, search);
    },
    [fetchProducts, search, pagination.page],
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

  // ✅ Get unique categories from current products
  const getAvailableCategories = useCallback(() => {
    const categories = new Map();

    sortedProducts.forEach((product) => {
      if (product.category_slug && product.category_name) {
        categories.set(product.category_slug, {
          slug: product.category_slug,
          name: product.category_name,
          count: (categories.get(product.category_slug)?.count || 0) + 1,
        });
      }
    });

    return Array.from(categories.values()).sort((a, b) => b.count - a.count);
  }, [sortedProducts]);

  // ✅ Get products stats
  const getProductStats = useCallback(() => {
    const totalProducts = sortedProducts.length;
    const avgPrice =
      sortedProducts.length > 0
        ? sortedProducts.reduce(
            (sum, product) => sum + (product.harga || 0),
            0,
          ) / sortedProducts.length
        : 0;

    const priceRanges = {
      under100k: sortedProducts.filter((p) => (p.harga || 0) < 100000).length,
      '100k-500k': sortedProducts.filter(
        (p) => (p.harga || 0) >= 100000 && (p.harga || 0) < 500000,
      ).length,
      '500k-1m': sortedProducts.filter(
        (p) => (p.harga || 0) >= 500000 && (p.harga || 0) < 1000000,
      ).length,
      over1m: sortedProducts.filter((p) => (p.harga || 0) >= 1000000).length,
    };

    return {
      totalProducts,
      avgPrice,
      priceRanges,
      categories: getAvailableCategories(),
    };
  }, [sortedProducts, getAvailableCategories]);

  // ✅ Computed values
  const hasProducts = sortedProducts.length > 0;
  const isEmpty = !loading && sortedProducts.length === 0 && !error;
  const hasError = !!error;
  const hasNextPage = pagination.page < pagination.totalPages;
  const hasPrevPage = pagination.page > 1;

  return {
    // ✅ Data
    products: sortedProducts, // Return sorted products
    pagination,
    stats: getProductStats(),

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
    searchProducts,
    sortProducts,
    handlePageChange,
    nextPage,
    prevPage,
    clearError,
    formatPrice,

    // ✅ Utilities
    getAvailableCategories,
  };
}
