import { useEffect, useState } from 'react';

import { LatLng } from '@/types/LatLng';

export function useCurrentLocation() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ 브라우저가 Geolocation API를 지원하는지 확인
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 위치 정보 획득 성공 시 상태 저장
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };

        setLocation((prev) => {
          if (prev?.lat === newLocation.lat && prev?.lng === newLocation.lng) {
            return prev;
          }
          return newLocation;
        });
      },
      (error) => {
        // 오류 발생 시 에러 상태 설정
        setLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }, []);

  return { location, locationError };
}
