'use client';

import { useState, useRef } from 'react';
import { apiClient } from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth-store';

export default function ImageUploadField({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  uploadEndpoint = '/upload', // Use relative path
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload to server using apiClient which includes auth token
      const response = await apiClient.upload(uploadEndpoint, file, 'image');

      // Assuming the API returns { url: "path/to/image.jpg" }
      const imageUrl = response.data.data.imageUrl;

      // Set preview
      setPreview(imageUrl);
      console.log('Ini gambar ', response.data.data.imageUrl);

      // Call onChange with the URL
      const syntheticEvent = {
        target: {
          name: name,
          value: imageUrl,
        },
      };
      onChange(syntheticEvent);

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to upload image. Please try again.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const syntheticEvent = {
      target: {
        name: name,
        value: '',
      },
    };
    onChange(syntheticEvent);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {!preview ? (
        <div className="mt-1">
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {uploading ? (
                    <span className="text-blue-600">Uploading...</span>
                  ) : (
                    <>
                      <span className="font-medium">Click to upload</span> or
                      drag and drop
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF, WEBP up to 5MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </div>
          </label>
        </div>
      ) : (
        <div className="mt-1">
          <div className="relative rounded-lg overflow-hidden border border-gray-300">
            <img
              src={
                preview.startsWith('http')
                  ? preview
                  : process.env.NEXT_PUBLIC_API_URL ||
                    `http://localhost:8081${preview}`
              }
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove Image
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click on image to remove and upload a new one
          </p>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {uploading && (
        <div className="mt-2">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
            <div className="flex items-center">
              <svg
                className="animate-spin h-4 w-4 text-blue-600 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm text-blue-600">Uploading image...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
