import supabase from '@/api/supabase';

// 💛 즐겨찾기 추가 및 콘텐츠 체크
export const addFavoriteWithContentCheck = async ({
  contentId,
  contentTypeId,
  folderId,
}: {
  contentId: string;
  contentTypeId: string;
  folderId?: string;
}) => {
  // 🔍 1. 먼저 contents 테이블에 해당 콘텐츠가 있는지 확인
  const { data: existingContent } = await supabase
    .from('contents')
    .select('contentid')
    .eq('contentid', contentId)
    .single();

  // ➕ 2. 없으면 먼저 contents에 삽입
  if (!existingContent) {
    const { error: insertContentError } = await supabase
      .from('contents')
      .insert([
        {
          contentid: contentId,
          contenttypeid: contentTypeId,
        },
      ]);

    if (insertContentError) {
      console.error('❌ contents 삽입 실패:', insertContentError);
      return { error: insertContentError };
    }
  }

  if (folderId) {
    // ❤️ 3. favorite에 찜 정보 삽입
    return await supabase.from('favorite').insert([
      {
        folder_id: folderId,
        content_id: contentId,
      },
    ]);
  }
};
