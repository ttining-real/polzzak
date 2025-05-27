import { memo, useCallback } from 'react';

import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import RabbitFace from '@/components/RabbitFace/RabbitFace';
import { cn } from '@/lib/utils';
import { useHeaderStore } from '@/store/useHeaderStore';

interface FavoriteCardProps {
  name: string;
  images?: string[];
  addFolder?: boolean;
  onClick?: () => void;
  onClickDelete?: () => void;
  onClickModify?: () => void;
}

function FavoriteCard({
  name,
  images = [],
  addFolder = false,
  onClick,
  onClickDelete,
  onClickModify,
}: FavoriteCardProps) {
  const isEditMode = useHeaderStore((state) => state.isEditMode);
  const commonImgClass = cn('h-full object-cover object-center');

  const renderImages = useCallback(() => {
    if (images.length === 0 && addFolder) {
      return (
        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full text-white">
          <Icon id="add" />
        </div>
      );
    }

    if (images.length === 0) {
      return (
        <div className="flex items-center">
          <RabbitFace size={18} />
          <p className="fs-13 text-gray05">깡총깡총</p>
          <RabbitFace size={18} />
        </div>
      );
    }

    if (images.length <= 2) {
      return images.map((url, index) => (
        <img
          key={index}
          src={url ? url : '/images/rabbit_face.png'}
          alt={`${name} 폴더의 ${index + 1}번`}
          className={`${commonImgClass} ${images.length === 1 ? 'w-full' : 'w-1/2'}`}
        />
      ));
    }

    return (
      <>
        <img
          src={images[0] === 'rabbit' ? '/images/rabbit_face.png' : images[0]}
          alt={`${name} 폴더의 1번`}
          className={`${commonImgClass} w-3/5`}
        />
        <div className="divide-gray03 w-2/5 divide-y-2 divide-double">
          {[images[1], images[2]].map((url, index) => (
            <img
              key={index}
              src={url ? url : '/images/rabbit_face.png'}
              alt={`${name} 폴더의 ${index + 1}번`}
              className={`${commonImgClass} aspect-[6/5]`}
            />
          ))}
        </div>
      </>
    );
  }, [addFolder, commonImgClass, images, name]);

  return (
    <article
      onClick={onClick}
      className={cn(
        'outline-none',
        onClick &&
          'focus-visible:ring-ring focus-visible:rounded-md focus-visible:ring-[2px] focus-visible:ring-offset-2',
      )}
      {...(onClick
        ? {
            role: 'button',
            tabIndex: 0,
            onKeyDown: (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onClick();
              }
            },
          }
        : null)}
    >
      <div
        className={cn(
          'border-gray03 flex aspect-[3/2] items-center justify-center overflow-hidden rounded-lg border-2',
          'w-full bg-[url("/images/pattern.png")] bg-cover',
          'divide-gray03 divide-x-2 divide-double',
        )}
      >
        {renderImages()}
      </div>
      {isEditMode && !onClick ? (
        <>
          <Button
            variant={'tertiary'}
            className="text-primary hover:border-primary-hover absolute top-0 right-0 bg-transparent"
            onClick={onClickDelete}
          >
            <Icon id="delete" />
          </Button>
          <Button
            variant={'tertiary'}
            size={'md'}
            onClick={onClickModify}
            className={cn(
              'mt-[8px] h-auto w-full justify-start truncate border py-[4px]',
            )}
          >
            <p className={cn('fs-14 lh truncate')}>{name}</p>
          </Button>
        </>
      ) : (
        <p
          className={cn(
            'fs-14 lh mt-2 truncate border border-transparent px-2 py-1',
          )}
        >
          {name}
        </p>
      )}
    </article>
  );
}

export default memo(FavoriteCard);
