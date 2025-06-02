// src/components/dashboard/ProductModal.js
'use client';

import { useState, useEffect } from 'react';
import { useProductManager, useProduct } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/auth-store';

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  product = null,
}) {
  const { createProduct, updateProduct, loading, error, clearError } =
    useProductManager();
  // const { product } = useProduct();
  const { store } = useAuthStore();

  // Determine if this is edit mode
  const isEditMode = !!product;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    harga: '',
    category_id: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Pre-fill form data when editing
  useEffect(() => {
    console.log('Ini props', product);
    if (isEditMode && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        harga: product.harga?.toString() || '',
        category_id: product.category_id?.toString() || '',
      });

      console.log('Ini dari edit ?', product.images);

      // Set existing images for edit mode
      if (product.images && product.images.length > 0) {
        setExistingImages(product.images);
      }
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        harga: '',
        category_id: '',
      });
      setExistingImages([]);
      setImagesToDelete([]);
    }
  }, [isEditMode, product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke URL for removed preview
    URL.revokeObjectURL(imagePreviews[index]);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (imageToRemove) => {
    setImagesToDelete((prev) => [...prev, imageToRemove]);
    setExistingImages((prev) => prev.filter((img) => img !== imageToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      if (isEditMode) {
        // Update existing product
        const updateData = {
          ...formData,
        };

        // Include image changes if any
        if (images.length > 0 || imagesToDelete.length > 0) {
          updateData.imagesToDelete = imagesToDelete;
        }

        await updateProduct(
          product.slug,
          updateData,
          images.length > 0 ? images : null,
        );
      } else {
        // Create new product
        const productData = {
          ...formData,
          store_id: store?.id?.toString() || store?.store_id?.toString(),
        };
        await createProduct(productData, images);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        harga: '',
        category_id: '',
      });
      setImages([]);
      setImagePreviews([]);
      setExistingImages([]);
      setImagesToDelete([]);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleClose = () => {
    // Revoke all preview URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setImages([]);
    setExistingImages([]);
    setImagesToDelete([]);
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga *
              </label>
              <input
                type="number"
                name="harga"
                value={formData.harga}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category ID *
              </label>
              <input
                type="number"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
                placeholder="Masukkan ID kategori"
              />
            </div>
          </div>

          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEditMode ? 'Tambah Gambar Baru' : 'Gambar Produk'}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Pilih beberapa gambar (maksimal 5)
            </p>
          </div>

          {/* Current Images (Edit Mode) */}
          {isEditMode && existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Saat Ini
              </label>
              <div className="grid grid-cols-3 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${image.image}`}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image.image)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {imagesToDelete.length > 0 && (
                <p className="text-sm text-red-600 mt-2">
                  {imagesToDelete.length} gambar akan dihapus
                </p>
              )}
            </div>
          )}

          {/* New Image Previews */}
          {imagePreviews.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isEditMode ? 'Preview Gambar Baru' : 'Preview Gambar'}
              </label>
              <div className="grid grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : isEditMode ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
