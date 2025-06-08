// src/app/penjual/store/page.js
'use client';
import { useStoreHooks } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function Store() {
  const router = useRouter();
  const {
    user,
    hasStore,
    needsToCreateStore,
    isLoading,
    isLoadingStore,
    createStoreAndRedirect,
  } = useAuth();

  const {
    createStoreRedirect,
    loading: storeActionLoading,
    error,
    clearAllErrors,
    currentStore,
  } = useStoreHooks();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    whatsapp: '',
    alamat: '',
  });

  const [debugInfo, setDebugInfo] = useState({});

  // ✅ Debug information
  useEffect(() => {
    const info = {
      user: user,
      hasStore: hasStore(),
      needsToCreateStore: needsToCreateStore(),
      isLoading,
      isLoadingStore,
      currentStore,
      timestamp: new Date().toISOString(),
    };
    setDebugInfo(info);
    console.log('Store page debug info:', info);
  }, [
    user,
    hasStore,
    needsToCreateStore,
    isLoading,
    isLoadingStore,
    currentStore,
  ]);

  // ✅ Protect route - hanya penjual yang bisa akses
  useEffect(() => {
    if (user && user.role !== 'penjual') {
      console.log('Non-seller trying to access store creation, redirecting...');
      router.push('/');
    }
  }, [user, router]);

  // ✅ Redirect jika user sudah punya toko (tapi tunggu loading selesai)
  useEffect(() => {
    if (!isLoading && !isLoadingStore && user?.role === 'penjual') {
      if (hasStore()) {
        console.log('User already has store, redirecting to dashboard...');
        router.push('/penjual/dashboard');
      }
    }
  }, [isLoading, isLoadingStore, user, hasStore, router]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.whatsapp.trim() ||
      !formData.alamat.trim()
    ) {
      alert('Semua field harus diisi!');
      return;
    }

    try {
      console.log('Creating store with data:', formData);

      // ✅ Gunakan method dari storeHooks yang akan handle redirect
      await createStoreRedirect(formData);

      console.log('Store created successfully');
    } catch (err) {
      console.error('Error creating store:', err);
    }
  };

  // ✅ Show loading jika masih cek auth atau store status
  if (isLoading || isLoadingStore) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoadingStore ? 'Checking store status...' : 'Loading...'}
          </p>

          {/* ✅ Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-500 max-w-md mx-auto">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ✅ Show loading jika user sudah punya toko dan akan redirect
  if (!needsToCreateStore()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            You already have a store. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Buat Toko Batik Anda
          </h1>
          <p className="text-gray-600">
            Lengkapi informasi di bawah untuk membuat toko batik Anda
          </p>
        </div>

        {/* ✅ Error Alert */}
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
                <h3 className="text-sm font-medium">Terjadi Kesalahan</h3>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={storeActionLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={storeActionLoading}
              className={`px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary ${
                storeActionLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {storeActionLoading ? (
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
                  Membuat Toko...
                </div>
              ) : (
                'Buat Toko'
              )}
            </button>
          </div>
        </form>

        {/* ✅ Info Note */}
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
              <h3 className="text-sm font-medium text-blue-800">Informasi</h3>
              <p className="mt-1 text-sm text-blue-700">
                Setelah toko dibuat, Anda dapat menambahkan produk dan mengelola
                toko melalui dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Store;
