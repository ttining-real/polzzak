// hooks/useDialogDrag.ts
import { useCallback, useRef, useState } from 'react';

export function useDialogDrag(
  HEIGHT_STEPS: string[] = ['30%', '50%', '70%', '90%'],
) {
  const startYRef = useRef<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [height, setHeight] = useState<string>(HEIGHT_STEPS[0]);

  const startDrag = useCallback((clientY: number) => {
    startYRef.current = clientY;
  }, []);

  const moveDrag = useCallback(
    (clientY: number) => {
      if (startYRef.current === null) return;

      const deltaY = startYRef.current - clientY;
      const THRESHOLD = 50;

      if (deltaY > THRESHOLD && currentIndex < HEIGHT_STEPS.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setHeight(HEIGHT_STEPS[nextIndex]);
        startYRef.current = clientY;
      } else if (deltaY < -THRESHOLD && currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        setHeight(HEIGHT_STEPS[prevIndex]);
        startYRef.current = clientY;
      }
    },
    [currentIndex, HEIGHT_STEPS],
  );

  const endDrag = useCallback(() => {
    startYRef.current = null;
  }, []);

  return {
    height,
    startDrag,
    moveDrag,
    endDrag,
  };
}
