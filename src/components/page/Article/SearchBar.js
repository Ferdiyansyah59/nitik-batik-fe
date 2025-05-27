'use client';
// src/components/page/Article/SearchBar.jsx - versi yang ditingkatkan
import { useState, useEffect } from 'react';
import useArticleStore from '@/store/articleStore';

function SearchBar() {
  const { searchArticles, clearSearch, loading, searchQuery, isSearching } =
    useArticleStore();
  const [inputValue, setInputValue] = useState('');

  // Sinkronkan nilai input dengan searchQuery dari store
  useEffect(() => {
    setInputValue(searchQuery || '');
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      searchArticles(inputValue);
    } else {
      clearSearch();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleClear = () => {
    setInputValue('');
    clearSearch();
  };

  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Cari artikel..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
        <button
          onClick={handleSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
          disabled={loading}
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Tampilkan informasi pencarian jika sedang dalam mode pencarian */}
      {isSearching && searchQuery && (
        <div className="mt-2 text-sm flex items-center justify-between">
          <span>
            Showing results for{' '}
            <span className="font-medium">"{searchQuery}"</span>
          </span>
          <button
            onClick={handleClear}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Show all articles
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
