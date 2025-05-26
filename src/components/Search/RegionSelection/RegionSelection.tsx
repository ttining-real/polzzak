import { memo, useCallback } from 'react';

import Chip from '@/components/Chip/Chip';
import { ClickedChipItem } from '@/components/Chip/Chip';
import { useSearchStore } from '@/store/useSearchStore';

const RegionSelection = memo(function RegionSelection() {
  const region = useSearchStore((state) => state.region);
  const setRegion = useSearchStore((state) => state.setRegion);

  const handleRegion = useCallback(
    (clickedChip: ClickedChipItem) => {
      if (clickedChip.selected) {
        setRegion(clickedChip.name);
      } else {
        setRegion('');
      }
    },
    [setRegion],
  );

  return (
    <Chip
      mode="region"
      label="지역 선택"
      subLabel="단일 선택"
      onClick={handleRegion}
      selectedValues={region ? [region] : []}
    />
  );
});

export default RegionSelection;
