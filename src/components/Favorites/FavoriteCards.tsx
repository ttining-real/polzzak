import { memo } from 'react';
import { Link } from 'react-router-dom';

import FavoritesCard from '@/components/Favorites/FavoriteCard';
import { cn } from '@/lib/utils';
import { useHeaderStore } from '@/store/useHeaderStore';

interface FavoritesCardsProps {
  name: string;
  images: string[];
  onClickDelete?: () => void;
  onClickModify?: () => void;
}

function FavoritesCards({
  name,
  images,
  onClickDelete,
  onClickModify,
}: FavoritesCardsProps) {
  const isEditMode = useHeaderStore((state) => state.isEditMode);
  const encodedName = encodeURIComponent(name);

  return isEditMode ? (
    <div
      className={cn(
        'focus-visible:ring-ring relative w-full outline-none focus-visible:rounded-md focus-visible:ring-[2px] focus-visible:ring-offset-2',
      )}
    >
      <FavoritesCard
        name={name}
        images={images}
        onClickDelete={onClickDelete}
        onClickModify={onClickModify}
      />
    </div>
  ) : (
    <Link
      to={`/my/favorites/${encodedName}`}
      className={cn(
        'focus-visible:ring-ring relative w-full outline-none focus-visible:rounded-md focus-visible:ring-[2px] focus-visible:ring-offset-2',
      )}
    >
      <FavoritesCard name={name} images={images} />
    </Link>
  );
}

export default memo(FavoritesCards);
