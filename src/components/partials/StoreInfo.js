// src/components/partials/StoreInfo.js
'use client';

import { useStoreData } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function StoreInfo({ showInNavigation = false }) {
  const { user, isPenjual } = useAuth();
  const { store, hasStore } = useStoreData();

  // Jangan tampilkan jika bukan penjual
  if (!isPenjual()) {
    return null;
  }

  // Jika belum punya toko, tampilkan CTA untuk buat toko
  if (!hasStore) {
    return (
      <div className={`${showInNavigation ? 'text-sm' : ''} text-center`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-yellow-800 text-sm">Anda belum memiliki toko</p>
          <Link
            href="/penjual/store"
            className="mt-2 inline-block bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700"
          >
            Buat Toko Sekarang
          </Link>
        </div>
      </div>
    );
  }

  // Tampilkan info toko
  if (showInNavigation) {
    // Version untuk navigation (compact)
    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">
          {store.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:block">
          <p className="font-medium text-gray-900 truncate max-w-32">
            {store.name}
          </p>
          <p className="text-xs text-gray-500">Toko Anda</p>
        </div>
      </div>
    );
  }

  // Version untuk card atau detail view
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start space-x-4">
        {/* Store Avatar */}
        <div className="flex-shrink-0">
          {store.avatar ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${store.avatar}`}
              alt={store.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white text-xl">
              {store.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Store Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {store.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {store.description}
          </p>

          <div className="mt-3 space-y-1">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">📱</span>
              <span>{store.whatsapp}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">📍</span>
              <span className="truncate">{store.alamat}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex space-x-2">
            <Link
              href="/store"
              className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90"
            >
              Lihat Toko
            </Link>
            <Link
              href="/penjual/dashboard/store/edit"
              className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Hook untuk mendapatkan store status dengan loading state
export function useStoreStatus() {
  const { user, isPenjual, hasStore } = useAuth();
  const { store } = useStoreData();

  const getStoreStatus = () => {
    if (!isPenjual()) {
      return 'not-seller';
    }

    if (!hasStore) {
      return 'no-store';
    }

    return 'has-store';
  };

  const getStoreStatusText = () => {
    const status = getStoreStatus();

    switch (status) {
      case 'not-seller':
        return 'Bukan Penjual';
      case 'no-store':
        return 'Belum Punya Toko';
      case 'has-store':
        return `Toko: ${store?.name}`;
      default:
        return 'Status Tidak Diketahui';
    }
  };

  const getStoreStatusColor = () => {
    const status = getStoreStatus();

    switch (status) {
      case 'not-seller':
        return 'gray';
      case 'no-store':
        return 'yellow';
      case 'has-store':
        return 'green';
      default:
        return 'gray';
    }
  };

  return {
    status: getStoreStatus(),
    statusText: getStoreStatusText(),
    statusColor: getStoreStatusColor(),
    store,
    hasStore,
    isPenjual: isPenjual(),
  };
}
