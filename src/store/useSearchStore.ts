import { create } from 'zustand';

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
  setTheme: (theme: string[] | ((prev: string[]) => string[])) => void;
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
  (set, get) => ({
    ...initialState,

    setKeyWord: (keyword) => set({ keyword }),
    setRegion: (region) => set({ region }),
    setTheme: (theme) => {
      const currentTheme = get().theme;
      if (typeof theme === 'function') {
        set({ theme: theme(currentTheme) });
      } else {
        set({ theme });
      }
    },
    setSearchResults: (data) => set({ searchResults: data }),
    setDetailData: (detailData) =>
      set({
        detailData: detailData,
      }),
  }),
);
