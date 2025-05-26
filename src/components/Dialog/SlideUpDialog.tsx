import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import { DialogProps, useDialogStore } from '@/store/useDialogStore';

const HEIGHT_STEPS = ['30%', '50%', '70%', '90%'];

function SlideUpDialog({
  dimd = true,
  dragIcon = false,
  header,
  button,
  buttonDirection = 'row',
  children,
  className,
}: DialogProps) {
  const { closeModal } = useDialogStore();
  const Wrapper = dimd ? 'div' : React.Fragment;
  const btnLength = button?.length;

  // drag handle
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const startYRef = useRef<number | null>(null);
  const startHeightRef = useRef<number | null>(null);
  const [height, setHeight] = useState<string | null>(null); // 기본 높이 설정

  useEffect(() => {
    if (dragIcon) {
      setHeight('50%');
    }
  }, [dragIcon]);

  // 모바일 여부 확인
  const isTouchDevice =
    typeof window !== 'undefined' && 'ontouchstart' in window;

  // 공통 로직을 묶은 핸들러 (Pointer 또는 Touch용)
  const startDrag = useCallback((clientY: number) => {
    if (!dialogRef.current) return;
    startYRef.current = clientY;
    startHeightRef.current = dialogRef.current.getBoundingClientRect().height;
  }, []);

  const moveDrag = useCallback(
    (clientY: number) => {
      if (!startYRef.current || !startHeightRef.current || !dialogRef.current)
        return;

      const deltaY = startYRef.current - clientY;
      const screenHeight = window.innerHeight;
      const newHeight = Math.min(
        Math.max((startHeightRef.current + deltaY) / screenHeight, 0.3),
        1,
      );

      const closest = HEIGHT_STEPS.reduce((prev, curr) => {
        const prevVal = parseFloat(prev) / 100;
        const currVal = parseFloat(curr) / 100;
        return Math.abs(currVal - newHeight) < Math.abs(prevVal - newHeight)
          ? curr
          : prev;
      });

      setHeight(closest);
    },
    [setHeight],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      moveDrag(e.clientY);
    },
    [moveDrag],
  );

  const handlePointerUp = useCallback(() => {
    startYRef.current = null;
    startHeightRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  // 📱 모바일용 touch 이벤트 핸들링
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      startDrag(e.touches[0].clientY);
      e.preventDefault(); // 기본 스크롤 방지
    },
    [startDrag],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      moveDrag(e.touches[0].clientY);
    },
    [moveDrag],
  );

  const handleTouchEnd = useCallback(() => {
    startYRef.current = null;
    startHeightRef.current = null;
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove]);

  // 🖱️ PC용 pointer 이벤트 핸들링
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      startDrag(e.clientY);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [startDrag, handlePointerMove, handlePointerUp],
  );

  // 이벤트 리스너 등록 및 정리
  useEffect(() => {
    if (isTouchDevice) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (isTouchDevice) {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      } else {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      }
    };
  }, [
    isTouchDevice,
    handleTouchMove,
    handleTouchEnd,
    handlePointerMove,
    handlePointerUp,
  ]);

  return (
    <Wrapper
      {...(dimd
        ? {
            className:
              'fixed top-0 right-0 bottom-0 left-0 z-[99] h-screen max-w-[640px] w-screen bg-black/45',
          }
        : null)}
    >
      <motion.dialog
        ref={dialogRef}
        onPointerDown={!isTouchDevice ? handlePointerDown : undefined}
        onTouchStart={isTouchDevice ? handleTouchStart : undefined}
        initial={{ y: '20%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        exit={{ y: '20%', opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          height: height ?? 'auto',
          transition: 'height 0.3s ease',
        }}
        className={`fixed bottom-0 left-1/2 z-[100] flex w-screen max-w-[640px] -translate-x-1/2 transform flex-col gap-4 rounded-t-2xl bg-white px-8 py-6 ${className}`}
      >
        {dragIcon ? (
          <div className="text-gray05 absolute top-0 right-0 left-0 flex w-full transform cursor-grab items-center justify-center">
            <Icon id="drag_handle" />
          </div>
        ) : null}

        <header className="flex items-center justify-between">
          <h3 className="fs-18 ls lh font-semibold text-black">{header}</h3>
          <Button
            size="md"
            variant={'tertiary'}
            aria-label="모달 닫기"
            onClick={closeModal}
          >
            <Icon id="close" />
          </Button>
        </header>
        <div className="overflow-auto">{children}</div>
        {button && (
          <div
            className={`flex w-full items-center justify-center gap-1 ${buttonDirection === 'row' ? 'flex-row' : 'flex-col'}`}
          >
            {button?.map((btn, idx) => (
              <Button
                className={`${buttonDirection === 'row' ? 'flex-1' : 'w-full'}`}
                {...(btnLength !== 1 && buttonDirection === 'row' && idx === 0
                  ? {
                      onClick: () => {
                        if (btn.onClick) {
                          btn.onClick();
                        }
                        closeModal();
                      },
                    }
                  : { onClick: btn.onClick })}
                key={idx}
                {...((btnLength !== 1 &&
                  buttonDirection === 'row' &&
                  idx === 0) ||
                (btnLength !== 1 && buttonDirection === 'col' && idx === 1)
                  ? { variant: 'secondary' }
                  : null)}
              >
                {btn.text}
              </Button>
            ))}
          </div>
        )}
      </motion.dialog>
    </Wrapper>
  );
}

export default SlideUpDialog;
