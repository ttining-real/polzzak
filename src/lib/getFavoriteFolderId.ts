import supabase from '@/api/supabase';

// ✅ 현재 로그인한 유저의 기본 즐겨찾기 폴더 ID 가져오기
export const getFavoriteFolderId = async ({
  userId,
  name,
  contentId,
}: {
  userId: string | undefined;
  name?: string | undefined;
  contentId?: string;
}) => {
  if (!userId) return;
  if (name && !contentId) {
    const { data, error } = await supabase
      .from('favorite_folders')
      .select('id')
      .match({ user_id: userId, folder_name: name })
      .maybeSingle();

    if (error || !data) {
      console.error('❌ 폴더 ID 가져오기 실패:', error);
      return;
    }

    return data.id;
  } else {
    const { data, error } = await supabase
      .from('favorite')
      .select('folder_id, favorite_folders!inner(user_id)')
      .eq('content_id', contentId)
      .eq('favorite_folders.user_id', userId)
      .maybeSingle();

    if (error || !data) {
      console.error('❌ 폴더 ID 가져오기 실패:', error);
      return;
    }

    return data.folder_id;
  }
};
