// src/hooks/useProducts.js
import { useEffect, useCallback, useMemo, useState } from 'react';
import useProductStore from '@/store/productStore';
import { useAuthStore } from '@/store/auth-store';
import useStoreStore from '@/store/storeStore';

export function useProducts(options = {}) {
  const { page = 1, limit = 12, search = '', autoFetch = true } = options;

  // Auth store untuk mendapatkan user dan store info
  const { user, store: authStore } = useAuthStore();

  // Store store untuk manajemen toko
  const {
    getCurrentStore,
    hasStore,
    store: storeData,
    loading: storeLoading,
  } = useStoreStore();

  // Product store
  const {
    products,
    pagination,
    loading: productLoading,
    error,
    fetchProductsByStore,
    deleteProduct: deleteProductFromStore,
    clearError,
    clearProducts,
    fetchLatestProduct,
  } = useProductStore();

  // Local state
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [hasFetchedStore, setHasFetchedStore] = useState(false);

  // ✅ Pastikan products selalu array
  const safeProducts = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  // ✅ Get store info - prioritas ke getCurrentStore, fallback ke authStore
  const storeInfo = useMemo(() => {
    return getCurrentStore() || authStore || storeData;
  }, [getCurrentStore, authStore, storeData]);

  // ✅ Check if user can manage products
  const canManageProducts = useMemo(() => {
    return user?.role === 'penjual' && hasStore() && storeInfo;
  }, [user, hasStore, storeInfo]);

  // ✅ Get store ID for API calls
  const storeId = useMemo(() => {
    return storeInfo?.id || storeInfo?.store_id;
  }, [storeInfo]);

  // ✅ Loading state - combine store and product loading
  const loading = storeLoading || productLoading;

  // ✅ Fetch products - STABLE dengan dependency yang minimal
  const fetchProducts = useCallback(
    async (pageNum = page, searchTerm = search) => {
      if (!storeId) {
        console.warn('useProducts: storeId not available yet');
        return;
      }

      try {
        console.log('Fetching products for store:', storeId, 'page:', pageNum);
        await fetchProductsByStore(storeId, pageNum, limit, searchTerm);
      } catch (error) {
        console.error('useProducts: Error fetching products:', error);
      }
    },
    [storeId, limit, fetchProductsByStore],
  ); // HANYA dependency yang stabil

  // ✅ Fetch products ketika store ID tersedia - HANYA SEKALI
  useEffect(() => {
    if (autoFetch && storeId && canManageProducts && !hasFetchedStore) {
      console.log('Auto-fetching products for store:', storeId);
      fetchProducts(page, search);
      setHasFetchedStore(true);
    }
  }, [autoFetch, storeId, canManageProducts, hasFetchedStore]); // Tidak include fetchProducts

  // ✅ Reset fetch flag when store changes
  useEffect(() => {
    if (storeId) {
      setHasFetchedStore(false);
    }
  }, [storeId]);

  // ✅ Refresh function
  const refresh = useCallback(() => {
    if (storeId) {
      console.log('Manual refresh products');
      fetchProducts();
    }
  }, [storeId, fetchProducts]);

  // ✅ Search function - STABLE
  const searchProducts = useCallback(
    (searchTerm) => {
      if (!storeId) return;
      console.log('Searching products:', searchTerm);
      setHasFetchedStore(false); // Reset untuk allow fetch ulang
      fetchProducts(1, searchTerm);
    },
    [storeId, fetchProducts],
  );

  // ✅ Pagination helpers - STABLE
  const handlePageChange = useCallback(
    (newPage) => {
      if (!storeId) return;
      console.log('Changing to page:', newPage);
      fetchProducts(newPage, search);
    },
    [storeId, search, fetchProducts],
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

  // ✅ Delete product with loading state
  const deleteProduct = useCallback(
    async (slug) => {
      setDeleteLoading(slug);
      try {
        await deleteProductFromStore(slug);
        return true;
      } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
      } finally {
        setDeleteLoading(null);
      }
    },
    [deleteProductFromStore],
  );

  // ✅ Product stats
  const getProductStats = useCallback(() => {
    const totalProducts = safeProducts.length;
    const inStock = safeProducts.filter((p) => (p.stock || 0) > 0).length;
    const lowStock = safeProducts.filter(
      (p) => (p.stock || 0) > 0 && (p.stock || 0) <= 10,
    ).length;
    const outOfStock = safeProducts.filter((p) => (p.stock || 0) === 0).length;

    return {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [safeProducts]);

  const getLatestProduct = useCallback(async () => {
    try {
      await fetchLatestProduct();
    } catch (error) {
      console.log('useProducts: Error fetching latest product', error);
    }
  }, [fetchLatestProduct]);

  // ✅ Format price helper
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  }, []);

  // ✅ Computed values
  const hasProducts = safeProducts.length > 0;
  const isEmpty = !loading && safeProducts.length === 0 && !error;
  const hasError = !!error;
  const hasNextPage = pagination.page < pagination.totalPages;
  const hasPrevPage = pagination.page > 1;

  return {
    // ✅ Data
    products: safeProducts,
    storeInfo,
    pagination,

    // ✅ States
    loading,
    error,
    hasProducts,
    isEmpty,
    hasError,
    canManageProducts,
    deleteLoading,
    getLatestProduct,

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
    handlePageChange,
    nextPage,
    prevPage,
    deleteProduct,
    clearError,
    getProductStats,
    formatPrice,
  };
}

