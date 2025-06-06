'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function BatikRegions() {
  const router = useRouter();
  const [batikData, setBatikData] = useState([]);
  const [selectedBatik, setSelectedBatik] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data dari JSON file
  useEffect(() => {
    const fetchBatikData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Ganti URL ini dengan path ke file JSON Anda
        const response = await axios.get('/data/BatikType.json');

        // Validasi response data
        if (response.data && Array.isArray(response.data)) {
          setBatikData(response.data);
          console.log('✅ Berhasil memuat', response.data.length, 'data batik');
        } else {
          throw new Error('Format data tidak valid');
        }
      } catch (err) {
        console.error('❌ Error fetching batik data:', err);
        setError(`Gagal memuat data batik: ${err.message}`);
        setBatikData([]); // Set empty array sebagai fallback
      } finally {
        setLoading(false);
      }
    };

    fetchBatikData();
  }, []);

  // Filter batik berdasarkan pencarian dan asal daerah
  const filteredBatik = batikData.filter((batik) => {
    // Safe check untuk mencegah error jika field undefined
    const batikName = (batik.name || batik.title || '').toLowerCase();
    const batikType = (batik.type || '').toLowerCase();
    const searchTermLower = (searchTerm || '').toLowerCase();

    const matchesSearch =
      batikName.includes(searchTermLower) ||
      batikType.includes(searchTermLower);
    const matchesOrigin =
      selectedOrigin === '' || batik.origin === selectedOrigin;
    return matchesSearch && matchesOrigin;
  });

  // Dapatkan daftar asal daerah unik
  const origins = [
    ...new Set(
      batikData.map((batik) => batik.origin).filter((origin) => origin),
    ),
  ].sort();

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data batik...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl xl:text-4xl 2xl:text-6xl font-semibold text-gray-800 mb-4">
            Ragam Batik Nusantara
          </h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
            Jelajahi keindahan dan makna mendalam dari {batikData.length} jenis
            batik khas Indonesia, dari Sabang sampai Merauke yang kaya akan
            filosofi dan sejarah
          </p>
        </div>

        {/* Filter dan Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama atau jenis batik..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full md:w-80"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
          </div>

          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Semua Daerah</option>
            {origins.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </div>

        {/* Grid Batik */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          {filteredBatik.map((batik) => (
            <div
              key={batik.id}
              className={`group cursor-pointer transition-all duration-300 transform hover:-translate-y-2 ${selectedBatik?.id === batik.id ? 'scale-105' : ''}`}
              onClick={() =>
                setSelectedBatik(selectedBatik?.id === batik.id ? null : batik)
              }
            >
              <div
                className={`
                relative overflow-hidden rounded-2xl shadow-md 
                border-2 ${batik.colorClasses.borderColor}
                h-40 md:h-48
                bg-gradient-to-b ${batik.colorClasses.bgColor}
                flex flex-col items-center justify-center
                transition-all duration-300
                group-hover:shadow-xl
                ${selectedBatik?.id === batik.id ? 'ring-4 ring-amber-400 ring-opacity-75' : ''}
              `}
              >
                {/* Image */}
                <div className="w-16 h-16 md:w-20 md:h-20 mb-2 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img
                    src={batik.img}
                    alt={batik.name || batik.title || 'Batik'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback jika gambar tidak ditemukan
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gray-200 hidden items-center justify-center text-2xl">
                    {batik.icon || '🎨'}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-xs md:text-sm font-medium text-center px-2 line-clamp-2">
                  {batik.name || batik.title || 'Nama Batik'}
                </h3>

                {/* Origin Badge */}
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full text-gray-600">
                  {batik.origin || 'Indonesia'}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal/Card */}
        {selectedBatik && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div
                className={`bg-gradient-to-r ${selectedBatik.colorClasses.bgColor} p-6 rounded-t-2xl relative`}
              >
                <button
                  onClick={() => setSelectedBatik(null)}
                  className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full w-8 h-8 flex items-center justify-center transition-all"
                >
                  ✕
                </button>
                <div className="text-center">
                  {/* Image or Icon */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={selectedBatik.img}
                      alt={selectedBatik.name || selectedBatik.title || 'Batik'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-200 hidden items-center justify-center text-4xl">
                      {selectedBatik.icon || '🎨'}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedBatik.name || selectedBatik.title || 'Nama Batik'}
                  </h3>
                  <p className="text-lg text-gray-600 mt-1">
                    {selectedBatik.characteristic || 'Karakteristik unik'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    📍 Asal Daerah
                  </h4>
                  <p className="text-gray-600">
                    {selectedBatik.origin || 'Indonesia'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    🎨 Jenis Motif
                  </h4>
                  <p className="text-gray-600">
                    {selectedBatik.type || 'Motif Tradisional'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    ✨ Karakteristik
                  </h4>
                  <p className="text-gray-600">
                    {selectedBatik.characteristic || 'Karakteristik unik'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    📖 Deskripsi
                  </h4>
                  <p className="text-gray-600">
                    {selectedBatik.description || 'Deskripsi batik'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    🔮 Makna & Filosofi
                  </h4>
                  <p className="text-gray-600">
                    {selectedBatik.meaning || 'Makna filosofis yang mendalam'}
                  </p>
                </div>

                {/* Action Buttons */}
                {/* <div className="flex gap-3 pt-4">
                  <button className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium">
                    Lihat Koleksi
                  </button>
                  <button className="flex-1 border border-amber-600 text-amber-600 py-3 rounded-lg hover:bg-amber-50 transition-colors font-medium">
                    Pelajari Lebih Lanjut
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredBatik.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Tidak Ditemukan
            </h3>
            <p className="text-gray-500">
              Coba ubah kata kunci pencarian atau filter daerah
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedOrigin('');
              }}
              className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-amber-600">
                {batikData.length}
              </div>
              <div className="text-gray-600 text-sm">Jenis Batik</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {origins.length}
              </div>
              <div className="text-gray-600 text-sm">Daerah Asal</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {filteredBatik.length}
              </div>
              <div className="text-gray-600 text-sm">Hasil Filter</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">🇮🇩</div>
              <div className="text-gray-600 text-sm">Nusantara</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Jelajahi Koleksi Batik Lengkap
            </h3>
            <p className="mb-6 opacity-90">
              Temukan batik favorit Anda dan pelajari lebih dalam tentang
              warisan budaya Indonesia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-white text-amber-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                type="button"
                onClick={() => router.push('/store/products')}
              >
                Lihat Semua Koleksi Katalog Batik
              </button>
              <button
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-amber-600 transition-colors"
                type="button"
                onClick={() => router.push('/articles')}
              >
                Artikel Batik Pilihan
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
