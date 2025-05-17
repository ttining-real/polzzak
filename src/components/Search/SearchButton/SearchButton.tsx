import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchSearchList } from '@/api/openAPI/utils/fetchSearchList';
import Button from '@/components/Button/Button';
import { useSearchStore } from '@/store/useSearchStore';

function SearchButton() {
  const navigate = useNavigate();

  const keyword = useSearchStore((state) => state.keyword);
  const region = useSearchStore((state) => state.region);
  const theme = useSearchStore((state) => state.theme);
  const setSearchResults = useSearchStore((state) => state.setSearchResults);

  const isDisabled = !keyword && !region && theme.length === 0;

  const handleSearchButton = useCallback(async () => {
    if (isDisabled) return;

    try {
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
  }, [keyword, region, theme, setSearchResults, navigate, isDisabled]);

  return (
    <Button disabled={isDisabled} onClick={handleSearchButton}>
      검색
    </Button>
  );
}

export default SearchButton;
