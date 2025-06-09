// src/store/productStore.js - FIXED with missing methods
import { create } from 'zustand';
import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_ROUTE || 'http://localhost:8081/api';

console.log('🔧 Product Store API URL:', API_URL);

// Create axios instance dengan timeout
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Add request interceptor dengan error handling
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ Get token from multiple sources
    let token = localStorage.getItem('token');

    if (!token) {
      try {
        // Import auth store dynamically to avoid circular dependency
        const { useAuthStore } = require('@/store/auth-store');
        token = useAuthStore.getState().token;
      } catch (error) {
        console.log('Could not get token from auth store:', error);
      }
    }

    if (token) {
      config.headers.Authorization = `${token}`;
    }

    // ✅ CRITICAL FIX: Don't override Content-Type for FormData
    // Axios automatically sets the correct multipart/form-data boundary
    if (config.data instanceof FormData) {
      // Remove Content-Type to let Axios set it automatically with boundary
      delete config.headers['Content-Type'];
      console.log(
        '📡 Multipart request detected, letting Axios handle Content-Type',
      );
    }

    console.log('📡 API Request:', config.method?.toUpperCase(), config.url, {
      hasToken: !!token,
      contentType: config.headers['Content-Type'],
      isFormData: config.data instanceof FormData,
    });

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

