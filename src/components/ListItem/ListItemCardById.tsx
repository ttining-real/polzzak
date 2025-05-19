import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchContentDetail } from '@/api/openAPI/utils/fetchContentDetail';
import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import RabbitFace from '@/components/RabbitFace/RabbitFace';
import { useFavoriteCheck } from '@/hooks/useFavoriteCheck';
import { useFavoriteFolderId } from '@/hooks/useFavoriteFolderId';
import { useToast } from '@/hooks/useToast';
import { addFavoriteWithContentCheck } from '@/lib/favorite';
import { removeFavorite } from '@/lib/removeFavorite';
import { useAuthStore } from '@/store/useAuthStore';

function ListItemCardById({
  contentId,
  contentTypeId,
}: {
  contentId: string;
  contentTypeId: string;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const [isCheck, setIsCheck] = useFavoriteCheck(contentId);
  const folderId = useFavoriteFolderId();
  const [item, setItem] = useState<Record<string, string | undefined>>({});
  const [likeAndReview, setLikeAndReview] = useState({ likes: 0, reviews: 0 });
  const showToast = useToast();

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
        .select('likes, reviews, ex_favorite(folder_id)')
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
  const handleFavoriteClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();

    if (!user) {
      setIsCheck((prev) => {
        const next = !prev;
        // 비로그인: sessionStorage 업데이트
        const stored = sessionStorage.getItem('favorites');
        const parsed: string[] = stored ? JSON.parse(stored) : [];
        const updated = next
          ? [...parsed, contentId]
          : parsed.filter((id) => id !== contentId);
        sessionStorage.setItem('favorites', JSON.stringify(updated));
        return next;
      });
      return;
    }

    if (!folderId) {
      console.error('❌ 폴더 ID가 없습니다.');
      return;
    }

    if (isCheck) {
      const { error } = await removeFavorite(folderId, contentId);

      if (error) {
        showToast('🚫 즐겨찾기 삭제에 실패했어요.', 'top-[64px]', 4000);
        return;
      }

      showToast('🗑️ 즐겨찾기를 삭제했어요.', 'top-[64px]', 4000);
      setIsCheck(false);

      setLikeAndReview((prev) => ({
        likes: Math.max((prev.likes ?? 0) - 1, 0),
        reviews: prev.reviews,
      }));
    } else {
      const { error } = await addFavoriteWithContentCheck(
        folderId,
        contentId,
        contentTypeId,
      );
      if (error) {
        showToast('💔 즐겨찾기를 추가하지 못했어요.', 'top-[64px]', 4000);
        return;
      }
      showToast('🧡 즐겨찾기를 추가했어요!', 'top-[64px]', 4000);
      setIsCheck(true);

      setLikeAndReview((prev) => ({
        likes: (prev.likes ?? 0) + 1,
        reviews: prev.reviews,
      }));
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
          <div className="flex items-center justify-between">
            <h3
              className="fs-14 ls lh w-full truncate font-semibold text-black"
              aria-label={item.title}
            >
              {item.title}
            </h3>
            <Button
              variant="tertiary"
              size="md"
              className='m-0.5 h-6 w-6 [&_svg:not([class*="size-"])]:size-5'
              onClick={handleFavoriteClick}
              aria-label={isCheck ? '즐겨찾기 취소' : '즐겨찾기 추가'}
              aria-live="polite"
              disabled={isAuthenticated && !folderId}
            >
              <Icon
                id={isCheck ? 'favorite_on' : 'favorite_off'}
                className="text-primary"
              />
            </Button>
          </div>
          <span className="fs-14 ls lh font-regular text-gray07">
            {periodInfo}
          </span>
          <span className="fs-14 ls lh font-regular text-gray07 inline-flex items-center">
            {item.region}
            <Icon id="chevron_right" size={16} className="text-gray07" />
            {item.district}
          </span>
          <dl className="fs-14 ls lh font-regular text-gray07 flex items-center gap-2">
            <div className="flex items-center gap-1" aria-label="즐겨찾기 수">
              <dt>
                <Icon id="favorite_off" size={16} />
              </dt>
              {likeAndReview.likes !== undefined && (
                <dd className="align-top">
                  {likeAndReview.likes >= 999 ? '999+' : likeAndReview.likes}
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
        </div>
      </Link>
    </li>
  );
}

export default ListItemCardById;
