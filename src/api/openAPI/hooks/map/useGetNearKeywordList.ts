import { useEffect, useState } from 'react';

import { NearItemType } from '@/types/detailCommonDataType';

export function useGetNearKeywordList(keyword: string) {
  const [data, setData] = useState<NearItemType[]>([]);

  useEffect(() => {
    if (!keyword) {
      setData([]);
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(
          `/tourapi/${import.meta.env.VITE_OPEN_API_BASE_URL}/searchKeyword1?serviceKey=${import.meta.env.VITE_OPEN_API_KEY}&MobileApp=polzzak&MobileOS=ETC&_type=json&pageNo=1&numOfRows=10&keyword=${encodeURIComponent(keyword)}`,
        );

        if (!res.ok) {
          throw new Error(`API 응답 오류: ${res.status}`);
        }

        const json = await res.json();
        const items = json.response?.body?.items?.item ?? [];

        const parsed: NearItemType[] = items.map((item: NearItemType) => ({
          contentid: item.contentid,
          title: item.title,
          addr1: item.addr1,
          firstimage: item.firstimage,
          mapx: parseFloat(item.mapx),
          mapy: parseFloat(item.mapy),
          contenttypeid: item.contenttypeid,
        }));

        setData(parsed);
      } catch (error) {
        console.error('키워드 검색 실패:', error);
      }
    }

    fetchData();
  }, [keyword]);

  return data;
}
