import * as React from 'react';

import { Label } from '@/components/Label';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  type?: 'text' | 'password' | 'button' | 'file' | 'time';
  label: string;
  hideLabel?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
  timeValue?: string;
  thumbnail?: string | null;
  fileName?: string | null;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      hideLabel = false,
      placeholder,
      children,
      timeValue,
      thumbnail,
      fileName,
      ...props
    },
    ref,
  ) => {
    const labelId = React.useId();
    const Wrapper = children ? 'div' : React.Fragment;

    const inputClassName = cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-full file:cursor-pointer file:border-0 file:bg-transparent file:pr-2 file:font-medium',
      'focus-visible:ring-ring placeholder:text-gray05 focus-visible:ring-[2px] focus-visible:ring-offset-2',
      'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
      'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'border-input fs-14 flex h-11.5 min-w-0 w-full items-center rounded-md border bg-transparent px-4 py-3 shadow-xs transition-[color,box-shadow] outline-none',
      (type === 'file' || type === 'button') && 'cursor-pointer py-0',
      children && 'pr-14',
      className,
    );

    const iconBtn = children && (
      <div className="absolute inset-y-0 right-0 flex items-center px-4">
        {children}
      </div>
    );

    return type === 'file' ? (
      <>
        <Label hideLabel={hideLabel} htmlFor={labelId} className="m-1">
          {label}
        </Label>
        <Wrapper {...(children ? { className: 'relative' } : {})}>
          <label className={inputClassName}>
            <input
              type="file"
              data-slot="input"
              className="hidden"
              id={labelId}
              accept=".jpg,.jpeg,.png,.heic,.webp"
              ref={ref}
              {...props}
            />
            <span
              className={`${thumbnail ? 'text-black' : 'text-gray05'} flex-1 truncate text-left`}
            >
              {fileName || placeholder}
            </span>
          </label>
          {iconBtn}
        </Wrapper>
      </>
    ) : type === 'button' ? (
      <>
        <Label hideLabel={hideLabel} htmlFor={labelId} className="m-1">
          {label}
        </Label>
        <Wrapper {...(children ? { className: 'relative' } : {})}>
          <input
            type="button"
            data-slot="input"
            className={cn('text-gray05 text-left', inputClassName)}
            id={labelId}
            {...props}
          />

          {iconBtn}
        </Wrapper>
      </>
    ) : type === 'time' ? (
      <>
        <Label hideLabel={hideLabel} htmlFor={labelId} className="m-1">
          {label}
        </Label>
        <Wrapper {...(children ? { className: 'relative' } : {})}>
          <input
            type="text"
            readOnly
            data-slot="input"
            id={labelId}
            value={timeValue || ''}
            placeholder={placeholder}
            className={cn(
              inputClassName,
              !timeValue && 'text-gray05',
              'cursor-pointer',
            )}
            onClick={() => {
              if (ref && 'current' in ref && ref.current) {
                ref.current?.showPicker();
                ref.current?.focus();
              }
            }}
          />
          <input
            type="time"
            className="sr-only"
            ref={ref}
            id={`${labelId}-hidden`}
            step={300}
            tabIndex={-1}
            {...props}
          />
          {iconBtn}
        </Wrapper>
      </>
    ) : (
      <>
        <Label hideLabel={hideLabel} htmlFor={labelId} className="m-1">
          {label}
        </Label>
        <Wrapper {...(children ? { className: 'relative' } : {})}>
          <input
            type={type}
            data-slot="input"
            className={inputClassName}
            id={labelId}
            placeholder={placeholder}
            ref={ref}
            {...props}
          />

          {iconBtn}
        </Wrapper>
      </>
    );
  },
);

export default Input;
