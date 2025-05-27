/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)'],
      },
      colors: {
        primary: '#291204',
        'amber-white': '#FFF8E7',
        desc: '#6B7280',
        title: '#1F2937',
      },
      backgroundColor: {
        primary: '#803E19',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
