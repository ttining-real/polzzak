import { useRef, useState } from 'react';
import {
  Map as MapArea,
  MapMarker,
  useKakaoLoader,
} from 'react-kakao-maps-sdk';
import { Outlet, useSearchParams } from 'react-router-dom';

import Button from '@/components/Button/Button';
import MapDialog from '@/components/Dialog/MapDialog';
import Loader from '@/components/Loader/Loader';
import MapHeader from '@/components/Map/MapHeader';
import MapMarkerList from '@/components/Map/MapMarkerList';
import ModalContent from '@/components/Map/ModalContent';
import ModalDetailContent from '@/components/Map/ModalDetailContent';
import { useFetchMarkers } from '@/hooks/map/useFetchMarkers';
import { useMapDialogEffect } from '@/hooks/map/useMapDialogEffect';
import { useSyncFilterWithQuery } from '@/hooks/map/useSyncFilterWithQuery';
import { useSyncLocation } from '@/hooks/map/useSyncLocation';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { formatMapDialogHeader } from '@/lib/formatMapDialogHeader';
import { useMapDialogStore } from '@/store/map/useMapDialogStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useMapSearchStore } from '@/store/useMapSearchStore';
import { DetailCommonDataType } from '@/types/detailCommonDataType';
import { LatLng } from '@/types/LatLng';
import { FilterType, MarkerDataTypes } from '@/types/mapDataType';

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
  const [markerData, setMarkerData] = useState<MarkerDataTypes[]>([]);

  // 필터링 상태 추가
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);

  // URL 쿼리 파라미터
  const [searchParams, setSearchParams] = useSearchParams();

  // 다이얼로그 상태
  const { isOpen, openModal, closeModal } = useMapDialogStore();

  // 재검색 버튼 상태
  const [showReSearchButton, setShowReSearchButton] = useState(false);

  const { resetSearchValue } = useMapSearchStore();

  // 선택된 마커
  const [selectedMarker, setSelectedMarker] =
    useState<DetailCommonDataType | null>(null);

  // 🚩 위치 초기화
  useSyncLocation(location, locationError, setMyLocation, setMapCenter);

  // 🔁 필터 ↔ url 쿼리 파라미터 동기화
  useSyncFilterWithQuery(
    selectedFilter,
    setSelectedFilter,
    searchParams,
    setSearchParams,
  );

  // 🚩 마커 데이터 패칭
  useFetchMarkers({ myLocation, selectedFilter, setMarkerData });

  const search = searchParams.get('search');

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

  // 🌻 다이얼로그 상태 연동
  useMapDialogEffect({
    selectedFilter,
    markerData,
    selectedMarker,
    isOpen,
    searchParams,
    setSelectedFilter,
    setSelectedMarker,
    setMarkerData,
    setSearchParams,
    setShowReSearchButton,
    resetSearchValue,
    openModal,
    closeModal,
  });

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

  // 다이얼로그 목록 보기로 변경 (뒤로 가기)
  const handleBack = () => {
    setSelectedMarker(null);
  };

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
            {markerData.length > 0 && (
              <MapMarkerList
                data={markerData}
                selectedFilter={selectedFilter}
                onMarkerClick={setSelectedMarker}
              />
            )}
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
              <MapDialog
                header={
                  selectedMarker
                    ? (selectedMarker.title ?? '상세 정보')
                    : search
                      ? `${search} 검색 결과`
                      : selectedFilter
                        ? (formatMapDialogHeader(selectedFilter) ?? '필터 결과')
                        : '내 주변'
                }
                onBack={selectedMarker ? handleBack : undefined}
              >
                {selectedMarker ? (
                  <ModalDetailContent
                    data={selectedMarker}
                    contentId={selectedMarker.contentid}
                  />
                ) : (
                  markerData.length > 0 && <ModalContent data={markerData} />
                )}
              </MapDialog>
            )}
          </MapArea>
        </>
      )}
    </main>
  );
}

export default Map;
