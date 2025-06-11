import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import SelectMenu from '@/components/Input/SelectMenu';
import Validation from '@/components/Input/Validation';
import { Label } from '@/components/Label';
import { validateEmail } from '@/lib/validationEmail';

function Step1() {
  const [emailIdValue, setEmailIdValue] = useState('');
  const [emailDomainValue, setEmailDomainValue] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const [searchParams] = useSearchParams();
  const step = searchParams.get('step');
  const navigate = useNavigate();

  // ref
  const domainRef = useRef<HTMLInputElement>(null);
  const duplicateCheckRef = useRef<HTMLButtonElement>(null);

  // 이메일 주소 조합
  const fullEmail = `${emailIdValue}@${emailDomainValue}`;

  const validateFullEmail = (emailId: string, emailDomain: string) => {
    const { isValid, message } = validateEmail(emailId, emailDomain);
    setEmailValid(isValid);
    setEmailMessage(message);
    setIsChecked(false); // 중복확인 무효화
  };

  // 이메일 아이디
  const onChangeEmailIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailIdValue(value);
    validateFullEmail(emailIdValue, value);

    if (hasChecked) {
      // 중복확인 초기화
      setIsChecked(false);
      setEmailMessage('중복 확인을 다시 해 주세요.');
    }
  };

  const onEmailIdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      domainRef.current?.focus();
    }
  };

  // 이메일 도메인
  const onChangeEmailDomainInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailDomainValue(value);
    validateFullEmail(emailDomainValue, value);

    if (hasChecked) {
      // 중복확인 초기화
      setIsChecked(false);
      setEmailMessage('중복 확인을 다시 해 주세요.');
    }
  };

  const onEmailDomainKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (emailValid) {
        duplicateCheckRef.current?.focus();
        handleIdDuplicateCheck();
      }
    }
  };

  useEffect(() => {
    validateFullEmail(emailIdValue, emailDomainValue);
    // 도메인/아이디가 바뀌면 항상 검증 & 중복 확인 해제
  }, [emailIdValue, emailDomainValue]);

  function handleSelectedEmail(selected: string) {
    if (selected === '직접 입력') {
      setEmailDomainValue('');
    } else {
      setEmailDomainValue(selected);
    }
  }

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
      .eq('email', fullEmail)
      .maybeSingle(); // ← 존재하지 않으면 null 반환

    setChecking(false);

    setHasChecked(true);

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
      .eq('email', fullEmail)
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
    localStorage.setItem('register_email', emailIdValue);

    const currentStep = Number(step ?? '1');
    const nextStep = currentStep + 1;

    navigate(`/register?step=${nextStep}`);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Label>이메일</Label>
          <div className="flex w-full items-center gap-2">
            <Input
              label="이메일 주소"
              value={emailIdValue}
              hideLabel={true}
              placeholder="example"
              onChange={onChangeEmailIdInput}
              onKeyDown={onEmailIdKeyDown}
              aria-label="이메일 주소를 입력해 주세요."
            />
            <span>@</span>
            <Input
              ref={domainRef}
              label="이메일 도메인"
              value={emailDomainValue}
              hideLabel={true}
              placeholder="polzzak.com"
              onChange={onChangeEmailDomainInput}
              onKeyDown={onEmailDomainKeyDown}
              aria-label="이메일 주소를 입력해 주세요."
            />
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
        </div>
        {emailValid !== null && (
          <Validation status={emailValid} message={emailMessage} />
        )}
        <SelectMenu data={'email'} onSelectedEmail={handleSelectedEmail} />
      </div>
      <Button disabled={!emailValid || !isChecked} onClick={handleNextButton}>
        다음
      </Button>
    </>
  );
}

export default Step1;
