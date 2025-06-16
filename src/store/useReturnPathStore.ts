import { create } from 'zustand';

interface ReturnPathStore {
  fromPath: string | null;
  setFromPath: (path: string) => void;
  reset: () => void;
}

export const useReturnPathStore = create<ReturnPathStore>((set) => ({
  fromPath: null,
  setFromPath: (path) => set({ fromPath: path }),
  reset: () => set({ fromPath: null }),
}));
