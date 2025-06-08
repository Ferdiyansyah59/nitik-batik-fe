'use client';
import { useProduct } from '@/hooks/useProducts';
import Link from 'next/link'; // ✅ Perbaikan import
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function DetailProduct() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  const { product, loading, error, fetchPublicProduct } = useProduct();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('camel');
  const [selectedSize, setSelectedSize] = useState('S');
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  const colors = [
    { name: 'camel', image: '/img/products/silk-camel.jpg' },
    { name: 'black', image: '/img/products/silk-black.jpg' },
  ];

  const accordionItems = [
    {
      id: 'description',
      title: 'Description',
      content: product?.description || 'Deskripsi produk tidak tersedia.',
    },
  ];

  useEffect(() => {
    if (slug) {
      fetchPublicProduct(slug);
    }
  }, [fetchPublicProduct, slug]);

  // ✅ Reset currentImage ketika product berubah
  useEffect(() => {
    if (product?.images?.length > 0) {
      setCurrentImage(0);
    }
  }, [product]);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  // ✅ Format harga ke Rupiah
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsapp = () => {
    let phoneNumber = product.store.whatsapp;
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Halo ${product.store.name} saya ingin memesan produk batik ${product.name}`,
    );

    const whatsappLink = `https://api.whatsapp.com/send?phone=${cleanPhoneNumber}&text=${message}`;
    window.open(whatsappLink, '_blank');
  };

  const handleStoreDetail = () => {
    router.push(`/store/${product.store.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/store" className="text-blue-600 hover:underline">
          Kembali ke Katalog Produk
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-gray-500 mb-4">Produk Tidak ditemukan</div>
        <Link href="/store" className="text-blue-600 hover:underline">
          Kembali ke Katalog Produk
        </Link>
      </div>
    );
  }

  // ✅ Handle jika images kosong atau tidak ada
  const productImages = product.images || [];
  const hasImages = productImages.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Product Images */}
        <div className="md:w-3/5">
          {hasImages ? (
            <div className="flex flex-row md:flex-row gap-4">
              {/* Thumbnails - Vertical on Desktop */}
              <div className="hidden md:flex flex-col gap-4 w-1/5">
                {productImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`cursor-pointer border hover:border-gray-400 transition ${
                      currentImage === index
                        ? 'border-gray-800'
                        : 'border-gray-200'
                    } w-full aspect-square overflow-hidden`}
                    onClick={() => setCurrentImage(index)}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${image.image}`}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div className="w-full md:w-4/5 aspect-[3/4] bg-gray-50 overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${productImages[currentImage]?.image}`}
                  alt={product.name}
                  className="w-full h-full object-contain object-center"
                />

                {/* Product Pagination Dots (Mobile) */}
                <div className="flex justify-center gap-2 mt-4 md:hidden">
                  {productImages.map((image, index) => (
                    <button
                      key={image.id}
                      className={`w-2 h-2 rounded-full ${
                        currentImage === index ? 'bg-gray-800' : 'bg-gray-300'
                      }`}
                      onClick={() => setCurrentImage(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // ✅ Placeholder jika tidak ada gambar
            <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-gray-500">Gambar tidak tersedia</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Product Info */}
        <div className="md:w-2/5 bg-gray-50 p-6 rounded-lg">
          {/* ✅ Product Name & Price dari data asli */}
          <h1 className="text-2xl font-light mb-2">{product.name}</h1>
          <p className="text-xl mb-6 font-semibold text-primary">
            {formatPrice(product.harga)}
          </p>

          {/* Quantity and Add to Bag */}
          <div className="flex gap-2 mb-6">
            {/* <div className="flex border border-gray-300 rounded-sm">
              <button
                className="px-3 py-2 text-gray-600"
                onClick={decrementQuantity}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300 min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                className="px-3 py-2 text-gray-600"
                onClick={incrementQuantity}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div> */}

            <button
              type="button"
              onClick={handleWhatsapp}
              className="flex-1 bg-gray-800 text-white py-2 px-4 hover:bg-gray-900 transition"
            >
              Pesan ke Penjual
            </button>

            {/* <button
              className="p-2 border border-gray-300"
              aria-label="Add to wishlist"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button> */}
          </div>

          {/* Store info - ✅ Bisa dikustomisasi dengan data toko dari product */}
          <button
            className="flex items-center gap-5 my-10"
            type="button"
            onClick={handleStoreDetail}
          >
            <img
              className="h-14 w-14 rounded-full"
              src={process.env.NEXT_PUBLIC_API_URL + product.store.avatar}
              alt="toko"
            />
            <div className="text-start">
              <h1 className="text-base font-medium">{product.store.name}</h1>
              <p className="text-xs">{product.store.alamat}</p>
            </div>
          </button>

          {/* Accordion Sections */}
          <div className="border-t border-gray-200">
            {accordionItems.map((item) => (
              <div key={item.id} className="border-b border-gray-200">
                <button
                  className="w-full py-4 flex justify-between items-center text-left"
                  onClick={() => toggleAccordion(item.id)}
                >
                  <span className="text-sm text-gray-500">{item.title}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      activeAccordion === item.id ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                {activeAccordion === item.id && (
                  <div className="pb-4 text-sm text-gray-600">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailProduct;
