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

export default function Step3() {
  const [nicknameValue, setNicknameValue] = useState('');
  const [validStatus, setValidStatus] = useState({
    status: false,
    message: '',
  });
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const { isOpen, isOpenId, openModal, closeModal } = useDialogStore();

  const navigate = useNavigate();
  const duplicateCheckRef = useRef<HTMLButtonElement>(null);

  const userData = useGetTable<ItemTypes>('users');

  // ✅ 닉네임 입력 시 유효성 검사
  function onChangeNicknameInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setNicknameValue(value);

    const { isValid, message } = validateNickname(value);
    setValidStatus({ status: isValid, message });

    setIsDuplicateChecked(false);
    setIsAvailable(false);
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
    setIsAvailable(false);
  };

  // ✅ 완료
  const handleCompleteButton = async () => {
    if (!(validStatus.status && isDuplicateChecked)) return;

    localStorage.setItem('register_nickname', nicknameValue);

    const email = localStorage.getItem('register_email')?.trim() ?? '';
    const password = localStorage.getItem('register_password')?.trim() ?? '';
    const nickname = localStorage.getItem('register_nickname')?.trim() ?? '';

    // 값이 하나라도 비어 있으면 중단
    if (!email || !password || !nickname) {
      console.error('⚠️ 등록 정보 누락:', { email, password, nickname });
      openModal('missing-info');
      return;
    }

    // 이메일 형식 간단 점검 (정규식 or validateNickname과 별개로)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      openModal('invalid-email');
      return;
    }

    // 🛡️ Supabase Auth에 사용자 등록
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // ⚠️ redirectTo: '배포 URL로 변경/login',
        emailRedirectTo: `http://localhost:5173/login?email=${encodeURIComponent(email)}`,
        data: {
          display_name: nickname,
        },
      },
    });

    if (authError) {
      console.error('회원가입 에러 : ', authError.message);
      openModal('sign-up-error');
      return;
    }

    // ✨ Supabase는 email confirmation이 활성화된 경우 session이 null이고, user도 null일 수 있음
    // 이 경우는 "이메일 인증을 기다리는 중" 상태
    if (!authData.user) {
      console.log('✅ 인증 이메일이 발송되었습니다. 이메일을 확인해주세요.');
      openModal('email-sent');
      // 여기서 DB에 데이터 저장 ❌ (인증 완료 후 저장)
      return;
    }

    // 실시간 로그인 성공 (거의 발생하지 않지만 예외 처리)
    if (!authData.user.id) {
      console.error('User ID가 없음');
      openModal('no-user-id');
      return;
    }

    // Supabase 백엔드 반영까지 잠깐 기다림 (안정성)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userId = authData.user.id;

    // users 테이블에 추가 정보 삽입
    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      email,
      nickname,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('users 삽입 실패:', insertError.message);
      openModal('insert-error');
      return;
    }

    // 3. 성공 시 모달 열기
    openModal('email-sent');
  };

  const getDialogContent = () => {
    switch (isOpenId) {
      case 'missing-info':
        return {
          header: '회원가입 정보 누락',
          description: [
            '회원가입 정보가 누락되었습니다.',
            '다시 시도해 주세요.',
          ],
          button: [{ text: '확인', onClick: closeModal }],
        };
      case 'invalid-email':
        return {
          header: '이메일 형식 오류',
          description: ['이메일 형식이 올바르지 않습니다.'],
          button: [{ text: '확인', onClick: closeModal }],
        };
      case 'sign-up-error':
        return {
          header: '회원가입 실패',
          description: [
            '회원가입 중 에러가 발생했습니다.',
            '다시 시도해 주세요.',
          ],
          button: [{ text: '확인', onClick: closeModal }],
        };
      case 'no-user-id':
        return {
          header: '사용자 정보 오류',
          description: ['회원가입 중 사용자 정보를 불러오지 못했습니다.'],
          button: [{ text: '확인', onClick: closeModal }],
        };
      case 'insert-error':
        return {
          header: '데이터 저장 실패',
          description: [
            '사용자 정보를 저장하는데 실패했습니다.',
            '다시 시도해 주세요.',
          ],
          button: [{ text: '확인', onClick: closeModal }],
        };
      case 'email-sent':
        return {
          header: '이메일 인증을 완료해 주세요.',
          description: [
            `${nicknameValue}님,`,
            '인증 링크를 이메일로 전송했습니다.',
            '이메일 인증을 완료해 주세요!',
          ],
          button: [
            {
              text: '확인',
              onClick: () => {
                closeModal();
                setNicknameValue('');
                navigate('/login');
              },
            },
          ],
        };
      default:
        return null;
    }
  };

  const dialogContent = getDialogContent();

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
      {isOpen && dialogContent && (
        <AlertDialog
          header="이메일 인증을 완료해 주세요."
          description={[
            `${nicknameValue}님,`,
            '인증 링크를 이메일로 전송했습니다.',
            '이메일 인증을 완료해 주세요!',
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
