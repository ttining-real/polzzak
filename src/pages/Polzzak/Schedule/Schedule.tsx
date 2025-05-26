import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import supabase from '@/api/supabase';
import Loader from '@/components/Loader/Loader';
import PolzzakListItem from '@/components/Polzzak/PolzzakListItem';
import TimelineSchedule from '@/components/Timeline/TimelineSchedule';
import { useToast } from '@/hooks/useToast';
import { useHeaderStore } from '@/store/useHeaderStore';

export interface ScheduleList {
  id: string;
  schedule_id: string;
  place: string;
  content_id: string;
  time: string;
  memo: string;
  order: number;
}

export interface ScheduleDetail {
  day: string;
  date: string;
  items: ScheduleList[];
}

function Schedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const setContentsTitle = useHeaderStore((state) => state.setContentsTitle);
  const showToast = useToast();

  const {
    data: polzzakData,
    isLoading: isPolzzakLoading,
    error: polzzakError,
  } = useQuery({
    queryKey: ['polzzak', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ex_polzzak')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: signedData } = useQuery({
    queryKey: ['thumbnail-url', polzzakData?.thumbnail],
    queryFn: async () => {
      if (!polzzakData?.thumbnail) return null;
      const { data, error } = await supabase.storage
        .from('expolzzak')
        .createSignedUrl(polzzakData.thumbnail, 86400);
      if (error) throw error;
      return { ...polzzakData, thumbnailUrl: data.signedUrl };
    },
    enabled: !!polzzakData?.thumbnail,
  });

  const {
    data: scheduleData,
    isLoading: isScheduleLoading,
    error: scheduleError,
  } = useQuery({
    queryKey: ['schedule', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ex_polzzak_schedule')
        .select('date, schedule_id')
        .eq('polzzak_id', id)
        .order('date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!polzzakData,
  });

  const scheduleIds = scheduleData?.map((s) => s.schedule_id) ?? [];

  const {
    data: detailData,
    isLoading: isDetailLoading,
    error: detailError,
  } = useQuery({
    queryKey: ['schedule-details'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ex_polzzak_detail')
        .select('*')
        .in('schedule_id', scheduleIds)
        .order('order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: scheduleIds.length > 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (polzzakData === undefined) return;
    if (!polzzakData) {
      navigate('/not-found');
      return;
    }
    setContentsTitle(polzzakData.name);

    return () => setContentsTitle(null);
  }, [polzzakData, navigate, setContentsTitle]);

  const mergedScheduled = useMemo(() => {
    if (!scheduleData || !detailData) return [];
    return scheduleData.map((entry, idx) => {
      const day = `Day ${idx + 1}`;
      const date = entry.date;
      const items = detailData
        .filter((d) => d.schedule_id === entry.schedule_id)
        .map((d) => ({
          id: d.id,
          schedule_id: entry.schedule_id,
          place: d.place,
          content_id: d.content_id,
          time: d.time,
          memo: d.memo,
          order: d.order,
        }));

      return { day, date, items };
    });
  }, [scheduleData, detailData]);

  if (isPolzzakLoading || isScheduleLoading || isDetailLoading) {
    return <Loader text="데이터 불러오는 중..." />; // 스켈레톤으로 변경 필요
  }

  if (
    polzzakError ||
    scheduleError ||
    detailError ||
    !scheduleData ||
    !detailData
  ) {
    showToast(
      '일정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
      'top-[64px]',
      5000,
    );
    return (
      <div className="flex justify-center">데이터를 불러오지 못했어요.</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section>
        <PolzzakListItem item={signedData || polzzakData} detail={true} />
      </section>
      <TimelineSchedule schedule={mergedScheduled} />
    </div>
  );
}

export default Schedule;
