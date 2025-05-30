import { Dispatch, SetStateAction, useEffect } from 'react';
import { URLSearchParamsInit } from 'react-router-dom';

import { DetailCommonDataType } from '@/types/detailCommonDataType';
import { MarkerDataTypes } from '@/types/mapDataType';
import { FilterType } from '@/types/mapDataType';

type UseMapDialogEffectProps = {
  selectedFilter: FilterType | null;
  markerData: MarkerDataTypes[];
  selectedMarker: DetailCommonDataType | null;
  isOpen: boolean;
  searchParams: URLSearchParams;

  setSelectedFilter: Dispatch<SetStateAction<FilterType | null>>;
  setSelectedMarker: Dispatch<SetStateAction<DetailCommonDataType | null>>;
  setMarkerData: Dispatch<SetStateAction<MarkerDataTypes[]>>;
  setSearchParams: (
    nextInit: URLSearchParamsInit,
    navigateOpts?: { replace?: boolean },
  ) => void;
  setShowReSearchButton: Dispatch<SetStateAction<boolean>>;

  resetSearchValue: () => void;
  openModal: () => void;
  closeModal: () => void;
};

export function useMapDialogEffect({
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
}: UseMapDialogEffectProps) {
  // console.log('1️⃣ 선택된 필터', selectedFilter);
  // console.log('2️⃣ 마커 데이터', markerData);
  // console.log('3️⃣ 선택된 마커', selectedMarker);
  // console.log('4️⃣ 다이얼로그 상태', isOpen);
  // console.log('5️⃣ 검색어 url', searchParams);

  // 모달 열기: searchParams에 search가 있거나 selectedFilter가 있거나 markerData가 있을 경우
  useEffect(() => {
    const hasSearchParam = searchParams.has('search');
    if (
      selectedFilter !== null ||
      markerData.length > 0 ||
      hasSearchParam ||
      selectedMarker !== null
    ) {
      openModal();
    }
  }, [selectedFilter, markerData, selectedMarker, searchParams]);

  // 모달 닫기 및 상태 초기화: isOpen이 false일 때
  useEffect(() => {
    if (!isOpen) {
      const newParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key !== 'category' && key !== 'search') {
          newParams.set(key, value);
        }
      });

      setSelectedFilter(null);
      setSelectedMarker(null);
      setMarkerData([]);
      setSearchParams({}, { replace: true });
      setShowReSearchButton(false);
      resetSearchValue();
    }
  }, [isOpen]);

  // selectedFilter가 null이고, searchParams에 category나 search가 없을 때 상태 초기화
  useEffect(() => {
    const hasCategoryOrSearch =
      searchParams.has('category') || searchParams.has('search');

    if (selectedFilter === null && !hasCategoryOrSearch) {
      closeModal();
      setMarkerData([]);

      const newParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key !== 'category') {
          newParams.set(key, value);
        }
      });

      setSearchParams({}, { replace: true });
    }

    if (!hasCategoryOrSearch) {
      closeModal();
      setMarkerData([]);
    }
  }, [selectedFilter, searchParams]);
}
