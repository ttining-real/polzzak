import { useEffect, useState } from 'react';

import { NearItemType } from '@/types/detailCommonDataType';

interface UseGetNearDataOptions {
  contentTypeId: string;
  radius?: number;
  errorMessage: string;
  enabled: boolean;
  lat: number;
  lng: number;
}

export function useGetNearData({
  contentTypeId,
  radius = 3000,
  errorMessage,
  enabled,
  lat,
  lng,
}: UseGetNearDataOptions) {
  const [dataList, setDataList] = useState<NearItemType[]>([]);

  useEffect(() => {
    if (!enabled || lat === 0 || lng === 0) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/tourapi/${import.meta.env.VITE_OPEN_API_BASE_URL}/locationBasedList1?serviceKey=${import.meta.env.VITE_OPEN_API_KEY}&MobileApp=polzzak&MobileOS=ETC&_type=json&pageNo=1&numOfRows=10&mapX=${lng}&mapY=${lat}&radius=${radius}&contentTypeId=${contentTypeId}`,
        );

        const data = await res.json();
        const items = data?.response?.body?.items?.item ?? [];

        setDataList(items);
      } catch (err) {
        console.error(`${errorMessage}:`, err);
      }
    };

    fetchData();
  }, [contentTypeId, lat, lng, radius, enabled, errorMessage]);

  return dataList;
}