const useProductStore = create((set, get) => ({
  // ✅ State management yang lebih robust
  products: [],
  product: null,
  pagination: {
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  lastFetchTime: null,
  fetchAttempts: 0,
  storeData: null,

  // ✅ Fetch products by store ID
  fetchProductsByStore: async (storeId, page = 1, limit = 12, search = '') => {
    if (!storeId) {
      console.error('❌ fetchProductsByStore: storeId is required');
      return;
    }

    set({ loading: true, error: null });

    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      console.log(
        '📡 Fetching products for store:',
        storeId,
        'with params:',
        params,
      );

      const response = await axiosInstance.get(`/store/${storeId}/products`, {
        params,
        timeout: 15000,
      });

      if (response.data && response.data.status) {
        const products = Array.isArray(response.data.data?.products)
          ? response.data.data.products
          : [];

        const pagination = response.data.data?.pagination || {
          page: 1,
          limit: 12,
          totalItems: 0,
          totalPages: 0,
        };

        set({
          products,
          pagination,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.data?.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);

      let errorMessage = 'Failed to fetch products';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = `Network Error: Cannot connect to API server (${API_URL})`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout: API server took too long to respond';
      } else if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `HTTP ${error.response.status}: ${error.response.statusText}`;
      }

      set({
        error: errorMessage,
        loading: false,
        products: [],
      });
    }
  },

  // ✅ Fetch product by slug
  fetchProductBySlug: async (slug) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/product/detail/${slug}`);

      if (response.data.status) {
        set({
          product: response.data.data,
          loading: false,
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch product',
        loading: false,
        product: null,
      });
    }
  },

  // Delete Prouct
  deleteProduct: async (slug) => {
    set({ loading: true, error: null });
    try {
      // Panggil API endpoint untuk menghapus produk
      const response = await axiosInstance.delete(`/product/${slug}`);

      if (response.data.status) {
        // Jika berhasil, hapus produk dari state lokal agar UI terupdate
        set((state) => ({
          products: state.products.filter((p) => p.slug !== slug),
          loading: false,
        }));
        return true; // Kembalikan true jika berhasil
      } else {
        throw new Error(response.data.message || 'Gagal menghapus produk');
      }
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Gagal menghapus produk';
      set({ error: errorMessage, loading: false });
      throw error; // Lemparkan error agar bisa ditangkap di komponen
    }
  },

  // ✅ Create product
  createProduct: async (productData, images) => {
    set({ loading: true, error: null });

    try {
      console.log('🔧 Creating product with data:', productData);
      console.log('🔧 Images to upload:', images?.length || 0);

      const formData = new FormData();

      // ✅ Add product data to FormData
      Object.keys(productData).forEach((key) => {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
          console.log(`📝 Added field: ${key} = ${productData[key]}`);
        }
      });

      // ✅ Add images to FormData
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append('images', image);
          console.log(
            `🖼️ Added image ${index + 1}: ${image.name} (${image.size} bytes)`,
          );
        });
      }

      // ✅ CRITICAL: Don't set Content-Type header manually
      // Let Axios handle it automatically with proper boundary
      const response = await axiosInstance.post('/product', formData, {
        // ✅ Do NOT set Content-Type header here!
        // headers: { 'Content-Type': 'multipart/form-data' }, // ❌ This causes issues
      });

      console.log('✅ Product creation response:', response.data);

      if (response.data.status) {
        set({ loading: false });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('❌ Error creating product:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create product';

      set({
        error: errorMessage,
        loading: false,
      });

      throw error;
    }
  },

  // ✅ Update product
  updateProduct: async (slug, productData, images = null) => {
    set({ loading: true, error: null });

    try {
      console.log('🔧 Updating product:', slug);
      console.log('🔧 Product data:', productData);
      console.log('🔧 New images:', images?.length || 0);

      // ✅ DEBUG: Log imagesToDelete specifically
      console.log('🗑️ Images to delete:', productData.imagesToDelete);

      // ✅ ALWAYS use FormData (backend expects this)
      const formData = new FormData();

      // Add basic fields
      formData.append('name', productData.name || '');
      formData.append('description', productData.description || '');
      formData.append('harga', productData.harga?.toString() || '0');
      formData.append(
        'category_id',
        productData.category_id?.toString() || '1',
      );

      // Add imagesToDelete as JSON string
      if (productData.imagesToDelete && productData.imagesToDelete.length > 0) {
        const imagesToDeleteJSON = JSON.stringify(productData.imagesToDelete);
        console.log('📦 Sending imagesToDelete JSON:', imagesToDeleteJSON);
        formData.append('imagesToDelete', imagesToDeleteJSON);
      }

      // Add new images
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append('images', image);
          console.log(`📸 Added image ${index + 1}:`, image.name);
        });
      }

      // ✅ DEBUG: Log all FormData entries
      console.log('📤 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      // Send request
      const response = await axiosInstance.put(`/product/${slug}`, formData, {
        timeout: 60000,
      });

      console.log('📥 Response:', response.data);

      if (response.data.status) {
        const updatedProduct = response.data.data;

        // Update local state
        const currentProducts = get().products || [];
        const updatedProducts = currentProducts.map((p) =>
          p.slug === slug ? { ...p, ...updatedProduct } : p,
        );

        set({
          products: updatedProducts,
          product: updatedProduct,
          loading: false,
        });

        return updatedProduct;
      } else {
        throw new Error(response.data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('❌ Error updating product:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update product';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Public: fetch latest product
  fetchLatestProduct: async (retryCount = 0, forceRefresh = false) => {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1000;

    console.log(`🔍 fetchLatestProduct called`, { retryCount, forceRefresh });

    // ✅ Force refresh akan reset semua state
    if (forceRefresh) {
      console.log('🔄 Force refresh - resetting all states');
      set({
        isFetching: false,
        lastFetchTime: null,
        loading: false,
        error: null,
        fetchAttempts: 0,
        products: [], // Clear products untuk force reload
      });
    }

    // ✅ Prevent multiple simultaneous calls
    if (get().isFetching && !forceRefresh) {
      console.log('🔄 Already fetching, skipping...');
      return get().products;
    }

    console.log(
      `🔍 Starting fetch attempt ${retryCount + 1}/${MAX_RETRIES + 1}`,
    );

    set({
      loading: true,
      error: null,
      isFetching: true,
      fetchAttempts: retryCount + 1,
    });

    try {
      // ✅ Add timestamp untuk prevent caching
      const timestamp = Date.now();
      const response = await axiosInstance.get(
        `/latest-products?_t=${timestamp}`,
      );

      console.log('📡 Latest products API response:', response.data);

      if (response.data && response.data.status) {
        const productsData = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        console.log('✅ Setting products data:', productsData.length, 'items');

        set({
          loading: false,
          products: productsData,
          error: null,
          isFetching: false,
          lastFetchTime: Date.now(),
          fetchAttempts: 0,
        });

        return productsData;
      } else {
        throw new Error('Invalid response format or status false');
      }
    } catch (error) {
      console.error(
        `❌ Error fetching latest products (attempt ${retryCount + 1}):`,
        error,
      );

      // ✅ Reset isFetching immediately on error
      set({ isFetching: false });

      // ✅ Retry logic - only for network errors, not for 404 or other HTTP errors
      const shouldRetry =
        retryCount < MAX_RETRIES &&
        error.code !== 'ERR_NETWORK' &&
        error.response?.status !== 404;

      if (shouldRetry) {
        console.log(`⏳ Retrying in ${RETRY_DELAY}ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return get().fetchLatestProduct(retryCount + 1, false); // Don't force refresh on retry
      }

      // ✅ Final failure
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch latest products';

      console.error('💥 Final fetch failure:', errorMessage);

      set({
        error: errorMessage,
        loading: false,
        products: [], // Clear products on error
        isFetching: false,
        lastFetchTime: Date.now(), // Set timestamp to prevent immediate retry
        fetchAttempts: 0,
      });

      return [];
    }
  },

  // Public: fetch all product
  fetchAllPublicProduct: async (page = 1, limit = 12, search = '') => {
    set({ loading: true, error: null });

    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      console.log('📡 Fetching all public products with params:', params);

      const response = await axiosInstance.get('/products', {
        params,
        timeout: 15000, // 15 second timeout for this request
      });

      console.log('✅ Products API response:', response.data);

      if (response.data && response.data.status) {
        // ✅ PERBAIKAN: Pastikan products selalu array
        const products = Array.isArray(response.data.data?.products)
          ? response.data.data.products
          : [];

        const pagination = response.data.data?.pagination || {
          page: 1,
          limit: 12,
          totalItems: 0,
          totalPages: 0,
        };

        console.log('✅ Setting products:', products.length, 'items');

        set({
          products,
          pagination,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.data?.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);

      // ✅ PERBAIKAN: Definisikan errorMessage yang hilang
      let errorMessage = 'Failed to fetch products';

      if (error.code === 'ERR_NETWORK') {
        errorMessage = `Network Error: Cannot connect to API server (${API_URL})`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout: API server took too long to respond';
      } else if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `HTTP ${error.response.status}: ${error.response.statusText}`;
      } else {
        errorMessage = error.message || errorMessage;
      }

      set({
        error: errorMessage,
        loading: false,
        products: [], // ✅ PERBAIKAN: Set ke empty array saat error
      });
    }
  },

  // Public: fetch product by slug
  fetchPublicProductBySlug: async (slug) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/product/${slug}`);

      // console.log('ini detail ', response.data.data.description);

      if (response.data.status) {
        set({
          product: response.data.data,
          loading: false,
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch product',
        loading: false,
        product: null,
      });
    }
  },

  // Public: fetch all product by category
  fetchAllPublicProductBySlug: async (
    slug,
    page = 1,
    limit = 12,
    search = '',
  ) => {
    set({ loading: true, error: null });

    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      console.log('📡 Fetching all public products with params:', params);

      const response = await axiosInstance.get(`/products/category/${slug}`, {
        params,
        timeout: 15000, // 15 second timeout for this request
      });

      console.log('✅ Products API response:', response.data);

      if (response.data && response.data.status) {
        // ✅ PERBAIKAN: Pastikan products selalu array
        const products = Array.isArray(response.data.data?.products)
          ? response.data.data.products
          : [];

        const pagination = response.data.data?.pagination || {
          page: 1,
          limit: 12,
          totalItems: 0,
          totalPages: 0,
        };

        console.log('✅ Setting products:', products.length, 'items');

        set({
          products,
          pagination,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.data?.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);

      // ✅ PERBAIKAN: Definisikan errorMessage yang hilang
      let errorMessage = 'Failed to fetch products';

      if (error.code === 'ERR_NETWORK') {
        errorMessage = `Network Error: Cannot connect to API server (${API_URL})`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout: API server took too long to respond';
      } else if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `HTTP ${error.response.status}: ${error.response.statusText}`;
      } else {
        errorMessage = error.message || errorMessage;
      }

      set({
        error: errorMessage,
        loading: false,
        products: [], // ✅ PERBAIKAN: Set ke empty array saat error
      });
    }
  },

  // Public: Fetching public product By Store ID
  fetchPublicProductsByStore: async (
    storeId,
    page = 1,
    limit = 12,
    search = '',
  ) => {
    if (!storeId) {
      console.error('❌ fetchProductsByStore: storeId is required');
      return;
    }

    set({ loading: true, error: null });

    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      console.log(
        '📡 Fetching products for store:',
        storeId,
        'with params:',
        params,
      );

      const response = await axiosInstance.get(`/products/store/${storeId}`, {
        params,
        timeout: 15000,
      });

      if (response.data && response.data.status) {
        const products = Array.isArray(response.data.data?.products)
          ? response.data.data.products
          : [];
        const store = response.data.data.store;

        const pagination = response.data.data?.pagination || {
          page: 1,
          limit: 12,
          totalItems: 0,
          totalPages: 0,
        };

        set({
          products,
          pagination,
          loading: false,
          error: null,
          storeData: store,
        });
      } else {
        throw new Error(response.data?.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);

      let errorMessage = 'Failed to fetch products';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = `Network Error: Cannot connect to API server (${API_URL})`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout: API server took too long to respond';
      } else if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `HTTP ${error.response.status}: ${error.response.statusText}`;
      }

      set({
        error: errorMessage,
        loading: false,
        products: [],
      });
    }
  },

  // ✅ Pagination helper
  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  // ✅ Helper untuk memastikan products selalu array
  getProducts: () => {
    const state = get();
    return Array.isArray(state.products) ? state.products : [];
  },

  resetFetchState: () => {
    console.log('🔄 Resetting fetch state completely');
    set({
      isFetching: false,
      loading: false,
      error: null,
      fetchAttempts: 0,
      lastFetchTime: null, // ✅ Reset cache timestamp
    });
  },

  // ✅ FIXED: Clear cache yang lebih aggressive
  clearCache: () => {
    console.log('🗑️ Clearing cache and resetting all state');
    set({
      lastFetchTime: null,
      products: [],
      product: null,
      isFetching: false,
      loading: false,
      error: null,
      fetchAttempts: 0,
      pagination: {
        page: 1,
        limit: 12,
        totalItems: 0,
        totalPages: 0,
      },
    });
  },

  // ✅ Clear error
  clearError: () => {
    set({ error: null });
  },

  // ✅ Clear products
  clearProducts: () => {
    set({
      products: [],
      product: null,
      error: null,
      pagination: {
        page: 1,
        limit: 12,
        totalItems: 0,
        totalPages: 0,
      },
    });
  },
}));

export default useProductStore;
