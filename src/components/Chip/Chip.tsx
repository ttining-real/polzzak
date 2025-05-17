import { memo, useState } from 'react';

import Button from '@/components/Button/Button';

const REGIONS_DATA = [
  { id: 0, name: '서울', selected: false },
  { id: 1, name: '제주', selected: false },
  { id: 2, name: '경기', selected: false },
  { id: 3, name: '충남', selected: false },
  { id: 4, name: '인천', selected: false },
  { id: 5, name: '대구', selected: false },
  { id: 6, name: '대전', selected: false },
  { id: 7, name: '경남', selected: false },
  { id: 8, name: '부산', selected: false },
  { id: 9, name: '전북', selected: false },
  { id: 10, name: '울산', selected: false },
  { id: 11, name: '광주', selected: false },
  { id: 12, name: '강원', selected: false },
  { id: 13, name: '경북', selected: false },
  { id: 14, name: '전남', selected: false },
  { id: 15, name: '충북', selected: false },
  { id: 16, name: '세종', selected: false },
];
const THEME_DATA = [
  { id: 0, name: '가족 여행', selected: false },
  { id: 1, name: '커플 여행', selected: false },
  { id: 2, name: '친구들과 함께', selected: false },
  { id: 3, name: '반려동물과 함께', selected: false },
  { id: 4, name: '맛집', selected: false },
  { id: 5, name: '축제', selected: false },
  { id: 6, name: '관광지', selected: false },
];
const MAP_FILTER_DATA = [
  { id: 0, name: '즐겨찾기', selected: false },
  { id: 1, name: '나의폴짝', selected: false },
  { id: 2, name: '음식점', selected: false },
  { id: 3, name: '축제', selected: false },
  { id: 4, name: '관광지', selected: false },
];

export interface ClickedChipItem {
  id: number;
  name: string;
  selected: boolean;
}

interface ChipProps {
  mode: 'region' | 'theme' | 'map_filter';
  label?: string;
  subLabel?: string;
  type?: 'default' | 'multiple';
  onClick?: (clickedChip: ClickedChipItem) => void;
  selectedValue?: string;
  selectedValues?: string[];
}

const Chip = memo(function Chip({
  mode,
  label,
  subLabel,
  type = 'default',
  onClick,
}: ChipProps) {
  const [chips, setChips] = useState(getChipData());

  function getChipData() {
    const baseMode =
      mode === 'region'
        ? REGIONS_DATA
        : mode === 'theme'
          ? THEME_DATA
          : MAP_FILTER_DATA;

    return baseMode.map((item) => ({ ...item, selected: item.selected }));
  }

  function handleChips(id: number) {
    const updatedChips =
      type === 'multiple'
        ? chips.map((chip) =>
            chip.id === id ? { ...chip, selected: !chip.selected } : chip,
          )
        : chips.map((chip) =>
            chip.id === id
              ? { ...chip, selected: !chip.selected }
              : { ...chip, selected: false },
          );
    setChips(updatedChips);

    const clickedChip = updatedChips.find((chip) => chip.id === id);
    if (onClick && clickedChip) {
      onClick(clickedChip);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      {label && (
        <div className="inline-flex items-center justify-start gap-2">
          <span className="fs-14 lh ls font-regular text-black">{label}</span>
          <span className="fs-13 text-gray06 lh ls font-regular">
            {subLabel}
          </span>
        </div>
      )}
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.id}>
            <Button
              type="button"
              size="md"
              className={`rounded-4xl border ${chip.selected ? 'bg-primary border-primary text-white' : 'text-gray07 border-gray07 bg-white'} active:text-white`}
              onClick={() => handleChips(chip.id)}
            >
              {chip.name}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
});

export default Chip;
