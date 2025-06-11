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

  const { isOpen, openModal, closeModal } = useDialogStore();

  // 🕹️ 이메일
  const [emailValue, setEmailValue] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  // 🕹️ 비밀번호
  const [pwValue, setPwValue] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwValid, setPwValid] = useState<boolean | null>(null);

  // 🕹️ 비밀번호 가시성
  const [isVisible, setIsVisible] = useState(false);
  const inputType = isVisible ? 'text' : 'password';
  const visibleIconId: IconId = isVisible
    ? 'visibillity_on'
    : 'visibillity_off';

  // 🕹️ 이메일 주소 저장
  const [isSavedLogin, setIsSavedLogin] = useState<boolean>(true);

  const pwInputRef = useRef<HTMLInputElement>(null);

  // ☘️ 페이지 진입 시 foundEmail 적용
  useEffect(() => {
    let initialEmail = '';
    let emailToValidate = '';

    // 1. location.state?.foundEmail 우선
    if (location.state?.foundEmail) {
      initialEmail = location.state.foundEmail;
      emailToValidate = location.state.foundEmail;
    } else {
      // 2. 저장된 이메일 (이메일 저장 체크가 기본 true이므로 항상 읽음)
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
    } else {
      setEmailValid(null);
    }
  }, [location.state]); // ✅ 배열 길이 고정

  // ☘️ 페이지 진입 시 토스트 메시지 출력
  useEffect(() => {
    if (location.state?.toastMessage) {
      showToast(location.state.toastMessage);
    }

    if (location.state?.foundEmail) {
      setEmailValue(location.state.foundEmail);
      setEmailValid(true);
      return;
    }
  }, [location.state, showToast]);

  // ☘️ 로컬 스토리지 아이디 값 불러오기
  useEffect(() => {
    if (!location.state?.foundEmail) {
      if (isSavedLogin) {
        const savedId = localStorage.getItem('user');
        if (savedId) {
          setEmailValue(savedId);
          const [emailId, emailDomain = ''] = savedId.split('@');
          const { isValid } = validateEmail(emailId, emailDomain);
          setEmailValid(isValid);
        }
      } else {
        const sessionId = sessionStorage.getItem('user');
        if (sessionId) {
          setEmailValue(sessionId);
          const [emailId, emailDomain = ''] = sessionId.split('@');
          const { isValid } = validateEmail(emailId, emailDomain);
          setEmailValid(isValid);
        } else {
          setEmailValue('');
          setEmailValid(false);
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

  // * 🛡️ Supabase Auth 로그인 처리
  const onClickLogin = async () => {
    const { setSession, setUser } = useAuthStore.getState();

    // 1. supabase.auth 로그인: 이메일 + 패스워드 조합
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password: pwValue,
    });

    if (error) {
      openModal();
      return;
    }

    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);
    }

    console.log('저장 여부:', isSavedLogin, '이메일:', emailValue);
    localStorage.setItem('user', emailValue);

    // 2. 저장 옵션에 따라 이메일 저장
    if (isSavedLogin) {
      localStorage.setItem('user', emailValue);
      localStorage.setItem('saveId', 'true');
      sessionStorage.removeItem('user');
    } else {
      localStorage.removeItem('user');
      localStorage.setItem('saveId', 'false');
      sessionStorage.setItem('user', emailValue);
    }

    navigate('/', { replace: true });
  };

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
      {isOpen && (
        <AlertDialog
          header="로그인에 실패하였습니다."
          description={['아이디 또는 비밀번호를', '다시 확인해 주세요.']}
          button={[
            {
              text: '확인',
              onClick: () => {
                closeModal();
                setEmailValue('');
                setPwValue('');
              },
            },
          ]}
        />
      )}
    </main>
  );
}

export default Login;
