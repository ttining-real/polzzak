import { useEffect, useState } from 'react';

import supabase from '@/api/supabase';
import SlideUpDialog from '@/components/Dialog/SlideUpDialog';
import { Radio } from '@/components/Input/RadioGroup';
import { FavoirteType, PolzzakType } from '@/components/Input/SelectMenu';
import { useDialogStore } from '@/store/useDialogStore';

interface FavoriteDialogProps {
  radioList: FavoirteType[] | PolzzakType[] | null;
  id: string;
  userId: string;
  listContentTypeid?: string;
  info?: {
    contenttypeid: string;
    title: string;
    addr1: string;
  };
  setIsMyContent: (arg: boolean) => void;
}

function FavoriteDialog({
  radioList,
  id,
  userId,
  listContentTypeid,
  info,
  setIsMyContent,
}: FavoriteDialogProps) {
  const [selectFolder, setSelectFolder] = useState<string | null>(null);
  const [selectPolzzak, setSelectPolzzak] = useState<string | null>(null);
  const [isSaveContent, setIsSaveContent] = useState(false);
  const { isOpenId, closeModal } = useDialogStore();

  useEffect(() => {
    if (!id || !userId) return;
    const isMyFavorite = async () => {
      const { data, error } = await supabase
        .from('ex_favorite_folders')
        .select('ex_favorite(content_id)')
        .eq('user_id', userId);

      if (error) {
        console.error(error);
        return;
      }

      const hasMyContent = data.some((folder) =>
        folder.ex_favorite?.some((item) => item.content_id === id),
      );
      setIsMyContent(hasMyContent);
    };
    isMyFavorite();

    const getContent = async () => {
      const { data, error } = await supabase
        .from('ex_content')
        .select('contentid')
        .eq('contentid', id);

      if (error) {
        console.error(error);
        return;
      }
      const hasContent = data.some((content) => content.contentid === id);
      setIsSaveContent(hasContent);
    };
    getContent();
  }, [id, userId, setIsMyContent]);

  const onClickAdd = async () => {
    if (!selectFolder || !selectPolzzak) return;
    try {
      if (isOpenId === '즐겨찾기') {
        if (!isSaveContent) {
          const { error } = await supabase.from('ex_contents').insert([
            {
              contentid: id,
              contenttypeid: info ? info.contenttypeid : listContentTypeid,
            },
          ]);
          if (error) throw error;
        }

        const { error } = await supabase
          .from('ex_favorite')
          .insert([{ folder_id: selectFolder?.slice(5), content_id: id }]);

        if (error) throw error;
      }
      if (isOpenId === '폴짝추가' && info) {
        const { error } = await supabase.from('ex_polzzak_detail').insert([
          {
            schedule_id: selectFolder?.slice(5),
            place: info.title,
            memo: info.addr1,
            content_id: id,
            order: 99,
          },
        ]);
        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      return;
    }
  };

  return (
    <SlideUpDialog
      header={`${isOpenId === '즐겨찾기' ? '즐겨찾기' : '폴짝'} 추가하기`}
      button={[
        {
          text: '취소',
          onClick: () => {
            closeModal();
          },
        },
        {
          text: '추가',
          onClick: async () => {
            await onClickAdd();
            closeModal();
          },
        },
      ]}
    >
      <Radio
        data={radioList}
        setSelectFolder={setSelectFolder}
        setSelectPolzzak={setSelectPolzzak}
      />
    </SlideUpDialog>
  );
}

export default FavoriteDialog;
