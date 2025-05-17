import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

import { ListItemProps } from '@/components/ListItem/ListItem';

interface SearchState {
  keyword: string;
  region: string;
  theme: string[];
  searchResults: ListItemProps[];
  detailData: ListItemProps[];
}
interface SearchActions {
  setKeyWord: (keyword: string) => void;
  setRegion: (region: string) => void;
  setTheme: (updater: (prev: string[]) => string[]) => void;
  setSearchResults: (data: ListItemProps[]) => void;
  setDetailData: (detailData: ListItemProps[]) => void;
}

const initialState: SearchState = {
  keyword: '',
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
          if (get().keyword === keyword) return;
          set({ keyword }, false, 'setKeyWord');
        },
        setRegion: (region) => {
          if (get().region === region) return;
          set({ region }, false, 'setRegion');
        },
        setTheme: (updater) => {
          const newTheme = updater(get().theme);
          if (shallow(get().theme, newTheme)) return;
          set({ theme: newTheme }, false, 'setTheme');
        },
        setSearchResults: (searchResults) =>
          set({ searchResults }, false, 'setSearchResults'),
        setDetailData: (detailData) => set({ detailData: detailData }),
      }),
      { name: 'search-store' },
    ),
  ),
);

export const useSearchActive = () =>
  useSearchStore((state) => {
    return Boolean(state.keyword || state.region || state.theme.length > 0);
  });
