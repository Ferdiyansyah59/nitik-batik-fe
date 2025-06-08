'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatDate } from '@/utils/dateFormatter';
import parse from 'html-react-parser';

export default function ArticleDetail({ initialArticle, slug }) {
  // LOCAL STATE ONLY - NO STORE FETCHING
  const [article, setArticle] = useState(initialArticle);
  const [mounted, setMounted] = useState(false);

  const [fontSize, setFontSize] = useState('base');

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // SYNC INITIAL DATA DARI PROPS (BUKAN FETCH)
  useEffect(() => {
    if (initialArticle) {
      console.log(
        '✅ Received article data from parent:',
        initialArticle.title,
      );
      setArticle(initialArticle);
    }
  }, [initialArticle]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!mounted || !article) return;

    const shareData = {
      title: article.title,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [article, mounted]);

  // Font size control
  const changeFontSize = useCallback((size) => {
    setFontSize(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('article-font-size', size);
    }
  }, []);

  // Load saved font size
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const savedFontSize = localStorage.getItem('article-font-size');
      if (savedFontSize) {
        setFontSize(savedFontSize);
      }
    }
  }, [mounted]);

  // ✅ FIXED: Prose classes yang override font size dengan specificity tinggi
  const getProseClasses = () => {
    const baseProse = 'prose max-w-none';

    switch (fontSize) {
      case 'small':
        return `${baseProse} prose-sm`;
      case 'large':
        return `${baseProse} prose-lg`;
      case 'xl':
        return `${baseProse} prose-xl`;
      default:
        return `${baseProse} prose-base`;
    }
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/articles"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Articles
        </Link>
      </div>

      {/* Reading controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Font size:</span>
          <div className="flex gap-2">
            {[
              { key: 'small', label: 'Small' },
              { key: 'base', label: 'Normal' },
              { key: 'large', label: 'Large' },
              { key: 'xl', label: 'XL' },
            ].map((sizeOption) => (
              <button
                key={sizeOption.key}
                onClick={() => changeFontSize(sizeOption.key)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  fontSize === sizeOption.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {sizeOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main article */}
      <article className="bg-white shadow-lg rounded-lg overflow-hidden">
        {article.imageUrl && (
          <div className="relative h-72 w-full">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${article.imageUrl}`}
              alt={article.title}
              className="object-cover w-full h-full"
              loading="eager"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
            <div>
              Published: {formatDate(article.created_At)}
              {article.author && <span> • By {article.author}</span>}
            </div>
          </div>

          {/* ✅ FIXED: Article content dengan prose classes yang benar */}
          <div className={getProseClasses()}>
            <div className="text-gray-800">
              {parse(article.description || '')}
            </div>
          </div>

          {/* Interactive actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
