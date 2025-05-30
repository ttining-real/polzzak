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
  // ✅ 마커 데이터가 있을 때 모달 열기
  useEffect(() => {
    if (selectedFilter && markerData.length > 0) {
      openModal();
    } else if (selectedMarker) {
      openModal();
    } else if (markerData.length > 0) {
      openModal();
    }
  }, [selectedFilter, markerData]);

  // ✅ 모달 닫힐 때 쿼리 초기화
  useEffect(() => {
    if (!isOpen && markerData.length === 0) return;

    if (!isOpen) {
      const newParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key !== 'category' && key !== 'search') {
          newParams.set(key, value);
        }
      });

      setSelectedFilter(null);
      setSelectedMarker(null);
      setSearchParams({}, { replace: true });
      setShowReSearchButton(false);
      resetSearchValue();
    }
  }, [isOpen]);

  // ✅ 필터 선택 해제 시, 상태 및 쿼리 초기화
  useEffect(() => {
    if (selectedFilter === null) {
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
  }, [selectedFilter]);
}
