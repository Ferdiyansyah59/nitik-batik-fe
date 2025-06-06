// src/store/productStore.js - BAGIAN ATAS SAJA (replace bagian API config)
import { create } from 'zustand';
import axios from 'axios';

// ✅ PERBAIKAN: API URL yang lebih robust
const API_URL =
  process.env.NEXT_PUBLIC_API_ROUTE ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'http://localhost:8081/api';

console.log('🔧 Product Store API URL:', API_URL);

// Create axios instance dengan timeout
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ PERBAIKAN: Add request interceptor dengan error handling
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    console.log('📡 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// ✅ PERBAIKAN: Add response interceptor untuk debugging
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
      baseURL: error.config?.baseURL,
    });
    return Promise.reject(error);
  },
);

const useProductStore = create((set, get) => ({
  // ✅ PERBAIKAN: Pastikan products selalu array, tidak pernah null
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

  // ✅ Fetch products by store ID dengan error handling yang lebih baik
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

  // ✅ Fetch product by slug
  fetchProductBySlug: async (slug) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/product/detail/${slug}`);

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

  // ✅ Create product (for authenticated users)
  createProduct: async (productData, images) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();

      // Add product data
      Object.keys(productData).forEach((key) => {
        formData.append(key, productData[key]);
      });

      // Add images
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await axiosInstance.post('/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status) {
        set({ loading: false });
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to create product',
        loading: false,
      });
      throw error;
    }
  },

  // ✅ Update product
  updateProduct: async (slug, productData, images = null) => {
    set({ loading: true, error: null });
    try {
      let requestData;
      let requestConfig = {};

      if (images && images.length > 0) {
        // If images are provided, use FormData
        const formData = new FormData();

        // Add product data
        Object.keys(productData).forEach((key) => {
          if (productData[key] !== null && productData[key] !== undefined) {
            formData.append(key, productData[key]);
          }
        });

        // Add images
        images.forEach((image) => {
          formData.append('images', image);
        });

        requestData = formData;
        requestConfig.headers = {
          'Content-Type': 'multipart/form-data',
        };
      } else {
        // If no images, send JSON
        requestData = productData;
        requestConfig.headers = {
          'Content-Type': 'application/json',
        };
      }

      const response = await axiosInstance.put(
        `/product/${slug}`,
        requestData,
        requestConfig,
      );

      if (response.data.status) {
        set({ loading: false });
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to update product',
        loading: false,
      });
      throw error;
    }
  },

  // ✅ Delete product
  deleteProduct: async (slug) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/product/${slug}`);

      if (response.data.status) {
        // Remove from current products list
        const currentProducts = get().products || [];
        const updatedProducts = currentProducts.filter((p) => p.slug !== slug);

        set({
          products: updatedProducts,
          loading: false,
        });
        return true;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to delete product',
        loading: false,
      });
      throw error;
    }
  },

  // Public: fetch latest product
  fetchLatestProduct: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get('/latest-products');
      if (res.data.status) {
        set({ loading: false, products: res.data.data });
        console.log('Success fetching latest products ', res.data.data);
      } else {
        set({ loading: false, product: null });
        console.log('Success fetching data but no data latest products');
      }
    } catch (error) {
      console.error('Error fetching latest product product:', error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to delete product',
        loading: false,
      });
      throw error;
    }
  },

  // Public: fetch all product
  fetchAllPublicProduct: async (storeId, page = 1, limit = 12, search = '') => {
    set({ loading: true, error: null });

    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await axiosInstance.get(`/products`, {
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

  // ✅ Clear products (useful for switching stores)
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

  // Change pagination
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
