import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button/Button';
import RabbitFace from '@/components/RabbitFace/RabbitFace';

function NotFound({
  text = '요청하신 페이지를 찾을 수 없습니다.',
}: {
  text?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[url('/images/pattern.png')] px-[24px]">
      <div className="flex flex-col gap-10 pb-12">
        <h1 className="text-primary relative flex items-center justify-center gap-9 text-center text-[80px] font-bold whitespace-nowrap">
          <span>4</span>
          <span>4</span>
          <RabbitFace size={64} className="absolute" />
        </h1>
        <p className="fs-16 font-semibold">{text}</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        <Button
          onClick={() => {
            navigate(-1);
          }}
        >
          이전 화면으로 돌아가기
        </Button>
        <Button
          variant={'secondary'}
          onClick={() => {
            navigate('/');
          }}
        >
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
