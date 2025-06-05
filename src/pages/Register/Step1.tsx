import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import Validation from '@/components/Input/Validation';
import { validateId } from '@/lib/validationId';

// import { REGISTER_STEP } from './REGISTER_STEP';

function Step1() {
  const [idValue, setIdValue] = useState('');
  const [idMessage, setIdMessage] = useState('');
  const [idValid, setIdValid] = useState<boolean | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [checking, setChecking] = useState(false);

  const [searchParams] = useSearchParams();
  const step = searchParams.get('step');
  const navigate = useNavigate();

  // ref
  const duplicateCheckRef = useRef<HTMLButtonElement>(null);

  const onChangeIDInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdValue(value);

    const { isValid, message } = validateId(value);
    setIdValid(isValid);
    setIdMessage(isValid ? '' : message);
    setIsChecked(false);
  };

  const onIdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (idValid) {
        duplicateCheckRef.current?.focus();
        handleIdDuplicateCheck();
      }
    }
  };

  // 중복 확인
  const handleIdDuplicateCheck = async () => {
    if (!idValid) {
      setIdMessage('아이디 형식을 먼저 확인해 주세요.');
      return;
    }

    setChecking(true);

    const { data, error } = await supabase
      .from('ex_users')
      .select('user_id')
      .eq('user_id', idValue)
      .maybeSingle(); // ← 존재하지 않으면 null 반환

    setChecking(false);

    if (error) {
      console.error(error);
      setIdValid(false);
      setIdMessage('중복 확인 중 오류가 발생했습니다.');
      setIsChecked(false);
      return;
    }

    if (data) {
      setIdValid(false);
      setIdMessage('이미 사용 중인 아이디입니다.');
      setIsChecked(false);
    } else {
      setIdValid(true);
      setIdMessage('사용 가능한 아이디입니다.');
      setIsChecked(true);
    }
  };

  const handleNextButton = async () => {
    // 서버에서 다시 한 번 중복 확인
    const { data, error: checkError } = await supabase
      .from('ex_users')
      .select('user_id')
      .eq('user_id', idValue)
      .maybeSingle();

    if (checkError) {
      console.error('중복 확인 중 오류 발생', checkError);
      setIdValid(false);
      setIdMessage('중복 확인 중 오류가 발생했습니다.');
      return;
    }

    if (data) {
      setIdValid(false);
      setIdMessage('이미 사용된 아이디입니다.');
      return;
    }

    // 중복이 아니면 저장
    localStorage.setItem('register_id', idValue);

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
              label="아이디"
              value={idValue}
              placeholder="아이디"
              onChange={onChangeIDInput}
              onKeyDown={onIdKeyDown}
              aria-label="아이디를 입력해 주세요."
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
        {idValid !== null && (
          <Validation status={idValid} message={idMessage} />
        )}
      </div>
      <Button disabled={!idValid || !isChecked} onClick={handleNextButton}>
        다음
      </Button>
    </>
  );
}

export default Step1;
