// hooks/map/useSearchQueryMarkers.ts
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { fetchMapSearchList } from '@/api/openAPI/utils/fetchMapSearchList';
import { MarkerDataTypes } from '@/types/mapDataType';

export function useSearchQueryMarkers(
  setMarkerData: (data: MarkerDataTypes[]) => void,
) {
  const [searchParams] = useSearchParams();

  // 🔍 검색 쿼리에 반응하여 검색 API 호출
  useEffect(() => {
    const word = searchParams.get('search');

    if (!word) return;

    fetchMapSearchList(word).then((result) => {
      setMarkerData(result);
    });
  }, [searchParams, setMarkerData]);
}
