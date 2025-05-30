'use client';

import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef } from 'react';

import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import { useDialogDrag } from '@/hooks/map/useDialogDrag';
import { useMapDialogStore } from '@/store/map/useMapDialogStore';
import { DialogProps } from '@/store/map/useMapDialogStore';

export default function MapDialog({
  header,
  children,
  className,
}: DialogProps) {
  const { closeModal } = useMapDialogStore();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const { height, startDrag, moveDrag, endDrag } = useDialogDrag([
    '30%',
    '50%',
    '70%',
    '90%',
  ]);

  const moveRef = useRef<((e: PointerEvent) => void) | null>(null);
  const upRef = useRef<((e: PointerEvent) => void) | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault(); // 기본 동작 방지
      e.stopPropagation(); // 이벤트 전파 차단

      startDrag(e.clientY);

      const onPointerMove = (e: PointerEvent) => {
        e.preventDefault();
        moveDrag(e.clientY);
      };
      const onPointerUp = (e: PointerEvent) => {
        e.preventDefault();
        endDrag();
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
    },
    [startDrag, moveDrag, endDrag],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      startDrag(e.touches[0].clientY);

      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        moveDrag(e.touches[0].clientY);
      };
      const onTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        endDrag();
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      };

      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    },
    [startDrag, moveDrag, endDrag],
  );

  useEffect(() => {
    return () => {
      if (moveRef.current) {
        window.removeEventListener('pointermove', moveRef.current);
      }
      if (upRef.current) {
        window.removeEventListener('pointerup', upRef.current);
      }
    };
  }, []);

  return (
    <motion.dialog
      ref={dialogRef}
      initial={{ y: '20%', opacity: 0 }}
      animate={{ y: '0%', opacity: 1 }}
      exit={{ y: '20%', opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        height: height ?? 'auto',
        transition: 'height 0.3s ease',
        touchAction: 'none',
      }}
      className={`fixed bottom-0 left-1/2 z-[100] flex w-screen max-w-[640px] -translate-x-1/2 transform flex-col gap-4 rounded-t-2xl bg-white px-8 py-6 ${className}`}
    >
      <div
        className="text-gray05 absolute top-0 right-0 left-0 flex w-full transform cursor-grab items-center justify-center"
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchStart}
        style={{ touchAction: 'none', userSelect: 'none', cursor: 'grab' }}
      >
        <Icon id="drag_handle" />
      </div>

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
    </motion.dialog>
  );
}
