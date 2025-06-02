import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { fetchContentDetail } from '@/api/openAPI/utils/fetchContentDetail';
import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import FavoriteDialog from '@/components/Dialog/FavoriteDialog';
import Icon from '@/components/Icon/Icon';
import { FavoirteType, PolzzakType } from '@/components/Input/SelectMenu';
import Loader from '@/components/Loader/Loader';
import RabbitFace from '@/components/RabbitFace/RabbitFace';
import { useFavoriteCheck } from '@/hooks/useFavoriteCheck';
import { useToast } from '@/hooks/useToast';
import { addFavoriteWithContentCheck } from '@/lib/favorite';
import { getFavoriteFolderId } from '@/lib/getFavoriteFolderId';
import { removeFavorite } from '@/lib/removeFavorite';
import { useAuthStore } from '@/store/useAuthStore';
import { useDialogStore } from '@/store/useDialogStore';
import { useReturnPathStore } from '@/store/useReturnPathStore';

function ListItemCardById({
  contentId,
  contentTypeId,
  currentTitle,
}: {
  contentId: string;
  contentTypeId: string;
  currentTitle?: string;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFavoritePath = location.pathname.startsWith('/my/favorites');
  const { user } = useAuthStore();
  const userId = user?.id;
  const [isCheck, setIsCheck] = useFavoriteCheck(contentId, userId);
  const [item, setItem] = useState<Record<string, string | undefined>>({});
  const [likeAndReview, setLikeAndReview] = useState({ likes: 0, reviews: 0 });
  const showToast = useToast();
  const fromPath = useReturnPathStore((state) => state.fromPath);
  const isSelectPolzzak = fromPath;
  const Wrapper = isSelectPolzzak ? 'div' : Fragment;

  // 리스트아이템 필요
  const [radioList, setRadioList] = useState<
    FavoirteType[] | PolzzakType[] | null
  >(null);
  const [isLoading, setIsLoading] = useState('');
  const [clickFavorite, setClickFavorite] = useState(false);
  const { isOpenId, openModal } = useDialogStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchContentDetail(contentId, contentTypeId);
        setItem(data);
      } catch (error) {
        console.error('❌ fetchContentDetail 에러:', error);
      }
    };

    const getLikesAndReviews = async () => {
      const { data, error } = await supabase
        .from('ex_contents')
        .select('likes, reviews')
        .eq('contentid', contentId)
        .maybeSingle();

      if (error) {
        console.log('❌ getLikesAndReviews 에러:', error);
        return;
      }

      setLikeAndReview({
        likes: data?.likes ?? 0,
        reviews: data?.reviews ?? 0,
      });
    };

    fetchData();
    getLikesAndReviews();
  }, [contentId, contentTypeId]);

  if (!item.title) return <p>불러오는 중...</p>; // 추후 스켈레톤으로 변경

  /* 🕹️ 찜 기능 - 실행 */
  const onClickFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!userId) {
      return navigate('/login');
    }
    if (isFavoritePath) {
      const folderId = await getFavoriteFolderId({ userId: userId, name: id });
      if (!id || !folderId) return;
      if (isCheck) {
        try {
          const { error } = await removeFavorite(folderId, contentId);

          if (error) throw error;

          setIsCheck(false);
          setLikeAndReview((prev) => ({
            likes: Math.max((prev.likes ?? 0) - 1, 0),
            reviews: prev.reviews,
          }));
        } catch (err) {
          showToast('🚫 즐겨찾기 삭제에 실패했어요.', 'top-[64px]', 4000);
          console.error('🚫 즐겨찾기 삭제:', err);
          setIsCheck(true);
        }
      } else {
        try {
          const { error } = await addFavoriteWithContentCheck(
            folderId,
            contentId,
            contentTypeId,
          );

          if (error) throw error;
          setIsCheck(true);
          setLikeAndReview((prev) => ({
            likes: (prev.likes ?? 0) + 1,
            reviews: prev.reviews,
          }));
        } catch (err) {
          showToast('💔 즐겨찾기를 추가하지 못했어요.', 'top-[64px]', 4000);
          console.error('💔 즐겨찾기 추가 실패:', err);
          setIsCheck(false);
        }
      }
    } else {
      try {
        if (isCheck) {
          const folderId = await getFavoriteFolderId({
            userId: userId,
            contentId: contentId,
          });
          setIsLoading('즐겨찾기 삭제 중..');
          const { error } = await supabase
            .from('ex_favorite')
            .delete()
            .match({ folder_id: folderId, content_id: contentId });

          if (error) {
            showToast('🚫 즐겨찾기 삭제에 실패했어요.', 'top-[64px]', 4000);
            throw error;
          }
          setLikeAndReview((prev) => ({
            likes: Math.max((prev.likes ?? 0) - 1, 0),
            reviews: prev.reviews,
          }));
          setIsCheck(false);
        } else {
          setClickFavorite(true);
          openModal('즐겨찾기');
          setIsLoading('폴더 가져오는 중..');
          const { data, error } = await supabase
            .from('ex_favorite_folders')
            .select('id, folder_name, ex_favorite(content_id)')
            .eq('user_id', userId);

          if (error) {
            showToast('💔 즐겨찾기를 추가하지 못했어요.', 'top-[64px]', 4000);
            throw error;
          }
          setRadioList(
            data.map((item) => ({
              id: item.id,
              name: item.folder_name,
              storage: item.ex_favorite?.map((i) => i.content_id),
            })),
          );
        }
      } catch (error) {
        console.error(error);
        return;
      } finally {
        setIsLoading('');
      }
    }
  };

  const changeDate = (date: string) => {
    const yy = date.slice(0, 4);
    const mm = date.slice(4, 6);
    const dd = date.slice(6, 8);

    return `${yy}.${mm}.${dd}`;
  };

  let periodInfo = '정보 없음';
  switch (contentTypeId) {
    case '12':
      periodInfo = item?.usetime ?? '';
      break;
    case '14':
      periodInfo = item?.usetimeculture ?? '';
      break;
    case '15':
      periodInfo = `${changeDate(item?.eventstartdate ?? '')} ~ ${changeDate(item?.eventenddate ?? '')}`;
      break;
    case '28':
      periodInfo = item?.usetimeleports ?? '';
      break;
    case '32':
      periodInfo = `체크인: ${item?.checkintime} ~ 체크아웃: ${item?.checkouttime}`;
      break;
    case '38':
      periodInfo = item?.opentime ?? '';
      break;
    case '39':
      periodInfo = item?.opentimefood ?? '';
      break;
    default:
      periodInfo = '정보 없음';
      break;
  }

  if (periodInfo.includes('<br>') && periodInfo.includes('~')) {
    const info = `${periodInfo.split('<br>')[0]}`;
    periodInfo = `${info.split('~')[0]} ~ ${info.split('~')[1]}`;
  } else if (periodInfo.includes('~')) {
    periodInfo = `${periodInfo.split('~')[0]} ~ ${periodInfo.split('~')[1]}`;
  } else if (periodInfo.includes('-')) {
    periodInfo = `${periodInfo.split('-')[0]} ~ ${periodInfo.split('-')[1]}`;
  }

  return (
    <li>
      <Link
        to={`/contents/${contentId}`}
        className="flex-start relative flex w-full items-center gap-4"
      >
        <div className="bg-primary/10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl object-cover">
          {item.image ? (
            <img src={item.image} alt={item.title} className="h-full w-full" />
          ) : (
            <RabbitFace alt="이미지 준비 중입니다." />
          )}
        </div>
        <div className="flex w-0 flex-1 flex-col">
          <Wrapper
            {...(isSelectPolzzak ? { className: 'flex items-center' } : null)}
          >
            <Wrapper {...(isSelectPolzzak ? { className: 'flex-1' } : null)}>
              <div className="flex items-center justify-between">
                <h3
                  className="fs-14 ls lh w-full truncate font-semibold text-black"
                  aria-label={item.title}
                >
                  {item.title}
                </h3>
                {!isSelectPolzzak && (
                  <Button
                    variant="tertiary"
                    size="md"
                    className='m-0.5 h-6 w-6 [&_svg:not([class*="size-"])]:size-5'
                    onClick={onClickFavorite}
                    aria-label={isCheck ? '즐겨찾기 취소' : '즐겨찾기 추가'}
                    aria-live="polite"
                  >
                    <Icon
                      id={isCheck ? 'favorite_on' : 'favorite_off'}
                      className="text-primary"
                    />
                  </Button>
                )}
              </div>
              <Wrapper
                {...(isSelectPolzzak ? { className: 'flex flex-col' } : null)}
              >
                <span className="fs-14 ls lh font-regular text-gray07">
                  {periodInfo}
                </span>
                <span className="fs-14 ls lh font-regular text-gray07 inline-flex items-center">
                  {item.region}
                  <Icon id="chevron_right" size={16} className="text-gray07" />
                  {item.district}
                </span>
              </Wrapper>
              <dl className="fs-14 ls lh font-regular text-gray07 flex items-center gap-2">
                <div
                  className="flex items-center gap-1"
                  aria-label="즐겨찾기 수"
                >
                  <dt>
                    <Icon id="favorite_off" size={16} />
                  </dt>
                  {likeAndReview.likes !== undefined && (
                    <dd className="align-top">
                      {likeAndReview.likes >= 999
                        ? '999+'
                        : likeAndReview.likes}
                    </dd>
                  )}
                </div>
                <div className="flex items-center gap-1" aria-label="리뷰 수">
                  <dt>
                    <Icon id="review" size={16} />
                  </dt>
                  {likeAndReview.reviews !== undefined && (
                    <dd className="align-top">
                      {likeAndReview.reviews >= 999
                        ? '999+'
                        : likeAndReview.reviews}
                    </dd>
                  )}
                </div>
              </dl>
            </Wrapper>
            {isSelectPolzzak && (
              <Button
                variant={'tertiary'}
                size={'sm'}
                className="text-primary fs-14 bg-primary/10 rounded-full px-4 py-3 font-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(fromPath ?? '/polzzak', {
                    state: {
                      contentId: contentId,
                      place: item.title,
                    },
                    replace: true,
                  });
                }}
              >
                선택
              </Button>
            )}
          </Wrapper>
        </div>
      </Link>

      {isOpenId === '즐겨찾기' &&
        clickFavorite &&
        userId &&
        currentTitle &&
        !isSelectPolzzak && (
          <FavoriteDialog
            radioList={radioList}
            id={contentId}
            userId={userId}
            info={{ contenttypeid: contentTypeId, title: currentTitle }}
            setIsMyContent={setIsCheck}
          />
        )}
      {isLoading && <Loader text={isLoading} />}
    </li>
  );
}

export default ListItemCardById;
