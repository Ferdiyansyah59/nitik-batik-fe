'use client';
import React from 'react';
import SectionSubtitle from '@/components/micro/SectionSubtitle';
import Description from '@/components/micro/Description';
import { useRouter } from 'next/navigation';

// Format harga ke format Rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}

// Komponen Rating Stars
function RatingStars({ rating = 4.5 }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-amber-500' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-gray-500">{rating}</span>
    </div>
  );
}

function Product() {
  const router = useRouter();
  const data = [
    {
      name: 'Kemeja Batik Pria Motif Parang',
      img: 'kemeja.png',
      harga: '1000000',
      toko: 'Batik Sentosa',
      rating: 4.8,
    },
    {
      name: 'Blus Batik Wanita Modern',
      img: 'blus.png',
      harga: '950000',
      toko: 'Batik Sentosa',
      rating: 4.7,
    },
    {
      name: 'Kaos Batik Casual',
      img: 'kaos.png',
      harga: '450000',
      toko: 'Batik Sentosa',
      rating: 4.3,
    },
    {
      name: 'Celana Batik Premium',
      img: 'celana.png',
      harga: '850000',
      toko: 'Batik Sentosa',
      rating: 4.9,
    },
    {
      name: 'Rok Batik Lilit Modern',
      img: 'rok.png',
      harga: '780000',
      toko: 'Batik Sentosa',
      discount: 20,
      rating: 4.6,
    },
    {
      name: 'Kain Batik Tulis Asli',
      img: 'kain.png',
      harga: '2500000',
      toko: 'Batik Sentosa',
      rating: 5.0,
    },
    {
      name: 'Kain Batik Cap Berkualitas',
      img: 'kain.png',
      harga: '1200000',
      toko: 'Batik Nad',
      rating: 4.5,
    },
    {
      name: 'Kain Batik Solo Premium',
      img: 'kain.png',
      harga: '1800000',
      toko: 'Batik Nurdin',
      rating: 4.7,
    },
  ];

  const handleDetail = () => {
    router.push('/store/detail-product');
  };

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <SectionSubtitle title="Katalog Produk Batik Untukmu" />
        <Description text="Eksplorasi koleksi batik terbaik dari pengrajin lokal Indonesia" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            {/* Product Image Container */}
            <div className="relative h-48 md:h-56 bg-gray-100 overflow-hidden">
              {/* Product Image */}
              <img
                src={`/img/store_categories/${item.img}`}
                alt={item.name}
                className="w-full h-full object-contain object-center transform group-hover:scale-105 transition-transform duration-500"
              />

              {/* Hover Overlay with Buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-500 hover:text-white transition-colors duration-300"
                  onClick={handleDetail}
                >
                  Lihat Detail
                </button>
                {/* <button className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-600 transition-colors duration-300">
                  + Keranjang
                </button> */}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              {/* Shop Name */}
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-500 font-medium">{item.toko}</p>
                {/* <RatingStars rating={item.rating} /> */}
              </div>

              {/* Product Name */}
              <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 h-12">
                {item.name}
              </h3>

              {/* Price */}
              <div className="mt-2">
                {item.discount ? (
                  <div className="flex items-center gap-2">
                    <span className="text-amber-800 font-bold">
                      {formatRupiah(item.harga * (1 - item.discount / 100))}
                    </span>
                    <span className="text-gray-400 text-sm line-through">
                      {formatRupiah(item.harga)}
                    </span>
                  </div>
                ) : (
                  <span className="text-amber-800 font-bold">
                    {formatRupiah(item.harga)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* "See More" Button */}
      <div className="text-center mt-8">
        <button className="bg-amber-800 hover:bg-amber-900 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 shadow-md hover:shadow-lg">
          Katalog Batik Lainnya
        </button>
      </div>
    </section>
  );
}

export default Product;
