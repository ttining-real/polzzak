import { useNavigate } from 'react-router-dom';

import supabase from '@/api/supabase';

export const useUserUpdate = (inputPhoneNumber: string) => {
  const navigate = useNavigate();

  async function userUpdate() {
    // > 사용자 데이터 조회
    const PREV_USER_EMAIL = localStorage.getItem('register_email');
    if (!PREV_USER_EMAIL) {
      console.error('해당 USER의 EMAIL이 존재하지 않습니다.');
      return;
    }

    const { data: USER_DATA, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', PREV_USER_EMAIL)
      .single();

    if (!USER_DATA || fetchError) {
      console.error(fetchError, '사용자 정보를 가져오는 데 실패했습니다.');
      return;
    }

    // > 사용자 데이터 조회 후 휴대폰번호가 없을 시 저장
    if (USER_DATA.phone_number === null) {
      const { error: UpdateError } = await supabase
        .from('users')
        .update({ phone_number: inputPhoneNumber })
        .eq('email', PREV_USER_EMAIL);

      navigate(`/register/4`);

      if (UpdateError) {
        console.error(UpdateError, '휴대폰번호를 저장하는 데 실패했습니다.');
      }
    }
  }

  return { userUpdate };
};
