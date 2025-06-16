import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useCallback, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import SlideUpDialog from '@/components/Dialog/SlideUpDialog';
import Plan from '@/components/Timeline/Plan';
import TimelineList from '@/components/Timeline/TimelineList';
import { useToast } from '@/hooks/useToast';
import {
  ScheduleDetail,
  ScheduleList,
} from '@/pages/Polzzak/Schedule/Schedule';
import { useDialogStore } from '@/store/useDialogStore';

interface TimelineScheduleProps {
  schedule: ScheduleDetail[];
}

const changeDate = (date: string) => {
  return format(new Date(date), 'MM.dd EEE', { locale: ko });
};

function TimelineSchedule({ schedule }: TimelineScheduleProps) {
  const { id } = useParams();
  const location = useLocation();
  const isSchedule =
    location.pathname === `/polzzak/${id && encodeURIComponent(id)}`;
  const navigate = useNavigate();
  const { isOpenId, closeModal } = useDialogStore();
  const [changeOrderBtn, setChangeOrderBtn] = useState<string | null>(null);
  const [editPlanData, setEditPlanData] = useState<{
    place: string;
    content_id: string;
    time: string;
    memo: string;
    region?: string;
  } | null>(null);
  const showToast = useToast();
  const queryClient = useQueryClient();

  const editPlanBtn = [
    {
      text: '삭제',
      onClick: async () => {
        if (!isOpenId) return;

        const { error } = await supabase
          .from('polzzak_detail')
          .delete()
          .eq('id', isOpenId);

        if (error) {
          console.error(error);
          showToast(
            '저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
            'top-[64px]',
            4000,
          );
          return;
        }

        await queryClient.invalidateQueries({
          queryKey: ['schedule-details'],
        });

        closeModal();
        showToast('삭제가 완료되었습니다.', 'top-[64px]', 2000);
      },
    },
    {
      text: '저장',
      onClick: async () => {
        if (!editPlanData) return;

        const { error } = await supabase
          .from('polzzak_detail')
          .update({
            place: editPlanData.place.trim(),
            time: editPlanData.time || null,
            memo: editPlanData.memo.trim() || null,
            content_id: editPlanData.content_id || null,
          })
          .eq('id', isOpenId);

        if (error) {
          console.error(error);
          showToast(
            '저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
            'top-[64px]',
            4000,
          );
          return;
        }

        if (editPlanData.region) {
          const { data, error: scheduleErr } = await supabase
            .from('polzzak_schedule')
            .select('polzzak_id')
            .eq('schedule_id', isOpenId)
            .single();

          if (scheduleErr) {
            console.error(scheduleErr);
            return;
          }

          const { error } = await supabase
            .from('polzzak_region')
            .upsert(
              [{ polzzak_id: data.polzzak_id, region: editPlanData.region }],
              {
                onConflict: 'polzzak_id,region',
              },
            );

          if (error) {
            console.error(error);
            return;
          }
        }

        await queryClient.invalidateQueries({
          queryKey: ['schedule-details'],
        });
        closeModal();
      },
    },
  ];

  const handleEditDetail = (idx: string | null) => {
    setChangeOrderBtn(idx);
  };

  const saveReorderedCards = useCallback(
    async (changeCards: ScheduleList[]) => {
      await Promise.all(
        changeCards.map(async (card, idx) => {
          const { error } = await supabase
            .from('polzzak_detail')
            .update({ order: idx })
            .eq('id', card.id);

          if (error) {
            console.error(error);
            showToast(
              '순서를 변경하지 못했어요. 잠시 후 다시 시도해 주세요.',
              'top-[64px]',
              4000,
            );
            return;
          }
        }),
      );

      await queryClient.invalidateQueries({ queryKey: ['schedule-details'] });
    },
    [showToast, queryClient],
  );

  return (
    <main className="flex flex-col gap-4">
      <h2 className="sr-only">폴짝 상세 페이지</h2>
      {isSchedule ? (
        schedule.map((daySchedule) => (
          <section key={daySchedule.day} className="flex flex-col gap-4">
            <header className="flex items-center justify-between">
              <h3>
                {daySchedule.day}
                <span className="text-gray06 font-regular pl-2">
                  {changeDate(daySchedule.date)}
                </span>
              </h3>
              {daySchedule.items.length > 0 && (
                <Button
                  variant={'tertiary'}
                  size={'md'}
                  onClick={() => {
                    if (changeOrderBtn === daySchedule.day) {
                      handleEditDetail(null);
                    } else {
                      handleEditDetail(daySchedule.day);
                    }
                  }}
                >
                  {changeOrderBtn === daySchedule.day ? '완료' : '편집'}
                </Button>
              )}
            </header>
            {daySchedule.items.length > 0 && (
              <TimelineList
                itemList={daySchedule.items}
                isEditMode={changeOrderBtn === daySchedule.day}
                onSaveCards={saveReorderedCards}
              />
            )}
            <Button
              variant={'secondary'}
              onClick={() => {
                navigate(
                  `/polzzak/${id && encodeURIComponent(id)}/addplan?date=${daySchedule.date}`,
                );
              }}
            >
              폴짝! 한 걸음 추가하기
            </Button>
          </section>
        ))
      ) : (
        <Outlet />
      )}
      {isOpenId && (
        <SlideUpDialog header="폴짝! 한 걸음 편집하기" button={editPlanBtn}>
          <Plan cardId={isOpenId} onUpdatePlan={setEditPlanData} />
        </SlideUpDialog>
      )}
    </main>
  );
}

export default TimelineSchedule;
