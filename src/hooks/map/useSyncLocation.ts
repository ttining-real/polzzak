import { useEffect } from 'react';

import { LatLng } from '@/types/LatLng';

export function useSyncLocation(
  location: LatLng | null,
  locationError: string | null,
  setMyLocation: (loc: LatLng) => void,
  setMapCenter: (loc: LatLng) => void,
) {
  // location이 업데이트되면 내 위치와 지도 중심을 설정
  useEffect(() => {
    if (location) {
      setMyLocation(location);
      setMapCenter(location);
    }
  }, [location, setMapCenter, setMyLocation]);

  // 위치 정보 오류가 발생했을 경우 콘솔에 출력
  useEffect(() => {
    if (locationError) {
      console.error('🚫 위치 정보를 가져올 수 없습니다. : ', locationError);
    }
  }, [locationError]);
}
