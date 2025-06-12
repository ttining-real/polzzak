import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';

import { reviewData } from '@/components/Contents/Review';
import ReviewList from '@/components/Contents/ReviewList';
import Loader from '@/components/Loader/Loader';
import RabbitFace from '@/components/RabbitFace/RabbitFace';
import useGetReviews from '@/hooks/useGetReviews';
import { useAuthStore } from '@/store/useAuthStore';

function MyReviews() {
  const navigate = useNavigate();
  const [reviewList, setReviewList] = useState<reviewData[]>([]);
  const [totalReview, setTotalReview] = useState(0);
  const { user } = useAuthStore();
  const userId = user?.id;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetReviews({
      id: userId ?? '',
      find: ['user_id', userId ?? ''],
    });

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (data?.pages) {
      const allReviews = data.pages.flatMap((page) => page[0]);
      const totalCount = data.pages[0][1];
      setReviewList(allReviews);
      setTotalReview(totalCount);
    }
  }, [data]);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!userId || isLoading) return <Loader text="리뷰 불러오는 중.." />;

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
      <ReviewList
        userId={userId}
        reviewList={reviewList}
        setReviewList={setReviewList}
        totalReview={totalReview}
      />
      <div
        hidden={!hasNextPage}
        ref={ref}
        className="text-primary animate-pulse p-8 text-center font-semibold duration-1000"
      >
        Loading...
      </div>
    </div>
  );
}

export default MyReviews;
