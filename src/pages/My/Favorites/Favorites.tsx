import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import supabase from '@/api/supabase';
import SlideUpDialog from '@/components/Dialog/SlideUpDialog';
import FavoritesList, {
  FolderProps,
} from '@/components/Favorites/FavoritesList';
import Input from '@/components/Input/Input';
import Loader from '@/components/Loader/Loader';
import { useToast } from '@/hooks/useToast';
import RequireLogin from '@/pages/RequireLogin';
import { useAuthStore } from '@/store/useAuthStore';
import { useDialogStore } from '@/store/useDialogStore';

function Favorites() {
  const [currentFolder, setCurrentFolder] = useState<FolderProps>();
  const [dialogType, setDialogType] = useState<
    'add' | 'edit' | 'delete' | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, openModal, closeModal } = useDialogStore();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.id;
  const showToast = useToast();
  const failToast = (text: string) => {
    showToast(text, 'bottom-[64px]', 3000);
  };

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ['folders', userId],
    queryFn: () =>
      getFolders(userId!, () => {
        failToast('데이터를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.');
      }),
    enabled: !!userId,
  });

  const handleAddClick = useCallback(() => {
    setCurrentFolder({ id: '', folder_name: '' });
    setDialogType('add');
    openModal();
  }, [openModal]);

  const handleEditClick = useCallback(
    (id: string, folder_name: string) => {
      setCurrentFolder({ id, folder_name });
      setDialogType('edit');
      openModal();
    },
    [openModal],
  );

  const handleDeleteClick = useCallback(
    (id: string, folder_name: string) => {
      setCurrentFolder({ id, folder_name });
      setDialogType('delete');
      openModal();
    },
    [openModal],
  );

  const handleSaveFolder = async (type: 'add' | 'edit') => {
    if (!currentFolder?.folder_name.trim()) {
      inputRef.current?.focus();
      return;
    }

    try {
      if (type === 'add') {
        await addFolder(userId!, currentFolder.folder_name.trim(), () => {
          failToast('폴더를 추가하지 못했어요. 잠시 후 다시 시도해 주세요.');
        });
      } else {
        await editFolder(
          currentFolder.id,
          currentFolder.folder_name.trim(),
          () => {
            failToast('이름을 변경하지 못했어요. 잠시 후 다시 시도해 주세요.');
          },
        );
      }
      await queryClient.invalidateQueries({ queryKey: ['folders', userId] });
      closeModal();
      setDialogType(null);
    } catch (error) {
      console.error(error);
      showToast('잠시 후 다시 시도해 주세요.', 'bottom-[64px]', 2000);
    }
  };

  const handleDeleteFolder = async () => {
    if (!currentFolder?.id) return;
    try {
      await deleteFolder(currentFolder.id, () => {
        failToast('폴더를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
      });
      await queryClient.invalidateQueries({ queryKey: ['folders', userId] });
      setDialogType(null);
      closeModal();
    } catch (error) {
      console.error(error);
      showToast(
        '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.',
        'bottom-[64px]',
        5000,
      );
    }
  };

  if (!isAuthenticated || !userId) return <RequireLogin />;

  return (
    <section>
      <FavoritesList
        folders={folders}
        onClick={handleAddClick}
        onClickModify={handleEditClick}
        onClickDelete={handleDeleteClick}
      />

      {isOpen && dialogType === 'add' && (
        <SlideUpDialog
          header="폴더 추가"
          button={[
            { text: '취소' },
            { text: '추가', onClick: () => handleSaveFolder('add') },
          ]}
        >
          <Input
            label="폴더 추가"
            hideLabel={true}
            value={currentFolder?.folder_name ?? ''}
            onChange={(e) =>
              setCurrentFolder((prev) =>
                prev ? { ...prev, folder_name: e.target.value } : undefined,
              )
            }
            placeholder="폴더 이름을 입력해 주세요."
            ref={inputRef}
            maxLength={20}
          />
        </SlideUpDialog>
      )}

      {isOpen && dialogType === 'edit' && (
        <SlideUpDialog
          header="폴더 이름 편집하기"
          button={[
            { text: '취소' },
            { text: '저장', onClick: () => handleSaveFolder('edit') },
          ]}
        >
          <Input
            label="폴더명 편집"
            hideLabel={true}
            value={currentFolder?.folder_name ?? ''}
            onChange={(e) =>
              setCurrentFolder((prev) =>
                prev ? { ...prev, folder_name: e.target.value } : undefined,
              )
            }
            placeholder="폴더 이름을 입력해 주세요."
            ref={inputRef}
            maxLength={20}
          />
        </SlideUpDialog>
      )}

      {isOpen && dialogType === 'delete' && (
        <SlideUpDialog
          header="폴더 삭제하기"
          button={[
            { text: '취소' },
            { text: '삭제', onClick: handleDeleteFolder },
          ]}
        >
          <p className="fs-14 flex w-full justify-center text-center">
            폴더 내 모든 콘텐츠도 함께 삭제됩니다.
            <br />
            정말 삭제하시겠습니까?
          </p>
        </SlideUpDialog>
      )}

      {/* 추후 스켈레톤 변경 필요 */}
      {isLoading && <Loader text="데이터 불러오는 중.." />}
    </section>
  );
}

export default Favorites;

// API 함수
const getFolders = async (userId: string, showToast: () => void) => {
  const { data, error } = await supabase
    .from('ex_favorite_folders')
    .select('id, folder_name')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) {
    showToast();
    console.log(error);
    return;
  }
  return data as FolderProps[];
};

const addFolder = async (
  userId: string,
  folderName: string,
  showToast: () => void,
) => {
  const { error } = await supabase
    .from('ex_favorite_folders')
    .insert([{ user_id: userId, folder_name: folderName }]);
  if (error) {
    showToast();
    console.log(error);
    return;
  }
};

const editFolder = async (
  folderId: string,
  folderName: string,
  showToast: () => void,
) => {
  const { error } = await supabase
    .from('ex_favorite_folders')
    .update({ folder_name: folderName })
    .eq('id', folderId);
  if (error) {
    showToast();
    console.log(error);
    return;
  }
};

const deleteFolder = async (folderId: string, showToast: () => void) => {
  const { error } = await supabase
    .from('ex_favorite_folders')
    .delete()
    .eq('id', folderId);
  if (error) {
    showToast();
    console.log(error);
    return;
  }
};
