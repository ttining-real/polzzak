import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchGetDetailCommon } from '@/api/openAPI/utils/fetchGetDetailCommon';
import Button from '@/components/Button/Button';
import AlertDialog from '@/components/Dialog/AlertDialog';
import Icon from '@/components/Icon/Icon';
import { typeToFilterName } from '@/lib/filterMap';
import { useDialogStore } from '@/store/useDialogStore';

export interface reviewData {
  id: string;
  userId: string;
  userName: string;
  review: string;
  contentId: string;
  created: string;
}

function Review({
  reviewId,
  userId,
  userName,
  review,
  currentUser,
  contentId,
  created,
  isMyReviewPage,
  onClickDelete,
}: {
  reviewId?: string;
  userId?: string;
  userName?: string;
  review?: string;
  currentUser?: string;
  contentId?: string;
  created?: string;
  isMyReviewPage?: boolean;
  onClickDelete?: (id: string) => void;
}) {
  const [cardInfo, setCardInfo] = useState<{
    addr1: string;
    contenttypeid: string;
    title: string;
  } | null>(null);
  const { isOpenId, openModal, closeModal } = useDialogStore();
  const myReview = userId === currentUser;

  useEffect(() => {
    if (!isMyReviewPage || !contentId) return;

    const fetchDetail = async () => {
      const info = await fetchGetDetailCommon(contentId);
      setCardInfo({
        addr1: info.addr1,
        contenttypeid: info.contenttypeid,
        title: info.title,
      });
    };
    fetchDetail();
  }, [isMyReviewPage, contentId]);

  const reviewDate = (data: string) => {
    const createdDate = data?.slice(0, 10).split('-');
    return `${createdDate[0]}년 ${createdDate[1]}월 ${createdDate[2]}일`;
  };

  return userId && review ? (
    <article className="fs-13 bg-gray01 lh flex flex-col gap-1 rounded-md p-3">
      <div>
        <div className="flex gap-1">
          {isMyReviewPage && cardInfo ? (
            <Link
              to={`/contents/${contentId}?category=${typeToFilterName(cardInfo.contenttypeid)}`}
              className="w-full flex-1 truncate"
            >
              <span className="fs-14 mr-1 font-semibold">{cardInfo.title}</span>
              <span className="text-gray06">{`${cardInfo.addr1.split(' ')[0]} ${cardInfo.addr1.split(' ')[1]}`}</span>
            </Link>
          ) : (
            <p className="fs-14 flex-1 font-semibold">{userName}</p>
          )}
          {myReview && (
            <Button
              variant={'tertiary'}
              size={'sm'}
              className="bg-gray01 h-5 w-7"
              onClick={() => {
                openModal(reviewId);
              }}
            >
              <Icon id="delete" className="text-primary" />
            </Button>
          )}
        </div>

        <p className="mt-2">{review}</p>
      </div>
      <footer className="text-gray06 text-right">
        {created ? reviewDate(created) : '0000년 00월 00일'}
      </footer>
      {isOpenId === reviewId && (
        <AlertDialog
          header="리뷰 삭제"
          description={['해당 리뷰를 삭제할까요?']}
          button={[
            {
              text: '취소',
              onClick: () => {
                closeModal();
              },
            },
            {
              text: '삭제',
              onClick: () => {
                if (onClickDelete && reviewId) {
                  onClickDelete(reviewId);
                }
              },
            },
          ]}
        />
      )}
    </article>
  ) : (
    <article className="fs-13 bg-gray01 text-gray07 flex flex-col items-center rounded-md p-3">
      <p>아직 등록된 리뷰가 없어요.</p>
      <p>리뷰를 작성해 주세요!</p>
    </article>
  );
}

export { Review };
