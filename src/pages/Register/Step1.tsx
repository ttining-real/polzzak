import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import Validation from '@/components/Input/Validation';
import { validateEmail } from '@/lib/validationEmail';

function Step1() {
  const [emailValue, setEmailValue] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [checking, setChecking] = useState(false);

  const [searchParams] = useSearchParams();
  const step = searchParams.get('step');
  const navigate = useNavigate();

  // ref
  const duplicateCheckRef = useRef<HTMLButtonElement>(null);

  const onChangeEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailValue(value);

    const { isValid, message } = validateEmail(value);
    setEmailValid(isValid);
    setEmailMessage(isValid ? '' : message);
    setIsChecked(false);
  };

  const onEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (emailValid) {
        duplicateCheckRef.current?.focus();
        handleIdDuplicateCheck();
      }
    }
  };

  // 중복 확인
  const handleIdDuplicateCheck = async () => {
    if (!emailValid) {
      setEmailMessage('이메일 형식을 먼저 확인해 주세요.');
      return;
    }

    setChecking(true);

    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', emailValue)
      .maybeSingle(); // ← 존재하지 않으면 null 반환

    setChecking(false);

    if (error) {
      console.error(error);
      setEmailValid(false);
      setEmailMessage('중복 확인 중 오류가 발생했습니다.');
      setIsChecked(false);
      return;
    }

    if (data) {
      setEmailValid(false);
      setEmailMessage('이미 사용 중인 이메일입니다.');
      setIsChecked(false);
    } else {
      setEmailValid(true);
      setEmailMessage('사용 가능한 이메일입니다.');
      setIsChecked(true);
    }
  };

  const handleNextButton = async () => {
    // 서버에서 다시 한 번 중복 확인
    const { data, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', emailValue)
      .maybeSingle();

    if (checkError) {
      console.error('중복 확인 중 오류 발생', checkError);
      setEmailValid(false);
      setEmailMessage('중복 확인 중 오류가 발생했습니다.');
      return;
    }

    if (data) {
      setEmailValid(false);
      setEmailMessage('이미 사용 중인 이메일입니다.');
      return;
    }

    // 중복이 아니면 저장
    localStorage.setItem('register_email', emailValue);

    const currentStep = Number(step ?? '1');
    const nextStep = currentStep + 1;

    navigate(`/register?step=${nextStep}`);
  };

  return (
    <>
      <div>
        <div className="flex items-end gap-2">
          <div className="w-full">
            <Input
              label="이메일 주소"
              value={emailValue}
              placeholder="example@polzzak.com"
              onChange={onChangeEmailInput}
              onKeyDown={onEmailKeyDown}
              aria-label="이메일 주소를 입력해 주세요."
            />
          </div>
          <Button
            ref={duplicateCheckRef}
            variant={'secondary'}
            onClick={() => {
              handleIdDuplicateCheck();
            }}
          >
            {checking ? '확인 중...' : '중복확인'}
          </Button>
        </div>
        {emailValid !== null && (
          <Validation status={emailValid} message={emailMessage} />
        )}
      </div>
      <Button disabled={!emailValid || !isChecked} onClick={handleNextButton}>
        다음
      </Button>
    </>
  );
}

export default Step1;
