import supabase from '@/api/supabase';

async function getLikesAndReviews(contentId: string) {
  const { data, error } = await supabase
    .from('contents')
    .select('likes, reviews')
    .eq('contentid', contentId)
    .single();

  if (error || !data) {
    return { likes: 0, reviews: 0 };
  }

  return {
    likes: data.likes ?? 0,
    reviews: data.reviews ?? 0,
  };
}

export { getLikesAndReviews };