// ✅ Hook untuk single product
export function useProduct(initialSlug = null) {
  const {
    product,
    loading,
    error,
    fetchProductBySlug,
    fetchPublicProductBySlug,
    clearError,
  } = useProductStore();

  // ✅ fetchProduct yang menerima slug sebagai parameter
  const fetchProduct = useCallback(
    async (targetSlug) => {
      const slugToUse = targetSlug || initialSlug;

      if (!slugToUse) {
        console.warn('useProduct: slug is required');
        return null;
      }

      try {
        await fetchProductBySlug(slugToUse);

        // ✅ Akses state terbaru dari store
        const currentProduct = useProductStore.getState().product;
        console.log('Ini kuren', currentProduct);
        return currentProduct;
      } catch (error) {
        console.error('useProduct: Error fetching product:', error);
        throw error;
      }
    },
    [fetchProductBySlug, initialSlug],
  );

  const fetchPublicProduct = useCallback(
    async (targetSlug) => {
      const slugToUse = targetSlug || initialSlug;

      if (!slugToUse) {
        console.warn('useProduct: slug is required');
        return null;
      }

      try {
        await fetchPublicProductBySlug(slugToUse);

        // ✅ Akses state terbaru dari store
        const currentProduct = useProductStore.getState().product;
        console.log('Ini kuren', currentProduct);
        return currentProduct;
      } catch (error) {
        console.error('useProduct: Error fetching product:', error);
        throw error;
      }
    },
    [fetchPublicProductBySlug, initialSlug],
  );

  // Auto-fetch jika ada initialSlug
  useEffect(() => {
    if (initialSlug) {
      fetchProduct(initialSlug);
    }
  }, [initialSlug, fetchProduct]);

  return {
    product,
    loading,
    error,
    fetchProduct,
    fetchPublicProduct,
    clearError,
    hasProduct: !!product,
  };
}

// ✅ Hook untuk manage products (create, update, delete)
export function useProductManager() {
  const {
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
  } = useProductStore();

  const handleCreateProduct = useCallback(
    async (productData, images) => {
      try {
        const result = await createProduct(productData, images);
        return result;
      } catch (error) {
        console.error('useProductManager: Error creating product:', error);
        throw error;
      }
    },
    [createProduct],
  );

  const handleUpdateProduct = useCallback(
    async (slug, productData, images = null) => {
      try {
        const result = await updateProduct(slug, productData, images);
        return result;
      } catch (error) {
        console.error('useProductManager: Error updating product:', error);
        throw error;
      }
    },
    [updateProduct],
  );

  const handleDeleteProduct = useCallback(
    async (slug) => {
      try {
        const result = await deleteProduct(slug);
        return result;
      } catch (error) {
        console.error('useProductManager: Error deleting product:', error);
        throw error;
      }
    },
    [deleteProduct],
  );

  return {
    loading,
    error,
    createProduct: handleCreateProduct,
    updateProduct: handleUpdateProduct,
    deleteProduct: handleDeleteProduct,
    clearError,
  };
}
