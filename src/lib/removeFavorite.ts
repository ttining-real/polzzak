import supabase from '@/api/supabase';

// 🗑️ 즐겨찾기 삭제
export const removeFavorite = async (folderId: string, contentId: string) => {
  const { error } = await supabase
    .from('ex_favorite')
    .delete()
    .match({ folder_id: folderId, content_id: contentId });

  if (error) {
    console.error('❌ 즐겨찾기 삭제 실패:', error);
  }

  return { error };
};
