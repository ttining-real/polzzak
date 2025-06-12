import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import { useToast } from '@/hooks/useToast';
import { useEditStore } from '@/store/useEditStore';

function PhoneNumber() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { phoneNumber, setPhoneNumber, authNumber, setAuthNumber } =
    useEditStore();
  const [isAuth, setIsAuth] = useState(false); // 인증번호 받았는지?
  const [vertify] = useState(true); // 인증번호 일치? 일단 true로 만들어서 다음 페이지 넘어가도록 함

  const handleGetAuth = () => {
    setIsAuth(true);
  };

  const handlePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    // > 000-0000-0000 형태
    if (value.length <= 3) {
      // value = value;
    } else if (value.length <= 7) {
      // 4~7자리
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length <= 11) {
      // 8자리 이상
      value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    } else {
      // 11자리 초과 입력 방지
      value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }

    setPhoneNumber(value);
  };
  const handleAuthNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthNumber(e.target.value);
  };
  const handleAuth = async () => {
    if (vertify) {
      try {
        const USER_ID =
          localStorage.getItem('user') || sessionStorage.getItem('user');

        if (!USER_ID) {
          console.error('해당 USER의 ID가 존재하지 않습니다.');
          return;
        }

        const { error: fetchError } = await supabase
          .from('ex_users')
          .select('*')
          .eq('user_id', USER_ID)
          .single();

        if (fetchError) {
          console.error('사용자 정보 조회 실패:', fetchError);
          return;
        }

        const { error: updateError } = await supabase
          .from('ex_users')
          .update({ phone_number: phoneNumber })
          .eq('user_id', USER_ID);

        if (updateError) {
          console.error('전화번호 저장 실패:', updateError);
          return;
        }

        navigate(-1);
        showToast('휴대폰 번호 저장을 성공했습니다.', 'top-[64px]', 3000);
        setPhoneNumber('');
        setAuthNumber('');
      } catch (error) {
        console.error('처리 중 오류 발생:', error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Input
          label="휴대폰 번호"
          placeholder="000-0000-0000"
          maxLength={13}
          value={phoneNumber}
          onChange={handlePhoneNumber}
        />
      </div>
      <div className={isAuth ? 'flex items-end gap-1' : 'hidden'}>
        <div className="w-full">
          <Input
            label="인증번호 확인"
            placeholder="000000"
            maxLength={6}
            value={authNumber}
            onChange={handleAuthNumber}
          />
        </div>
        <Button variant={'secondary'}>재전송</Button>
      </div>
      {isAuth ? (
        <Button disabled={authNumber.length === 0} onClick={handleAuth}>
          인증하기
        </Button>
      ) : (
        <Button disabled={phoneNumber.length === 0} onClick={handleGetAuth}>
          인증번호 받기
        </Button>
      )}
    </div>
  );
}

export default PhoneNumber;
