import { useEffect, useState } from 'react';

import supabase from '@/api/supabase';
import SlideUpDialog from '@/components/Dialog/SlideUpDialog';
import { Radio } from '@/components/Input/RadioGroup';
import { FavoirteType, PolzzakType } from '@/components/Input/SelectMenu';
import { useToast } from '@/hooks/useToast';
import { transAddress } from '@/lib/transAddress';
import { useDialogStore } from '@/store/useDialogStore';

interface FavoriteDialogProps {
  radioList: FavoirteType[] | PolzzakType[] | null;
  id: string;
  userId: string;
  listContentTypeid?: string;
  info?: {
    contenttypeid: string;
    title: string;
    addr1?: string;
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
    if (info && (!info.title || !info.contenttypeid)) return;

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
  }, [id, userId, info]);

  if (isOpenId === '신규폴짝') return;

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
          .from('favorite')
          .insert([{ folder_id: selectFolder?.slice(5), content_id: id }]);

        if (error) throw error;
        setIsMyContent(true);
      }
      if (selectPolzzak && info && isOpenId === '기존폴짝') {
        const { data, error } = await supabase
          .from('polzzak_detail')
          .select('schedule_id')
          .match({ schedule_id: selectPolzzak, content_id: id });

        if (error) throw error;

        if (data.length) {
          showToast('이미 폴짝에 저장되어 있어요!', 'bottom-[64px]', 3000);
        } else {
          const { error } = await supabase.from('polzzak_detail').insert([
            {
              schedule_id: selectPolzzak,
              place: info.title,
              content_id: id,
              order: 99,
            },
          ]);
          if (error) throw error;

          if (info.addr1) {
            const addr = transAddress(info.addr1);
            const { data, error } = await supabase
              .from('polzzak_schedule')
              .select('polzzak_id')
              .eq('schedule_id', selectPolzzak)
              .single();
            if (error) throw error;

            const { error: regionErr } = await supabase
              .from('polzzak_region')
              .upsert([{ polzzak_id: data?.polzzak_id, region: addr }], {
                onConflict: 'polzzak_id,region',
              });
            if (regionErr) throw regionErr;
          }
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
      <Radio
        data={radioList}
        setSelectFolder={setSelectFolder}
        setSelectPolzzak={setSelectPolzzak}
      />
    </SlideUpDialog>
  );
}

export default FavoriteDialog;
