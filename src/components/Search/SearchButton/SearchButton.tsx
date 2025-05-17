import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchSearchList } from '@/api/openAPI/utils/fetchSearchList';
import Button from '@/components/Button/Button';
import { useSearchActive, useSearchStore } from '@/store/useSearchStore';

const SearchButton = memo(function SearchButton() {
  const navigate = useNavigate();

  const isActive = useSearchActive();
  const setSearchResults = useSearchStore((state) => state.setSearchResults);

  const handleSearchButton = useCallback(async () => {
    if (!isActive) return;

    try {
      const { keyword, region, theme } = useSearchStore.getState();

      const searchResults = await fetchSearchList({ keyword, region, theme });
      setSearchResults(searchResults);

      const params = new URLSearchParams();
      if (keyword) params.set('q', keyword);
      if (region) params.set('region', region);
      if (theme.length > 0) {
        params.set('theme', theme.join(','));
      }
      navigate(`/search/result?${params.toString()}`);
    } catch (error) {
      console.error('검색 결과를 가져오는 중 오류가 발생했습니다:', error);
    }
  }, [isActive, setSearchResults, navigate]);

  console.log('SearchButton rendered');

  return (
    <Button disabled={!isActive} onClick={handleSearchButton}>
      검색
    </Button>
  );
});

export default SearchButton;
