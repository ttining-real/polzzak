import Button from '@/components/Button/Button';
import ListItem from '@/components/ListItem/ListItem';
import DropdownCustom from '@/components/SortDropdown/DropdownCustom';
import { useSearchStore } from '@/store/useSearchStore';

function SearchResult() {
  const { searchResults } = useSearchStore();
  const region = useSearchStore((state) => state.region);

  return (
    <main className="flex h-full w-full flex-1 flex-col gap-4 overflow-hidden bg-white p-6">
      <div>
        <DropdownCustom selectedRegion={region} />
      </div>
      {searchResults.length > 0 ? (
        <section className="no-scrollbar flex flex-col gap-4 overflow-y-scroll">
          <ListItem data={searchResults} />
          <Button variant={'secondary'}>더보기</Button>
        </section>
      ) : (
        <p>검색 결과가 없습니다.</p>
      )}
    </main>
  );
}

export default SearchResult;
