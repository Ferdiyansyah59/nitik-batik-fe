// src/app/penjual/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useStoreData } from '@/hooks/useStore';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, needsToCreateStore } = useAuth();
  const { store, hasStore, loading: storeLoading } = useStoreData();

  // ✅ Loading state untuk menunggu rehydration
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // ✅ Delay untuk menunggu zustand rehydration
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // console.log('inI TOKO', store.id);
    // ✅ Check auth dan store status setelah loading selesai
    if (!isLoading && hasCheckedAuth) {
      if (!isAuthenticated() || user?.role !== 'penjual') {
        router.push('/login');
        return;
      }

      // ✅ Redirect ke halaman buat toko jika belum punya toko
      if (needsToCreateStore()) {
        router.push('/penjual/store');
        return;
      }
    }
  }, [
    isLoading,
    hasCheckedAuth,
    isAuthenticated,
    user,
    needsToCreateStore,
    router,
  ]);

  // ✅ Show loading saat menunggu rehydration
  if (isLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Show loading jika masih checking auth
  if (!hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse bg-gray-200 h-12 w-48 rounded mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ✅ Redirect jika user belum punya toko
  if (needsToCreateStore()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to store creation...</p>
        </div>
      </div>
    );
  }

  // Mock data untuk dashboard
  const stats = [
    {
      title: 'Total Produk',
      value: '24',
      change: '+3',
      icon: '🛍️',
      color: 'blue',
    },
    {
      title: 'Pesanan Bulan Ini',
      value: '45',
      change: '+12',
      icon: '📦',
      color: 'green',
    },
    {
      title: 'Total Pelanggan',
      value: '128',
      change: '+8',
      icon: '👥',
      color: 'purple',
    },
    {
      title: 'Pendapatan Bulan Ini',
      value: 'Rp 12.5M',
      change: '+15%',
      icon: '💰',
      color: 'yellow',
    },
  ];

  const recentOrders = [
    {
      id: 1,
      customer: 'Budi Santoso',
      product: 'Kemeja Batik Parang',
      amount: 'Rp 250.000',
      status: 'Pending',
      time: '2 jam lalu',
    },
    {
      id: 2,
      customer: 'Siti Nurhaliza',
      product: 'Blus Batik Kawung',
      amount: 'Rp 180.000',
      status: 'Processing',
      time: '4 jam lalu',
    },
    {
      id: 3,
      customer: 'Ahmad Wijaya',
      product: 'Kain Batik Solo',
      amount: 'Rp 450.000',
      status: 'Shipped',
      time: '6 jam lalu',
    },
    {
      id: 4,
      customer: 'Maya Sari',
      product: 'Rok Batik Modern',
      amount: 'Rp 320.000',
      status: 'Delivered',
      time: '1 hari lalu',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Processing: 'bg-blue-100 text-blue-800',
    Shipped: 'bg-purple-100 text-purple-800',
    Delivered: 'bg-green-100 text-green-800',
  };

  return (
    <DashboardLayout role="penjual">
      <div className="space-y-6">
        {/* ✅ Welcome Section dengan info toko */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Selamat datang, {user?.name}!
              </h1>
              {store && (
                <div className="mt-2">
                  <p className="text-lg text-gray-700 font-medium">
                    {store.name}
                  </p>
                  <p className="text-gray-600">{store.description}</p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <span>📱 {store.whatsapp}</span>
                    <span>📍 {store.alamat}</span>
                  </div>
                </div>
              )}
            </div>
            {/* ✅ Store Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/store')}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm"
              >
                Lihat Toko
              </button>
              <button
                onClick={() => router.push('/penjual/dashboard/store/edit')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              >
                Edit Toko
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-sm mt-2">
                    <span className="text-green-600 font-medium">
                      {stat.change}
                    </span>{' '}
                    dari bulan lalu
                  </p>
                </div>
                <div className={`p-3 rounded-full ${colorMap[stat.color]}`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Pesanan Terbaru</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.product}</p>
                      <p className="text-xs text-gray-400 mt-1">{order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{order.amount}</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/penjual/dashboard/orders')}
                  className="w-full text-center text-sm text-primary hover:text-primary/80"
                >
                  Lihat Semua Pesanan →
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Aksi Cepat</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/penjual/dashboard/products/add')}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">➕</span>
                  <p className="mt-2 text-sm font-medium">Tambah Produk</p>
                </button>
                <button
                  onClick={() => router.push('/penjual/dashboard/orders')}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">📦</span>
                  <p className="mt-2 text-sm font-medium">Kelola Pesanan</p>
                </button>
                <button
                  onClick={() => router.push('/penjual/dashboard/customers')}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">👥</span>
                  <p className="mt-2 text-sm font-medium">Data Pelanggan</p>
                </button>
                <button
                  onClick={() => router.push('/penjual/dashboard/analytics')}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">📊</span>
                  <p className="mt-2 text-sm font-medium">Lihat Analitik</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Store Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Performa Toko - {store?.name}
          </h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">
              Chart visualisasi performa toko akan ditampilkan di sini
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
