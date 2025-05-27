import { useEffect, useState } from 'react';

import supabase from '@/api/supabase';
import { useAuthStore } from '@/store/useAuthStore';

import { useFavoriteFolderId } from './useFavoriteFolderId';

// ✅ 즐겨찾기 상태 체크
export const useFavoriteCheck = (contentId: string) => {
  const { isAuthenticated } = useAuthStore();
  const folderId = useFavoriteFolderId();
  const [isCheck, setIsCheck] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (isAuthenticated && folderId) {
        const { data, error } = await supabase
          .from('ex_favorite')
          .select('content_id')
          .eq('folder_id', folderId)
          .eq('content_id', contentId)
          .single();

        if (!error && data) {
          setIsCheck(true);
        } else {
          setIsCheck(false);
        }
      } else {
        // 비로그인 유저는 sessionStorage 확인
        const stored = sessionStorage.getItem('favorites');
        const parsed: string[] = stored ? JSON.parse(stored) : [];
        setIsCheck(parsed.includes(contentId));
      }
    };

    checkFavorite();
  }, [isAuthenticated, folderId, contentId]);

  return [isCheck, setIsCheck] as const;
};
