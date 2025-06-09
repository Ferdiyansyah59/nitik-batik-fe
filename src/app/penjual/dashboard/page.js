// src/app/penjual/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useStoreData } from '@/hooks/useStore';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useProducts } from '@/hooks/useProducts';
import { Link } from 'lucide-react';
import Image from 'next/image';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, needsToCreateStore } = useAuth();
  const { store, hasStore, loading: storeLoading } = useStoreData();

  // ✅ Loading state untuk menunggu rehydration
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // ✅ Delay untuk menunggu zustand rehydration
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // console.log('inI TOKO', store.id);
    // ✅ Check auth dan store status setelah loading selesai
    if (!isLoading && hasCheckedAuth) {
      if (!isAuthenticated() || user?.role !== 'penjual') {
        router.push('/login');
        return;
      }

      // ✅ Redirect ke halaman buat toko jika belum punya toko
      if (needsToCreateStore()) {
        router.push('/penjual/store');
        return;
      }
    }
  }, [
    isLoading,
    hasCheckedAuth,
    isAuthenticated,
    user,
    needsToCreateStore,
    router,
  ]);

  // ✅ Show loading saat menunggu rehydration
  if (isLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Show loading jika masih checking auth
  if (!hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse bg-gray-200 h-12 w-48 rounded mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ✅ Redirect jika user belum punya toko
  if (needsToCreateStore()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to store creation...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout role="penjual">
      <div className="space-y-6">
        {/* ✅ Welcome Section dengan info toko */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Selamat datang, {user?.name}!
              </h1>
              {store && (
                <div className="mt-2">
                  <p className="text-lg text-gray-700 font-medium">
                    {store.name}
                  </p>
                  <p className="text-gray-600">{store.description}</p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <span>📱 {store.whatsapp}</span>
                    <span>📍 {store.alamat}</span>
                  </div>
                </div>
              )}
            </div>
            {/* ✅ Store Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/store/${store.id}`)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm"
              >
                Lihat Toko
              </button>
              <button
                onClick={() => router.push('/penjual/dashboard/store/edit')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              >
                Edit Toko
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Store Performance Chart */}
        <ProductGrid />
      </div>
    </DashboardLayout>
  );
}

const ProductGrid = () => {
  const { products, loading, isEmpty, formatPrice } = useProducts();

  // ✅ Ambil hanya 8 produk pertama
  const limitedProducts = products.slice(0, 8);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Produk Terbaru Anda</h2>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat produk...</p>
          </div>
        </div>
      ) : isEmpty ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum Ada Produk
            </h3>
            <p className="text-gray-600">
              Mulai dengan menambahkan produk pertama Anda
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {limitedProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative h-32 bg-gray-100">
                {product.thumbnail ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${product.thumbnail}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-primary">
                  {formatPrice(product.harga)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
