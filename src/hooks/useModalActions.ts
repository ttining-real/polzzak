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
        localStorage.removeItem('ex_users');
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
      const LOGINED_USER = localStorage.getItem('user');
      const { error } = await supabase
        .from('ex_users')
        .delete()
        .eq('user_id', LOGINED_USER);

      navigate('/', {
        state: { toastMessage: '회원 탈퇴가 완료되었습니다.' },
      });
      localStorage.clear();
      sessionStorage.clear();
      if (error) {
        console.error('회원 탈퇴를 할 수 없습니다. ', error);
      }
      closeModal();
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
