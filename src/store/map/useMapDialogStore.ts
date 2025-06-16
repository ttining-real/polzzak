import { create } from 'zustand';

interface DialogStore {
  isOpen: boolean;
  openModal: (id?: string | null) => void;
  closeModal: () => void;
}

export const useMapDialogStore = create<DialogStore>()((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));

export type DialogProps = {
  header: string;
  children?: React.ReactNode;
  className?: string;
};
