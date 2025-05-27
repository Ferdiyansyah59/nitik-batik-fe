'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated() || user?.role !== 'penjual') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Mock data untuk dashboard
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: '👥',
      color: 'blue',
    },
    {
      title: 'Total Articles',
      value: '567',
      change: '+23%',
      icon: '📝',
      color: 'green',
    },
    {
      title: 'Total Products',
      value: '890',
      change: '+8%',
      icon: '🛍️',
      color: 'purple',
    },
    {
      title: 'Total Revenue',
      value: 'Rp 45.6M',
      change: '+15%',
      icon: '💰',
      color: 'yellow',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'John Doe',
      action: 'created a new article',
      time: '2 hours ago',
    },
    {
      id: 2,
      user: 'Jane Smith',
      action: 'updated product information',
      time: '4 hours ago',
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'registered as a new seller',
      time: '6 hours ago',
    },
    {
      id: 4,
      user: 'Sarah Williams',
      action: 'placed a new order',
      time: '8 hours ago',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <DashboardLayout role="penjual">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your platform today.
          </p>
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
                    from last month
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
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Recent Activities</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/penjual/dashboard/articles')}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">📝</span>
                  <p className="mt-2 text-sm font-medium">Add Article</p>
                </button>
                <button
                  onClick={() => router.push('/penjual/dashboard/users')}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">👤</span>
                  <p className="mt-2 text-sm font-medium">Add User</p>
                </button>
                <button
                  onClick={() => router.push('/penjual/dashboard/categories')}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">🏷️</span>
                  <p className="mt-2 text-sm font-medium">Add Category</p>
                </button>
                <button
                  onClick={() => router.push('/penjual/dashboard/reports')}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">📊</span>
                  <p className="mt-2 text-sm font-medium">View Reports</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
