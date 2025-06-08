// src/components/page/Store/ProductsPageByStore.js - FIXED VERSION
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SectionSubtitle from '@/components/micro/SectionSubtitle';
import Description from '@/components/micro/Description';
import { useStoreProducts } from '@/hooks/useStoreProducts';

// Format harga ke format Rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}

function ProductsPageByStore() {
  // ✅ State untuk input dan search
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const {
    products,
    storeData,
    rawStoreData, // ✅ Untuk debugging
    isStoreDataLoaded, // ✅ Helper untuk check loading
    pagination,
    storeId,

    // States
    loading,
    error,
    hasProducts,
    isEmpty,
    hasError,
    searchQuery,
    isParamsReady,

    // Actions
    fetchProducts,
    refresh,
    searchProducts,
    handlePageChange,
    clearError,
  } = useStoreProducts();

  // ✅ Data warna untuk kategori
  const dataWarna = {
    'kemeja-batik': { bgColor: 'from-amber-200 to-amber-100' },
    'blus-batik': { bgColor: 'from-rose-200 to-rose-100' },
    'kaos-batik': { bgColor: 'from-teal-200 to-teal-100' },
    'celana-batik': { bgColor: 'from-indigo-200 to-indigo-100' },
    'rok-batik': { bgColor: 'from-fuchsia-200 to-fuchsia-100' },
    'kain-batik': { bgColor: 'from-amber-300 to-amber-200' },
  };

  // ✅ Debug effect
  useEffect(() => {
    console.log('🔍 ProductsPageByStore Debug:', {
      storeId,
      isParamsReady,
      isStoreDataLoaded,
      storeDataName: storeData.name,
      rawStoreData,
      productsLength: products?.length,
      loading,
      isEmpty,
    });
  }, [
    storeId,
    isParamsReady,
    isStoreDataLoaded,
    storeData.name,
    rawStoreData,
    products?.length,
    loading,
    isEmpty,
  ]);

  // ✅ Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search triggered with:', inputValue);

    setSearchTerm(inputValue.trim());
    searchProducts(inputValue.trim());
  };

  // ✅ Handle clear search
  const handleClearSearch = () => {
    console.log('Clearing search');
    setInputValue('');
    setSearchTerm('');
    searchProducts('');
  };

  // ✅ Handle key press untuk Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // ✅ Handle pagination
  const handlePagination = (page) => {
    console.log('Page change to:', page);
    handlePageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Generate pagination numbers
  const generatePageNumbers = () => {
    const totalPages = pagination.totalPages;
    const current = pagination.page;
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 4) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 3) pages.push('...');
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  // ✅ Helper untuk get safe image URL
  const getStoreImageUrl = (imagePath) => {
    if (!imagePath) return '/img/placeholder-store.jpg';

    if (imagePath.startsWith('http')) return imagePath;

    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  };

  // ✅ Loading state untuk params - PRIORITAS TERTINGGI
  if (!isParamsReady || !storeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store information...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing store data</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-12 w-12 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={clearError}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Tutup
            </button>
            <button
              onClick={refresh}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      {/* Header Section - Improved Design */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Banner Section */}
          {isStoreDataLoaded && storeData.banner ? (
            <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
              {/* Banner Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${getStoreImageUrl(storeData.banner)})`,
                }}
              >
                {/* Dark Overlay untuk readability */}
                <div className="absolute inset-0 bg-black bg-opacity-60"></div>
              </div>

              {/* Store Info Overlay */}
              <div className="relative z-10 flex items-end h-full">
                <div className="w-full px-4 pb-8">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                    {/* Store Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={getStoreImageUrl(storeData.avatar)}
                        alt={storeData.name}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.src = '/img/placeholder-store.jpg';
                        }}
                      />
                    </div>

                    {/* Store Details */}
                    <div className="text-center md:text-left text-white">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                        {storeData.name}
                      </h1>

                      {storeData.description && (
                        <p className="text-lg md:text-xl mb-4 opacity-90 drop-shadow-md max-w-2xl">
                          {storeData.description}
                        </p>
                      )}

                      {/* Store Contact Info */}
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm opacity-90">
                        {storeData.whatsapp && (
                          <div className="flex items-center bg-white bg-opacity-30 font-medium rounded-full px-3 py-1">
                            <span className="mr-2">📱</span>
                            <span>{storeData.whatsapp}</span>
                          </div>
                        )}
                        {storeData.alamat && (
                          <div className="flex items-center bg-white bg-opacity-30 font-medium rounded-full px-3 py-1">
                            <span className="mr-2">📍</span>
                            <span className="truncate max-w-xs">
                              {storeData.alamat}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No Banner - Clean Layout */
            <div className="px-4 py-16">
              {isStoreDataLoaded ? (
                <div className="text-center">
                  {/* Store Avatar */}
                  {storeData.avatar && (
                    <div className="mb-6">
                      <img
                        src={getStoreImageUrl(storeData.avatar)}
                        alt={storeData.name}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto object-cover border-4 border-primary shadow-lg"
                        onError={(e) => {
                          e.target.src = '/img/placeholder-store.jpg';
                        }}
                      />
                    </div>
                  )}

                  {/* Store Info */}
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {storeData.name}
                  </h1>

                  {storeData.description && (
                    <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                      {storeData.description}
                    </p>
                  )}

                  {/* Store Details */}
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    {storeData.whatsapp && (
                      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                        <span className="mr-2">📱</span>
                        <span>{storeData.whatsapp}</span>
                      </div>
                    )}
                    {storeData.alamat && (
                      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                        <span className="mr-2">📍</span>
                        <span>{storeData.alamat}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Loading Placeholder */
                <div className="text-center">
                  <div className="animate-pulse">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-full mx-auto mb-6"></div>
                    <div className="h-8 md:h-10 bg-gray-300 rounded w-64 md:w-80 mx-auto mb-4"></div>
                    <div className="h-4 md:h-5 bg-gray-300 rounded w-96 max-w-full mx-auto mb-6"></div>
                    <div className="flex justify-center gap-4">
                      <div className="h-8 bg-gray-300 rounded-full w-32"></div>
                      <div className="h-8 bg-gray-300 rounded-full w-48"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari produk batik..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={loading}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Clear button */}
                {inputValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                    aria-label="Clear search"
                  >
                    <svg
                      className="h-5 w-5 text-gray-500 hover:text-gray-700"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            {/* Results Info */}
            <div className="text-sm text-gray-600">
              {isStoreDataLoaded && <span>Produk dari {storeData.name}</span>}
            </div>
          </div>

          {/* Search Info */}
          {searchQuery && (
            <div className="mt-2 text-sm flex items-center justify-between">
              <span>
                Menampilkan hasil untuk{' '}
                <span className="font-medium">"{searchQuery}"</span>
              </span>
              <button
                onClick={handleClearSearch}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Tampilkan semua produk
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            // Loading State
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  Memuat produk dari store...
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Store ID: {storeId}
                </p>
              </div>
            </div>
          ) : isEmpty ? (
            // Empty State
            <div className="text-center py-20">
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
                Tidak Ada Produk
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? `Tidak ditemukan produk untuk pencarian "${searchQuery}"`
                  : 'Store ini belum memiliki produk'}
              </p>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                >
                  Lihat Semua Produk
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {products.map((item, idx) => (
                  <div
                    key={item.id || `product-${idx}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    {/* Product Image Container */}
                    <div className="relative h-48 md:h-56 bg-gray-100 overflow-hidden">
                      <img
                        src={
                          item.thumbnail
                            ? `${process.env.NEXT_PUBLIC_API_URL}${item.thumbnail}`
                            : '/img/placeholder-product.jpg'
                        }
                        alt={item.name}
                        className="w-full h-full object-contain object-center transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = '/img/placeholder-product.jpg';
                        }}
                      />

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
                      {/* Shop Name & Category */}
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-gray-500 font-medium truncate">
                          {storeData.name || 'Toko Batik'}
                        </p>
                        {item.category_slug &&
                          dataWarna[item.category_slug] && (
                            <div
                              className={`bg-gradient-to-b ${dataWarna[item.category_slug].bgColor} px-2 py-1 rounded-sm`}
                            >
                              <p className="text-xs">{item.category_name}</p>
                            </div>
                          )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 h-12">
                        {item.name}
                      </h3>

                      {/* Price */}
                      <div className="mt-2">
                        <span className="text-amber-800 font-bold">
                          {formatRupiah(item.harga)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 py-8">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePagination(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {generatePageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-2 text-sm font-medium text-gray-700">
                          ...
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePagination(page)}
                          disabled={loading}
                          className={`px-3 py-2 text-sm font-medium rounded-md disabled:cursor-not-allowed ${
                            pagination.page === page
                              ? 'bg-primary text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePagination(pagination.page + 1)}
                    disabled={
                      pagination.page === pagination.totalPages || loading
                    }
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Page Info */}
              <div className="text-center text-sm text-gray-600 pb-8">
                Halaman {pagination.page} dari {pagination.totalPages} (Total:{' '}
                {pagination.totalItems} produk)
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductsPageByStore;
