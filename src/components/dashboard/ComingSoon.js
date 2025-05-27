'use client';

import { useRouter } from 'next/navigation';

export default function ComingSoon({ title, description }) {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}

// Contoh penggunaan untuk halaman yang belum selesai:

// src/app/admin/dashboard/users/page.js
'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ComingSoon from '@/components/dashboard/ComingSoon';

export default function AdminUsersPage() {
  return (
    <DashboardLayout role="admin">
      <ComingSoon
        title="User Management"
        description="Fitur manajemen pengguna sedang dalam pengembangan."
      />
    </DashboardLayout>
  );
}

// src/app/penjual/dashboard/orders/page.js
'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ComingSoon from '@/components/dashboard/ComingSoon';

export default function PenjualOrdersPage() {
  return (
    <DashboardLayout role="penjual">
      <ComingSoon
        title="Kelola Pesanan"
        description="Fitur manajemen pesanan sedang dalam pengembangan."
      />
    </DashboardLayout>
  );
}