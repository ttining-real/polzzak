import { useEffect, useRef, useState } from 'react';
import {
  Map as MapArea,
  MapMarker,
  useKakaoLoader,
} from 'react-kakao-maps-sdk';
import { Outlet, useSearchParams } from 'react-router-dom';

import { fetchAroundList } from '@/api/openAPI/utils/fetchAroundList';
import { fetchMapSearchList } from '@/api/openAPI/utils/fetchMapSearchList';
import Button from '@/components/Button/Button';
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
import { useMapSearchStore } from '@/store/useMapSearchStore';
import { LatLng } from '@/types/LatLng';
import { FilterType, MakerDataTypes } from '@/types/mapDataType';

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
  const [markerData, setMarkerData] = useState<MakerDataTypes[]>([]);

  // 필터링 상태 추가
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);

  // URL 쿼리 파라미터
  const [searchParams, setSearchParams] = useSearchParams();

  // 다이얼로그 상태
  const { isOpen, openModal } = useDialogStore();

  // 재검색 버튼 상태
  const [showReSearchButton, setShowReSearchButton] = useState(false);

  const { resetSearchValue } = useMapSearchStore();

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

        setMarkerData(itemArray);
      })
      .catch((err) => {
        console.error('🚫 API 호출 실패: ', err);
      });
  }, [myLocation, selectedFilter]); // ✅ 의존성 배열 추가로 무한 루프 방지

  // 🗺️ 지도 이동 감지
  const handleCenterChanged = () => {
    const map = mapRef.current;
    if (!map || !mapCenter) return;

    const center = map.getCenter();
    const newCenter = { lat: center.getLat(), lng: center.getLng() };

    const moved =
      Math.abs(mapCenter.lat - newCenter.lat) > 0.005 ||
      Math.abs(mapCenter.lng - newCenter.lng) > 0.005;

    // 필터링된 상태에서만 버튼 보여주기
    setShowReSearchButton(!!selectedFilter && moved);

    // url에 search가 있을 경우 버튼 보여주기
    const search = searchParams.get('search');
    setShowReSearchButton(!!search && moved);
  };

  // 📍 현재 위치에서 재검색 클릭
  const handleReSearchClick = () => {
    const map = mapRef.current;
    if (!map) return;

    const center = map.getCenter();
    const newCenter = { lat: center.getLat(), lng: center.getLng() };

    setMapCenter(newCenter);
    setShowReSearchButton(false);
  };

  // 🔍 검색 쿼리에 반응하여 검색 API 호출
  useEffect(() => {
    const word = searchParams.get('search');

    if (!word) return;

    fetchMapSearchList(word).then((result) => {
      setMarkerData(result);
    });
  }, [searchParams, openModal]);

  // 필터링 상태 && 마커 데이터가 존재할 때 다이얼로그 열기
  useEffect(() => {
    if (selectedFilter && markerData.length > 0) {
      openModal();
    }
  }, [selectedFilter, markerData, openModal]);

  // 다이얼로그 닫히면 필터 초기화
  useEffect(() => {
    if (!isOpen) {
      setSelectedFilter(null);

      const params = new URLSearchParams(searchParams);
      params.delete('category');
      params.delete('search');
      setSearchParams(params, { replace: true });

      setShowReSearchButton(false);
      resetSearchValue();
    }
  }, [isOpen]);

  // 필터 해제 시 쿼리 제거
  useEffect(() => {
    if (selectedFilter === null) {
      const params = new URLSearchParams(searchParams);
      params.delete('category');
      setSearchParams(params, { replace: true });
    }
  }, [selectedFilter]);

  const getFallbackContent = () => {
    // ⌛ 카카오 맵 SDK 로딩 중인 상태
    if (mapLoading) {
      return <Loader text="🗺️ 지도를 불러오고 있어요!" />;
    }
    // ⌛ SDK 로딩 실패
    if (mapError) {
      return <NotFound text="😭 지도를 불러오는 데 실패했어요." />;
    }
    // ⌛ 위치 정보가 아직 준비되지 않음
    if (!myLocation || !mapCenter) {
      return <Loader text="🗺️ 지도를 불러오고 있어요!" />;
    }
  };

  const fallbackContent = getFallbackContent();

  const searchWord = searchParams.get('search');

  console.log('📌 markerData : ', markerData);
  console.log('📌 isOpen : ', isOpen);

  return (
    <main className="h-full w-full">
      {fallbackContent ? (
        fallbackContent
      ) : (
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
            center={mapCenter!}
            onCenterChanged={handleCenterChanged}
            style={{ width: '100%', height: '100%' }}
            className="relative"
            level={3}
          >
            <MapMarker
              position={myLocation!}
              image={{
                src: '/marker/my_location.svg',
                size: { width: 32, height: 32 },
                options: { offset: { x: 16, y: 16 } },
              }}
            />
            <MapMarkerList data={markerData} />
            {showReSearchButton && (
              <Button
                className="absolute top-30 left-1/2 z-20 h-[40px] -translate-x-1/2 rounded-full px-4 font-normal shadow-md"
                onClick={handleReSearchClick}
              >
                현재 위치에서 재검색
              </Button>
            )}
            <Outlet />
            {isOpen && markerData.length > 0 && (
              <SlideUpDialog
                header={
                  (searchWord && `${searchWord} 검색 결과`) ||
                  (selectedFilter && formatMapDialogHeader(selectedFilter)) ||
                  '내 주변'
                }
                dimd={false}
                dragIcon={true}
                className="shadow-[0_-4px_16px_rgba(0,0,0,0.1)]"
              >
                <ModalContent data={markerData} />
              </SlideUpDialog>
            )}
          </MapArea>
        </>
      )}
    </main>
  );
}

export default Map;
