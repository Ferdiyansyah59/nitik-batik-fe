// app/layout.js
import { Poppins } from 'next/font/google';
import './globals.css';

const getPoppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
  title: {
    template: `${process.env.NEXT_PUBLIC_APP_NAME} - %s`,
    default: `${process.env.NEXT_PUBLIC_APP_NAME} - Platform Edukasi dan UMKM Batik`,
  },
  icons: {
    icon: '/img/nb_logo.png',
  },
  description:
    'NitikBatik adalah platform digital yang bertujuan untuk mengedukasi masyarakat tentang warisan budaya batik Indonesia sekaligus mendukung UMKM dalam mempromosikan dan memperluas jangkauan produk batik mereka secara online.',
  siteName: `${process.env.NEXT_PUBLIC_APP_NAME}`,
  url: 'http://belumada.com',
  locale: 'id_ID',
  type: 'website',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${getPoppins.variable} antialiased`}>{children}</body>
    </html>
  );
}
