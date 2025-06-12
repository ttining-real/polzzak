import { create } from 'zustand';

import supabase from '@/api/supabase';

interface UserState {
  user: {
    nickname: string;
    email: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  fetchUserInfo: () => Promise<void>;
}

export const useUserStore = create<UserState & UserActions>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUserInfo: async () => {
    set({ isLoading: true, error: null });

    try {
      const CURRENT_USER = localStorage.getItem('user');

      if (!CURRENT_USER) {
        throw new Error('해당 USER의 정보를 가져올 수 없습니다.');
      }

      const { data: USER_DATA, error } = await supabase
        .from('users')
        .select('nickname, email')
        .eq('email', CURRENT_USER);

      if (error || !USER_DATA || USER_DATA.length === 0) {
        throw new Error('사용자 정보를 가져오는 데 실패했습니다.');
      }

      set({ user: USER_DATA[0], isLoading: false });
    } catch (error) {
      console.error(error);
      set({
        error:
          error instanceof Error
            ? error.message
            : '사용자 정보를 가져오는 데 오류가 발생했습니다.',
        isLoading: false,
      });
    }
  },
}));
