function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Content */}
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Side: Batik Pattern Background */}
        <div
          className="w-full md:w-1/4 min-h-screen hidden md:block bg-amber-800/10"
          style={{
            backgroundImage: "url('/img/batik_hero.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>

        {/* Right Side: Content */}
        <div className="w-full md:w-3/4 min-h-screen flex flex-col justify-center relative px-4 md:px-12 py-24 md:py-0 bg-amber-50">
          <span className="text-sm text-amber-800 font-medium tracking-wider mb-2">
            WARISAN BUDAYA INDONESIA
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight text-gray-900 mb-4">
            Batikmu, <br />
            <span className="text-amber-800">Gayamu,</span> Identitasmu
          </h2>
          <p className="text-gray-700 text-lg mb-8 max-w-2xl">
            Dukung produk lokal, tampil elegan dengan batik autentik dari
            seluruh Indonesia. Kualitas terbaik untuk ekspresi gaya yang tak
            tertandingi.
          </p>

          {/* Search Bar */}
          <div className="relative mb-8 max-w-lg">
            <input
              type="text"
              placeholder="Cari batik yang kamu inginkan"
              className="w-full py-4 px-6 rounded-full shadow-md border-0 focus:ring-2 focus:ring-amber-800 focus:outline-none"
            />
            <button className="absolute right-1 top-1 bg-amber-800 hover:bg-amber-900 text-white p-3 rounded-full transition-all duration-300">
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

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button className="bg-amber-800 text-white font-medium py-3 px-8 rounded-full shadow-lg hover:bg-amber-900 transition-all duration-300 transform hover:-translate-y-1">
              Koleksi Terbaru
            </button>
            <button className="bg-transparent border-2 border-gray-800 text-gray-800 font-medium py-3 px-8 rounded-full hover:bg-gray-800 hover:text-white transition-all duration-300">
              Lihat Katalog
            </button>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-6 md:gap-12">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-800 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700">100% Autentik</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-800 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700">Mendukung Pengrajin Lokal</span>
            </div>
          </div>
        </div>

        {/* Floating Woman Image (Desktop only) */}
        <div className="hidden md:block absolute right-0 bottom-0 h-3/4">
          <img
            src="/img/model_hero.png"
            alt="Model Batik"
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Model Image (Only visible on mobile) */}
        <div className="absolute -bottom-10 right-0 md:hidden">
          <img
            src="/img/model_hero.png"
            alt="Model Batik"
            className="w-64 h-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default Hero;
