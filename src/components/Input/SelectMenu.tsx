import { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Input/Select';

export interface FavoirteType {
  id: string;
  name: string;
  storage: string[];
}

export interface PolzzakType {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  storage: {
    schedule_id: string;
    date: string;
  }[];
}

interface SelectMenuProps {
  data: PolzzakType | 'email';
  className?: string;
  onSelectedEmail?: (email: string) => void;
  setSelectPolzzak?: (id: string) => void;
}

function SelectMenu({
  data,
  className,
  onSelectedEmail,
  setSelectPolzzak,
}: SelectMenuProps) {
  const emailArr = ['naver.com', 'gmail.com', '직접 입력'];
  const [daySelected, setDaySelected] = useState('');
  console.log(daySelected);
  useEffect(() => {
    if (!data || data === 'email') return;

    setDaySelected(`${data.storage[0].schedule_id}`);
  }, [data]);

  useEffect(() => {
    if (!data || data === 'email') return;
    setSelectPolzzak?.(daySelected);
  }, [daySelected, setSelectPolzzak, data]);

  if (data === 'email') {
    return (
      <Select onValueChange={(value) => onSelectedEmail?.(value)}>
        <SelectTrigger className={className}>
          <SelectValue placeholder="이메일 선택" />
        </SelectTrigger>
        <SelectContent>
          {emailArr.map((email) => (
            <SelectItem key={email} value={email}>
              {email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  } else {
    const selectItems = data?.storage?.map((item, idx) => (
      <SelectItem key={item.schedule_id} value={item.schedule_id}>
        Day {idx + 1} ({item.date})
      </SelectItem>
    ));

    return (
      <Select value={daySelected ?? ''} onValueChange={setDaySelected}>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Select a day" />
        </SelectTrigger>
        <SelectContent>{selectItems}</SelectContent>
      </Select>
    );
  }
}

export default SelectMenu;
