import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import supabase from '@/api/supabase';
import { Review, reviewData } from '@/components/Contents/Review';
import RabbitFace from '@/components/RabbitFace/RabbitFace';
import { useAuthStore } from '@/store/useAuthStore';

function MyReviews() {
  const [myReviewList, setMyReviewList] = useState<reviewData[]>([]);
  const { user } = useAuthStore();
  const userId = user?.id;
  const location = useLocation();
  const isMyReviewPage = location.pathname === '/my/my-reviews';

  useEffect(() => {
    if (!userId) return;
    const getReviewList = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.log(error);
        return;
      }

      const list = data?.map((li) => ({
        id: li.id,
        userId: li.user_id,
        userName: li.user_name,
        review: li.review,
        contentId: li.content_id,
        created: li.created_at,
      }));
      setMyReviewList(list);
    };
    getReviewList();
  }, [userId]);

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
      <ul className="mt-4 flex flex-col gap-2">
        {myReviewList.map((review) => (
          <li key={review.id}>
            <Review
              reviewId={review.id}
              userId={userId}
              userName={review.userName}
              review={review.review}
              currentUser={userId}
              setReviewList={setMyReviewList}
              contentId={review.contentId}
              created={review.created}
              isMyReviewPage={isMyReviewPage}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyReviews;
