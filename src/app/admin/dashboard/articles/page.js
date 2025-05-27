'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DataTable from '@/components/dashboard/DataTable';
import useArticleStore from '@/store/articleStore';
import axios from 'axios';
import ImageUploadField from '@/components/dashboard/ImageUploadField';
import { useToast } from '@/components/ui/Toast';
import TiptapEditor from '@/components/micro/TiptapEditor';
import EditorDecoupledWrapper from '@/components/micro/CKEditorDecoupledWrapper';

// Dynamic import FormModal to avoid SSR issues with TiptapEditor
const FormModal = dynamic(
  () => import('@/components/dashboard/FormModal').then((mod) => mod.default),
  { ssr: false },
);

const FormField = dynamic(
  () => import('@/components/dashboard/FormModal').then((mod) => mod.FormField),
  { ssr: false },
);

export default function AdminArticlesPage() {
  const { articles, loading, fetchArticles } = useArticleStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    description: '',
    imageUrl: '',
  });

  const API_ENDPOINT = 'http://localhost:8081';

  // Configure axios defaults
  useEffect(() => {
    // Set default headers if needed
    const token = localStorage.getItem('token'); // or get from your auth store
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    fetchArticles(1, 100); // Fetch all articles
  }, [fetchArticles]);

  // Table columns configuration
  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value, item) => (
        <div className="flex items-center">
          {item.imageUrl && (
            <img
              src={
                item.imageUrl.startsWith('http')
                  ? item.imageUrl
                  : `${API_ENDPOINT}${item.imageUrl}`
              }
              alt={value}
              className="w-10 h-10 rounded object-cover mr-3"
            />
          )}
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
    },
    {
      key: 'created_At',
      label: 'Created Date',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = editingArticle
        ? `${API_ENDPOINT}/api/articles/${editingArticle.id}`
        : `${API_ENDPOINT}/api/articles`;

      const response = editingArticle
        ? await axios.put(endpoint, formData)
        : await axios.post(endpoint, formData);

      if (response.status === 200 || response.status === 201) {
        // Show success message
        toast.success(
          editingArticle
            ? 'Article updated successfully!'
            : 'Article created successfully!',
        );

        // Refresh data
        fetchArticles(1, 100);
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to save article. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add new
  const handleAdd = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      description: '',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || '',
      slug: article.slug || '',
      excerpt: article.excerpt || '',
      description: article.description || '',
      imageUrl: article.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await axios.delete(
          `${API_ENDPOINT}/api/articles/${id}`,
        );

        if (response.status === 200) {
          toast.success('Article deleted successfully!');
          fetchArticles(1, 100);
        }
      } catch (error) {
        console.error('Error deleting article:', error);
        toast.error(
          error.response?.data?.message ||
            'Failed to delete article. Please try again.',
        );
      }
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      description: '',
      imageUrl: '',
    });
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title
    if (name === 'title' && !editingArticle) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Articles Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all articles in the system
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Total Articles</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={articles}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchPlaceholder="Search articles..."
          addButtonText="Add Article"
        />

        {/* Form Modal */}
        <FormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          title={editingArticle ? 'Edit Article' : 'Add New Article'}
          submitText={editingArticle ? 'Update' : 'Create'}
          size="lg" // Use larger modal for editor
          isLoading={isLoading}
        >
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          <FormField
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
          />

          {/* <FormField
            label="Excerpt"
            name="excerpt"
            type="textarea"
            value={formData.excerpt}
            onChange={handleInputChange}
            placeholder="Short description of the article..."
          /> */}

          {/* <FormField
            label="Content"
            name="description"
            type="editor"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Write your article content here..."
            required
          /> */}

          <TiptapEditor
            onChange={handleInputChange}
            value={formData.description}
            name="description"
          />

          {/* Image Upload Field */}
          <ImageUploadField
            label="Featured Image"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            uploadEndpoint="/api/upload"
          />

          {/* <FormField
            label="Status"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleInputChange}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ]}
          /> */}
        </FormModal>
      </div>
    </DashboardLayout>
  );
}
