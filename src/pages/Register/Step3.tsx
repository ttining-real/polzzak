import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Button from '@/components/Button/Button';
import AlertDialog from '@/components/Dialog/AlertDialog';
import Input from '@/components/Input/Input';
import { validationPhone } from '@/lib/validationPhone';
import { useDialogStore } from '@/store/useDialogStore';

function Step3() {
  const [phoneValue, setPhoneValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showConfirmInput, setShowConfirmInput] = useState(false);
  const [isConfirmValid, setIsConfirmValid] = useState(false);
  const [nextStep, setNextStep] = useState<number | null>(null);

  const { isOpen, openModal, closeModal } = useDialogStore();
  const [dialogHeader, setDialogHeader] = useState('');
  const [dialogDescription, setDialogDescription] = useState<string[]>([]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);

  const [searchParams] = useSearchParams();
  const step = searchParams.get('step');
  const navigate = useNavigate();

  // 휴대폰 번호
  const onChangePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = validationPhone(e.target.value);
    setPhoneValue(value);

    const valid = /^(010|011|016|017|018|019)-\d{4}-\d{4}$/.test(value);
    setIsValid(valid);

    if (!valid) {
      setShowConfirmInput(false);
      setConfirmValue('');
      setIsConfirmValid(false);
    }
  };

  const onPhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isValid) {
        buttonRef.current?.focus();
        handleButtonClick();
      }
    }
  };

  // 인증번호 확인
  const onChangeConfirmInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmValue(value);

    // 인증번호가 6자리일 때 유효한 것으로 판단
    setIsConfirmValid(value.length === 6);
  };

  const onConfirmKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isConfirmValid) {
        buttonRef.current?.focus();
      }
    }
  };

  const handleResendButton = () => {
    console.log('재전송 버튼 클릭');
  };

  // 버튼 조건 분기
  const handleButtonClick = () => {
    if (showConfirmInput) {
      if (!isConfirmValid) return; // 인증번호가 6자리 아닐 땐 동작하지 않도록

      // TODO: 인증번호 확인 API 호출
      const isAuthSuccess = true; // 임시

      if (isAuthSuccess) {
        const currentStep = Number(step ?? '1');
        const calculatedNextStep = currentStep + 1;

        localStorage.setItem('register_phone', phoneValue);
        setNextStep(calculatedNextStep);

        setDialogHeader('인증에 성공하였습니다.');
        setDialogDescription(['다음 버튼을 눌러 진행해 주세요.']);
      } else {
        setDialogHeader('인증에 실패하였습니다.');
        setDialogDescription(['인증 번호를 확인해 주세요.']);
      }

      openModal();
    } else {
      setShowConfirmInput(true);

      // TODO: 인증번호 발송 API 호출
    }
  };

  useEffect(() => {
    if (showConfirmInput) {
      confirmInputRef.current?.focus();
      setConfirmValue('');
      setIsConfirmValid(false);
    }
  }, [showConfirmInput]);

  return (
    <>
      <div>
        <Input
          label="휴대폰 번호"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="000-0000-0000"
          value={phoneValue}
          onChange={onChangePhoneInput}
          onKeyDown={onPhoneKeyDown}
          maxLength={13}
        />
      </div>

      {showConfirmInput && (
        <div className="flex items-end gap-2">
          <div className="flex-grow">
            <Input
              ref={confirmInputRef}
              label="인증번호 확인"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="인증번호 6자리를 입력해 주세요."
              maxLength={6}
              value={confirmValue}
              onChange={onChangeConfirmInput}
              onKeyDown={onConfirmKeyDown}
            />
          </div>
          <Button variant="secondary" onClick={handleResendButton}>
            재전송
          </Button>
        </div>
      )}

      <Button
        ref={buttonRef}
        onClick={handleButtonClick}
        disabled={showConfirmInput ? !isConfirmValid : !isValid}
      >
        {showConfirmInput ? '인증하기' : '인증번호 받기'}
      </Button>

      {isOpen && (
        <AlertDialog
          header={dialogHeader}
          description={dialogDescription}
          button={[
            {
              text: '취소',
              onClick: () => {
                closeModal();
              },
            },
            {
              text: '확인',
              onClick: () => {
                closeModal();
                if (nextStep) {
                  navigate(`/register?step=${nextStep}`);
                }
              },
            },
          ]}
        />
      )}
    </>
  );
}

export default Step3;
