// src/components/dashboard/ProductModal.js - SIMPLE FIX
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProductManager } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/auth-store';

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  product = null,
}) {
  const { createProduct, updateProduct, loading, error, clearError } =
    useProductManager();
  const { store } = useAuthStore();

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

  // ✅ SIMPLE FIX: Reset everything when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Cleanup when modal closes
      imagePreviews.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      return;
    }

    // Reset form when modal opens
    if (isEditMode && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        harga: product.harga?.toString() || '',
        category_id: product.category_id?.toString() || '',
      });

      // Set existing images (create new array to prevent reference issues)
      setExistingImages(product.images ? [...product.images] : []);
    } else {
      setFormData({
        name: '',
        description: '',
        harga: '',
        category_id: '',
      });
      setExistingImages([]);
    }

    // Reset other states
    setImages([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    clearError(); // Clear any previous errors
  }, [isOpen, product?.id]); // ✅ Only depend on isOpen and product.id

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Cleanup old previews
    imagePreviews.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    // Create new previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    // Cleanup removed preview
    if (imagePreviews[index] && imagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[index]);
    }

    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (imageToRemove) => {
    const imagePath =
      typeof imageToRemove === 'object' ? imageToRemove.image : imageToRemove;

    setImagesToDelete((prev) => [...prev, imagePath]);
    setExistingImages((prev) =>
      prev.filter((img) => {
        const currentPath = typeof img === 'object' ? img.image : img;
        return currentPath !== imagePath;
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!formData.name.trim() || !formData.harga || !formData.category_id) {
      alert('Nama produk, harga, dan kategori harus diisi');
      return;
    }

    try {
      if (isEditMode) {
        const updateData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          harga: formData.harga,
          category_id: formData.category_id,
        };

        if (imagesToDelete.length > 0) {
          updateData.imagesToDelete = imagesToDelete;
        }

        await updateProduct(
          product.slug,
          updateData,
          images.length > 0 ? images : null,
        );
      } else {
        const productData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          harga: formData.harga,
          category_id: formData.category_id,
          store_id: store?.id?.toString() || store?.store_id?.toString(),
        };

        await createProduct(productData, images);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleClose = () => {
    // Cleanup blob URLs
    imagePreviews.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    clearError();
    onClose();
  };

  // ✅ SIMPLE IMAGE URL HELPER
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('blob:') || imagePath.startsWith('http')) {
      return imagePath;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
    return imagePath.startsWith('/')
      ? `${baseUrl}${imagePath}`
      : `${baseUrl}/${imagePath}`;
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
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Kategori</option>
                <option value="1">Kemeja Batik</option>
                <option value="2">Blus Batik</option>
                <option value="3">Kaos Batik</option>
                <option value="4">Celana Batik</option>
                <option value="5">Rok Batik</option>
                <option value="6">Kain Batik</option>
              </select>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEditMode ? 'Tambah Gambar Baru' : 'Gambar Produk'}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Current Images (Edit Mode) */}
          {isEditMode && existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Saat Ini
              </label>
              <div className="grid grid-cols-3 gap-4">
                {existingImages.map((imageObj, index) => {
                  const imagePath =
                    typeof imageObj === 'object' ? imageObj.image : imageObj;
                  const imageUrl = getImageUrl(imagePath);

                  return (
                    <div key={`existing-${index}`} className="relative">
                      <div className="w-full h-24 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // ✅ SIMPLE ERROR HANDLING - just hide broken images
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display =
                                'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center text-gray-400 text-xs"
                          style={{ display: 'none' }}
                        >
                          Gambar tidak tersedia
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(imageObj)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
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
                Preview Gambar Baru
              </label>
              <div className="grid grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={`preview-${index}`} className="relative">
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
