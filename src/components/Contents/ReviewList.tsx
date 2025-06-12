import { Dispatch, SetStateAction, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import { Review, reviewData } from '@/components/Contents/Review';
import Input from '@/components/Input/Input';
import { addFavoriteWithContentCheck } from '@/lib/favorite';
import { filterNameToType } from '@/lib/filterMap';

interface ReviewListProps {
  userId?: string;
  searchParams?: URLSearchParams;
  reviewRef?: React.RefObject<HTMLDivElement | null>;
  reviewList: reviewData[] | [];
  setReviewList: Dispatch<SetStateAction<reviewData[]>>;
  totalReview: number;
}

function ReviewList({
  userId,
  searchParams,
  reviewRef,
  reviewList,
  setReviewList,
  totalReview,
}: ReviewListProps) {
  const { id } = useParams();
  const { pathname, search } = useLocation();
  const isMyReviewPage = pathname === '/my/my-reviews';
  const isReviewPage =
    pathname.startsWith('/contents/') && pathname.includes('reviews');
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const categoryName = search.split('=')[1];
  const contentTypeId = filterNameToType(categoryName);

  const handleAddReview = async () => {
    if (!userId || !id || inputValue.trim() === '') return;

    const getUserName = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('nickname')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.log(error);
        return;
      }
      return data?.nickname;
    };

    const userName = await getUserName();

    const insertReview = async () => {
      const hasContent = await addFavoriteWithContentCheck({
        contentId: id,
        contentTypeId: contentTypeId ?? '',
      });

      if (hasContent && 'error' in hasContent && hasContent.error) {
        console.error(hasContent.error);
        return;
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            content_id: id,
            user_id: userId,
            user_name: userName,
            review: inputValue.trim(),
          },
        ])
        .select()
        .single();

      if (error || !data) {
        console.error(error);
        return;
      }

      setReviewList((prev) => [
        {
          id: data.id,
          userId: userId,
          userName: userName,
          review: inputValue.trim(),
          contentId: id,
          created: data.created_at,
        },
        ...prev,
      ]);
    };
    insertReview();

    setInputValue('');
  };
  return isMyReviewPage ? (
    <ul className="mt-4 flex flex-col gap-2">
      {reviewList?.map((review) => (
        <li key={review.id}>
          <Review
            reviewId={review.id}
            userId={userId}
            userName={review.userName}
            review={review.review}
            currentUser={userId}
            setReviewList={setReviewList}
            contentId={review.contentId}
            created={review.created}
            isMyReviewPage={isMyReviewPage}
          />
        </li>
      ))}
    </ul>
  ) : (
    <div className="flex flex-col gap-4">
      <h3
        {...(reviewRef ? { ref: reviewRef } : null)}
        className="fs-14 border-b-gray03 flex w-full gap-2 border-b border-solid p-2 font-bold text-black"
      >
        리뷰
        <span className="fs-13 text-primary font-semibold">{totalReview}</span>
      </h3>
      <div className="relative flex items-center justify-center gap-2">
        <Input
          label="리뷰 작성"
          hideLabel={true}
          placeholder={
            userId ? '한 줄 리뷰를 작성해 주세요!' : '로그인 후 이용해 주세요!'
          }
          value={inputValue}
          onChange={(e) => {
            const value = e.target.value;
            setInputValue(value);
          }}
          disabled={!userId}
          maxLength={200}
        />
        <Button
          disabled={!userId || inputValue.trim() === ''}
          onClick={handleAddReview}
        >
          등록
        </Button>
      </div>
      <div
        className={`${isReviewPage ? 'flex flex-col items-center gap-4' : 'relative'}`}
      >
        <ul className="flex w-full flex-col gap-2">
          {reviewList.length ? (
            isReviewPage ? (
              reviewList.map((data) => (
                <li key={data.id} className="w-full">
                  <Review
                    reviewId={data.id}
                    userId={data.userId}
                    userName={data.userName}
                    review={data.review}
                    currentUser={userId}
                    setReviewList={setReviewList}
                    created={data.created}
                  />
                </li>
              ))
            ) : (
              reviewList.slice(0, 3).map((data, idx) => (
                <li
                  key={data.id}
                  className={idx === 2 ? 'max-h-[55px] overflow-hidden' : ''}
                >
                  <Review
                    reviewId={data.id}
                    userId={data.userId}
                    userName={data.userName}
                    review={data.review}
                    currentUser={userId}
                    setReviewList={setReviewList}
                    created={data.created}
                  />{' '}
                  {idx === 2 && (
                    <div className="from-gray07 pointer-events-none absolute bottom-0 left-0 h-2 w-full bg-gradient-to-t to-transparent dark:from-white" />
                  )}
                </li>
              ))
            )
          ) : (
            <li>
              <Review />
            </li>
          )}
        </ul>
        {!isReviewPage && (
          <Button
            variant={'secondary'}
            size={'md'}
            className="absolute bottom-0 left-1/2 w-20 -translate-x-1/2 translate-y-1/2 shadow-md"
            onClick={() => {
              navigate(`reviews?${searchParams}`);
            }}
          >
            더보기
          </Button>
        )}
      </div>
    </div>
  );
}

export default ReviewList;
