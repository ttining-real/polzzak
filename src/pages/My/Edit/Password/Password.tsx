import { useNavigate } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import Validation from '@/components/Input/Validation';
import { useToast } from '@/hooks/useToast';
import { validatePassword } from '@/lib/validationPassword';
import { usePasswordStore } from '@/store/usePasswordStore';

function Password() {
  const navigate = useNavigate();
  const showToast = useToast();
  const {
    isVisible,
    setIsVisible,
    currentPw,
    changePw,
    changePwConfirm,
    setCurrentPw,
    setChangePw,
    setChangePwConfirm,
    currentPwValidation,
    changePwValidation,
    changePwConfirmValidation,
    setCurrentPwValidation,
    setChangePwValidation,
    setChangePwConfirmValidation,
  } = usePasswordStore();
  const inputType = isVisible ? 'text' : 'password';
  const visibleIconId = isVisible ? 'visibillity_on' : 'visibillity_off';

  const onClickVisible = () => {
    setIsVisible(!isVisible);
  };
  const handleCurrentPw = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentPw(value);
  };
  // 1. 비밀번호 확인 일치 검사 함수
  const validateConfirmPassword = (pw: string, confirm: string) => {
    if (confirm.length === 0) {
      setChangePwConfirmValidation({ status: false, message: '' });
      return;
    }

    if (pw !== confirm) {
      setChangePwValidation({
        status: false,
        message: '비밀번호가 일치하지 않습니다.',
      });
      setChangePwConfirmValidation({
        status: false,
        message: '비밀번호가 일치하지 않습니다.',
      });
    } else {
      setChangePwValidation({
        status: true,
        message: '비밀번호가 일치합니다.',
      });
      setChangePwConfirmValidation({
        status: true,
        message: '비밀번호가 일치합니다.',
      });
    }
  };
  const handleChangePw = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChangePw(value);

    const { isValid, message } = validatePassword(value);
    setChangePwValidation({ status: isValid, message });

    validateConfirmPassword(value, changePwConfirm);
  };
  const handleChangePwConfirm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChangePwConfirm(value);

    validateConfirmPassword(changePw, value);
  };
  const handlePwSave = async () => {
    try {
      const USER_ID =
        localStorage.getItem('ex_users') ||
        localStorage.getItem('user') ||
        sessionStorage.getItem('user');
      if (!USER_ID) {
        console.error('해당 USER의 ID가 존재하지 않습니다.');
        return;
      }
      const { data: USER_DATA, error: fetchError } = await supabase
        .from('ex_users')
        .select('*')
        .eq('user_id', USER_ID)
        .single();
      if (!USER_DATA || fetchError) {
        console.error(fetchError, '사용자 정보를 가져오는 데 실패했습니다.');
        return;
      }
      if (USER_DATA.password !== currentPw) {
        setCurrentPwValidation({
          status: false,
          message: '현재 사용중인 비밀번호와 다릅니다.',
        });
        return;
      }
      if (USER_DATA.password) {
        const { error: UpdateError } = await supabase
          .from('ex_users')
          .update({ password: changePw })
          .eq('user_id', USER_ID);

        if (UpdateError) {
          console.error(UpdateError, '비밀번호를 저장하는 데 실패했습니다.');
        }
      }
      navigate(-1);
      showToast('비밀번호 저장을 성공했습니다', 'top-[64px]', 3000);
      setCurrentPw('');
      setChangePw('');
      setChangePwConfirm('');
    } catch (error) {
      console.error('비밀번호 저장 중 오류 발생: ', error);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <div>
          <Input
            label="현재 비밀번호"
            type={inputType}
            placeholder="현재 비밀번호를 적어주세요."
            value={currentPw}
            onChange={handleCurrentPw}
          >
            <Button variant="input" onClick={onClickVisible}>
              <Icon id={visibleIconId} />
            </Button>
          </Input>
        </div>
        <Validation
          status={currentPwValidation.status}
          message={currentPwValidation.message}
        />
      </div>
      <div>
        <Input
          label="변경할 비밀번호"
          type={inputType}
          placeholder="변경할 비밀번호를 적어주세요."
          value={changePw}
          onChange={handleChangePw}
        >
          <Button variant="input" onClick={onClickVisible}>
            <Icon id={visibleIconId} />
          </Button>
        </Input>
      </div>
      <Validation
        status={changePwValidation.status}
        message={changePwValidation.message}
      />
      <div>
        <Input
          label="변경할 비밀번호 확인"
          type={inputType}
          placeholder="비밀번호를 한 번 더 입력해 주세요."
          value={changePwConfirm}
          onChange={handleChangePwConfirm}
        >
          <Button variant="input" onClick={onClickVisible}>
            <Icon id={visibleIconId} />
          </Button>
        </Input>
      </div>
      <Validation
        status={changePwConfirmValidation.status}
        message={changePwConfirmValidation.message}
      />
      <Button
        disabled={
          currentPw.length === 0 ||
          changePw.length === 0 ||
          changePwConfirm.length === 0
        }
        variant={'default'}
        onClick={handlePwSave}
      >
        저장
      </Button>
    </section>
  );
}

export default Password;
