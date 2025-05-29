import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';
import * as React from 'react';

import SelectMenu, {
  FavoirteType,
  PolzzakType,
} from '@/components/Input/SelectMenu';
import { Label } from '@/components/Label';
import { cn } from '@/lib/utils';

interface RadioProps {
  data?: FavoirteType[] | PolzzakType[] | null;
  className?: string;
  setSelectFolder: (id: string) => void;
  setSelectPolzzak: (id: string) => void;
}

function Radio({
  data,
  className,
  setSelectFolder,
  setSelectPolzzak,
}: RadioProps) {
  const [selected, setSelected] = React.useState('');

  React.useEffect(() => {
    if (data?.length) {
      setSelected(`radio${data[0].id}`);
    }
  }, [data]);

  React.useEffect(() => {
    if (selected && data?.length && typeof data[0].storage[0] === 'string') {
      setSelectFolder(selected);
    }
  }, [selected, data, setSelectFolder]);

  if (!data) return;

  return (
    <RadioGroup value={selected ?? ''} onValueChange={setSelected}>
      {data?.map((item) => {
        const isChecked = selected === `radio${item.id}`;
        return (
          <div
            key={item.id}
            className={cn(
              'flex items-center rounded-md border px-4 py-2 transition-colors',
              'hover:border-primary-hover active:border-primary-active',
              isChecked ? 'border-primary' : 'border-gray05',
              className,
            )}
          >
            <RadioGroupItem
              value={`radio${item.id}`}
              id={`radio${item.id}`}
              className="border-gray05 size-5 rounded-full border"
            />
            <div>
              <div className="flex">
                <Label
                  htmlFor={`radio${item.id}`}
                  className="ml-2 px-0 font-medium"
                >
                  {item?.name ?? '폴짝 이름 미정'}
                </Label>
                {'storage' in item && (
                  <p className="fs-14 lh text-primary pl-1 font-semibold">
                    {item.storage.length}
                  </p>
                )}
              </div>
              {isChecked && 'startDate' in item && (
                <AddSchedule data={item} setSelectPolzzak={setSelectPolzzak} />
              )}
            </div>
          </div>
        );
      })}
    </RadioGroup>
  );
}

export interface AddScheduleProps {
  data: PolzzakType;
  setSelectPolzzak?: (id: string) => void;
}

function AddSchedule({ data, setSelectPolzzak }: AddScheduleProps) {
  const range = (date: string) => {
    const splitDate = date.split('-');
    return `${splitDate[0]}.${splitDate[1]}.${splitDate[2]}`;
  };

  return (
    <div className="ml-2 w-full">
      <p className="fs-14 text-gray06 lh">
        {data.endDate
          ? `${range(data.startDate)} ~ ${range(data.endDate)}`
          : range(data.startDate)}
      </p>

      <SelectMenu
        data={data}
        className="mx-0.5"
        setSelectPolzzak={setSelectPolzzak}
      />
    </div>
  );
}

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-2', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'text-primary focus-visible:border-ring focus-visible:ring-ring aria-invalid:ring-destructive/20 aria-invalid:border-destructive aspect-square size-5 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[2px] disabled:cursor-not-allowed disabled:opacity-50',
        'border-gray05 data-[state=checked]:border-primary hover:border-primary-hover active:border-primary-active border-2',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { Radio, RadioGroup, RadioGroupItem };
