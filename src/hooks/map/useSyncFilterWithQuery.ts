import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { filterNameToType, typeToFilterName } from '@/lib/filterMap';
import { FilterType } from '@/types/mapDataType';

export function useSyncFilterWithQuery(
  selectedFilter: FilterType | null,
  setSelectedFilter: (value: FilterType) => void,
) {
  const [searchParams, setSearchParams] = useSearchParams();

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
    setSearchParams(params, { replace: true });
  }, [selectedFilter]);
}
