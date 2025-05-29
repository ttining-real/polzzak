import { useEffect } from 'react';
import { NavigateOptions, URLSearchParamsInit } from 'react-router-dom';

import { filterNameToType, typeToFilterName } from '@/lib/filterMap';
import { FilterType } from '@/types/mapDataType';

type SetSearchParams = (
  nextInit: URLSearchParamsInit,
  navigateOpts?: NavigateOptions,
) => void;

export function useSyncFilterWithQuery(
  selectedFilter: FilterType | null,
  setSelectedFilter: (value: FilterType) => void,
  searchParams: URLSearchParams,
  setSearchParams: SetSearchParams,
) {
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const matchedType = filterNameToType(categoryParam);
      if (matchedType) {
        setSelectedFilter(matchedType);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedFilter) return;
    const filterName = typeToFilterName(selectedFilter);
    if (!filterName) return;

    const params = new URLSearchParams(searchParams);
    params.set('category', filterName);

    setSearchParams(params);
  }, [selectedFilter]);
}
