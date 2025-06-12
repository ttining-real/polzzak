import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { reviewData } from '@/components/Contents/Review';
import ReviewList from '@/components/Contents/ReviewList';
import Loader from '@/components/Loader/Loader';
import useGetReviews from '@/hooks/useGetReviews';
import { filterNameToType } from '@/lib/filterMap';
import { useAuthStore } from '@/store/useAuthStore';

function DetailReviews() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentTypeName = searchParams.get('category');
  const contentTypeId = filterNameToType(contentTypeName ?? '');
  const [reviewList, setReviewList] = useState<reviewData[]>([]);
  const [totalReview, setTotalReview] = useState(0);
  const { user } = useAuthStore();
  const userId = user?.id;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetReviews({
      id: id ?? '',
      find: ['content_id', id ?? ''],
    });

  useEffect(() => {
    if (!id || !contentTypeId) {
      navigate('/');
    }
  }, [contentTypeId, id, navigate]);

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
    <section className="p-6">
      <ReviewList
        userId={userId}
        searchParams={searchParams}
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
    </section>
  );
}

export default DetailReviews;
