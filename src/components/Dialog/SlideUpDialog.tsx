import { motion } from 'framer-motion';
import React from 'react';

import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import { DialogProps, useDialogStore } from '@/store/useDialogStore';

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

  return (
    <Wrapper
      {...(dimd
        ? {
            className:
              'fixed top-0 right-0 bottom-0 left-0 z-[99] h-screen w-screen bg-black/45',
          }
        : null)}
    >
      <motion.dialog
        initial={{ y: '20%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        exit={{ y: '20%', opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`fixed bottom-0 left-1/2 z-[100] flex w-screen -translate-x-1/2 transform flex-col gap-4 rounded-t-2xl bg-white px-8 py-6 ${className}`}
      >
        <div
          className={`${
            dragIcon
              ? 'absolute top-0 left-1/2 -translate-x-1/2 transform cursor-grab items-center justify-center overflow-scroll'
              : 'hidden'
          }`}
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
