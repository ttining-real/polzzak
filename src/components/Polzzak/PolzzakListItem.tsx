import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import AlertDialog from '@/components/Dialog/AlertDialog';
import Icon from '@/components/Icon/Icon';
import RabbitFace from '@/components/RabbitFace/RabbitFace';
import { useToast } from '@/hooks/useToast';
import { ListItemType } from '@/pages/Polzzak/Polzzak';
import { useDialogStore } from '@/store/useDialogStore';

interface PolzzakListItemProps {
  item: ListItemType;
  onDeleted?: () => void;
  detail?: boolean;
}

function PolzzakListItem({
  item,
  onDeleted,
  detail = false,
}: PolzzakListItemProps) {
  const navigate = useNavigate();
  const [region, setRegion] = useState<{ region: string }[]>([]);
  const [openMeatball, setOpenMeatball] = useState(false);
  const { isOpenId, closeModal, openModal } = useDialogStore();
  const showToast = useToast();
  const Container = detail ? 'div' : 'li';

  useEffect(() => {
    const getMyRegion = async () => {
      const { data, error } = await supabase
        .from('ex_polzzak_region')
        .select('region')
        .eq('polzzak_id', item.id);

      if (!data || data.length === 0) return;
      if (error) return;

      setRegion(data);
    };

    getMyRegion();
  }, [item.id]);

  const onClickMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e?.stopPropagation();
    setOpenMeatball((prev) => !prev);
  };

  const onClickDelete = async () => {
    if (item.id !== isOpenId) {
      showToast(
        '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.',
        'top-[64px]',
        3000,
      );
      return;
    }

    const { error } = await supabase
      .from('ex_polzzak')
      .delete()
      .eq('id', item.id);

    if (error) {
      showToast(
        '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.',
        'top-[64px]',
        3000,
      );
      console.error('폴짝 삭제 실패', error);
    } else {
      if (item.thumbnail) {
        const { data, error } = await supabase.storage
          .from('expolzzak')
          .remove([item.thumbnail]);

        if (error || !data) {
          console.error(error);
          return;
        }
      }
      if (onDeleted) {
        onDeleted();
        showToast('삭제가 완료되었습니다.', 'top-[64px]', 2000);
      } else {
        showToast('삭제가 완료되었습니다.', 'top-[64px]', 2000);
        navigate('/polzzak');
      }
    }

    setOpenMeatball(false);
  };

  const renderContent = () => {
    return (
      <>
        <figure className="bg-primary/10 flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg object-cover">
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="폴짝" className="h-full w-full" />
          ) : (
            <RabbitFace alt="폴짝 사진을 지정하지 않았어요." />
          )}
        </figure>
        <div className="flex flex-1 flex-col overflow-hidden">
          <span className="fs-14 overflow-hidden font-semibold text-nowrap text-ellipsis text-black">
            {item.name ? item.name : '폴짝 이름 미정'}
          </span>
          <span className="font-regular text-gray07 fs-14 overflow-hidden text-nowrap text-ellipsis">
            {item.startDate
              ? item.endDate
                ? `${format(item.startDate, 'yyyy-MM-dd', { locale: ko })} ~ ${format(item.endDate, 'yyyy-MM-dd', { locale: ko })}`
                : `${format(item.startDate, 'yyyy-MM-dd', { locale: ko })}`
              : '날짜 미정'}
          </span>
          <span className="font-regular text-gray07 fs-14 overflow-hidden text-nowrap text-ellipsis">
            {region.length === 0
              ? '지역 미정'
              : region.length === 1
                ? region[0].region
                : `${region[0].region} 외 ${region.length - 1}개 도시`}
          </span>
        </div>
        <div className="relative">
          <Button
            variant="tertiary"
            size="md"
            className="bg-white"
            onClick={onClickMore}
          >
            <Icon id="more" />
          </Button>
          {openMeatball && (
            <div className="border-gray03 absolute right-1 z-10 w-fit rounded-md border bg-white p-1">
              {[
                {
                  label: '편집하기',
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    setOpenMeatball(false);
                    navigate(`/polzzak/edit/${item.id}`);
                  },
                },
                {
                  label: '삭제하기',
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMeatball(false);

                    openModal(item.id);
                  },
                },
              ].map(({ label, onClick }, index) => (
                <Button
                  key={index}
                  variant="tertiary"
                  size="md"
                  className="hover:bg-gray02 fs-14 font-regular h-9 rounded-sm bg-white px-3 hover:text-black active:text-black"
                  onClick={onClick}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <Container {...(detail ? undefined : { role: 'listitem' })}>
      {detail ? (
        <div className="flex flex-row items-center gap-4">
          {renderContent()}
        </div>
      ) : (
        <Link
          to={`/polzzak/${item.id}`}
          className="flex flex-row items-center gap-4"
        >
          {renderContent()}
        </Link>
      )}

      {isOpenId === item.id && (
        <AlertDialog
          header="해당 폴짝을 삭제할까요?"
          description={['삭제하면 복구할 수 없어요.']}
          buttonDirection="row"
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
                closeModal();
              },
            },
          ]}
        />
      )}
    </Container>
  );
}

export default PolzzakListItem;
