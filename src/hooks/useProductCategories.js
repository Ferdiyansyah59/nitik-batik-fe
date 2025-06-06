import useCategoryProductStore from '@/store/productCategoryStore';
import { useCallback, useMemo } from 'react';

export function useProductCategories() {
  const { fetchProductCategory, productCategories, loading, error } =
    useCategoryProductStore();

  const safeProductCategories = useMemo(() => {
    return Array.isArray(productCategories) ? productCategories : [];
  }, [productCategories]);

  const fetchProductCategories = useCallback(async () => {
    try {
      await fetchProductCategory();
    } catch (error) {
      console.log(
        'useProductCategories: Error fetching product categories ',
        error,
      );
    }
  }, [fetchProductCategory]);

  return {
    productCategories: safeProductCategories,
    fetchProductCategories,
  };
}
