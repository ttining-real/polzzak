import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import supabase from '@/api/supabase';
import ListItemCardById from '@/components/ListItem/ListItemCardById';
import { useToast } from '@/hooks/useToast';
import RequireLogin from '@/pages/RequireLogin';
import { useAuthStore } from '@/store/useAuthStore';
import { useHeaderStore } from '@/store/useHeaderStore';

function FavoritesDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itemList, setItemList] = useState<
    { contentid: string; contenttypeid: string }[] | null
  >(null);
  const showToast = useToast();
  const setContentsTitle = useHeaderStore((state) => state.setContentsTitle);
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.id;

  // 🕹️ 즐겨찾기 리스트 fetch
  const checkFolderExists = useCallback(
    async (folderId: string) => {
      const { data, error } = await supabase
        .from('ex_favorite_folders')
        .select('user_id, folder_name')
        .eq('user_id', userId)
        .eq('id', folderId)
        .single();

      if (error || !data) {
        navigate('/my/favorites');
        return null;
      }

      return data;
    },
    [userId, navigate],
  );

  const fetchFavoriteList = useCallback(
    async (folderId: string) => {
      const { data, error } = await supabase
        .from('ex_favorite')
        .select('ex_contents(contentid, contenttypeid)')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) {
        showToast(
          '데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
          'top-[64px]',
          5000,
        );
        console.error('❌ 데이터 가져오기 실패: ', error);
        return;
      }

      type DataType = {
        ex_contents: {
          contentid: string;
          contenttypeid: string;
        };
      };

      const getData = data as unknown as DataType[];

      const contentsData = getData.map((item) => ({
        contentid: item.ex_contents.contentid,
        contenttypeid: item.ex_contents.contenttypeid,
      }));

      setItemList(contentsData);
    },
    [showToast],
  );

  useEffect(() => {
    if (!id || !userId) return;
    const init = async () => {
      const folder = await checkFolderExists(id);
      if (!folder) return;
      setContentsTitle(folder.folder_name);

      await fetchFavoriteList(id);
    };
    init();
    return () => setContentsTitle(null);
  }, [id, userId, checkFolderExists, fetchFavoriteList, setContentsTitle]);

  if (!userId || !isAuthenticated) {
    return <RequireLogin />;
  }

  return (
    <section>
      {itemList?.length ? (
        <ul className="flex flex-col gap-6">
          {itemList?.map((item, idx) => (
            <ListItemCardById
              key={idx}
              contentId={item.contentid}
              contentTypeId={item.contenttypeid}
            />
          ))}
        </ul>
      ) : (
        <p className="bg-gray01 text-gray07 fs-14 rounded-sm px-4 py-2">
          저장된 폴더가 없습니다.
        </p>
      )}
    </section>
  );
}

export default FavoritesDetails;
