import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import supabase from '@/api/supabase';
import { useGetTable } from '@/api/supabase/hooks';
import Button from '@/components/Button/Button';
import AlertDialog from '@/components/Dialog/AlertDialog';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import Validation from '@/components/Input/Validation';
import { getRandomNickname } from '@/lib/getRandomNickname';
import { validateNickname } from '@/lib/validationNickname';
import { useDialogStore } from '@/store/useDialogStore';

interface ItemTypes {
  nickname: string;
}

// 회원가입 페이지를 아예 못들어오게 할 것인지?
// 회원가입 step1 페이지로만 들어가게 할 것인지?

function Step5() {
  const [nicknameValue, setNicknameValue] = useState('');
  const [validStatus, setValidStatus] = useState({
    status: false,
    message: '',
  });
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const { isOpen, openModal, closeModal } = useDialogStore();

  const navigate = useNavigate();

  const duplicateCheckRef = useRef<HTMLButtonElement>(null);

  const userData = useGetTable<ItemTypes>('ex_users');

  // ✅ 닉네임 입력 시 유효성 검사
  function onChangeNicknameInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setNicknameValue(value);

    const { isValid, message } = validateNickname(value);
    setValidStatus({ status: isValid, message });

    setIsDuplicateChecked(false);
  }

  const onNicknameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nicknameValue) {
        duplicateCheckRef.current?.focus();
        handleIdDuplicateCheck();
      }
    }
  };

  // ✅ 중복 검사만 수행 (형식은 validateNickname으로 미리 검사됨)
  function handleIdDuplicateCheck() {
    if (!validStatus.status) {
      setValidStatus({
        status: false,
        message: '닉네임 형식을 먼저 확인해 주세요.',
      });
      setIsDuplicateChecked(false);
      setIsAvailable(false);
      return;
    }

    const isDuplicate = userData?.tableData?.some(
      (user) => user.nickname === nicknameValue,
    );

    if (isDuplicate) {
      setValidStatus({
        status: false,
        message: '이미 사용 중인 닉네임입니다.',
      });
      setIsDuplicateChecked(true);
      setIsAvailable(false);
    } else {
      setValidStatus({
        status: true,
        message: '사용 가능한 닉네임입니다.',
      });
      setIsDuplicateChecked(true);
      setIsAvailable(true);
    }
  }

  // ✅ 랜덤 생성
  const handleRandomButton = () => {
    const randomNickname = getRandomNickname();
    setNicknameValue(randomNickname);

    const { isValid, message } = validateNickname(randomNickname);
    setValidStatus({ status: isValid, message });
    setIsDuplicateChecked(false);
  };

  // ✅ 완료
  const handleCompleteButton = async () => {
    if (!(validStatus.status && isDuplicateChecked)) return;

    localStorage.setItem('register_nickname', nicknameValue);

    const user_id = localStorage.getItem('register_id');
    const password = localStorage.getItem('register_password');
    const email = localStorage.getItem('register_email');
    const phone_number = localStorage.getItem('register_phone');
    const nickname = localStorage.getItem('register_nickname');

    // 값이 하나라도 비어 있으면 중단
    if (!user_id || !password || !email || !phone_number || !nickname) {
      console.error('⚠️ 등록 정보 누락');
      return;
    }

    // 🛡️ Supabase Auth에 사용자 등록
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('Supabase Auth 등록 실패:', authError?.message);
      return;
    }

    // ex_users 테이블에 추가 정보 삽입
    const { error: insertError } = await supabase.from('ex_users').insert({
      user_id,
      email,
      phone_number,
      nickname,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('ex_users 삽입 실패:', insertError.message);
      return;
    }

    // 3. 성공 시 모달 열기
    openModal();
  };

  return (
    <>
      <div className="relative flex flex-col">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="닉네임"
              placeholder="닉네임을 입력해 주세요."
              value={nicknameValue}
              onChange={onChangeNicknameInput}
              onKeyDown={onNicknameKeyDown}
            />
            <Button
              variant="tertiary"
              className="fs-13 text-gray06 absolute top-[5px] left-12 h-5 px-1"
              size="sm"
              onClick={handleRandomButton}
            >
              랜덤 생성
              <Icon id="replay" className="text-gray05" />
            </Button>
          </div>
          <Button
            ref={duplicateCheckRef}
            variant="secondary"
            onClick={handleIdDuplicateCheck}
          >
            중복확인
          </Button>
        </div>
        {validStatus.message && (
          <Validation
            status={validStatus.status}
            message={validStatus.message}
          />
        )}
      </div>
      <Button
        onClick={handleCompleteButton}
        disabled={!(isDuplicateChecked && isAvailable)}
      >
        회원가입
      </Button>
      {isOpen && (
        <AlertDialog
          header="회원가입이 완료되었습니다."
          description={[
            `${nicknameValue}님, 환영합니다 🎉`,
            '로그인 화면으로 이동합니다.',
          ]}
          button={[
            {
              text: '확인',
              onClick: () => {
                closeModal();
                setNicknameValue('');
                navigate('/login');
              },
            },
          ]}
        />
      )}
    </>
  );
}

export default Step5;
