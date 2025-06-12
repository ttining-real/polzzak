import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Progress } from '@/components/Register/progress';
import { Step1, Step2, Step3 } from '@/pages/Register';

import NotFound from '../NotFound';

const REGISTER_STEP = [
  {
    step: 1,
    title: '로그인에 사용할 이메일 주소를 입력해 주세요.',
  },
  {
    step: 2,
    title: '로그인에 사용할 비밀번호를 입력해 주세요.',
  },
  {
    step: 3,
    title: '폴짝에서 사용할 닉네임을 입력해 주세요.',
  },
];

function Register() {
  const [searchParams, setSearchParams] = useSearchParams();

  const stepParam = searchParams.get('step');
  const step = Number(searchParams.get('step')) || 1;

  // 🚨 step 쿼리 없거나 잘못된 경우 리다이렉트
  useEffect(() => {
    if (!stepParam || isNaN(step) || step < 1 || step > REGISTER_STEP.length) {
      setSearchParams({ step: '1' });
    }
  }, [stepParam, step, setSearchParams]);

  const renderStepComponent = () => {
    switch (step) {
      case 1:
        return <Step1 />;
        break;
      case 2:
        return <Step2 />;
        break;
      case 3:
        return <Step3 />;
        break;
      default:
        return <NotFound />;
    }
  };

  return (
    <main className="flex-1 overflow-auto">
      <Progress value={(step / REGISTER_STEP.length) * 100} />
      <section className="flex flex-col gap-6 p-8">
        <header className="flex flex-col">
          <h2 className="text-16 order-2 font-semibold text-black">
            {REGISTER_STEP[step - 1].title}
          </h2>
          <p className="order-1 flex items-baseline gap-1">
            <span aria-hidden className="fs-18 text-primary font-semibold">
              {step}
            </span>
            <span aria-hidden className="text-gray06 fs-14">
              / {REGISTER_STEP.length}
            </span>
          </p>
        </header>
        <div className="flex flex-col gap-4">{renderStepComponent()}</div>
      </section>
    </main>
  );
}

export default Register;
