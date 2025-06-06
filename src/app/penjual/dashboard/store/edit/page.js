// src/app/penjual/dashboard/store/edit/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useStoreData, useStoreHooks } from '@/hooks/useStore';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ImageUploadField from '@/components/micro/UploadImage';
import { useToast } from '@/components/ui/Toast';
import useStoreStore from '@/store/storeStore';

export default function EditStorePage() {
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated, needsToCreateStore } = useAuth();
  const { store, hasStore, loading: storeLoading } = useStoreData();
  const {
    updateStoreData,
    loading: updateLoading,
    error,
    clearAllErrors,
  } = useStoreHooks();

  const { fetchStoreByID, store: storeData } = useStoreStore();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    whatsapp: '',
    alamat: '',
    avatar: '',
    banner: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Loading state untuk initial check
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Upload states for images
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [bannerError, setBannerError] = useState('');

  // Initial hydration check
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Auth check
  useEffect(() => {
    if (!hasCheckedAuth || isLoading) return;

    if (!isAuthenticated() || user?.role !== 'penjual') {
      router.push('/login');
      return;
    }

    // Jika belum punya toko, redirect ke create store
    if (needsToCreateStore()) {
      router.push('/penjual/store');
      return;
    }
  }, [
    hasCheckedAuth,
    isLoading,
    isAuthenticated,
    user,
    needsToCreateStore,
    router,
  ]);

  useEffect(() => {
    fetchStoreByID(store.id);
  }, [fetchStoreByID]);

  // Pre-fill form dengan data toko yang ada
  useEffect(() => {
    if (storeData && hasStore) {
      setFormData({
        name: storeData.name || '',
        description: storeData.description || '',
        whatsapp: storeData.whatsapp || '',
        alamat: storeData.alamat || '',
        avatar: storeData.avatar || '',
        banner: storeData.banner || '',
      });
    }
  }, [storeData, hasStore]);

  useEffect(() => {
    console.log('Ini toko ', storeData);
  });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      clearAllErrors();
    }
  };

  // Handle avatar file selection
  const handleAvatarFileSelect = async (file, error) => {
    if (error) {
      setAvatarError(error.message);
      return;
    }

    setAvatarError('');

    if (file) {
      setAvatarUploading(true);
      try {
        // Here you would typically upload the file to your server
        // For now, we'll just create a local URL
        const imageUrl = URL.createObjectURL(file);

        setFormData((prev) => ({
          ...prev,
          avatar: imageUrl,
        }));

        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success('Avatar berhasil diunggah!');
      } catch (err) {
        setAvatarError('Gagal mengunggah avatar');
        toast.error('Gagal mengunggah avatar');
      } finally {
        setAvatarUploading(false);
      }
    } else {
      // File removed
      setFormData((prev) => ({
        ...prev,
        avatar: '',
      }));
    }
  };

  // Handle banner file selection
  const handleBannerFileSelect = async (file, error) => {
    if (error) {
      setBannerError(error.message);
      return;
    }

    setBannerError('');

    if (file) {
      setBannerUploading(true);
      try {
        // Here you would typically upload the file to your server
        // For now, we'll just create a local URL
        const imageUrl = URL.createObjectURL(file);

        setFormData((prev) => ({
          ...prev,
          banner: imageUrl,
        }));

        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success('Banner berhasil diunggah!');
      } catch (err) {
        setBannerError('Gagal mengunggah banner');
        toast.error('Gagal mengunggah banner');
      } finally {
        setBannerUploading(false);
      }
    } else {
      // File removed
      setFormData((prev) => ({
        ...prev,
        banner: '',
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validasi form
      if (
        !formData.name.trim() ||
        !formData.description.trim() ||
        !formData.whatsapp.trim() ||
        !formData.alamat.trim()
      ) {
        toast.error('Semua field harus diisi!');
        setIsSubmitting(false);
        return;
      }

      console.log('Updating store with data:', formData);

      // Update store
      await updateStoreData(formData);

      toast.success('Toko berhasil diperbarui!');

      // Redirect ke dashboard setelah berhasil
      setTimeout(() => {
        router.push('/penjual/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Error updating store:', err);
      toast.error(err.message || 'Gagal memperbarui toko');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/penjual/dashboard');
  };

  // Loading states
  if (isLoading || !hasCheckedAuth || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated() || user?.role !== 'penjual') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // No store found
  if (!hasStore || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Toko tidak ditemukan. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout role="penjual">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Informasi Toko
          </h1>
          <p className="text-gray-600 mt-2">
            Perbarui informasi toko Anda untuk meningkatkan kepercayaan
            pelanggan
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar Upload */}
              <ImageUploadField
                label="Logo/Avatar Toko"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                onFileSelect={handleAvatarFileSelect}
                uploading={avatarUploading}
                error={avatarError}
                placeholder="Klik untuk mengunggah logo toko"
                helpText="PNG, JPG, GIF, WEBP hingga 5MB"
                previewHeight="h-32"
                maxSize={5 * 1024 * 1024}
              />

              {/* Banner Upload */}
              <ImageUploadField
                label="Banner Toko"
                name="banner"
                value={formData.banner}
                onChange={handleInputChange}
                onFileSelect={handleBannerFileSelect}
                uploading={bannerUploading}
                error={bannerError}
                placeholder="Klik untuk mengunggah banner toko"
                helpText="PNG, JPG, GIF, WEBP hingga 5MB. Rasio 16:9 direkomendasikan"
                previewHeight="h-40"
                maxSize={5 * 1024 * 1024}
              />
            </div>

            {/* Nama Toko */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Toko *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Contoh: Batik Nusantara"
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Deskripsi Toko *
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Ceritakan tentang toko batik Anda..."
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Deskripsikan produk unggulan, keunikan, dan nilai-nilai toko
                Anda
              </p>
            </div>

            {/* WhatsApp */}
            <div>
              <label
                htmlFor="whatsapp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nomor WhatsApp *
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Contoh: +6281234567890"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Gunakan format internasional dengan kode negara (+62)
              </p>
            </div>

            {/* Alamat */}
            <div>
              <label
                htmlFor="alamat"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Alamat Toko *
              </label>
              <textarea
                id="alamat"
                name="alamat"
                rows="3"
                value={formData.alamat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Alamat lengkap toko Anda..."
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isSubmitting || updateLoading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  updateLoading ||
                  avatarUploading ||
                  bannerUploading
                }
                className={`px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary ${
                  isSubmitting ||
                  updateLoading ||
                  avatarUploading ||
                  bannerUploading
                    ? 'opacity-70 cursor-not-allowed'
                    : ''
                }`}
              >
                {isSubmitting || updateLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Menyimpan...
                  </div>
                ) : avatarUploading || bannerUploading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Mengunggah gambar...
                  </div>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>

          {/* Info Note */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Tips</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Gunakan foto berkualitas tinggi untuk avatar dan banner
                      toko
                    </li>
                    <li>
                      Deskripsi yang jelas dan menarik akan meningkatkan
                      kepercayaan pelanggan
                    </li>
                    <li>
                      Pastikan nomor WhatsApp aktif untuk memudahkan komunikasi
                      dengan pelanggan
                    </li>
                    <li>
                      Avatar toko sebaiknya berukuran persegi (1:1), banner
                      sebaiknya rasio 16:9
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
