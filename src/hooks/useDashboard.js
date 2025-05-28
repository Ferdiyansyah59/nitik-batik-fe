// hooks/useDashboardData.js
import { useEffect } from 'react';
import useArticleStore from '@/store/articleStore';
import useUserStore from '@/store/userStore';

export const useDashboardData = () => {
  const { articles, fetchArticles } = useArticleStore();
  const { users, fetchUsers } = useUserStore();

  useEffect(() => {
    // ✅ Fetch data saat hook pertama kali digunakan
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          fetchArticles(1, 100), // Fetch all articles
          fetchUsers(1, 100), // Fetch all users
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    // Hanya fetch jika data belum ada
    if (articles.length === 0 || users.length === 0) {
      loadDashboardData();
    }
  }, []);

  return {
    articles,
    users,
    statistic: {
      totalUsers: users.length,
      totalArticles: articles.length,
    },
  };
};
