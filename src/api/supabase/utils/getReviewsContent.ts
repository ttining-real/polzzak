import supabase from '@/api/supabase';
import { reviewData } from '@/components/Contents/Review';

interface GetReivewsProps {
  find: [string, string];
  page?: number;
  pageSize?: number;
}

async function getReviewsContent({
  find,
  page = 0,
  pageSize = 15,
}: GetReivewsProps): Promise<[reviewData[], number] | undefined> {
  const start = page * pageSize;

  const { count, error } = await supabase
    .from('reviews')
    .select('content_id', { count: 'exact' })
    .eq(find[0], find[1]);

  if (error) {
    console.error(error);
    return;
  }

  const end = Math.max(start, Math.min(start + pageSize - 1, (count ?? 1) - 1));
  if (start > end) return [[], count ?? 0];

  const { data: rangedData, error: rangeError } = await supabase
    .from('reviews')
    .select('*')
    .eq(find[0], find[1])
    .order('created_at', { ascending: false })
    .range(start, end);

  if (rangeError) {
    console.error(rangeError);
    return;
  }

  const list = rangedData?.map((li) => ({
    id: li.id,
    userId: li.user_id,
    userName: li.user_name,
    review: li.review,
    contentId: li.content_id,
    created: li.created_at,
  }));

  return [list, count ?? 0];
}

export { getReviewsContent };
