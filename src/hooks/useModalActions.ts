import { useNavigate } from 'react-router-dom';

import supabase from '@/api/supabase';
import { updateNickname } from '@/api/supabase/hooks/updateNickname';
import { useUserUpdate } from '@/hooks/register/useUserUpdate';
import { useModalStore } from '@/store/useModalStore';
import { useRegisterStore } from '@/store/useRegisterStore';
import { useSearchStore } from '@/store/useSearchStore';

export interface ModalActionParams {
  buttonText: string;
}

export function useModalActions() {
  const navigate = useNavigate();
  const closeModal = useModalStore((state) => state.closeModal);
  const phoneNumber = useRegisterStore((state) => state.phoneNumber);
  const nickname = useRegisterStore((state) => state.nickname);
  const { userUpdate } = useUserUpdate(phoneNumber);
  const setDate = useSearchStore((state) => state.setDate);

  const modalActions: Record<string, (inputValue?: string) => void> = {
    취소: () => {
      closeModal();
    },
    '다시 인증하기': () => {
      closeModal();
    },
    다음: () => {
      userUpdate();
      navigate('/register/4');
      closeModal();
    },
    확인: async () => {
      const result = await updateNickname(nickname);
      if (result) {
        navigate('/login', { replace: true });
        localStorage.removeItem('users');
        closeModal();
      } else {
        console.error('닉네임 저장 실패 또는 이미 존재합니다.');
      }
    },

    저장: () => console.log('저장 버튼에 맞는 함수'),
    삭제: () => console.log('삭제 버튼에 맞는 함수'),
    추가: () => console.log('추가 버튼에 맞는 함수'),
    초기화: () => {
      setDate({ startDate: null, endDate: null });
      closeModal();
    },
    변경: () => console.log('변경 버튼에 맞는 함수'),
    로그아웃: async () => {
      try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;
        localStorage.removeItem('user');

        navigate('/', {
          state: { toastMessage: '로그아웃이 완료되었습니다.' },
        });

        closeModal();
      } catch (error) {
        console.error('로그아웃 실패 :', error);
      }
    },
    탈퇴: async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.log('No user found');
          return { success: false, error: 'No user logged in' };
        }

        console.log('Deleting user:', user.id);

        const response = await fetch('/api/supabase/utils/deleteUsers', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });

        const text = await response.text();
        let result: { message?: string; error?: string } = {};

        try {
          result = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
        }

        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete user');
        }

        await supabase.auth.signOut();

        return { success: true, message: result.message || 'User deleted' };
      } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error };
      }
    },
    '신규 폴짝 추가하기': () =>
      console.log('신규 폴짝 추가하기 버튼에 맞는 함수'),
    '기존 폴짝 추가하기': () =>
      console.log('기존 폴짝 추가하기 버튼에 맞는 함수'),
  };

  const handleButtonClick = (params: ModalActionParams) => {
    const action = modalActions[params.buttonText];
    if (action) {
      action();
    } else {
      console.warn(`"${params.buttonText}"에 대한 동작이 정의되지 않았습니다.`);
    }
  };

  return { handleButtonClick };
}
