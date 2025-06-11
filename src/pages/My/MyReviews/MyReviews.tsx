import ReviewList from '@/components/Contents/ReviewList';
import RabbitFace from '@/components/RabbitFace/RabbitFace';
import { useAuthStore } from '@/store/useAuthStore';

function MyReviews() {
  const { user } = useAuthStore();
  const userId = user?.id;

  return (
    <div>
      <h2 className="fs-14 lh bg-primary relative -mx-6 mb-6 flex flex-col gap-2 p-6 text-white">
        <div className="fs-16 flex items-center gap-1 font-semibold">
          <RabbitFace size={24} /> <p>안내</p>
        </div>
        <p className="">
          카드 위 제목을 누르면 리뷰를 작성한 장소의 상세 페이지로 이동해요!
        </p>
        <span className="triangle absolute -bottom-[0.1px] left-10"></span>
      </h2>
      <ReviewList userId={userId} />
    </div>
  );
}

export default MyReviews;
