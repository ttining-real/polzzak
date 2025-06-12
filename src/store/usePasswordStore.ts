import { create } from 'zustand';

interface PasswordState {
  currentPw: string;
  changePw: string;
  changePwConfirm: string;
  currentPwValidation: { status: boolean; message: string };
  changePwValidation: { status: boolean; message: string };
  changePwConfirmValidation: { status: boolean; message: string };
  currentVisible: boolean;
  changePwVisible: boolean;
  changePwConfirmVisible: boolean;
}

interface PasswordActions {
  setCurrentPw: (currentPw: string) => void;
  setChangePw: (changePw: string) => void;
  setChangePwConfirm: (changePwConfirm: string) => void;
  setCurrentPwValidation: (currentPwValidation: {
    status: boolean;
    message: string;
  }) => void;
  setChangePwValidation: (changePwValidation: {
    status: boolean;
    message: string;
  }) => void;
  setChangePwConfirmValidation: (changePwConfirmValidation: {
    status: boolean;
    message: string;
  }) => void;
  setCurrentVisible: (currentVisible: boolean) => void;
  setChangePwVisible: (changePwVisible: boolean) => void;
  setChangePwConfirmVisible: (changePwConfirmVisible: boolean) => void;
}

export const usePasswordStore = create<PasswordState & PasswordActions>(
  (set) => ({
    currentPw: '',
    changePw: '',
    changePwConfirm: '',
    currentPwValidation: { status: false, message: '' },
    changePwValidation: { status: false, message: '' },
    changePwConfirmValidation: { status: false, message: '' },
    currentVisible: false,
    changePwVisible: false,
    changePwConfirmVisible: false,

    setCurrentPw: (currentPw) => set({ currentPw }),
    setChangePw: (changePw) => set({ changePw }),
    setChangePwConfirm: (changePwConfirm) => set({ changePwConfirm }),
    setCurrentPwValidation: (currentPwValidation) =>
      set({ currentPwValidation }),
    setChangePwValidation: (changePwValidation) => set({ changePwValidation }),
    setChangePwConfirmValidation: (changePwConfirmValidation) =>
      set({ changePwConfirmValidation }),
    setCurrentVisible: (currentVisible) => set({ currentVisible }),
    setChangePwVisible: (changePwVisible) => set({ changePwVisible }),
    setChangePwConfirmVisible: (changePwConfirmVisible) =>
      set({ changePwConfirmVisible }),
  }),
);
