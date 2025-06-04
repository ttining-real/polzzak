import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import { Textarea } from '@/components/Input/Textarea';
import { useToast } from '@/hooks/useToast';
import { transAddress } from '@/lib/transAddress';
import { useAuthStore } from '@/store/useAuthStore';
import { useReturnPathStore } from '@/store/useReturnPathStore';

interface PlanProps {
  cardId?: string;
  onUpdatePlan?: (plan: {
    place: string;
    content_id: string;
    time: string;
    memo: string;
    region?: string;
  }) => void;
}

function Plan({ cardId, onUpdatePlan }: PlanProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const userId = user?.id;
  const { place, contentId, region } = location.state || {};
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
  const [isSelectMap, setIsSelectMap] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transRegion, setTransRegion] = useState<string | null>(null);
  const showToast = useToast();
  const queryClient = useQueryClient();

  /* add */
  useEffect(() => {
    if (!date || !id) {
      navigate(`/polzzak/${id ? encodeURIComponent(id) : ''}`);
    }
  }, [date, id, navigate]);

  useEffect(() => {
    if (region) {
      const addr = transAddress(region);
      setTransRegion(addr);
    }
  }, [region]);

  const onSavePlan = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const { data, error: scheduleIdErr } = await supabase
        .from('ex_polzzak')
        .select('id, ex_polzzak_schedule(schedule_id)')
        .match({ user_id: userId, name: id })
        .eq('ex_polzzak_schedule.date', date)
        .single();

      if (scheduleIdErr) throw scheduleIdErr;
      if (!data) return;

      const scheduleId = data.ex_polzzak_schedule[0].schedule_id;
      const { data: orderData, error: orderErr } = await supabase
        .from('ex_polzzak_detail')
        .select('order')
        .eq('schedule_id', scheduleId)
        .order('order', { ascending: true });

      if (orderErr) throw orderErr;
      if (!orderData) return;

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

      if (error) throw error;

      if (transRegion) {
        const { error } = await supabase
          .from('ex_polzzak_region')
          .upsert([{ polzzak_id: data.id, region: transRegion }], {
            onConflict: 'polzzak_id,region',
          });

        if (error) throw error;
      }

      await queryClient.invalidateQueries({
        queryKey: ['schedule-details'],
      });

      navigate(`/polzzak/${id && encodeURIComponent(id)}`);
    } catch (err) {
      showToast(
        '폴짝을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        'top-[64px]',
        4000,
      );
      setIsSaving(false);
      console.error(err);
      return;
    }
  };

  /* 맵에서 선택한 장소가 있는지 먼저 확인 */
  useEffect(() => {
    if (place) {
      setIsSelectMap(true);
    }
  }, [place]);

  /* 맵에서 선택한 장소 처리 */
  useEffect(() => {
    if (!place) return;

    setPlan((prev) => ({ ...prev, place, content_id: contentId }));
  }, [place, contentId]);

  /* plan 상태가 변경될 때마다 부모에게 알림 */
  useEffect(() => {
    if (!onUpdatePlan) return;

    if (transRegion) {
      onUpdatePlan({
        place: plan.place,
        time: plan.time,
        memo: plan.memo,
        content_id: plan.content_id,
        region: transRegion,
      });
    } else {
      onUpdatePlan({
        place: plan.place,
        time: plan.time,
        memo: plan.memo,
        content_id: plan.content_id,
      });
    }
  }, [plan, onUpdatePlan, transRegion]);

  /* 편집 모드일 때 기존 데이터 가져오기 */
  const getEditPlan = useCallback(
    async (cardId: string) => {
      if (place || isSelectMap) return;

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

      const editData = {
        place: data[0].place,
        time: data[0]?.time?.slice(0, 5) ?? '',
        memo: data[0]?.memo ?? '',
        content_id: data[0]?.content_id ?? '',
      };

      setPlan(editData);
    },
    [showToast, place, isSelectMap],
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
            setPlan((prev) => ({ ...prev, place: e.target.value }))
          }
          maxLength={20}
        >
          <Button
            variant={'input'}
            onClick={() => {
              useReturnPathStore
                .getState()
                .setFromPath(
                  `${location.pathname}${location.search ? location.search : ''}`,
                );
              navigate('/map');
            }}
          >
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
            setPlan((prev) => ({
              ...prev,
              memo: e.target.value,
            }))
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
