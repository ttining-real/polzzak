import supabase from '@/api/supabase';

// 💛 즐겨찾기 추가 및 콘텐츠 체크
export const addFavoriteWithContentCheck = async (
  folderId: string,
  contentId: string,
  contentTypeId: string,
) => {
  // 🔍 1. 먼저 ex_contents 테이블에 해당 콘텐츠가 있는지 확인
  const { data: existingContent } = await supabase
    .from('ex_contents')
    .select('contentid')
    .eq('contentid', contentId)
    .single();

  // ➕ 2. 없으면 먼저 ex_contents에 삽입
  if (!existingContent) {
    const { error: insertContentError } = await supabase
      .from('ex_contents')
      .insert([
        {
          contentid: contentId,
          contenttypeid: contentTypeId,
        },
      ]);

    if (insertContentError) {
      console.error('❌ ex_contents 삽입 실패:', insertContentError);
      return { error: insertContentError };
    }
  }

  // ❤️ 3. ex_favorite에 찜 정보 삽입
  return await supabase.from('ex_favorite').insert([
    {
      folder_id: folderId,
      content_id: contentId,
    },
  ]);
};
