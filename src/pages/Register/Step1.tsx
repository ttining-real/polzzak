import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import SelectMenu from '@/components/Input/SelectMenu';
import Validation from '@/components/Input/Validation';
import { Label } from '@/components/Label';
import { validateEmail } from '@/lib/validationEmail';

export default function Step1() {
  const [emailIdValue, setEmailIdValue] = useState('');
  const [emailDomainValue, setEmailDomainValue] = useState('');
  const [selectedEmailDomain, setSelectedEmailDomain] = useState('직접 입력'); // SelectMenu 선택 상태

  const [emailMessage, setEmailMessage] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  const [isDuplicateConfirmed, setIsDuplicateConfirmed] = useState(false); // 중복 확인 성공 여부
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false); // 중복 확인 진행 중
  const [hasPerformedDuplicateCheck, setHasPerformedDuplicateCheck] =
    useState(false); // 중복 확인 시도 여부

  const [searchParams] = useSearchParams();
  const step = searchParams.get('step');
  const navigate = useNavigate();

  // ref
  const domainRef = useRef<HTMLInputElement>(null);
  const duplicateCheckRef = useRef<HTMLButtonElement>(null);

  // 이메일 전체 주소
  const fullEmail = `${emailIdValue}@${emailDomainValue}`;

  // 이메일 유효성 검사
  const validateFullEmail = (emailId: string, emailDomain: string) => {
    const { isValid, message } = validateEmail(emailId, emailDomain);
    setEmailValid(isValid);
    setEmailMessage(message);
  };

  // 이메일 아이디 input 변경 핸들러
  const onChangeEmailIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailIdValue(value);
    validateFullEmail(value, emailDomainValue);

    if (hasPerformedDuplicateCheck) {
      setIsDuplicateConfirmed(false);
      setEmailMessage('중복 확인을 다시 해 주세요.');
    }
  };

  const onEmailIdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      domainRef.current?.focus();
    }
  };

  // 이메일 도메인 input 변경 핸들러
  const onChangeEmailDomainInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailDomainValue(value);
    validateFullEmail(emailIdValue, value);

    // 도메인 직접 입력 시 SelectMenu 상태도 변경
    if (selectedEmailDomain !== '직접 입력') {
      setSelectedEmailDomain('직접 입력');
    }

    if (hasPerformedDuplicateCheck) {
      setIsDuplicateConfirmed(false);
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

  // SelectMenu 선택 변경 핸들러
  function handleSelectedEmail(selected: string) {
    setSelectedEmailDomain(selected);

    if (selected === '직접 입력') {
      setEmailDomainValue('');
      validateFullEmail(emailIdValue, '');
    } else {
      setEmailDomainValue(selected);
      validateFullEmail(emailIdValue, selected);
    }

    if (hasPerformedDuplicateCheck) {
      setIsDuplicateConfirmed(false);
      setEmailMessage('중복 확인을 다시 해 주세요');
    }
  }

  // 중복 확인 함수
  const handleIdDuplicateCheck = async () => {
    if (!emailValid) {
      setEmailMessage('이메일 형식을 먼저 확인해 주세요.');
      return;
    }

    setIsCheckingDuplicate(true);

    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', fullEmail)
      .maybeSingle();

    setIsCheckingDuplicate(false);
    setHasPerformedDuplicateCheck(true);

    if (error) {
      console.error(error);
      setEmailMessage('중복 확인 중 오류가 발생했습니다.');
      setIsDuplicateConfirmed(false);
      return;
    }

    if (data) {
      setEmailMessage('이미 사용 중인 이메일입니다.');
      setIsDuplicateConfirmed(false);
    } else {
      setEmailMessage('사용 가능한 이메일입니다.');
      setIsDuplicateConfirmed(true);
    }
  };

  // 다음 버튼 클릭
  const handleNextButton = async () => {
    // 서버에서 다시 한 번 중복 확인
    const { data, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', fullEmail)
      .maybeSingle();

    if (checkError) {
      console.error('중복 확인 중 오류 발생', checkError);
      setEmailMessage('중복 확인 중 오류가 발생했습니다.');
      return;
    }

    if (data) {
      setEmailMessage('이미 사용 중인 이메일입니다.');
      setIsDuplicateConfirmed(false);
      return;
    }

    // 중복이 아니면 저장
    localStorage.setItem('register_email', fullEmail);

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
              variant="secondary"
              onClick={handleIdDuplicateCheck}
              disabled={isCheckingDuplicate}
            >
              {isCheckingDuplicate ? '확인 중...' : '중복확인'}
            </Button>
          </div>
        </div>
        {emailValid !== null && (
          <Validation
            status={emailValid ? isDuplicateConfirmed : false}
            message={emailMessage}
          />
        )}
        <SelectMenu
          data="email"
          selectedEmail={selectedEmailDomain}
          setSelectedEmail={setSelectedEmailDomain}
          onSelectedEmail={handleSelectedEmail}
        />
      </div>
      <Button
        disabled={!emailValid || !isDuplicateConfirmed}
        onClick={handleNextButton}
      >
        다음
      </Button>
    </>
  );
}
