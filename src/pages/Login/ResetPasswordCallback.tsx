import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import AlertDialog from '@/components/Dialog/AlertDialog';
import Icon, { IconId } from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import Validation from '@/components/Input/Validation';
import Loader from '@/components/Loader/Loader';
import { validatePassword } from '@/lib/validationPassword';
import { useDialogStore } from '@/store/useDialogStore';

export default function ResetPasswordCallback() {
  const navigate = useNavigate();

  // 🕹️ 비밀번호
  const [pwValue, setPwValue] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwValid, setPwValid] = useState<boolean | null>(null);

  // 🕹️ 비밀번호 확인
  const [pwCheckValue, setPwCheckValue] = useState('');
  const [pwCheckMessage, setPwCheckMessage] = useState('');
  const [pwCheckValid, setPwCheckValid] = useState<boolean | null>(null);

  // 🕹️ 비밀번호 가시성
  const [isVisible, setIsVisible] = useState(false);
  const inputType = isVisible ? 'text' : 'password';
  const visibleIconId: IconId = isVisible
    ? 'visibillity_on'
    : 'visibillity_off';

  const pwCheckInputRef = useRef<HTMLInputElement>(null);
  const pwResetButtonRef = useRef<HTMLButtonElement>(null);

  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const { isOpen, openModal, closeModal } = useDialogStore();
  const [dialogContent, setDialogContent] = useState<{
    header: string;
    description: string[];
  } | null>(null);

  const onChangePWInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPwValue(value);

    const { isValid, message } = validatePassword(value);
    setPwValid(isValid);
    setPwMessage(isValid ? '' : message);
  };

  const onChangePWCheckInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPwCheckValue(value);

    const isSame = pwValue === value;
    setPwCheckValid(isSame);
    setPwCheckMessage(isSame ? '' : '비밀번호가 일치하지 않습니다.');
  };

  const onPWKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pwCheckInputRef.current) {
      pwCheckInputRef.current.focus();
    }
  };

  const onPWCheckKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      pwResetButtonRef.current?.focus();
    }
  };

  const onClickVisible = () => setIsVisible((prev) => !prev);

  // ⚠️ 비밀번호 재설정 이메일 링크 클릭 시, supabase가 자동 로그인 처리
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!session || !user) {
        setDialogContent({
          header: '세션 만료',
          description: [
            '세션이 만료되었습니다.',
            '이메일 링크를 다시 확인해 주세요.',
          ],
        });
        openModal();
        return;
      }

      setAuthReady(true);
    };

    checkSession();
  }, [openModal]);

  const isButtonDisabled =
    loading || !pwValid || !pwCheckValid || pwValue !== pwCheckValue;

  const handleResetPassword = async () => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: pwValue,
    });

    setLoading(false);

    if (error) {
      setDialogContent({
        // 비밀번호 변경 실패
        header: '비밀번호 변경 실패',
        description: ['비밀번호 변경에 실패했습니다.'],
      });
      openModal();
      return;
    }
    setDialogContent({
      // 비밀번호 변경 완료
      header: '비밀번호 변경 완료',
      description: ['비밀번호가 성공적으로 변경되었습니다.'],
    });
    openModal();
  };

  // 세션 체크 완료 전
  if (!authReady)
    return (
      <main className="flex-1">
        <Loader text="세션 체크 중.." />
      </main>
    );

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h2 className="font-semibold text-black">비밀번호 재설정</h2>
      <p className="text-gray07 fs-15">새로운 비밀번호를 입력해 주세요.</p>
      <div className="flex flex-col gap-4">
        <div>
          <Input
            type={inputType}
            label="새 비밀번호"
            value={pwValue}
            placeholder="새 비밀번호"
            onChange={onChangePWInput}
            onKeyDown={onPWKeyDown}
            aria-label="비밀번호를 입력해 주세요."
          >
            <Button variant="input" onClick={onClickVisible}>
              <Icon id={visibleIconId} />
            </Button>
          </Input>
          {pwValid !== null && (
            <Validation status={pwValid} message={pwMessage} />
          )}
        </div>
        <div>
          <Input
            ref={pwCheckInputRef}
            type={inputType}
            label="새 비밀번호 확인"
            value={pwCheckValue}
            placeholder="새로운 비밀번호를 한 번 더 입력해 주세요."
            onChange={onChangePWCheckInput}
            onKeyDown={onPWCheckKeyDown}
            aria-label="새로운 비밀번호를 한 번 더 입력해 주세요."
          >
            <Button variant="input" onClick={onClickVisible}>
              <Icon id={visibleIconId} />
            </Button>
          </Input>
          {pwCheckValid !== null && (
            <Validation status={pwCheckValid} message={pwCheckMessage} />
          )}
        </div>
        <Button
          ref={pwResetButtonRef}
          onClick={handleResetPassword}
          disabled={isButtonDisabled}
        >
          {loading ? '변경 중...' : '비밀번호 변경'}
        </Button>
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
                navigate('/login', { replace: true });
              },
            },
          ]}
        />
      )}
    </main>
  );
}
