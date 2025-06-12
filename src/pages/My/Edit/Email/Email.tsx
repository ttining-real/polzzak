import { useNavigate } from 'react-router-dom';

import { useGetTable } from '@/api/supabase/hooks';
import { updateEmail } from '@/api/supabase/hooks/updateEmail';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import SelectMenu from '@/components/Input/SelectMenu';
import Validation from '@/components/Input/Validation';
import { Label } from '@/components/Label';
import { useToast } from '@/hooks/useToast';
import { useEditStore } from '@/store/useEditStore';

interface ItemTypes {
  email: string;
}

function Email() {
  const navigate = useNavigate();
  const userData = useGetTable<ItemTypes>('users');
  const showToast = useToast();
  const emailId = useEditStore((state) => state.emailId);
  const setEmailId = useEditStore((state) => state.setEmailId);
  const domain = useEditStore((state) => state.domain);
  const setDomain = useEditStore((state) => state.setDomain);
  const validationStatus = useEditStore((state) => state.validationStatus);
  const setValidationStatus = useEditStore(
    (state) => state.setValidationStatus,
  );
  const email = `${emailId}@${domain}`;
  const pattern = /^[A-Za-z0-9_.-]+@[A-Za-z0-9-]+\.[A-Za-z0-9-]+$/;

  const message = {
    success: '사용 가능한 이메일 입니다.',
    errorGap: '공백은 사용할 수 없습니다.',
    errorDup: '이미 사용된 이메일입니다.',
  };
  const handleEmailId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailId(e.target.value);
  };
  const handleDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
  };
  const handleSelectedEmail = (selected: string) => {
    if (selected === '직접 입력') {
      setDomain('');
    } else {
      setDomain(selected);
    }
  };
  const handleCheckButton = () => {
    const isDuplicate = userData.tableData.some((item) => item.email === email);

    if (!pattern.test(email)) {
      setValidationStatus({
        status: false,
        message: '유효하지 않은 이메일 형식입니다.',
      });
      return;
    }
    if (emailId.includes(' ')) {
      setValidationStatus({ status: false, message: message.errorGap });
      return;
    }
    if (isDuplicate) {
      setValidationStatus({ status: false, message: message.errorDup });
    } else {
      setValidationStatus({ status: true, message: message.success });
    }
  };
  const handleEmailSave = async () => {
    try {
      const result = await updateEmail(email);

      if (result) {
        navigate(-1);
        showToast('이메일 저장을 성공했습니다.', 'top-[64px]', 3000);
        setEmailId('');
        setDomain('');
        setValidationStatus({ status: false, message: '' });
      } else {
        showToast('이메일 저장을 실패했습니다.', 'top-[64px]', 3000);
      }
    } catch (error) {
      console.error('이메일 변경 중 오류:', error);
    }
  };

  return (
    <section className="flex flex-col gap-4" role="main">
      <h2 className="sr-only">이메일 설정</h2>

      <div className="flex flex-col">
        <Label>이메일</Label>
        <div className="flex items-center justify-center gap-1">
          <div className="flex-1">
            <Input
              label="이메일 아이디"
              hideLabel={true}
              type="text"
              placeholder="email"
              value={emailId}
              onChange={handleEmailId}
            />
          </div>
          <span className="fs-14 text-gray06">@</span>
          <div className="flex-1">
            <Input
              label="이메일 도메인"
              hideLabel={true}
              type="text"
              placeholder="직접 입력"
              value={domain}
              onChange={handleDomain}
            />
          </div>
        </div>
        <Validation
          status={validationStatus.status}
          message={validationStatus.message}
        />
        <SelectMenu data={'email'} onSelectedEmail={handleSelectedEmail} />
      </div>
      {validationStatus.status ? (
        <Button onClick={handleEmailSave}>저장</Button>
      ) : (
        <Button
          onClick={handleCheckButton}
          disabled={emailId.length === 0 || domain.length === 0}
        >
          확인
        </Button>
      )}
    </section>
  );
}

export default Email;
