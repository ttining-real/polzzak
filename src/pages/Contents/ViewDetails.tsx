import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGetDetailCommon } from '@/api/openAPI';
import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Details from '@/components/Contents/Details';
import SlideUpDialog from '@/components/Dialog/SlideUpDialog';
import Icon from '@/components/Icon/Icon';
import { Radio } from '@/components/Input/RadioGroup';
import { FavoirteType, PolzzakType } from '@/components/Input/SelectMenu';
import UserMenu, { MenuItemTypes } from '@/components/UserMenu/UserMenu';
import { useAuthStore } from '@/store/useAuthStore';
import { useDialogStore } from '@/store/useDialogStore';
import { useHeaderStore } from '@/store/useHeaderStore';
import { useSearchStore } from '@/store/useSearchStore';

function ViewDetails() {
  const { id } = useParams();
  const [radioList, setRadioList] = useState<
    FavoirteType[] | PolzzakType[] | null
  >(null);
  const [selectFolder, setSelectFolder] = useState<string | null>(null);
  const [selectPolzzak, setSelectPolzzak] = useState<string | null>(null);
  const [isMyContent, setIsMyContent] = useState(false);
  const [isSaveContent, setIsSaveContent] = useState(false);
  const { detailData } = useSearchStore();
  const setContentsTitle = useHeaderStore((state) => state.setContentsTitle);
  const { isOpenId, openModal, closeModal } = useDialogStore();
  const info = detailData.filter((item) => item.contentid === id);
  const rawData = useGetDetailCommon(id as string);
  const data = rawData ?? null;
  const { user } = useAuthStore();
  const userId = user?.id;
  const userMenu: MenuItemTypes[] = [
    {
      label: '즐겨찾기',
      icon: isMyContent ? 'favorite_on' : 'favorite_off',
      onClick: () => {
        openModal('즐겨찾기');
        onClickFavorite();
      },
    },
    {
      label: '폴짝추가',
      icon: 'calendar',
      onClick: () => {
        openModal('폴짝추가');
        onClickPolzzak();
      },
    },
    {
      label: '리뷰작성',
      icon: 'review',
      path: '/',
    },
    {
      label: '공유하기',
      icon: 'share',
      onClick: () => {
        onClickShare();
      },
    },
  ];

  useEffect(() => {
    if (data?.title) {
      setContentsTitle(data.title);
    }
    return () => {
      setContentsTitle(null);
    };
  }, [data, setContentsTitle]);

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
  }, [id, userId]);

  const onClickFavorite = async () => {
    if (!id || !userId) return;
    try {
      const { data, error } = await supabase
        .from('ex_favorite_folders')
        .select('id, folder_name, ex_favorite(content_id)')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
      setRadioList(
        data.map((item) => ({
          id: item.id,
          name: item.folder_name,
          storage: item.ex_favorite?.map((i) => i.content_id),
        })),
      );
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const onClickPolzzak = async () => {
    if (!id || !userId) return;
    try {
      const { data, error } = await supabase
        .from('ex_polzzak')
        .select(
          'id, name, startDate, endDate, ex_polzzak_schedule(schedule_id, date)',
        )
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
      setRadioList(
        data.map((item) => ({
          id: item.id,
          name: item.name,
          startDate: item.startDate,
          endDate: item.endDate,
          storage: item.ex_polzzak_schedule?.map((i) => ({
            schedule_id: i.schedule_id,
            date: i.date,
          })),
        })),
      );
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const onClickShare = async () => {
    try {
      await navigator.share({
        title: '폴짝 POLZZAK',
        text: '국내 여행지를 찾고 싶을 땐, 폴짝!',
        url: `https://polzzak.vercel.app/contents/${id}`,
      });
    } catch (error) {
      return console.error(error);
    }
  };

  const onClickAdd = async () => {
    if (!selectFolder || !selectPolzzak) return;
    try {
      if (isOpenId === '즐겨찾기') {
        if (isSaveContent) {
          const { error } = await supabase
            .from('ex_contents')
            .insert([{ contentid: id, contenttypeid: info[0].contenttypeid }]);
          if (error) throw error;
        }

        const { error } = await supabase
          .from('ex_favorite')
          .insert([{ folder_id: selectFolder?.slice(5), content_id: id }]);

        if (error) throw error;
      }
      if (isOpenId === '폴짝추가') {
        const { error } = await supabase.from('ex_polzzak_detail').insert([
          {
            schedule_id: selectFolder?.slice(5),
            place: info[0].title,
            memo: info[0].addr1,
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
    <div className="flex flex-col gap-4">
      <figure className="bg-primary/10 flex h-full min-h-[230px] w-full flex-col items-center justify-center rounded-2xl">
        {info.length > 0 ? (
          info[0].image ? (
            <>
              <img
                src={info[0].image}
                alt=""
                className="h-full w-full rounded-2xl"
              />
              <figcaption className="sr-only">{info[0].title}</figcaption>
            </>
          ) : (
            <>
              <img
                src="/images/rabbit_face.png"
                alt=""
                className="mb-4 aspect-square h-12"
              />
              <figcaption className="">등록된 이미지가 없습니다.</figcaption>
            </>
          )
        ) : (
          <div className="text-center">이미지를 불러오는 중 입니다.</div>
        )}
      </figure>
      <UserMenu menus={userMenu} />
      {data && info.length > 0 ? (
        <Details info={info[0]} data={data} />
      ) : (
        <div>데이터를 불러오는 중 입니다.</div>
      )}
      {isOpenId && (
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
      )}
      <Button variant={'float'}>
        <Icon id="arrow_top" />
      </Button>
    </div>
  );
}

export default ViewDetails;
