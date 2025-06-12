import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Checkbox from '@/components/Checkbox/Checkbox';
import AlertDialog from '@/components/Dialog/AlertDialog';
import Icon, { IconId } from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import Validation from '@/components/Input/Validation';
import RabbitFace from '@/components/RabbitFace/RabbitFace';
import { useToast } from '@/hooks/useToast';
import { validateEmail } from '@/lib/validationEmail';
import { validatePassword } from '@/lib/validationPassword';
import { useAuthStore } from '@/store/useAuthStore';
import { useDialogStore } from '@/store/useDialogStore';

function Login() {
  const location = useLocation();
  const showToast = useToast();
  const navigate = useNavigate();

  const { isOpen, isOpenId, openModal, closeModal } = useDialogStore();
  const { session, setSession, setUser } = useAuthStore();

  // 이메일
  const [emailValue, setEmailValue] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  // 비밀번호
  const [pwValue, setPwValue] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwValid, setPwValid] = useState<boolean | null>(null);

  // 비밀번호 가시성 버튼
  const [isVisible, setIsVisible] = useState(false);
  const inputType = isVisible ? 'text' : 'password';
  const visibleIconId: IconId = isVisible
    ? 'visibillity_on'
    : 'visibillity_off';

  // 이메일 주소 저장
  const [isSavedLogin, setIsSavedLogin] = useState<boolean>(true);

  // 리다이렉트 잠금
  const [lockRedirect, setLockRedirect] = useState(false);

  // ref
  const pwInputRef = useRef<HTMLInputElement>(null);

  // 로그인 여부
  const isLoggedIn = !!session;

  // '/login' 경로 접근 시
  useEffect(() => {
    if (isLoggedIn && lockRedirect) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, lockRedirect, navigate, session]);

  // Supabase 인증 성공
  useEffect(() => {
    const hashParams = new URLSearchParams(location.hash.substring(1));

    if (hashParams.get('type') === 'signup') {
      const checkAuth = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: sessionData } = await supabase.auth.getSession();

          setSession(sessionData.session);
          setUser(user);

          const nickname = localStorage.getItem('register_nickname') ?? '';

          const { error: upsertError } = await supabase.from('users').upsert(
            {
              id: user.id,
              email: user.email,
              nickname,
              created_at: new Date().toISOString(),
            },
            { onConflict: 'id' },
          );

          if (upsertError) {
            console.error('users 테이블 upsert 실패', upsertError.message);
            openModal('insert-error');
            return;
          }

          setLockRedirect(false); // 로그인 성공 시, 리다이렉트 해제
          openModal('email-verification-success');
          // ⚠️ 수정 필요
          // console.log(emailValue);
          // localStorage.setItem('user', emailValue);
          localStorage.removeItem('register_email');
          localStorage.removeItem('register_password');
          localStorage.removeItem('register_nickname');
        }
      };

      checkAuth();
    }
  }, [location.hash, openModal, setSession, setUser]);

  // 페이지 진입 시 foundEmail
  useEffect(() => {
    let initialEmail = '';
    let emailToValidate = '';

    // 1. location.state?.foundEmail
    if (location.state?.foundEmail) {
      initialEmail = location.state.foundEmail;
      emailToValidate = location.state.foundEmail;
    } else {
      // 2. 저장된 이메일
      const savedEmail = localStorage.getItem('user');
      if (savedEmail) {
        initialEmail = savedEmail;
        emailToValidate = savedEmail;
      } else {
        // 3. 회원가입 시 저장된 이메일
        const registerEmail = localStorage.getItem('register_email');
        if (registerEmail) {
          initialEmail = registerEmail;
          emailToValidate = registerEmail;
        }
      }
    }

    setEmailValue(initialEmail);

    if (emailToValidate) {
      const [emailId, emailDomain] = emailToValidate.split('@');
      const { isValid } = validateEmail(emailId, emailDomain);
      setEmailValid(isValid);
      setEmailMessage(isValid ? '' : '유효하지 않은 이메일입니다.');
    } else {
      setEmailValid(null);
      setEmailMessage('');
    }
  }, [location.state]);

  // 페이지 진입 시 토스트 메시지
  useEffect(() => {
    if (location.state?.toastMessage) {
      showToast(location.state.toastMessage);
    }

    if (location.state?.foundEmail) {
      setEmailValue(location.state.foundEmail);
      setEmailValid(true);
    }
  }, [location.state, showToast]);

  // 로컬 스토리지에 저장된 이메일
  useEffect(() => {
    if (!location.state?.foundEmail) {
      if (isSavedLogin) {
        const savedId = localStorage.getItem('user');
        if (savedId) {
          setEmailValue(savedId);
          const [emailId, emailDomain = ''] = savedId.split('@');
          const { isValid } = validateEmail(emailId, emailDomain);
          setEmailValid(isValid);
          setEmailMessage(isValid ? '' : '유효하지 않은 이메일입니다.');
        }
      }
    }
  }, [isSavedLogin, location.state?.foundEmail]);

  const onChangeEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailValue(value);

    const [emailId, emailDomain = ''] = value.split('@');
    const { isValid, message } = validateEmail(emailId, emailDomain);
    setEmailValid(isValid);
    setEmailMessage(isValid ? '' : message);
  };

  const onEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (emailValid) {
        pwInputRef.current?.focus();
      }
    }
  };

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
      if (emailValid && pwValid) onClickLogin();
    }
  };

  const onClickVisible = () => setIsVisible((prev) => !prev);

  const onChangeSavedIdToggle = () => setIsSavedLogin((prev: boolean) => !prev);

  const onClickLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password: pwValue,
    });

    if (error) {
      openModal('login-failed');
      setPwValue(''); // 비밀번호 초기화
      return;
    }

    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);

      if (isSavedLogin) {
        localStorage.setItem('user', emailValue);
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('user', emailValue);
        localStorage.removeItem('user');
      }

      openModal('login-success');
    }
  };

  const getDialogContent = () => {
    switch (isOpenId) {
      case 'login-failed':
        return {
          header: '로그인 실패',
          description: ['이메일 또는 비밀번호가 일치하지 않습니다.'],
          button: [{ text: '확인', onClick: closeModal }],
        };
      case 'insert-error':
        return {
          header: '사용자 정보 저장 실패',
          description: ['사용자 정보를 저장하는 데 실패했습니다.'],
          button: [{ text: '확인', onClick: closeModal }],
        };
      case 'email-verification-success':
        return {
          header: '이메일 인증 성공',
          description: [
            '이메일 인증이 완료되었습니다.',
            '확인 버튼을 누르면',
            '홈 화면으로 이동합니다.',
          ],
          button: [
            {
              text: '확인',
              onClick: () => {
                closeModal();
                setLockRedirect(true);
              },
            },
          ],
        };
      case 'login-success':
        return {
          header: '로그인 성공',
          description: ['로그인이 성공적으로 완료되었습니다.'],
          button: [
            {
              text: '확인',
              onClick: () => {
                closeModal();
                navigate('/', { replace: true });
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
    <main className="m-auto flex h-full w-full max-w-[420px] flex-col justify-center gap-6 px-6 pb-20">
      <h2>
        <Link
          to="/"
          aria-label="홈으로 이동"
          className="fs-40 text-primary font-title flex items-center justify-center gap-2 py-3 font-bold whitespace-nowrap"
        >
          <RabbitFace src="/images/rabbit_face.png" alt="토끼 얼굴" size={40} />
          폴짝
          <RabbitFace src="/images/rabbit_face.png" alt="토끼 얼굴" size={40} />
        </Link>
      </h2>
      <fieldset className="flex flex-col gap-2">
        <div>
          <Input
            type="text"
            label="이메일"
            value={emailValue}
            placeholder="example@polzzak.com"
            hideLabel={true}
            onChange={onChangeEmailInput}
            onKeyDown={onEmailKeyDown}
            aria-label="이메일 주소를 입력해 주세요."
          />
          {emailValid !== null && (
            <Validation status={emailValid} message={emailMessage} />
          )}
        </div>
        <div>
          <Input
            ref={pwInputRef}
            type={inputType}
            label="비밀번호"
            value={pwValue}
            placeholder="비밀번호"
            hideLabel={true}
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
        <div className="flex items-center justify-between gap-2">
          <Checkbox
            label="이메일 주소 저장"
            checked={isSavedLogin}
            onCheckedChange={onChangeSavedIdToggle}
          />
        </div>
        <Button onClick={onClickLogin} disabled={!emailValid || !pwValid}>
          로그인
        </Button>
      </fieldset>
      <div className="fs-14 font-regular text-gray07 flex items-center justify-center gap-1">
        <Link to="reset-password" className="px-1">
          비밀번호 재설정
        </Link>
        <span aria-hidden className="bg-gray04 h-[11px] w-[1px]"></span>
        <div className="relative">
          <Link to="/register?step=1" className="px-1">
            회원가입
          </Link>
          <span className="heartbeat-ring bg-primary absolute top-8 right-2 rounded-3xl px-3 py-1 whitespace-nowrap text-white">
            우리 같이 폴짝해요!
            <span
              aria-hidden
              className="bg-primary absolute -top-1 right-4 h-2 w-2 rotate-45"
            ></span>
          </span>
        </div>
      </div>
      {isOpen && dialogContent && (
        <AlertDialog
          header={dialogContent.header}
          description={dialogContent.description}
          button={dialogContent.button}
        />
      )}
    </main>
  );
}

export default Login;
