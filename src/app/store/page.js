'use client';
import Categories from '@/components/page/Store/Categories';
import Hero from '@/components/page/Store/Hero';
import Product from '@/components/page/Store/Product';
import { useRef } from 'react';

function Store() {
  const productsRef = useRef(null); // 1. Buat ref di sini

  // 2. Buat fungsi untuk menangani scroll
  const handleScrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Hero onScrollToProducts={handleScrollToProducts} />
      <Categories />
      <Product ref={productsRef} />
    </>
  );
}

export default Store;
