import { Dispatch, SetStateAction, useEffect } from 'react';
import { URLSearchParamsInit } from 'react-router-dom';

import { DetailCommonDataType } from '@/types/detailCommonDataType';
import { MarkerDataTypes } from '@/types/mapDataType';
import { FilterType } from '@/types/mapDataType';

type UseMapDialogEffectProps = {
  selectedFilter: FilterType | null;
  markerData: MarkerDataTypes[];
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
  useEffect(() => {
    if (selectedFilter && markerData.length > 0) {
      openModal();
    }
  }, [selectedFilter, markerData]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFilter(null);
      setSelectedMarker(null);
      const params = new URLSearchParams(searchParams);
      params.delete('category');
      params.delete('search');
      setSearchParams(params, { replace: true });
      setShowReSearchButton(false);
      resetSearchValue();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedFilter === null) {
      closeModal();
      setMarkerData([]);
      const params = new URLSearchParams(searchParams);
      params.delete('category');
      setSearchParams(params, { replace: true });
    }
  }, [selectedFilter]);
}
