'use client';
import SectionSubtitle from '@/components/micro/SectionSubtitle';
import useArticleStore from '@/store/articleStore';
import Link from 'next/link';
import { useEffect } from 'react';

function Article() {
  const { articles, fetchLatestArticles, loading, error } = useArticleStore();

  useEffect(() => {
    fetchLatestArticles();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <section className="container mx-auto px-4 my-20">
      <div className="flex justify-between items-center mb-8">
        <SectionSubtitle title="Sesuatu Tentang Batik Kita" />
        <Link
          href="/articles"
          className="text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
        >
          Lihat Semua
        </Link>
      </div>

      {/* ✅ 5 kolom dalam 1 baris */}
      <div className="grid grid-cols-5 gap-6">
        {articles.map((item, idx) => (
          <div
            key={idx}
            className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border"
          >
            {/* Image */}
            <div
              className="h-32 bg-cover bg-center"
              style={{
                backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL + item.imageUrl})`,
              }}
            />

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors text-sm">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {item.excerpt}
              </p>

              <Link
                href={`/articles/${item.slug}`}
                className="text-xs text-primary hover:underline font-medium"
              >
                Baca Selengkapnya
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Article;
