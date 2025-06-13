import { useEffect, useRef, useState } from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { useGetDetailCommon } from '@/api/openAPI';
import { fetchContentDetail } from '@/api/openAPI/utils/fetchContentDetail';
import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Details from '@/components/Contents/Details';
import AlertDialog from '@/components/Dialog/AlertDialog';
import FavoriteDialog from '@/components/Dialog/FavoriteDialog';
import Icon from '@/components/Icon/Icon';
import { FavoirteType, PolzzakType } from '@/components/Input/SelectMenu';
import Loader from '@/components/Loader/Loader';
import UserMenu, { MenuItemTypes } from '@/components/UserMenu/UserMenu';
import { filterNameToType } from '@/lib/filterMap';
import { useAuthStore } from '@/store/useAuthStore';
import { useDialogStore } from '@/store/useDialogStore';
import { useHeaderStore } from '@/store/useHeaderStore';
// import { useSearchStore } from '@/store/useSearchStore';

function ViewDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const contentTypeName = searchParams.get('category');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isReviewPage = pathname.includes('reviews');
  const [isLoading, setIsLoading] = useState('');
  const [radioList, setRadioList] = useState<
    FavoirteType[] | PolzzakType[] | null
  >(null);
  const [info, setInfo] = useState<Record<string, string | undefined>>({});
  const [isMyContent, setIsMyContent] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  // const detailData = useSearchStore((state) => state.detailData);
  const setContentsTitle = useHeaderStore((state) => state.setContentsTitle);
  const { isOpenId, openModal, closeModal } = useDialogStore();
  // const info = detailData?.filter((item) => item.contentid.toString() === id);
  const rawData = useGetDetailCommon(id as string);
  const data = rawData ?? null;
  const { user } = useAuthStore();
  const userId = user?.id;
  const reviewRef = useRef<HTMLDivElement>(null);
  const userMenu: MenuItemTypes[] = [
    {
      label: '즐겨찾기',
      icon: isMyContent ? 'favorite_on' : 'favorite_off',
      onClick: () => {
        if (userId) {
          onClickFavorite();
        } else {
          navigate('/login');
        }
      },
    },
    {
      label: '폴짝추가',
      icon: 'calendar',
      onClick: () => {
        if (userId) {
          onClickPolzzak();
        } else {
          navigate('/login');
        }
      },
    },
    {
      label: '리뷰작성',
      icon: 'review',
      onClick: () => {
        scrollToReview();
      },
    },
    {
      label: '공유하기',
      icon: 'share',
      onClick: () => {
        onClickShare();
      },
    },
  ];

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (data?.title) {
      setContentsTitle(data.title);
    }
    return () => {
      setContentsTitle(null);
    };
  }, [data, setContentsTitle]);

  useEffect(() => {
    if (!id || !contentTypeName) {
      navigate('/', { replace: true });
      return;
    }

    const contentTypeId = filterNameToType(contentTypeName ?? '');
    if (!contentTypeId) return;

    const getContentDetail = async () => {
      const data = await fetchContentDetail(id, contentTypeId, true);
      setInfo(data);
    };
    if (!id || !userId) return;
    getContentDetail();

    const checkIsMyContent = async () => {
      const { data, error } = await supabase
        .from('favorite_folders')
        .select('favorite(folder_id, content_id)')
        .eq('user_id', userId);

      if (error) {
        console.error(error);
        return;
      }

      const isFavorited = data.flatMap((folder) =>
        folder.favorite?.filter((item) => item.content_id === id),
      );
      setSelectedFolderId(isFavorited[0]?.folder_id ?? null);
      setIsMyContent(!!isFavorited.length);
    };
    checkIsMyContent();
  }, [id, userId, contentTypeName, navigate]);

  const onClickFavorite = async () => {
    if (!id || !userId) {
      navigate('/login');
      return;
    }
    if (!isMyContent) {
      openModal('즐겨찾기');
    }
    try {
      if (isMyContent && selectedFolderId) {
        setIsLoading('즐겨찾기 삭제 중..');
        const { error } = await supabase
          .from('favorite')
          .delete()
          .match({ folder_id: selectedFolderId, content_id: id });

        if (error) throw error;
        setIsMyContent(false);
      } else {
        setIsLoading('폴더 가져오는 중..');
        const { data, error } = await supabase
          .from('favorite_folders')
          .select('id, folder_name, favorite(content_id)')
          .eq('user_id', userId);

        if (error) throw error;
        setRadioList(
          data.map((item) => ({
            id: item.id,
            name: item.folder_name,
            storage: item.favorite?.map((i) => i.content_id),
          })),
        );
      }
    } catch (error) {
      console.error(error);
      return;
    } finally {
      setIsLoading('');
    }
  };

  const onClickPolzzak = async () => {
    if (!id || !userId) {
      navigate('/login');
    } else {
      openModal('폴짝선택');
    }
  };

  const onClickExistingPolzzak = async () => {
    closeModal();
    if (!id || !userId) return;

    openModal('기존폴짝');
    try {
      setIsLoading('폴짝 가져오는 중...');
      const { data, error } = await supabase
        .from('polzzak')
        .select(
          'id, name, startDate, endDate, polzzak_schedule(schedule_id, date)',
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
          storage: item.polzzak_schedule?.map((i) => ({
            schedule_id: i.schedule_id,
            date: i.date,
          })),
        })),
      );
    } catch (error) {
      console.error(error);
      return;
    } finally {
      setIsLoading('');
    }
  };

  const onClickNewPolzzak = () => {
    closeModal();
    if (!id || !userId) {
      navigate('/login');
    } else {
      navigate('/polzzak/add', { state: { from: location.pathname } });
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

  return (
    <>
      {isReviewPage ? (
        <Outlet />
      ) : (
        <div className="flex flex-col gap-1 p-6">
          <figure className="bg-primary/10 flex h-full min-h-[230px] w-full flex-col items-center justify-center rounded-2xl">
            {info ? (
              info.image ? (
                <>
                  <img
                    src={info.image}
                    alt=""
                    className="h-full w-full rounded-2xl"
                  />
                  <figcaption className="sr-only">{info.title}</figcaption>
                </>
              ) : (
                <>
                  <img
                    src="/images/rabbit_face.png"
                    alt=""
                    className="mb-4 aspect-square h-12"
                  />
                  <figcaption>등록된 이미지가 없습니다.</figcaption>
                </>
              )
            ) : (
              <div className="text-center">이미지를 불러오는 중 입니다.</div>
            )}
          </figure>
          <UserMenu menus={userMenu} />
          {data && info && userId ? (
            <Details
              info={info}
              data={data}
              reviewRef={reviewRef}
              userId={userId}
              searchParams={searchParams}
            />
          ) : (
            <div>데이터를 불러오는 중 입니다.</div>
          )}
          {(isOpenId === '즐겨찾기' || isOpenId === '기존폴짝') &&
            id &&
            userId &&
            data && (
              <FavoriteDialog
                radioList={radioList}
                id={id}
                userId={userId}
                info={{
                  contenttypeid: data?.contenttypeid,
                  title: info?.title ?? '타이틀이 없어요.',
                  addr1: info.addr1,
                }}
                setIsMyContent={setIsMyContent}
              />
            )}
          {isOpenId === '폴짝선택' && (
            <AlertDialog
              header="폴짝 추가하기"
              description={[
                `신규${radioList?.length ? ' 또는 기존' : ''} 폴짝을 추가해 주세요.`,
              ]}
              buttonDirection="col"
              button={
                radioList?.length
                  ? [
                      {
                        text: '신규 폴짝 추가하기',
                        onClick: () => {
                          onClickNewPolzzak();
                        },
                      },
                      {
                        text: '기존 폴짝 추가하기',
                        onClick: () => {
                          onClickExistingPolzzak();
                        },
                      },
                    ]
                  : [
                      {
                        text: '신규 폴짝 추가하기',
                        onClick: () => {
                          onClickNewPolzzak();
                        },
                      },
                    ]
              }
            />
          )}
          <Button variant={'float'}>
            <Icon id="arrow_top" />
          </Button>

          <cite className="text-gray06 bg-gray01 fs-13 ls lh -mx-6 mt-10 -mb-6 p-6 text-center">
            ※ 한국관광공사 TourAPI 4.0을 통해 제공받은 데이터 입니다.
          </cite>
          {isLoading && <Loader text={isLoading} />}
        </div>
      )}
    </>
  );
}

export default ViewDetails;
