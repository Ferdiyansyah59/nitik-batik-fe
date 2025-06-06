'use client';
import Description from '@/components/micro/Description';
import SectionSubtitle from '@/components/micro/SectionSubtitle';
import { useProductCategories } from '@/hooks/useProductCategories';
import Link from 'next/link';
import { useEffect } from 'react';

function Categories() {
  const { productCategories, fetchProductCategories } = useProductCategories();

  useEffect(() => {
    fetchProductCategories();
  }, [fetchProductCategories]);

  useEffect(() => {
    console.log('Ini kategori', productCategories);
  });
  const data = [
    {
      name: 'Kemeja Batik',
      img: 'kemeja.png',
      bgColor: 'from-amber-200 to-amber-100',
      borderColor: 'border-amber-400',
    },
    {
      name: 'Blus Batik',
      img: 'blus.png',
      bgColor: 'from-rose-200 to-rose-100',
      borderColor: 'border-rose-400',
    },
    {
      name: 'Kaos Batik',
      img: 'kaos.png',
      bgColor: 'from-teal-200 to-teal-100',
      borderColor: 'border-teal-400',
    },
    {
      name: 'Celana Batik',
      img: 'celana.png',
      bgColor: 'from-indigo-200 to-indigo-100',
      borderColor: 'border-indigo-400',
    },
    {
      name: 'Rok Batik',
      img: 'rok.png',
      bgColor: 'from-fuchsia-200 to-fuchsia-100',
      borderColor: 'border-fuchsia-400',
    },
    {
      name: 'Kain Batik',
      img: 'kain.png',
      bgColor: 'from-amber-300 to-amber-200',
      borderColor: 'border-amber-500',
    },
  ];

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <SectionSubtitle title="Kategori Pilihan untuk Anda" />
        <Description text="Pilih kategori batik yang sesuai dengan yang anda inginkan" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {productCategories.map((item, idx) => (
          <div
            className="group cursor-pointer transition-all duration-300 transform hover:-translate-y-2"
            key={item.id}
          >
            <div
              className={`
              relative
              overflow-hidden
              rounded-2xl
              shadow-md 
              border-2 ${data[idx].borderColor}
              h-48 md:h-56
              bg-gradient-to-b ${data[idx].bgColor}
              flex items-center justify-center
              transition-all duration-300
              group-hover:shadow-xl
            `}
            >
              {/* Pattern Overlay */}
              <div
                className="absolute inset-0 opacity-10 bg-repeat"
                style={{
                  backgroundImage: "url('/api/placeholder/100/100')",
                  backgroundSize: '50px',
                }}
              ></div>

              {/* Image */}
              <div className="relative z-10 h-32 md:h-40 w-32 md:w-40 flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 group-hover:translate-y-[-10px]">
                <img
                  className="h-full w-auto object-contain drop-shadow-md"
                  src={`/img/store_categories/${data[idx].img}`}
                  alt={item.category_name}
                />
              </div>

              {/* Category Name - Shows on hover */}
              <div
                className={`
                absolute bottom-0 left-0 right-0 z-20
                bg-black/85
                text-white font-medium
                py-3 px-4
                transform translate-y-full
                transition-transform duration-300 ease-in-out
                group-hover:translate-y-0
              `}
              >
                <h3 className="text-center">{item.category_name}</h3>
              </div>
            </div>

            {/* Category Name - Always visible */}
            <h2
              className={`
              mt-3 text-center font-medium text-gray-800
              transition-colors duration-300
              group-hover:text-amber-800
            `}
            >
              {item.category_name}
            </h2>

            {/* Shop Now Button */}
            <Link
              className="text-center mt-1"
              href={`/store/products/category/${item.slug}`}
            >
              <span
                className={`
                text-xs font-medium text-gray-500
                transition-colors duration-300
                group-hover:text-amber-700
              `}
              >
                Lihat Koleksi →
              </span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
