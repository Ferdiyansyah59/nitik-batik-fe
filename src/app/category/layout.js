// app/(main)/layout.tsx
import Nav from '@/components/partials/Nav';
import Footer from '@/components/partials/Footer';
import ClientLayout from '@/components/partials/ClientLayout';

export default function CategoryLayout({ children }) {
  return (
    <>
      <Nav />
      <ClientLayout>{children}</ClientLayout>
      <Footer />
    </>
  );
}
