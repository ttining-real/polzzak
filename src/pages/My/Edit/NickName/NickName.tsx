import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetTable } from '@/api/supabase/hooks';
import { updateNickname } from '@/api/supabase/hooks/updateNickname';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import Validation from '@/components/Input/Validation';
import { useToast } from '@/hooks/useToast';
import { getRandomNickname } from '@/lib/getRandomNickname';
import { validateNickname } from '@/lib/validationNickname';
import { useEditStore } from '@/store/useEditStore';

interface ItemTypes {
  nickname: string;
}

function NickName() {
  const navigate = useNavigate();
  const showToast = useToast();
  const nickname = useEditStore((state) => state.nickname);
  const setNickname = useEditStore((state) => state.setNickname);
  const [validationStatus, setValidationStatus] = useState({
    status: false,
    message: '',
  });
  const message = {
    success: '사용 가능한 닉네임입니다.',
    error: '2~10자로 입력해 주세요.',
    errorDup: '이미 사용된 닉네임입니다.',
  };
  const userData = useGetTable<ItemTypes>('ex_users');

  const handleNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };
  const handleNicknameCheck = () => {
    const validation = validateNickname(nickname);

    if (!validation.isValid) {
      setValidationStatus({ status: false, message: validation.message });
      return;
    }

    const isDuplicate = userData?.tableData?.some(
      (item) => item.nickname === nickname,
    );

    if (isDuplicate) {
      setValidationStatus({ status: false, message: message.errorDup });
    } else {
      setValidationStatus({ status: true, message: message.success });
    }
  };
  const handleRandomButton = () => {
    const randomNickname = getRandomNickname();

    setNickname(randomNickname);
  };
  const handleNicknameSave = async () => {
    const result = await updateNickname(nickname);
    if (result) {
      navigate('/my/edit');
      showToast('닉네임 설정에 성공했습니다.', 'top-[64px]', 3000);
      setNickname('');
    } else {
      showToast('닉네임 설정에 실패했습니다.', 'top-[64px]', 3000);
    }
  };

  useEffect(() => {
    return () => {
      setNickname('');
    };
  }, [setNickname]);

  return (
    <section className="relative flex flex-col" role="main">
      <h2 className="sr-only">닉네임 설정</h2>

      <div className="flex items-end gap-1">
        <div className="flex-1">
          <Input
            label="닉네임"
            value={nickname}
            onChange={handleNickname}
            maxLength={10}
            placeholder="2~10자 사이로 입력해 주세요."
          />
        </div>
        <Button
          variant={'tertiary'}
          className="s-13 text-gray06 absolute top-[5px] left-12 h-5 px-1"
          size="sm"
          onClick={handleRandomButton}
          aria-label="랜덤 닉네임 생성"
          type="button"
        >
          <span aria-hidden="true">랜덤생성</span>
          <Icon id="replay" className="text-gray05" />
        </Button>
        <Button
          variant={'secondary'}
          type="button"
          aria-label="닉네임 중복 확인"
          onClick={() => {
            handleNicknameCheck();
          }}
        >
          중복확인
        </Button>
      </div>
      <Validation
        status={validationStatus.status}
        message={validationStatus.message}
      />
      <Button
        variant={'default'}
        disabled={validationStatus.message !== message.success}
        onClick={handleNicknameSave}
        type="button"
        aria-label="닉네임 저장"
      >
        저장
      </Button>
    </section>
  );
}

export default NickName;
