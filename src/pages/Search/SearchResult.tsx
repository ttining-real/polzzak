import { format } from 'date-fns';

import { fetchSearchList } from '@/api/openAPI/utils/fetchSearchList';
import Button from '@/components/Button/Button';
import ListItem from '@/components/ListItem/ListItem';
import { ListItemProps } from '@/components/ListItem/ListItem';
import DropdownCustom from '@/components/SortDropdown/DropdownCustom';
import { useSearchStore } from '@/store/useSearchStore';

function SearchResult() {
  const region = useSearchStore((state) => state.region);
  const month = useSearchStore((state) => state.month);
  const keyword = useSearchStore((state) => state.keyword);
  const theme = useSearchStore((state) => state.theme);
  const date = useSearchStore((state) => state.date);
  const pageNo = useSearchStore((state) => state.pageNo);
  const appendSearchResults = useSearchStore(
    (state) => state.appendSearchResults,
  );
  const setPageNo = useSearchStore((state) => state.setPageNo);
  const searchResults = useSearchStore((state) => state.searchResults);
  const filteredResults = searchResults.filter((item) => {
    const matchesRegion = region ? item.addr1.includes(region) : true;

    const startMonth = item.eventstartdate?.substring(4, 6);
    const paddedMonth = month ? month.padStart(2, '0') : null;
    const matchesMonth = month ? startMonth === paddedMonth : true;

    return matchesRegion && matchesMonth;
  });

  const handleLoadMore = async () => {
    const nextPage = pageNo + 1;
    try {
      const formatToYYYYMMDD = (date: Date) => format(date, 'yyyyMMdd');

      const formattedStart = date?.startDate
        ? formatToYYYYMMDD(date.startDate)
        : undefined;
      const formattedEnd = date?.endDate
        ? formatToYYYYMMDD(date.endDate)
        : undefined;

      const nextResults = await fetchSearchList({
        keyword,
        region,
        theme,
        startDate: formattedStart,
        endDate: formattedEnd,
        pageNo: nextPage,
      });

      const transformedResults = nextResults.filter(
        (item): item is ListItemProps =>
          !!item.contentid &&
          !!item.contenttypeid &&
          !!item.title &&
          !!item.addr1 &&
          !!item.firstimage,
      );

      appendSearchResults(transformedResults);
      setPageNo(nextPage);
    } catch (error) {
      console.error('더보기 중 오류 발생:', error);
    }
  };

  return (
    <main className="flex h-full w-full flex-1 flex-col gap-4 overflow-hidden bg-white p-6">
      <div>
        <DropdownCustom selectedRegion={region} />
      </div>
      {searchResults.length > 0 ? (
        <section className="no-scrollbar flex flex-col gap-4 overflow-y-scroll">
          <ListItem data={filteredResults} />
          <Button variant={'secondary'} onClick={handleLoadMore}>
            더보기
          </Button>
        </section>
      ) : (
        <p>검색 결과가 없습니다.</p>
      )}
    </main>
  );
}

export default SearchResult;
