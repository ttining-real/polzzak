import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useGetTable } from '@/api/supabase/hooks';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import SelectMenu from '@/components/Input/SelectMenu';
import Validation from '@/components/Input/Validation';
import { Label } from '@/components/Label';
import { validEmail } from '@/lib/validationEmail';

interface ItemTypes {
  email: string;
}

function Step4() {
  const [idValue, setIdValue] = useState('');
  const [domainValue, setDomainValue] = useState('');
  const [isValid, setIsValid] = useState({
    status: false,
    message: '',
  });

  const [searchParams] = useSearchParams();
  const step = searchParams.get('step');
  const navigate = useNavigate();

  const userData = useGetTable<ItemTypes>('ex_users');

  const domainRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function handleidValue(e: React.ChangeEvent<HTMLInputElement>) {
    setIdValue(e.target.value);
    setIsValid({ status: false, message: '' });
  }

  const onIdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isValid) {
        domainRef.current?.focus();
      }
    }
  };

  function handledomainValue(e: React.ChangeEvent<HTMLInputElement>) {
    setDomainValue(e.target.value);
    setIsValid({ status: false, message: '' });
  }

  const onDomainKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isValid) {
        buttonRef.current?.focus();
      }
    }
  };

  function handleSelectedEmail(selected: string) {
    if (selected === '직접 입력') {
      setDomainValue('');
    } else {
      setDomainValue(selected);
    }
    setIsValid({ status: false, message: '' });
  }

  function handleDuplicateCheck() {
    const email = `${idValue}@${domainValue}`;

    // 아이디에 공백 및 영문+숫자 외 문자 체크
    if (/\s/.test(idValue)) {
      setIsValid({ status: false, message: '공백은 사용할 수 없습니다.' });
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(idValue)) {
      setIsValid({
        status: false,
        message: '이메일 아이디는 영문과 숫자만 가능합니다.',
      });
      return;
    }

    if (!validEmail(email)) {
      setIsValid({
        status: false,
        message: '유효하지 않은 이메일 형식입니다.',
      });
      return;
    }

    const isDuplicate = userData.tableData.some((item) => item.email === email);

    if (isDuplicate) {
      setIsValid({ status: false, message: '이미 사용된 이메일입니다.' });
    } else {
      setIsValid({ status: true, message: '사용 가능한 이메일입니다.' });
    }
  }

  const handleNextButton = () => {
    const currentStep = Number(step ?? '1');
    const nextStep = currentStep + 1;

    const email = `${idValue}@${domainValue}`;
    localStorage.setItem('register_email', email);

    navigate(`/register?step=${nextStep}`);
  };

  return (
    <>
      <div>
        <Label>이메일</Label>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              label="이메일 아이디"
              hideLabel={true}
              type="text"
              placeholder="email"
              value={idValue}
              onChange={handleidValue}
              onKeyDown={onIdKeyDown}
            />
          </div>
          <span className="fs-14 text-gray06">@</span>
          <div className="flex-1">
            <Input
              ref={domainRef}
              label="이메일 도메인"
              hideLabel={true}
              type="text"
              placeholder="직접 입력"
              value={domainValue}
              onChange={handledomainValue}
              onKeyDown={onDomainKeyDown}
            />
          </div>
        </div>
        {isValid.message && (
          <Validation status={isValid.status} message={isValid.message} />
        )}
      </div>
      <SelectMenu data={'email'} onSelectedEmail={handleSelectedEmail} />
      {isValid.status ? (
        <Button onClick={handleNextButton}>다음</Button>
      ) : (
        <Button
          ref={buttonRef}
          disabled={!idValue || !domainValue}
          onClick={handleDuplicateCheck}
        >
          확인
        </Button>
      )}
    </>
  );
}

export default Step4;
