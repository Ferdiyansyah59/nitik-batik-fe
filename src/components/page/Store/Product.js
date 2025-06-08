// src/components/page/Store/Product.js - FIXED VERSION
'use client';
import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import SectionSubtitle from '@/components/micro/SectionSubtitle';
import Description from '@/components/micro/Description';
import Link from 'next/link';

const Product = forwardRef((props, ref) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    getLatestProduct,
    products,
    loading,
    error,
    clearCache,
    resetFetchState,
  } = useProducts();

  // ✅ State untuk track component lifecycle
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef(null);

  // ✅ Cleanup function yang lebih robust
  const cleanup = () => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
    clearCache();
    resetFetchState();
    setHasInitialFetch(false);
    setRetryCount(0);
  };

  // ✅ Reset semua state saat component mount/unmount
  useEffect(() => {
    console.log('🔄 Product component mounting, clearing state');

    // Reset semua state
    cleanup();
    setIsComponentMounted(true);
    isMountedRef.current = true;

    return () => {
      console.log('🔄 Product component unmounting, cleaning up');
      isMountedRef.current = false;
      cleanup();
    };
  }, []); // ✅ No dependencies - hanya jalankan sekali saat mount

  // ✅ Reset state saat pathname berubah (navigasi)
  useEffect(() => {
    console.log('🔄 Pathname changed:', pathname);
    cleanup();
    setIsComponentMounted(true);

    // Small delay untuk memastikan cleanup selesai
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setHasInitialFetch(false);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  // ✅ Fetch data dengan retry logic yang lebih baik
  const fetchProductsWithRetry = async (attempt = 0) => {
    const MAX_RETRIES = 3;

    if (!isMountedRef.current || hasInitialFetch) {
      console.log(
        '🛑 Fetch cancelled - component unmounted or already fetched',
      );
      return;
    }

    try {
      console.log(
        `🔍 Fetching products (attempt ${attempt + 1}/${MAX_RETRIES})`,
      );

      // Force refresh untuk memastikan data fresh
      const result = await getLatestProduct(true);

      if (!isMountedRef.current) return;

      if (result && Array.isArray(result) && result.length > 0) {
        console.log('✅ Products fetched successfully:', result.length);
        setHasInitialFetch(true);
        setRetryCount(0);
      } else if (attempt < MAX_RETRIES - 1) {
        console.log('⏳ No data received, retrying...');
        setRetryCount(attempt + 1);

        fetchTimeoutRef.current = setTimeout(
          () => {
            if (isMountedRef.current) {
              fetchProductsWithRetry(attempt + 1);
            }
          },
          1000 * (attempt + 1),
        ); // Incremental delay
      } else {
        console.log('⚠️ Max retries reached, stopping fetch attempts');
        setHasInitialFetch(true);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);

      if (!isMountedRef.current) return;

      if (attempt < MAX_RETRIES - 1) {
        console.log('⏳ Retrying after error...');
        setRetryCount(attempt + 1);

        fetchTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            fetchProductsWithRetry(attempt + 1);
          }
        }, 2000);
      } else {
        console.log('💥 Max retries reached after errors');
        setHasInitialFetch(true);
      }
    }
  };

  // ✅ Trigger fetch hanya saat component sudah mount dan belum fetch
  useEffect(() => {
    if (isComponentMounted && !hasInitialFetch && !loading) {
      console.log('🚀 Starting initial fetch');

      // Small delay untuk memastikan component fully ready
      const timer = setTimeout(() => {
        if (isMountedRef.current && !hasInitialFetch) {
          fetchProductsWithRetry(0);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isComponentMounted, hasInitialFetch, loading]);

  // ✅ Safe products array
  const safeProducts = React.useMemo(() => {
    const result = Array.isArray(products) ? products : [];
    console.log('🔍 Rendering with products:', result.length);
    return result;
  }, [products]);

  // ✅ Manual refresh handler
  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    cleanup();
    setHasInitialFetch(false);
    setRetryCount(0);

    // Small delay lalu fetch ulang
    setTimeout(() => {
      if (isMountedRef.current) {
        fetchProductsWithRetry(0);
      }
    }, 100);
  };

  // ✅ Color mapping untuk categories
  const dataWarna = {
    'kemeja-batik': { bgColor: 'from-amber-200 to-amber-100' },
    'blus-batik': { bgColor: 'from-rose-200 to-rose-100' },
    'kaos-batik': { bgColor: 'from-teal-200 to-teal-100' },
    'celana-batik': { bgColor: 'from-indigo-200 to-indigo-100' },
    'rok-batik': { bgColor: 'from-fuchsia-200 to-fuchsia-100' },
    'kain-batik': { bgColor: 'from-amber-300 to-amber-200' },
    default: { bgColor: 'from-gray-200 to-gray-100' },
  };

  const getColorByCategory = (categorySlug) => {
    return dataWarna[categorySlug] || dataWarna.default;
  };

  // ✅ Format currency
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // ✅ Loading state yang lebih informatif
  if (!hasInitialFetch || (loading && safeProducts.length === 0)) {
    return (
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <SectionSubtitle title="Katalog Produk Batik Untukmu" />
          <Description text="Eksplorasi koleksi batik terbaik dari pengrajin lokal Indonesia" />
        </div>

        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Memuat produk...
              {retryCount > 0 && ` (Percobaan ${retryCount + 1})`}
            </p>

            {/* Emergency refresh button */}
            {retryCount > 1 && (
              <button
                onClick={handleManualRefresh}
                className="mt-4 px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 text-sm"
              >
                Coba Lagi
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ✅ Error state
  if (error && safeProducts.length === 0) {
    return (
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <SectionSubtitle title="Katalog Produk Batik Untukmu" />
          <Description text="Eksplorasi koleksi batik terbaik dari pengrajin lokal Indonesia" />
        </div>

        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-4">
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
            <p className="text-gray-600 mb-4">Gagal memuat produk</p>
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ✅ Empty state
  if (safeProducts.length === 0) {
    return (
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <SectionSubtitle title="Katalog Produk Batik Untukmu" />
          <Description text="Eksplorasi koleksi batik terbaik dari pengrajin lokal Indonesia" />
        </div>

        <div className="flex justify-center items-center py-12">
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
            <p className="text-gray-600 mb-4">Produk akan segera hadir</p>
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ✅ Main content dengan products
  return (
    <section ref={ref} className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <SectionSubtitle title="Katalog Produk Batik Untukmu" />
        <Description text="Eksplorasi koleksi batik terbaik dari pengrajin lokal Indonesia" />

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 mt-2">
            Products: {safeProducts.length} | Has Fetched:{' '}
            {hasInitialFetch.toString()} | Retries: {retryCount}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {safeProducts.map((item, idx) => {
          const colorConfig = getColorByCategory(item.category_slug);

          return (
            <div
              key={item.id || item.slug || `product-${idx}`}
              className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Product Image Container */}
              <div className="relative h-48 md:h-56 bg-gray-100 overflow-hidden">
                {item.thumbnail ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${item.thumbnail}`}
                    alt={item.name || 'Product Image'}
                    className="w-full h-full object-contain object-center transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Image load error:', e.target.src);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg
                      className="w-16 h-16 text-gray-400"
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

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                  <Link
                    href={`/store/detail-product/${item.slug}`}
                    className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-500 hover:text-white transition-colors duration-300"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-gray-500 font-medium">
                    {item.store_name || 'Unknown Store'}
                  </p>
                  <div
                    className={`bg-gradient-to-b ${colorConfig.bgColor} px-2 py-1 rounded-sm`}
                  >
                    <p className="text-xs">
                      {item.category_name || 'Kategori'}
                    </p>
                  </div>
                </div>

                <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 h-12">
                  {item.name || 'Nama Produk'}
                </h3>

                <div className="mt-2">
                  <span className="text-amber-800 font-bold">
                    {formatRupiah(item.harga)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* "See More" Button */}
      <div className="text-center mt-8">
        <Link
          href="/store/products"
          className="bg-amber-800 hover:bg-amber-900 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Katalog Batik Lainnya
        </Link>
      </div>
    </section>
  );
});

export default Product;
