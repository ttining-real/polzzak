import { useQueries } from '@tanstack/react-query';
import { memo } from 'react';

import { fetchImage } from '@/api/openAPI/utils/fetchImage';
import supabase from '@/api/supabase';
import AddFavoriteCard from '@/components/Favorites/AddFavoriteCard';
import FavoritesCards from '@/components/Favorites/FavoriteCards';
import { useToast } from '@/hooks/useToast';

export interface FolderProps {
  id: string;
  folder_name: string;
}

interface FavoritesListProps {
  folders: FolderProps[];
  onClick: () => void;
  onClickDelete: (id: string, name: string) => void;
  onClickModify: (id: string, name: string) => void;
}

function FavoritesList({
  folders,
  onClick,
  onClickDelete,
  onClickModify,
}: FavoritesListProps) {
  const showToast = useToast();

  const fetchImagesQueries = useQueries({
    queries: folders.map((folder) => ({
      queryKey: ['favorite=images', folder.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('favorite')
          .select('content_id')
          .eq('folder_id', folder.id)
          .limit(3)
          .order('created_at', { ascending: false });

        if (error || !data) {
          showToast(
            '데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
            'top-[64px]',
            5000,
          );
          console.error('❌ 폴더 데이터 불러오기 실패:', error);
          return;
        }
        const contentIds = data.map((item) => item.content_id);
        const images = await fetchImage(contentIds);
        return images;
      },
      staleTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      enabled: true,
    })),
  });

  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-6">
      {folders.map((folder, idx) => {
        const { data: images = [], isLoading } = fetchImagesQueries[idx];
        return (
          <FavoritesCards
            key={folder.folder_name}
            name={folder.folder_name}
            images={isLoading ? [] : images}
            onClickDelete={() => onClickDelete(folder.id, folder.folder_name)}
            onClickModify={() => onClickModify(folder.id, folder.folder_name)}
          />
        );
      })}
      <AddFavoriteCard onClick={onClick} />
    </section>
  );
}

export default memo(FavoritesList);
