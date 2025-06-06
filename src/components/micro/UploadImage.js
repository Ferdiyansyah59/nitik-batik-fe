'use client';

import { useState, useRef } from 'react';

export default function ImageUploadField({
  label,
  name,
  value,
  onChange,
  onFileSelect, // Callback untuk handle file yang dipilih
  required = false,
  error,
  uploading = false, // Status uploading dari parent component
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  placeholder = 'Click to upload or drag and drop',
  helpText = 'PNG, JPG, GIF, WEBP up to 5MB',
  previewHeight = 'h-48', // Tailwind class untuk height preview
}) {
  const [preview, setPreview] = useState(value || null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      const allowedFormats = acceptedTypes
        .map((type) => type.split('/')[1].toUpperCase())
        .join(', ');

      if (onFileSelect) {
        onFileSelect(null, {
          type: 'validation',
          message: `Silakan pilih file gambar yang valid (${allowedFormats})`,
        });
      }
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      if (onFileSelect) {
        onFileSelect(null, {
          type: 'validation',
          message: `Ukuran file harus kurang dari ${maxSizeMB}MB`,
        });
      }
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Call parent callback with file
    if (onFileSelect) {
      onFileSelect(file, null);
    }

    // Create synthetic event for onChange compatibility
    const syntheticEvent = {
      target: {
        name: name,
        value: file,
        files: [file],
      },
    };

    if (onChange) {
      onChange(syntheticEvent);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  // Handle remove image
  const handleRemove = () => {
    // Revoke preview URL to prevent memory leaks
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Call parent callback
    if (onFileSelect) {
      onFileSelect(null, null);
    }

    // Create synthetic event for onChange compatibility
    const syntheticEvent = {
      target: {
        name: name,
        value: null,
        files: [],
      },
    };

    if (onChange) {
      onChange(syntheticEvent);
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  // Get preview source - FIXED VERSION
  const getPreviewSrc = () => {
    if (!preview) return null;

    // If it's a blob URL (newly selected file from frontend)
    if (preview.startsWith('blob:')) {
      return preview;
    }

    // If it's already a full URL (http/https)
    if (preview.startsWith('http')) {
      return preview;
    }

    // If it's a relative path from backend, add the API URL
    if (preview.startsWith('/') || preview.includes('uploads/')) {
      return `${process.env.NEXT_PUBLIC_API_URL}${preview.startsWith('/') ? preview : '/' + preview}`;
    }

    // For other relative paths, add API URL
    return `${process.env.NEXT_PUBLIC_API_URL}/${preview}`;
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {!preview ? (
        <div className="mt-1">
          <label className="block">
            <div
              className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                dragOver
                  ? 'border-blue-400 bg-blue-50'
                  : uploading
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <svg
                  className={`mx-auto h-12 w-12 ${
                    uploading ? 'text-gray-300' : 'text-gray-400'
                  }`}
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
                    <span className="text-blue-600">Mengunggah...</span>
                  ) : (
                    <>
                      <span className="font-medium">{placeholder}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">{helpText}</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleInputChange}
                disabled={uploading}
              />
            </div>
          </label>
        </div>
      ) : (
        <div className="mt-1">
          <div className="relative rounded-lg overflow-hidden border border-gray-300">
            <img
              src={getPreviewSrc()}
              alt="Preview"
              className={`w-full ${previewHeight} object-cover`}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Hapus Gambar
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Klik pada gambar untuk menghapus dan mengunggah yang baru
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
              <span className="text-sm text-blue-600">
                Mengunggah gambar...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
