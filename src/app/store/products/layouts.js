// app/store/products/layout.js
import Nav from '@/components/partials/Nav';
import Footer from '@/components/partials/Footer';
import ClientLayout from '@/components/partials/ClientLayout';

export default function StoreProductsLayout({ children }) {
  return (
    <>
      <Nav />
      <ClientLayout>{children}</ClientLayout>
      <Footer />
    </>
  );
}
