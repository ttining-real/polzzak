import { useRef, useState } from 'react';

import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/SortDropdown/DropdownMenu';

type DropdownProps = {
  options: string[];
  defaultValue?: string;
};

function Dropdown({ options, defaultValue }: DropdownProps) {
  const initialValue = options.includes(defaultValue ?? '')
    ? defaultValue!
    : options[0];
  const [dropdownMenu, setDropdownMenu] = useState<string>(options[0]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const pointerDownRef = useRef<number | null>(null);
  const movedRef = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownRef.current = e.clientX;
    movedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerDownRef.current !== null) {
      const diff = Math.abs(e.clientX - pointerDownRef.current);
      if (diff > 5) movedRef.current = true;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="md"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onClick={handleClick}
          className="border-gray03 m-0 h-9 rounded-full px-3 text-black"
        >
          {initialValue}
          <Icon id={isOpen ? 'arrow_top' : 'arrow_bottom'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {options.map((menu, index) => (
            <DropdownMenuItem
              key={index}
              onSelect={() => {
                setDropdownMenu(menu);
                setIsOpen(false);
              }}
            >
              <span>{menu}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Dropdown;
