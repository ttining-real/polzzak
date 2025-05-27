import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

import { ListItemProps } from '@/components/ListItem/ListItem';

interface SearchState {
  keyword: string;
  date: { startDate: Date | null; endDate: Date | null } | null;
  month: string;
  region: string;
  theme: string[];
  searchResults: ListItemProps[];
  detailData: ListItemProps[];
  pageNo: number;
}
interface SearchActions {
  setKeyWord: (keyword: string) => void;
  setDate: (date: { startDate: Date | null; endDate: Date | null }) => void;
  setMonth: (month: string) => void;
  setRegion: (region: string) => void;
  setTheme: (updater: (prev: string[]) => string[]) => void;
  setSearchResults: (data: ListItemProps[]) => void;
  setFilteredResults: (results: ListItemProps[]) => void;
  setDetailData: (detailData: ListItemProps[]) => void;
  resetSearch: () => void;
  sortSearchResults: (
    type: 'latest' | 'favorite' | 'review' | 'oldest',
  ) => void;
  setPageNo: (pageNo: number) => void;
  appendSearchResults: (results: ListItemProps[]) => void;
}

const initialState: SearchState = {
  keyword: '',
  date: { startDate: null, endDate: null },
  month: '',
  region: '',
  theme: [],
  searchResults: [],
  detailData: [],
  pageNo: 1,
};

export const useSearchStore = create<SearchState & SearchActions>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        ...initialState,

        setKeyWord: (keyword) => {
          const trimKeyword = typeof keyword === 'string' ? keyword.trim() : '';
          if (get().keyword === trimKeyword) return;
          set({ keyword: trimKeyword }, false, 'setKeyWord');
        },
        setDate: (newDate) => {
          const currentDate = get().date;

          const isSameStart =
            currentDate?.startDate &&
            newDate.startDate &&
            currentDate.startDate.getTime() === newDate.startDate.getTime();

          const isSameEnd =
            currentDate?.endDate &&
            newDate.endDate &&
            currentDate.endDate.getTime() === newDate.endDate.getTime();

          if (isSameStart && isSameEnd) return;

          set({ date: newDate }, false, 'setDate');
        },
        setMonth: (month) => {
          if (get().month === month) return;
          set({ month }, false, 'setMonth');
        },
        setRegion: (region) => {
          const trimmedRegion = typeof region === 'string' ? region.trim() : '';
          if (get().region === trimmedRegion) return;
          set({ region: trimmedRegion }, false, 'setRegion');
        },
        setTheme: (updater) => {
          const newTheme = updater(get().theme);
          if (shallow(get().theme, newTheme)) return;
          set({ theme: newTheme }, false, 'setTheme');
        },
        setSearchResults: (searchResults) =>
          set({ searchResults }, false, 'setSearchResults'),
        setDetailData: (detailData) => set({ detailData: detailData }),
        resetSearch: () => {
          set(
            {
              keyword: '',
              date: null,
              month: '',
              region: '',
              theme: [],
              searchResults: [],
              detailData: [],
            },
            false,
            'resetSearchState',
          );
        },
        sortSearchResults: (type) => {
          const results = [...get().searchResults];
          let sorted;

          switch (type) {
            case 'latest':
              sorted = results.sort((a, b) =>
                b.eventstartdate.localeCompare(a.eventstartdate),
              );
              break;
            case 'oldest':
              sorted = results.sort((a, b) =>
                a.eventstartdate.localeCompare(b.eventstartdate),
              );
              break;
            case 'favorite':
              // sorted = results.sort((a, b) => b.likes - a.likes);
              break;
            case 'review':
              // sorted = results.sort((a, b) => b.reviews - a.reviews);
              break;
            default:
              sorted = results;
          }

          set({ searchResults: sorted });
        },
        setPageNo: (pageNo) => set({ pageNo }),
        appendSearchResults: (newResults) =>
          set((state) => ({
            searchResults: [...state.searchResults, ...newResults],
          })),
      }),
      { name: 'search-store' },
    ),
  ),
);

export const useSearchActive = () =>
  useSearchStore((state) => {
    const hasKeyword = state.keyword.trim() !== '';
    const hasDate = state.date?.startDate || state.date?.endDate;
    const hasRegion = state.region.trim() !== '';
    const hasThemes = Array.isArray(state.theme) && state.theme.length > 0;

    return hasKeyword || hasDate || hasRegion || hasThemes;
  });
