// src/app/penjual/dashboard/products/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import useStoreStore from '@/store/storeStore';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProductList from '@/components/dashboard/ProductList';

export default function ProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated, needsToCreateStore, hasStore } = useAuth();
  const {
    fetchStoreByUserId,
    store: storeData,
    loading: storeLoading,
    getCurrentStore,
  } = useStoreStore();

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [hasAttemptedStoreFetch, setHasAttemptedStoreFetch] = useState(false);

  // ✅ STEP 1: Initial hydration check - HANYA SEKALI
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []); // Tidak ada dependency

  // ✅ STEP 2: Auth check SETELAH hydration - HANYA SEKALI
  useEffect(() => {
    if (!hasCheckedAuth || isLoading) return;

    console.log('🔍 Checking auth status...');

    if (!isAuthenticated() || user?.role !== 'penjual') {
      console.log('❌ Not authenticated or not penjual, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('✅ User authenticated as penjual');
  }, [hasCheckedAuth, isLoading]); // Minimal dependency

  // ✅ STEP 3: Fetch store data - HANYA SEKALI per user
  useEffect(() => {
    if (
      hasCheckedAuth &&
      !isLoading &&
      user?.role === 'penjual' &&
      user.id &&
      !hasAttemptedStoreFetch &&
      !storeLoading
    ) {
      console.log('🔍 Attempting to fetch store for user:', user.id);
      setHasAttemptedStoreFetch(true);

      fetchStoreByUserId(user.id)
        .then((store) => {
          console.log('✅ Store fetch completed:', store);
        })
        .catch((error) => {
          console.log(
            'ℹ️ Store fetch result (could be normal):',
            error.message,
          );
        });
    }
  }, [
    hasCheckedAuth,
    isLoading,
    user?.id,
    hasAttemptedStoreFetch,
    storeLoading,
  ]); // Stabil

  // ✅ STEP 4: Final redirect check SETELAH store check selesai
  useEffect(() => {
    if (
      hasCheckedAuth &&
      !isLoading &&
      hasAttemptedStoreFetch &&
      !storeLoading &&
      user?.role === 'penjual'
    ) {
      console.log('🔍 Final check - Store status:', {
        hasStore: hasStore(),
        needsToCreateStore: needsToCreateStore(),
        storeData: storeData,
        currentStore: getCurrentStore(),
      });

      if (needsToCreateStore() && !getCurrentStore()) {
        console.log('❌ No store found, redirecting to store creation');
        router.push('/penjual/store');
        return;
      }

      console.log('✅ All checks passed, user can access products');
    }
  }, [
    hasCheckedAuth,
    isLoading,
    hasAttemptedStoreFetch,
    storeLoading,
    user?.role,
    storeData, // Hanya track store data changes
  ]);

  // ✅ RENDERING CONDITIONS

  // Still loading hydration
  if (isLoading || !hasCheckedAuth) {
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

  // Still checking store status
  if (!hasAttemptedStoreFetch || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data toko...</p>
        </div>
      </div>
    );
  }

  // No store found
  if (needsToCreateStore() && !getCurrentStore()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Toko Belum Dibuat
          </h3>
          <p className="text-gray-600 mb-4">
            Anda perlu membuat toko terlebih dahulu sebelum dapat mengelola
            produk.
          </p>
          <button
            onClick={() => router.push('/penjual/store')}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90"
          >
            Buat Toko Sekarang
          </button>
        </div>
      </div>
    );
  }

  // All good, show products
  return (
    <DashboardLayout role="penjual">
      <ProductList />
    </DashboardLayout>
  );
}
