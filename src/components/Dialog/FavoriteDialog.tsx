import { useEffect, useState } from 'react';

import supabase from '@/api/supabase';
import SlideUpDialog from '@/components/Dialog/SlideUpDialog';
import Input from '@/components/Input/Input';
import { Radio } from '@/components/Input/RadioGroup';
import { FavoirteType, PolzzakType } from '@/components/Input/SelectMenu';
import { useToast } from '@/hooks/useToast';
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
  const showToast = useToast();

  useEffect(() => {
    if (!id || !userId) return;

    const getContent = async () => {
      const { data, error } = await supabase
        .from('ex_contents')
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
  }, [id, userId]);

  const onClickAdd = async () => {
    try {
      if (selectFolder && isOpenId === '즐겨찾기') {
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
        setIsMyContent(true);
      }
      if (selectPolzzak && info) {
        if (isOpenId === '기존폴짝') {
          const { data, error } = await supabase
            .from('ex_polzzak')
            .select('id')
            .eq('user_id', userId);

          if (error) throw error;

          if (data.length) {
            const { data, error } = await supabase
              .from('ex_polzzak_detail')
              .select('schedule_id')
              .match({ schedule_id: selectPolzzak, content_id: id });

            if (error) throw error;

            if (data.length) {
              showToast('이미 폴짝에 저장되어 있어요!', 'bottom-[64px]', 3000);
            } else {
              const { error } = await supabase
                .from('ex_polzzak_detail')
                .insert([
                  {
                    schedule_id: selectPolzzak,
                    place: info.title,
                    content_id: id,
                    order: 99,
                  },
                ]);
              if (error) throw error;
            }
          }
        } else {
          // isOpenId === '신규폴짝'
          console.log('hi');
        }
      }
    } catch (err) {
      console.error(err);
      return;
    } finally {
      closeModal();
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
          },
        },
      ]}
    >
      {isOpenId === '신규폴짝' ? (
        // 수정 필요
        <section>
          <Input label="폴짝 이름" placeholder="폴짝 이름을 입력해 주세요." />
          <Input label="폴짝 날짜" />
          <Input label="폴짝 장소" value={info?.addr1} />
        </section>
      ) : (
        <Radio
          data={radioList}
          setSelectFolder={setSelectFolder}
          setSelectPolzzak={setSelectPolzzak}
        />
      )}
    </SlideUpDialog>
  );
}

export default FavoriteDialog;
