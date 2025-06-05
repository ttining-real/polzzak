import { Dispatch } from 'react';

import Button from '@/components/Button/Button';
import AlertDialog from '@/components/Dialog/AlertDialog';
import Icon from '@/components/Icon/Icon';
import { useDialogStore } from '@/store/useDialogStore';

export interface reviewData {
  id: string;
  userId: string;
  userName: string;
  review: string;
}

function Review({
  reviewId,
  userId,
  userName,
  review,
  currentUser,
  setReviewList,
}: {
  reviewId?: string;
  userId?: string;
  userName?: string;
  review?: string;
  currentUser?: string;
  setReviewList?: Dispatch<React.SetStateAction<reviewData[]>>;
}) {
  const { isOpenId, openModal, closeModal } = useDialogStore();
  const myReview = userId === currentUser;

  const onClickDelete = () => {
    if (!setReviewList) return;
    setReviewList((prev) => prev.filter((review) => review.id !== reviewId));
    closeModal();
  };

  return userId && review ? (
    <article className="fs-13 bg-gray01 lh flex flex-col gap-1 rounded-md p-3">
      <div className="flex gap-1">
        <p className="flex-1">{review}</p>
        {myReview && (
          <Button
            variant={'tertiary'}
            size={'sm'}
            className="bg-gray01 h-5 w-7"
            onClick={() => {
              openModal(reviewId);
              console.log('click');
            }}
          >
            <Icon id="delete" />
          </Button>
        )}
      </div>
      <footer className="text-gray06 text-right">{userName}</footer>
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
                onClickDelete();
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
