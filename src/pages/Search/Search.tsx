import { memo } from 'react';

import Modal from '@/components/Modal/Modal';
import DateSelector from '@/components/Search/DateSelector/DateSelector';
import KeywordInput from '@/components/Search/KeywordInput/KeywordInput';
import RegionSelection from '@/components/Search/RegionSelection/RegionSelection';
import SearchButton from '@/components/Search/SearchButton/SearchButton';
import ThemeSelection from '@/components/Search/ThemeSelection/ThemeSelection';

const Search = memo(function Search() {
  return (
    <main className="flex h-full w-full flex-1 flex-col overflow-auto p-6">
      <h1 className="sr-only">검색</h1>
      <div className="flex flex-1 flex-col gap-4">
        <KeywordInput />
        <DateSelector />
        <RegionSelection />
        <ThemeSelection />
      </div>
      <SearchButton />
      <Modal mode="slide" type="calendar" />
    </main>
  );
});

export default Search;
