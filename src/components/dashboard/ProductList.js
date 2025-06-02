// src/components/dashboard/ProductList.js
'use client';

import { useState } from 'react';
import { useProducts, useProduct } from '@/hooks/useProducts';
import Link from 'next/link';
import Image from 'next/image';
import ProductModal from './ProductModal';

export default function ProductList() {
  const {
    products,
    storeInfo,
    pagination,
    loading,
    error,
    handlePageChange,
    searchProducts,
    deleteProduct,
    getProductStats,
    formatPrice,
    clearError,
    hasProducts,
    isEmpty,
    canManageProducts,
    deleteLoading,
  } = useProducts();
  const { fetchProduct, product } = useProduct();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ Get stats safely
  const stats = getProductStats();

  const handleSearch = (e) => {
    e.preventDefault();
    searchProducts(searchTerm);
  };

  const handleDelete = async (slug, productName) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${productName}"?`)) {
      try {
        await deleteProduct(slug);
        alert('Produk berhasil dihapus!');
      } catch (error) {
        alert('Gagal menghapus produk: ' + error.message);
      }
    }
  };

  const handleEdit = async (slug) => {
    console.log('Edit ', slug);
    try {
      // ✅ Gunakan return value dari fetchProduct
      const productData = await fetchProduct(slug);
      console.log('Product data:', productData); // ✅ Ini akan ada datanya

      setSelectedProduct(productData);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching product for edit:', error);
      alert('Gagal memuat data produk: ' + error.message);
    }
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  // ✅ Loading state saat checking store
  if (loading && !storeInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data toko...</p>
        </div>
      </div>
    );
  }

  // ✅ Show message if user cannot manage products
  if (!canManageProducts) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
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
          Tidak Dapat Mengelola Produk
        </h3>
        <p className="text-gray-600">
          Anda perlu memiliki toko untuk mengelola produk.
        </p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500">
            Status: {storeInfo ? 'Toko tersedia' : 'Tidak ada toko'}
          </p>
          <Link
            href="/penjual/store"
            className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            {storeInfo ? 'Kelola Toko' : 'Buat Toko'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
            {storeInfo && (
              <p className="text-gray-600 mt-1">Toko: {storeInfo.name}</p>
            )}
          </div>
          <button
            onClick={handleCreate}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Tambah Produk
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-blue-600 text-sm font-medium">
                  Total Produk
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-green-600 text-sm font-medium">Tersedia</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.inStock}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-yellow-600 text-sm font-medium">
                  Stok Rendah
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats.lowStock}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <div className="ml-4">
                <p className="text-red-600 text-sm font-medium">Habis</p>
                <p className="text-2xl font-bold text-red-900">
                  {stats.outOfStock}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Mencari...' : 'Cari'}
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                searchProducts('');
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <svg
                className="w-5 h-5"
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
        </div>
      )}

      {/* Product Grid */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat produk...</p>
          </div>
        ) : isEmpty ? (
          <div className="p-12 text-center">
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
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? `Tidak ada produk yang ditemukan untuk "${searchTerm}"`
                : 'Mulai dengan menambahkan produk pertama Anda.'}
            </p>
            <button
              onClick={handleCreate}
              className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90"
            >
              Tambah Produk Pertama
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
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
                          className="w-12 h-12"
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
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-primary mb-3">
                      {formatPrice(product.harga)}
                    </p>

                    {/* Description */}
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product.slug)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <Link
                          href={`/penjual/dashboard/products/${product.slug}`}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Detail
                        </Link>
                        <Link
                          href={`/store/product/${product.slug}`}
                          target="_blank"
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          Lihat
                        </Link>
                      </div>
                      <button
                        onClick={() => handleDelete(product.slug, product.name)}
                        disabled={deleteLoading === product.slug}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      >
                        {deleteLoading === product.slug ? 'Hapus...' : 'Hapus'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, pagination.page - 1))
                    }
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        pagination.page === page
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.min(pagination.totalPages, pagination.page + 1),
                      )
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal (Create/Edit) */}
      <ProductModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => window.location.reload()}
        product={selectedProduct}
      />
    </div>
  );
}
