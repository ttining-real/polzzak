import { useCallback } from 'react';

import Chip from '@/components/Chip/Chip';
import { ClickedChipItem } from '@/components/Chip/Chip';
import { useSearchStore } from '@/store/useSearchStore';

function ThemeSelection() {
  const theme = useSearchStore((state) => state.theme);
  const setTheme = useSearchStore((state) => state.setTheme);

  const handleTheme = useCallback(
    (clickedChip: ClickedChipItem) => {
      setTheme((prev) => {
        if (clickedChip.selected) {
          return [...prev, clickedChip.name];
        } else {
          return prev.filter((item) => item !== clickedChip.name);
        }
      });
    },
    [setTheme],
  );

  return (
    <Chip
      mode="theme"
      type="multiple"
      label="주제 선택"
      subLabel="다중 선택"
      onClick={handleTheme}
    />
  );
}

export default ThemeSelection;
