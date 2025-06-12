import { useRef, useState } from 'react';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import AlertDialog from '@/components/Dialog/AlertDialog';
import Input from '@/components/Input/Input';
import SelectMenu from '@/components/Input/SelectMenu';
import Validation from '@/components/Input/Validation';
import { Label } from '@/components/Label';
import { validateEmail } from '@/lib/validationEmail';
import { useDialogStore } from '@/store/useDialogStore';

function ResetPassword() {
  const [emailIdValue, setEmailIdValue] = useState('');
  const [emailDomainValue, setEmailDomainValue] = useState('');
  const [selectedEmailDomain, setSelectedEmailDomain] = useState('직접 입력'); // SelectMenu 선택 상태

  const [emailMessage, setEmailMessage] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  const { isOpen, openModal, closeModal } = useDialogStore();
  const [dialogContent, setDialogContent] = useState<{
    header: string;
    description: string[];
  } | null>(null);

  // ref
  const domainRef = useRef<HTMLInputElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);

  // 이메일 전체 주소
  const fullEmail = `${emailIdValue}@${emailDomainValue}`;

  // 이메일 유효성 검사
  const validateFullEmail = (emailId: string, emailDomain: string) => {
    const { isValid, message } = validateEmail(emailId, emailDomain);
    setEmailValid(isValid);
    setEmailMessage(message);
  };

  // 이메일 아이디
  const onChangeEmailIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailIdValue(value);
    validateFullEmail(value, emailDomainValue);
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
    validateFullEmail(emailIdValue, value);

    // 도메인 직접 입력 시 SelectMenu 상태도 변경
    if (selectedEmailDomain !== '직접 입력') {
      setSelectedEmailDomain('직접 입력');
    }
  };

  const onEmailDomainKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendButtonRef.current?.focus();
      if (emailValid) {
        // sendButtonRef.current?.focus();
        handleSendResetEmail();
      }
    }
  };

  function handleSelectedEmail(selected: string) {
    setSelectedEmailDomain(selected);

    const newDomain = selected === '직접 입력' ? '' : selected;
    setEmailDomainValue(newDomain);
    validateFullEmail(emailIdValue, newDomain);
  }

  const handleSendResetEmail = async () => {
    const { data: userRow, error: findError } = await supabase
      .from('users')
      .select('email')
      .eq('email', fullEmail)
      .single();

    if (findError || !userRow) {
      setDialogContent({
        header: '이메일이 존재하지 않습니다.',
        description: [
          '입력한 이메일로 가입된 계정이 없습니다.',
          '이메일 주소를 다시 확인해 주세요.',
        ],
      });
      openModal();
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(fullEmail, {
      // ⚠️ redirectTo: '배포 URL로 변경/reset-password-callback',
      redirectTo: 'http://localhost:5173/login/reset-password-callback',
    });

    if (error) {
      setDialogContent({
        header: '이메일 발송 실패',
        description: [
          '이메일 발송에 실패했습니다.',
          '잠시 후 다시 시도해 주세요.',
        ],
      });
      openModal();
      return;
    }

    setDialogContent({
      header: '이메일 발송 완료!',
      description: ['비밀번호 재설정 링크가', '이메일로 전송되었습니다.'],
    });
    openModal();
  };

  return (
    <main className="flex flex-1 flex-col gap-4 px-6 py-8">
      <h2 className="font-semibold text-black">
        회원가입 시 등록한 이메일을 입력하고,
        <br />
        이메일 발송 버튼을 눌러주세요.
      </h2>
      <p className="text-gray07 fs-15">
        입력하신 이메일 주소로
        <br />
        비밀번호 재설정 링크를 보내드릴게요!
      </p>
      <div className="flex flex-col gap-4">
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
              aria-label="이메일 도메인을 입력해 주세요."
            />
          </div>
          {emailValid !== null && emailMessage !== '' && (
            <Validation status={emailValid} message={emailMessage} />
          )}
        </div>
        <SelectMenu
          data={'email'}
          selectedEmail={selectedEmailDomain}
          setSelectedEmail={setSelectedEmailDomain}
          onSelectedEmail={handleSelectedEmail}
          className="flex-1"
        />
        <Button
          ref={sendButtonRef}
          onClick={handleSendResetEmail}
          disabled={!emailValid}
        >
          이메일 발송
        </Button>

        <p className="fs-14 text-gray07 mt-4 text-center">
          이메일이 기억나지 않으시면, 고객센터(
          <span className="text-primary px-[1px] underline">
            polzzak@gmail.com
          </span>
          )로 문의해주세요.
        </p>
      </div>
      {isOpen && dialogContent && (
        <AlertDialog
          header={dialogContent.header}
          description={dialogContent.description}
          button={[
            {
              text: '확인',
              onClick: () => {
                closeModal();
              },
            },
          ]}
        />
      )}
    </main>
  );
}

export default ResetPassword;
