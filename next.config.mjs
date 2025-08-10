/** @type {import('next').NextConfig} */
const nextConfig = {
  // Untuk Docker deployment
  output: 'standalone',

  // Konfigurasi images
  images: {
    // domains: ['localhost'],
    // Tambahkan domain production jika ada
    domains: ['localhost', 'http://82.112.230.106:1801', '212.85.24.186'],
  },

  // Optional: untuk optimasi Docker build
  // experimental: {
  //   // Mengurangi ukuran bundle
  //   outputFileTracingRoot: undefined,
  // },
};

export default nextConfig;
