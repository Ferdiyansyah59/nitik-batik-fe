'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageComponent from '../micro/ImageComponent';

function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // Jika scroll ke atas atau di bagian paling atas, tampilkan navbar
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      }
      // Jika scroll ke bawah dan sudah cukup jauh, sembunyikan navbar
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsMenuOpen(false); // Tutup mobile menu jika terbuka
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle function untuk performa yang lebih baik
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          controlNavbar();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav
      className={`bg-[#FFF8E7] text-primary shadow-sm fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="w-screen mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" onClick={closeMenu}>
            <ImageComponent
              src="/img/logo_nav.png"
              className="w-24 sm:w-28 md:w-32"
              alt="logo"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10">
            <Link
              href="/"
              className="text-base lg:text-lg font-medium hover:text-primary/80 transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/articles"
              className="text-base lg:text-lg font-medium hover:text-primary/80 transition-colors"
            >
              Artikel
            </Link>
            <Link
              href="/store"
              className="text-base lg:text-lg font-medium hover:text-primary/80 transition-colors"
            >
              Katalog Batik
            </Link>
            <Link
              className="bg-primary text-white rounded-md px-6 lg:px-10 py-2 text-base lg:text-lg font-medium hover:bg-primary/90 transition-colors"
              href="/login"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out relative z-50 ${
          isMenuOpen
            ? 'max-h-64 opacity-100'
            : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1 bg-[#FFF8E7] border-t border-primary/20">
          <Link
            href="/"
            className="block px-3 py-2 text-base font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
            onClick={closeMenu}
          >
            Beranda
          </Link>
          <Link
            href="/articles"
            className="block px-3 py-2 text-base font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
            onClick={closeMenu}
          >
            Artikel
          </Link>
          <Link
            href="/store"
            className="block px-3 py-2 text-base font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
            onClick={closeMenu}
          >
            Katalog Batik
          </Link>
          <div className="pt-2">
            <Link
              href="/login"
              className="block w-full text-center bg-primary text-white rounded-md px-4 py-2 text-base font-medium hover:bg-primary/90 transition-colors"
              onClick={closeMenu}
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={closeMenu}
        />
      )}
    </nav>
  );
}

export default Nav;
