import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import Validation from '@/components/Input/Validation';
import { validatePassword } from '@/lib/validationPassword';

export default function Step2() {
  const [pwValue, setPwValue] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwValid, setPwValid] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const [pwCheckValue, setPwCheckValue] = useState('');
  const [pwCheckMessage, setPwCheckMessage] = useState('');
  const [pwCheckValid, setPwCheckValid] = useState<boolean | null>(null);
  const [isCheckVisible, setIsCheckVisible] = useState(false);

  const pwRef = useRef<HTMLInputElement>(null);
  const pwCheckRef = useRef<HTMLButtonElement>(null);
  const pwInputType = isVisible ? 'text' : 'password';
  const pwCheckInputType = isCheckVisible ? 'text' : 'password';

  const [searchParams] = useSearchParams();
  const step = searchParams.get('step');
  const navigate = useNavigate();

  // 비밀번호
  const onChangePWInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPwValue(value);

    const { isValid, message } = validatePassword(value);
    setPwValid(isValid);
    setPwMessage(isValid ? '' : message);
  };

  const onPWKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (pwValid) {
        pwRef.current?.focus();
      }
    }
  };

  const onClickVisible = () => setIsVisible((prev) => !prev);

  // 비밀번호 확인
  const onChangePWCheckInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPwCheckValue(value);

    const { isValid, message } = validatePassword(value);
    setPwCheckValid(isValid);
    setPwCheckMessage(isValid ? '' : message);
  };

  const onPWCheckKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (pwCheckValid) {
        pwCheckRef.current?.focus();
        handleNextButton();
      }
    }
  };

  const onClickCheckVisible = () => setIsCheckVisible((prev) => !prev);

  const isNextEnabled =
    pwValid === true && pwCheckValid === true && pwValue === pwCheckValue;

  // console.log(step);

  const handleNextButton = () => {
    const currentStep = Number(step ?? '1');
    const nextStep = currentStep + 1;

    if (pwValid === true && pwCheckValid === true && pwValue === pwCheckValue) {
      // console.log('비밀번호 저장 & 다음 페이지로 이동');
      localStorage.setItem('register_password', pwCheckValue);
      navigate(`/register?step=${nextStep}`);
    }
  };

  return (
    <>
      <div>
        <div>
          <Input
            type={pwInputType}
            label="비밀번호"
            value={pwValue}
            placeholder="비밀번호"
            onChange={onChangePWInput}
            onKeyDown={onPWKeyDown}
            aria-label="비밀번호를 입력해 주세요."
          >
            <Button variant="input" onClick={onClickVisible}>
              <Icon id={isVisible ? 'visibillity_on' : 'visibillity_off'} />
            </Button>
          </Input>
        </div>
        {pwValid !== null && (
          <Validation status={pwValid} message={pwMessage} />
        )}
      </div>
      <div>
        <div>
          <Input
            ref={pwRef}
            type={pwCheckInputType}
            label="비밀번호 확인"
            value={pwCheckValue}
            placeholder="비밀번호 한 번 더 입력해 주세요."
            onChange={onChangePWCheckInput}
            onKeyDown={onPWCheckKeyDown}
            aria-label="비밀번호를 한 번 더 입력해 주세요."
          >
            <Button variant="input" onClick={onClickCheckVisible}>
              <Icon
                id={isCheckVisible ? 'visibillity_on' : 'visibillity_off'}
              />
            </Button>
          </Input>
        </div>
        {pwCheckValid !== null && (
          <Validation status={pwCheckValid} message={pwCheckMessage} />
        )}
      </div>
      <Button
        ref={pwCheckRef}
        disabled={!isNextEnabled}
        onClick={handleNextButton}
      >
        다음
      </Button>
    </>
  );
}
