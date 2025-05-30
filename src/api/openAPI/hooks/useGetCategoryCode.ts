import { useEffect, useState } from 'react';

interface CategoryItemType {
  code: string;
  name: string;
  rnum: number;
}

function useGetCategoryCode(): CategoryItemType[] {
  const [categoryCode, setCategoryCode] = useState<CategoryItemType[]>([]);

  useEffect(() => {
    const fetchCategorycode = async () => {
      try {
        const res = await fetch(
          `/tourapi/${import.meta.env.VITE_OPEN_API_BASE_URL}/categoryCode2?MobileOS=ETC&MobileApp=polzzak&_type=json&serviceKey=${import.meta.env.VITE_OPEN_API_KEY}`,
        );

        const data = await res.json();
        const items = data?.response?.body?.items?.item ?? [];

        setCategoryCode(items);
      } catch (err) {
        console.error('⚠️ 데이터를 불러오는 중 오류 발생:', err);
      }
    };

    fetchCategorycode();
  }, []);

  return categoryCode;
}

export { useGetCategoryCode };
