import { useEffect, useState } from 'react';

import supabase from '@/api/supabase';
import { useAuthStore } from '@/store/useAuthStore';

// ✅ 현재 로그인한 유저의 기본 즐겨찾기 폴더 ID 가져오기
export const useFavoriteFolderId = () => {
  const { user } = useAuthStore();
  const [folderId, setFolderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFolderId = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('ex_favorite_folders')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('❌ 폴더 ID 가져오기 실패:', error);
        return;
      }

      setFolderId(data.id);
    };

    fetchFolderId();
  }, [user]);

  return folderId;
};
