import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

import { ListItemProps } from '@/components/ListItem/ListItem';

interface SearchState {
  keyword: string;
  date: { startDate: Date | null; endDate: Date | null } | null;
  region: string;
  theme: string[];
  searchResults: ListItemProps[];
  detailData: ListItemProps[];
}
interface SearchActions {
  setKeyWord: (keyword: string) => void;
  setDate: (date: { startDate: Date | null; endDate: Date | null }) => void;
  setRegion: (region: string) => void;
  setTheme: (updater: (prev: string[]) => string[]) => void;
  setSearchResults: (data: ListItemProps[]) => void;
  setDetailData: (detailData: ListItemProps[]) => void;
  resetSearch: () => void;
}

const initialState: SearchState = {
  keyword: '',
  date: { startDate: null, endDate: null },
  region: '',
  theme: [],
  searchResults: [],
  detailData: [],
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
              region: '',
              theme: [],
            },
            false,
            'resetSearchState',
          );
        },
      }),
      { name: 'search-store' },
    ),
  ),
);

export const useSearchActive = () =>
  useSearchStore((state) => {
    const hasKeyword = state.keyword.trim() !== '';
    const hasRegion = state.region.trim() !== '';
    const hasThemes = Array.isArray(state.theme) && state.theme.length > 0;

    return hasKeyword || hasRegion || hasThemes;
  });
