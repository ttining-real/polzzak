import FavoriteCard from '@/components/Favorites/FavoriteCard';

function AddFavoriteCard({ onClick }: { onClick: () => void }) {
  return (
    <div className="focus-visible:ring-ring w-full cursor-pointer outline-none focus-visible:rounded-md focus-visible:ring-[2px] focus-visible:ring-offset-2">
      <FavoriteCard
        name="폴더 추가하기"
        images={[]}
        addFolder={true}
        onClick={onClick}
      />
    </div>
  );
}

export default AddFavoriteCard;
