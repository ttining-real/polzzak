import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import { Textarea } from '@/components/Input/Textarea';
import { useToast } from '@/hooks/useToast';

interface PlanProps {
  cardId?: string;
  onUpdatePlan?: (plan: {
    place: string;
    content_id: string;
    time: string;
    memo: string;
  }) => void;
}

function Plan({ cardId, onUpdatePlan }: PlanProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const date = cardId ? '' : searchParams.get('date');
  const inputRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState({
    place: '',
    content_id: '',
    time: '',
    memo: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const showToast = useToast();
  const queryClient = useQueryClient();

  /* add */
  useEffect(() => {
    if (!date) {
      navigate(`/polzzak/${id}`);
    } else if (!id) {
      navigate('/polzzak');
    }
  }, [date, id, navigate]);

  const onSavePlan = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const { data, error: scheduleIdErr } = await supabase
      .from('ex_polzzak_schedule')
      .select('schedule_id')
      .eq('polzzak_id', id)
      .eq('date', date)
      .single();

    if (scheduleIdErr || !data) {
      console.error(scheduleIdErr);
      showToast(
        '폴짝을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        'top-[64px]',
        4000,
      );
      setIsSaving(false);
      return;
    }

    const scheduleId = data.schedule_id;
    const { data: orderData, error: orderErr } = await supabase
      .from('ex_polzzak_detail')
      .select('order')
      .eq('schedule_id', scheduleId)
      .order('order', { ascending: true });

    if (orderErr || !orderData) {
      console.error(orderErr);
      showToast(
        '해당 폴짝을 가져오지 못했어요. 잠시 후 다시 시도해 주세요.',
        'top-[64px]',
        4000,
      );
      return;
    }

    const orderMap = orderData?.map((num) => num.order);
    const myOrderNumber = orderMap.length ? Math.max(...orderMap) + 1 : 0;

    const { error } = await supabase.from('ex_polzzak_detail').insert([
      {
        schedule_id: scheduleId,
        place: plan!.place.trim(),
        time: plan.time || null,
        memo: plan.memo.trim() || null,
        content_id: plan?.content_id || null,
        order: myOrderNumber,
      },
    ]);

    if (error) {
      console.error(error);
      showToast(
        '폴짝을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        'top-[64px]',
        4000,
      );
      setIsSaving(false);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ['schedule-details'],
    });

    navigate(`/polzzak/${id}`);
  };

  /* edit */

  useEffect(() => {
    if (cardId && onUpdatePlan) onUpdatePlan(plan);
  }, [cardId, onUpdatePlan, plan]);

  const getEditPlan = useCallback(
    async (cardId: string) => {
      const { data, error } = await supabase
        .from('ex_polzzak_detail')
        .select('place, time, memo, content_id, order')
        .eq('id', cardId);

      if (error || !data) {
        console.error(error);
        showToast(
          '해당 폴짝을 가져오지 못했어요. 잠시 후 다시 시도해 주세요.',
          'top-[64px]',
          4000,
        );
        return;
      }

      setPlan({
        place: data[0].place,
        time: data[0]?.time?.slice(0, 5) ?? '',
        memo: data[0]?.memo ?? '',
        content_id: data[0]?.content_id ?? '',
      });
    },
    [showToast],
  );

  useEffect(() => {
    if (!cardId) return;
    getEditPlan(cardId);
  }, [cardId, getEditPlan]);

  return (
    <>
      <section>
        <Input
          label="장소"
          ref={inputRef}
          placeholder="폴짝 장소를 선택해 주세요."
          value={plan.place}
          onChange={(e) =>
            setPlan({
              place: e.target.value,
              time: plan.time,
              memo: plan.memo,
              content_id: plan.content_id,
            })
          }
          maxLength={20}
        >
          <Button variant={'input'} onClick={() => navigate('/map')}>
            <Icon id="map_search" className="text-gray05" />
          </Button>
        </Input>
        <Input
          label="시간"
          type="time"
          timeValue={plan.time}
          onChange={(e) =>
            setPlan({
              place: plan.place,
              time: e.target.value,
              memo: plan.memo,
              content_id: plan.content_id,
            })
          }
          placeholder="폴짝 시간을 선택해 주세요."
          ref={timeRef}
        >
          {plan?.time && (
            <Button
              variant="input"
              onClick={() => setPlan({ ...plan, time: '' })}
              className="text-gray07 ml-1"
            >
              <Icon id="close" className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="input"
            onClick={() => {
              timeRef.current?.showPicker();
              timeRef.current?.focus();
            }}
          >
            <Icon id="time" className="text-gray05" />
          </Button>
        </Input>
        <Textarea
          label="메모"
          placeholder="폴짝 메모를 작성해 주세요."
          value={plan.memo}
          onChange={(e) =>
            setPlan({
              place: plan.place,
              time: plan.time,
              memo: e.target.value,
              content_id: plan.content_id,
            })
          }
        />
      </section>
      {!cardId && (
        <Button disabled={!plan?.place} onClick={onSavePlan}>
          폴짝! 한 걸음 추가하기
        </Button>
      )}
    </>
  );
}

export default Plan;
