import { useEffect, useState } from 'react';

import supabase from '@/api/supabase';

// ✅ 즐겨찾기 상태 체크
export const useFavoriteCheck = (
  contentId: string,
  userId: string | undefined,
) => {
  const [isCheck, setIsCheck] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      const { data, error } = await supabase
        .from('favorite')
        .select('content_id, favorite_folders!inner(user_id)')
        .eq('content_id', contentId)
        .eq('favorite_folders.user_id', userId)
        .maybeSingle();

      if (!error && data) {
        setIsCheck(true);
      } else {
        setIsCheck(false);
      }
    };

    if (!userId) return;

    checkFavorite();
  }, [contentId, userId]);

  return [isCheck, setIsCheck] as const;
};
