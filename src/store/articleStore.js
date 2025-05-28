import { create } from 'zustand';
import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_ROUTE || 'http://localhost:8081/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or get from auth store
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const useArticleStore = create((set) => ({
  articles: [],
  article: null,
  pagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,

  // Get all articles
  fetchArticles: async (page = 1, limit = 10, search = '') => {
    set({ loading: true, error: null });
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (search) {
        params.search = search;
      }

      const response = await axiosInstance.get('/articles', { params });

      if (response.data.status) {
        set({
          articles: response.data.data.articles,
          pagination: response.data.data.pagination,
          loading: false,
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch articles',
        loading: false,
      });
      console.error('Error fetching articles:', error);
    }
  },

  // Get article by slug
  fetchArticleBySlug: async (slug) => {
    set({ loading: true, error: null, article: null });
    try {
      const response = await axiosInstance.get(`/articles/slug/${slug}`);

      if (response.data.status) {
        set({ article: response.data.data, loading: false });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch article',
        loading: false,
      });
      console.error('Error fetching article:', error);
    }
  },

  // Create article
  createArticle: async (articleData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/articles', articleData);

      if (response.data.status) {
        // Refresh articles list
        const { fetchArticles } = useArticleStore.getState();
        await fetchArticles();
        set({ loading: false });
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to create article',
        loading: false,
      });
      console.error('Error creating article:', error);
      throw error;
    }
  },

  // Update article
  updateArticle: async (id, articleData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(`/articles/${id}`, articleData);

      if (response.data.status) {
        // Refresh articles list
        const { fetchArticles } = useArticleStore.getState();
        await fetchArticles();
        set({ loading: false });
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to update article',
        loading: false,
      });
      console.error('Error updating article:', error);
      throw error;
    }
  },

  // Delete article
  deleteArticle: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/articles/${id}`);

      if (response.data.status) {
        // Refresh articles list
        const { fetchArticles } = useArticleStore.getState();
        await fetchArticles();
        set({ loading: false });
        return true;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to delete article',
        loading: false,
      });
      console.error('Error deleting article:', error);
      throw error;
    }
  },

  // Search articles
  searchArticles: async (query, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const params = {
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      };

      const response = await axiosInstance.get('/articles/search', { params });

      if (response.data.status) {
        set({
          articles: response.data.data.articles,
          pagination: response.data.data.pagination,
          loading: false,
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to search articles',
        loading: false,
      });
      console.error('Error searching articles:', error);
    }
  },

  // Upload image
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        'http://localhost:8081/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.status || response.data.url) {
        return (
          response.data.url || response.data.path || response.data.imageUrl
        );
      } else {
        throw new Error(response.data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Change pagination
  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useArticleStore;
