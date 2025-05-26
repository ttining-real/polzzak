import { create } from 'zustand';

interface MapSearchStore {
  searchValue: string;
  setSearchValue: (value: string) => void;
  resetSearchValue: () => void;
}

export const useMapSearchStore = create<MapSearchStore>((set) => ({
  searchValue: '',
  setSearchValue: (value) => set({ searchValue: value }),
  resetSearchValue: () => set({ searchValue: '' }),
}));
