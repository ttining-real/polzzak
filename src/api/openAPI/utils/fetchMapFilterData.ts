import supabase from '@/api/supabase';

// 🧡 즐겨찾기
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

// 🐰 폴짝
export const fetchPolzzakItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('ex_polzzak')
    .select(
      `
      ex_polzzak_schedule(
        schedule_id,
        ex_polzzak_detail(
          content_id
        )
      )
    `,
    )
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Polzzak Item을 불러오는 중, 오류 발생 ! ', error);
    return [];
  }

  return data;
};
