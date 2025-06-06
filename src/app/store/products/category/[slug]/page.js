'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import SectionSubtitle from '@/components/micro/SectionSubtitle';
import Description from '@/components/micro/Description';
import { useAllProductsBySlug } from '@/hooks/useAllProductsBySlug';
import { useParams } from 'next/navigation';

// Format harga ke format Rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}

function ProductsPageByCategory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  // ✅ Menggunakan hook dengan API
  const {
    products,
    pagination,
    loading,
    error,
    isEmpty,
    searchProducts,
    sortProducts,
    handlePageChange,
    clearError,
    refresh,
    slug,
  } = useAllProductsBySlug({
    page: currentPage,
    limit: 40, // 40 produk per halaman (10 baris x 4 kolom)
    search: searchTerm,
    sortBy: sortBy,
    autoFetch: true,
  });

  // Data warna untuk kategori
  const dataWarna = {
    'kemeja-batik': { bgColor: 'from-amber-200 to-amber-100' },
    'blus-batik': { bgColor: 'from-rose-200 to-rose-100' },
    'kaos-batik': { bgColor: 'from-teal-200 to-teal-100' },
    'celana-batik': { bgColor: 'from-indigo-200 to-indigo-100' },
    'rok-batik': { bgColor: 'from-fuchsia-200 to-fuchsia-100' },
    'kain-batik': { bgColor: 'from-amber-300 to-amber-200' },
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    searchProducts(searchTerm);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    searchProducts('');
  };

  // Handle pagination
  const handlePagination = (page) => {
    setCurrentPage(page);
    handlePageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    sortProducts(newSortBy); // Sort di frontend
  };

  // Generate pagination numbers
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

      if (current > 4) {
        pages.push('...');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 3) {
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const formatSlugMenjadiJudul = (slug) => {
    const kataArray = slug.split('-');

    const kataKapital = kataArray.map((kata) => {
      if (!kata) return '';
      return kata.charAt(0).toUpperCase() + kata.slice(1).toLowerCase();
    });

    return kataKapital.join(' ');
  };

  // Handle error state
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
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <SectionSubtitle
              title={`Semua Produk <span style='color:#82431b;'> ${formatSlugMenjadiJudul(slug)} </span> Batik`}
            />
            <Description text="Jelajahi koleksi lengkap batik dari seluruh pengrajin Indonesia" />
          </div>
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
                  Memuat produk dari server...
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Mohon tunggu sebentar
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
                {searchTerm
                  ? `Tidak ditemukan produk untuk pencarian "${searchTerm}"`
                  : 'Belum ada produk yang tersedia saat ini'}
              </p>
              {searchTerm && (
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
              {/* Products Grid - 4 kolom */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {products.map((item, idx) => (
                  <div
                    key={item.id || `product-${idx}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    {/* Product Image Container */}
                    <div className="relative h-48 md:h-56 bg-gray-100 overflow-hidden">
                      {/* Product Image */}
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

                      {/* Hover Overlay with Buttons */}
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
                          {item.store_name || 'Toko Batik'}
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
                <br />
                Menampilkan {(pagination.page - 1) * 40 + 1}-
                {Math.min(pagination.page * 40, pagination.totalItems)} dari{' '}
                {pagination.totalItems} produk
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductsPageByCategory;
