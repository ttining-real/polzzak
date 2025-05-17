import { useCallback } from 'react';

import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import { useModalStore } from '@/store/useModalStore';

function DateSelector() {
  const openModal = useModalStore((state) => state.openModal);

  const handleOpenCalendar = useCallback(() => {
    openModal('calendar');
  }, [openModal]);

  return (
    <div>
      <Input
        label="폴짝 날짜"
        hideLabel={true}
        type="button"
        value={'날짜를 선택해 주세요.'}
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
