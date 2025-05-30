import axios from 'axios';

import { LatLng } from '@/types/LatLng';

export async function getAreaCodesFromCoords(myLocation: LatLng) {
  const { lat, lng } = myLocation;
  const response = await axios.get(
    'https://dapi.kakao.com/v2/local/geo/coord2regioncode.json',
    {
      params: {
        x: lng,
        y: lat,
      },
      headers: {
        Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`,
      },
    },
  );

  const region = response.data.documents[0];
  const areaCode = region.code.substring(0, 2); // 시도 코드
  const sigunguCode = region.code.substring(0, 5); // 시군구 코드

  return { areaCode, sigunguCode };
}
