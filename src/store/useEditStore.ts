import { create } from 'zustand';

interface ValidationStatus {
  status: boolean;
  message: string;
}

interface EditState {
  nickname: string;
  phoneNumber: string;
  authNumber: string;
  emailId: string;
  domain: string;
  validationStatus: ValidationStatus;
}

interface EditActions {
  setPhoneNumber: (phoneNumber: string) => void;
  setAuthNumber: (authNumber: string) => void;
  setNickname: (nickname: string) => void;
  setEmailId: (emailId: string) => void;
  setDomain: (domain: string) => void;
  setValidationStatus: (validationStatus: ValidationStatus) => void;
}

export const useEditStore = create<EditState & EditActions>()((set) => ({
  nickname: '',
  setNickname: (nickname) => set({ nickname }),
  phoneNumber: '',
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  authNumber: '',
  setAuthNumber: (authNumber) => set({ authNumber }),
  emailId: '',
  setEmailId: (emailId) => set({ emailId }),
  domain: '',
  setDomain: (domain) => set({ domain }),
  validationStatus: { status: false, message: '' },
  setValidationStatus: (validationStatus) => set({ validationStatus }),
}));
