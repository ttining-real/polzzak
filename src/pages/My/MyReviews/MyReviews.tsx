import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Review, reviewData } from '@/components/Contents/Review';
import { useAuthStore } from '@/store/useAuthStore';

const DUMMY_DATA = [
  {
    id: '000',
    userId: 'c4ff296a-b2a1-4c33-8710-3f7efac11df1',
    userName: '홀딱벗은래빗',
    review: '여기 찐 맛집 인정ㅋㅋ',
    contentId: '3485244',
  },
  {
    id: '111',
    userId: 'c4ff296a-b2a1-4c33-8710-3f7efac11df1',
    userName: '홀딱벗은래빗',
    review:
      '좀 비싸긴 함.. 근데 인사에 올리기 좋음ㅎㅎ 커플끼리 오기 딱 좋아잉잉잉잉잉잉잉잉잉잉잉',
    contentId: '3485244',
  },
];

function MyReviews() {
  const [myReviewList, setMyReviewList] = useState<reviewData[]>([]);
  const { user } = useAuthStore();
  const userId = user?.id;

  useEffect(() => {
    setMyReviewList(DUMMY_DATA);
  }, []);

  return (
    <div>
      <h2 className="fs-14 lh mb-6">
        <p className="text-primary font-semibold">📢 안내</p>
        <p className="">
          카드 위 제목을 누르면 내가 리뷰한 장소의 상세 페이지로 이동해요!
        </p>
      </h2>
      <hr />
      <ul className="mt-6 flex flex-col gap-4">
        {myReviewList.map((review) => (
          <li key={review.id}>
            <Link
              to={`/contents/${review.contentId}`}
              className="fs-13 text-gray07 px-2"
            >
              푼주
            </Link>
            <Review
              reviewId={review.id}
              userId={userId}
              userName={review.userName}
              review={review.review}
              currentUser={userId}
              setReviewList={setMyReviewList}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyReviews;
