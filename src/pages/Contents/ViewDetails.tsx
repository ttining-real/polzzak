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
  const { detailData } = useSearchStore();
  const info = detailData.filter((item) => item.contentid === id);
  const rawData = useGetDetailCommon(id as string);
  const data = rawData ?? null;
  const setContentsTitle = useHeaderStore((state) => state.setContentsTitle);
  const { isOpen, openModal, closeModal } = useDialogStore();
  const { user } = useAuthStore();
  const userId = user?.id;
  const [radioList, setRadioList] = useState<
    FavoirteType[] | PolzzakType[] | null
  >(null);
  const userMenu: MenuItemTypes[] = [
    {
      label: '즐겨찾기',
      icon: 'favorite_off',
      onClick: () => {
        openModal();
        onClickAddFavorite();
      },
    },
    {
      label: '폴짝추가',
      icon: 'calendar',
      onClick: () => {
        openModal();
        onClickAddPolzzak();
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

  const onClickAddFavorite = async () => {
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

  const onClickAddPolzzak = async () => {
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

  useEffect(() => {
    if (data?.title) {
      setContentsTitle(data.title);
    }
    return () => {
      setContentsTitle(null);
    };
  }, [data, setContentsTitle]);

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
      {isOpen && (
        <SlideUpDialog
          header="즐겨찾기 추가하기"
          button={[
            {
              text: '취소',
              onClick: () => {
                closeModal();
              },
            },
            {
              text: '추가',
              onClick: () => {
                console.log('click');
                closeModal();
              },
            },
          ]}
        >
          <Radio data={radioList} />
        </SlideUpDialog>
      )}
      <Button variant={'float'}>
        <Icon id="arrow_top" />
      </Button>
    </div>
  );
}

export default ViewDetails;
