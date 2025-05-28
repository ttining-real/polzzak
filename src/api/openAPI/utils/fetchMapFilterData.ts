import supabase from '@/api/supabase';

export const fetchFavoriteItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('ex_favorite_folders')
    .select(`id, folder_name, ex_favorite(content_id)`)
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Favorite Item을 불러오는 중, 오류 발생 ! ', error);
    return [];
  }

  return data;
};
