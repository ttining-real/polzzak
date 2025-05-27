import { format } from 'date-fns';
import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchSearchList } from '@/api/openAPI/utils/fetchSearchList';
import Button from '@/components/Button/Button';
import { ListItemProps } from '@/components/ListItem/ListItem';
import { useSearchActive, useSearchStore } from '@/store/useSearchStore';

const SearchButton = memo(function SearchButton() {
  const navigate = useNavigate();

  const isActive = useSearchActive();
  const keyword = useSearchStore((state) => state.keyword);
  const date = useSearchStore((state) => state.date);
  const region = useSearchStore((state) => state.region);
  const theme = useSearchStore((state) => state.theme);
  const setSearchResults = useSearchStore((state) => state.setSearchResults);

  const handleSearchButton = useCallback(async () => {
    if (!isActive) return;

    const formatToYYYYMMDD = (date: Date) => {
      return format(date, 'yyyyMMdd');
    };
    const formattedStart = date?.startDate
      ? formatToYYYYMMDD(date.startDate)
      : undefined;
    const formattedEnd = date?.endDate
      ? formatToYYYYMMDD(date.endDate)
      : undefined;

    try {
      const searchResults = await fetchSearchList({
        keyword,
        region,
        theme,
        startDate: formattedStart,
        endDate: formattedEnd,
      });

      const transformedResults = searchResults.filter(
        (item): item is ListItemProps =>
          !!item.contentid &&
          !!item.contenttypeid &&
          !!item.title &&
          !!item.addr1,
      );
      setSearchResults(transformedResults);

      const params = new URLSearchParams();
      if (keyword) params.set('q', keyword);
      if (formattedStart) params.set('startDate', formattedStart);
      if (formattedEnd) params.set('endDate', formattedEnd);
      if (region) params.set('region', region);
      if (theme.length > 0) {
        params.set('theme', theme.join(','));
      }

      navigate(`/search/result?${params.toString()}`);
    } catch (error) {
      console.error('검색 결과를 가져오는 중 오류가 발생했습니다:', error);
    }
  }, [isActive, keyword, date, region, theme, setSearchResults, navigate]);

  return (
    <Button disabled={!isActive} onClick={handleSearchButton}>
      검색
    </Button>
  );
});

export default SearchButton;
