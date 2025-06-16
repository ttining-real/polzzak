import { useInfiniteQuery } from '@tanstack/react-query';

import { getReviewsContent } from '@/api/supabase/utils/getReviewsContent';
import { reviewData } from '@/components/Contents/Review';

const useGetReviews = ({
  id,
  find,
}: {
  id: string;
  find: [string, string];
}) => {
  return useInfiniteQuery({
    queryKey: ['get-reviews', id],
    queryFn: async ({ pageParam }) => {
      const res = await getReviewsContent({ find, page: pageParam });
      return [res?.[0] ?? [], res?.[1] ?? 0, pageParam] as [
        reviewData[],
        number,
        number,
      ];
    },
    getNextPageParam: (last, allPages) => {
      const total = last[1];
      const loaded = allPages.reduce((acc, [list]) => acc + list.length, 0);
      return loaded < total ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!id,
  });
};

export default useGetReviews;
