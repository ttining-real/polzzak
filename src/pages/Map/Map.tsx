import { useEffect, useRef, useState } from 'react';
import {
  Map as MapArea,
  MapMarker,
  useKakaoLoader,
} from 'react-kakao-maps-sdk';
import { Outlet, useSearchParams } from 'react-router-dom';

import { fetchAroundList } from '@/api/openAPI/utils/fetchAroundList';
import SlideUpDialog from '@/components/Dialog/SlideUpDialog';
import Loader from '@/components/Loader/Loader';
import MapHeader from '@/components/Map/MapHeader';
import MapMarkerList from '@/components/Map/MapMarkerList';
import ModalContent from '@/components/Map/ModalContent';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { filterNameToType, typeToFilterName } from '@/lib/filterMap';
import { formatMapDialogHeader } from '@/lib/formatMapDialogHeader';
import { useAuthStore } from '@/store/useAuthStore';
import { useDialogStore } from '@/store/useDialogStore';
import { LatLng } from '@/types/LatLng';
import { aroundDataTypes, FilterType } from '@/types/mapDataType';

import NotFound from '../NotFound';

function Map() {
  // 카카오 맵 SDK 로드 상태 및 오류 체크
  const [mapLoading, mapError] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_API_KEY,
    libraries: ['services'],
  });

  // 로그인 상태 확인
  const { isAuthenticated } = useAuthStore();

  // 내 위치 상태
  const [myLocation, setMyLocation] = useState<LatLng | null>(null);

  // 커스텀 훅을 통해 현재 위치 가져오기
  const { location, locationError } = useCurrentLocation();

  // 지도의 중심 위치 상태
  const [mapCenter, setMapCenter] = useState<LatLng | null>(null);

  // 카카오맵 ref
  const mapRef = useRef<kakao.maps.Map | null>(null);

  // 마커 데이터 저장
  const [markerData, setMarkerData] = useState<aroundDataTypes[]>([]);

  // 필터링 상태 추가
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);

  // URL 쿼리 파라미터
  const [searchParams, setSearchParams] = useSearchParams();

  // 다이얼로그 상태
  const { isOpen, openModal } = useDialogStore();

  // 쿼리 → selectedFilter 세팅
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const matchedType = filterNameToType(categoryParam);
      if (matchedType) {
        setSelectedFilter(matchedType);
      }
    }
  }, [searchParams]);

  // selectedFilter → 쿼리 반영
  useEffect(() => {
    if (!selectedFilter) return;

    const filterName = typeToFilterName(selectedFilter);

    if (!filterName) return;

    const params = new URLSearchParams(searchParams);
    params.set('category', filterName);
    setSearchParams(params, { replace: true });
  }, [selectedFilter]);

  // location이 업데이트되면 내 위치와 지도 중심을 설정
  useEffect(() => {
    if (location) {
      setMyLocation(location);
      setMapCenter(location);
    }
  }, [location]);

  // 위치 정보 오류가 발생했을 경우 콘솔에 출력
  useEffect(() => {
    if (locationError) {
      console.error('🚫 위치 정보를 가져올 수 없습니다. : ', locationError);
    }
  }, [locationError]);

  useEffect(() => {
    if (!myLocation) return;

    fetchAroundList({
      mapX: myLocation.lng,
      mapY: myLocation.lat,
      ...(selectedFilter && { contentTypeId: selectedFilter }),
    })
      .then((res) => {
        const rawItem = res.data?.response?.body?.items?.item; // 🔍 불러온 주변 리스트 데이터

        const itemArray = Array.isArray(rawItem)
          ? rawItem
          : rawItem
            ? [rawItem]
            : [];

        console.log(itemArray); // 🔍 변환된 마커 데이터
        setMarkerData(itemArray);
      })
      .catch((err) => {
        console.error('🚫 API 호출 실패: ', err);
      });
  }, [myLocation, selectedFilter]); // ✅ 의존성 배열 추가로 무한 루프 방지

  // 필터링 상태 && 마커 데이터가 존재할 때 다이얼로그 열기
  useEffect(() => {
    if (selectedFilter && markerData.length > 0) {
      openModal();
    }
  }, [selectedFilter, markerData]);

  // ⌛ 카카오 맵 SDK 로딩 중인 상태
  if (mapLoading) return <Loader text="🗺️ 지도를 불러오고 있어요!" />;

  // ⌛ SDK 로딩 실패
  if (mapError) return <NotFound text="😭 지도를 불러오는 데 실패했어요." />;

  // ⌛ 위치 정보가 아직 준비되지 않음
  if (!myLocation || !mapCenter)
    return <Loader text="🚩 내 위치를 불러오고 있어요!" />;

  return (
    <>
      <MapHeader
        mapRef={mapRef}
        myLocation={myLocation}
        isLoggedIn={isAuthenticated}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />
      <MapArea
        ref={mapRef}
        center={mapCenter}
        style={{ width: '100%', height: '100%' }}
        className="relative"
        level={3}
      >
        <MapMarker
          position={myLocation}
          image={{
            src: '/marker/my_location.svg',
            size: { width: 32, height: 32 },
            options: { offset: { x: 16, y: 16 } },
          }}
        />
        <MapMarkerList data={markerData} />
        <Outlet />
        {isOpen && selectedFilter && markerData.length > 0 && (
          <SlideUpDialog
            header={formatMapDialogHeader(selectedFilter) ?? '내 주변'}
            dimd={false}
            dragIcon={true}
            className="shadow-[0_-4px_16px_rgba(0,0,0,0.1)]"
          >
            <ModalContent data={markerData} />
          </SlideUpDialog>
        )}
      </MapArea>
    </>
  );
}

export default Map;
