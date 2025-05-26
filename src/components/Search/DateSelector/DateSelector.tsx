import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useCallback } from 'react';

import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import { useModalStore } from '@/store/useModalStore';
import { useSearchStore } from '@/store/useSearchStore';

function DateSelector() {
  const openModal = useModalStore((state) => state.openModal);
  const date = useSearchStore((state) => state.date);

  const handleOpenCalendar = useCallback(() => {
    openModal('calendar');
  }, [openModal]);

  const value =
    date?.startDate && date?.endDate
      ? `${format(date.startDate, 'yyyy.MM.dd(eee)', { locale: ko })} ~ ${format(date.endDate, 'yyyy.MM.dd(eee)', { locale: ko })}`
      : '날짜를 선택해 주세요.';

  return (
    <div>
      <Input
        label="폴짝 날짜"
        hideLabel={true}
        type="button"
        value={value}
        onClick={handleOpenCalendar}
      >
        <Button variant={'tertiary'} size="md" onClick={handleOpenCalendar}>
          <Icon id="calendar" className="text-gray05" />
        </Button>
      </Input>
    </div>
  );
}

export default DateSelector;
