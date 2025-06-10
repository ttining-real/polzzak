import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import AlertDialog from '@/components/Dialog/AlertDialog';
import Input from '@/components/Input/Input';
import SelectMenu from '@/components/Input/SelectMenu';
import { Label } from '@/components/Label';
import { validateEmail } from '@/lib/validationEmail';
import { useDialogStore } from '@/store/useDialogStore';

export default function FindEmail() {
  const navigate = useNavigate();
  const [inputEmail, setInputEmail] = useState('');
  const [inputDomain, setInputDomain] = useState('');
  const [dialogContent, setDialogContent] = useState<{
    header: string;
    description: string[];
  } | null>(null);
  const { isOpen, openModal, closeModal } = useDialogStore();
  const [foundUserId, setFoundUserId] = useState<string | null>(null);

  const handleInputEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputEmail(e.target.value.trim());
  };

  const handleInputDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputDomain(e.target.value.trim());
  };

  const handleSelectedEmail = (selected: string) => {
    setInputDomain(selected === '직접 입력' ? '' : selected);
  };

  const isValidEmail =
    inputEmail && inputDomain
      ? validateEmail(`${inputEmail}@${inputDomain}`)
      : false;

  const onDomainKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isValidEmail) handleFindEmail();
    }
  };

  const handleFindEmail = async () => {
    const fullEmail = `${inputEmail}@${inputDomain}`;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(fullEmail)) {
      setDialogContent({
        header: '오류가 발생했습니다.',
        description: [
          '유효하지 않은 이메일 형식입니다.',
          '올바른 이메일 주소를 입력해 주세요.',
        ],
      });
      openModal();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ex_users')
        .select('user_id')
        .eq('email', fullEmail)
        .single();

      if (error || !data) {
        setDialogContent({
          header: '아이디를 찾을 수 없습니다.',
          description: ['입력하신 이메일로', '등록된 아이디가 없습니다.'],
        });
        setFoundUserId(null);
        openModal();
      } else {
        setFoundUserId(data.user_id);
        setDialogContent({
          header: '아이디를 찾았습니다! 🎉',
          description: [
            `가입된 아이디는 [ ${data.user_id} ] 입니다.`,
            '해당 아이디로 로그인 하시겠습니까?',
          ],
        });
        openModal();
      }
    } catch (err) {
      console.error('아이디 찾기 실패:', err);
      setFoundUserId(null);
      setDialogContent({
        header: '오류가 발생했습니다.',
        description: [
          '아이디를 조회하는 중 오류가 발생했습니다.',
          `잠시 후 다시 시도해 주세요.`,
        ],
      });
      openModal();
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 px-6 py-8">
      <h2 className="font-semibold text-black">
        회원가입 시 등록한 이메일을 입력하고,
        <br />
        아이디 찾기 버튼을 눌러주세요.
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label className="p-1">이메일</Label>
          <div className="flex items-center justify-center gap-1">
            <div className="flex-1">
              <Input
                label="이메일 아이디"
                hideLabel={true}
                type="text"
                placeholder="email"
                value={inputEmail}
                onChange={handleInputEmail}
              />
            </div>
            <span className="fs-14 text-gray06">@</span>
            <div className="flex-1">
              <Input
                label="이메일 도메인"
                hideLabel={true}
                type="text"
                placeholder="직접 입력"
                value={inputDomain}
                onKeyDown={onDomainKeyDown}
                onChange={handleInputDomain}
              />
            </div>
          </div>
        </div>
        <SelectMenu
          data={'email'}
          onSelectedEmail={handleSelectedEmail}
          className="flex-1"
        />
        <Button onClick={handleFindEmail} disabled={!isValidEmail}>
          아이디 찾기
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
                if (foundUserId) {
                  navigate('/login', {
                    state: { foundId: foundUserId },
                    replace: true,
                  });
                }
              },
            },
          ]}
        />
      )}
    </main>
  );
}
