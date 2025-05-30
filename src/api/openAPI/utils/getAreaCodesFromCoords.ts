export const getRegionCodeFromCoords = async (mapX: number, mapY: number) => {
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${mapX}&y=${mapY}`,
    {
      headers: {
        Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`,
      },
    },
  );

  if (!res.ok) throw new Error('Kakao API 요청 실패');

  const data = await res.json();
  const regionInfo = data.documents?.[0];

  return {
    regionCode: regionInfo?.code, // 시군구 포함된 법정동 코드
    addressName: regionInfo?.address_name,
    region1: regionInfo?.region_1depth_name,
    region2: regionInfo?.region_2depth_name,
    region3: regionInfo?.region_3depth_name,
  };
};
