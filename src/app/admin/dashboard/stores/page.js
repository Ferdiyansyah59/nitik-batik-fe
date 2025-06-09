'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DataTable from '@/components/dashboard/DataTable';
import axios from 'axios';
import useUserStore from '@/store/userStore';
import useStoreStore from '@/store/storeStore';

export default function AdminArticlesPage() {
  const { stores, loading, fetchAllStoreData } = useStoreStore();

  // Configure axios defaults
  useEffect(() => {
    // Set default headers if needed
    const token = localStorage.getItem('token'); // or get from your auth store
    if (token) {
      axios.defaults.headers.common['Authorization'] = `${token}`;
    }
  }, []);

  useEffect(() => {
    fetchAllStoreData(1, 100); // Fetch all articles
  }, [fetchAllStoreData]);

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      label: 'name',
    },
    {
      key: 'whatsapp',
      label: 'whatsapp',
    },
    {
      key: 'alamat',
      label: 'alamat',
    },
    {
      key: 'created_At',
      label: 'Created Date',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data toko...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Users Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all users in the system</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Total Toko</p>
                <p className="text-2xl font-bold">{stores.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={stores}
          searchPlaceholder="Search articles..."
          addButtonText="Add Article"
        />
      </div>
    </DashboardLayout>
  );
}
