// import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import { useHeaderStore } from '@/store/useHeaderStore';

interface HeaderProps {
  title: string;
  subTitle?: string;
  editHide?: boolean;
  searchBtn?: boolean;
}

function Header({
  title,
  subTitle,
  editHide = false,
  searchBtn = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const { isEditMode, toggleEditMode } = useHeaderStore();

  return (
    <header
      className={`flex h-12 items-center justify-start bg-white shadow-xs ${isHome ? 'px-4' : 'px-2'}`}
    >
      <div className="flex flex-1 items-center justify-start gap-2">
        <h1 className="fs-16 ls lh font-semibold text-black">{title}</h1>
        {subTitle && (
          <span className="fs-14 font-regular text-gray07 ls lh">
            {subTitle}
          </span>
        )}
      </div>
      {!isHome && (
        <Button
          type="button"
          variant={'tertiary'}
          className={isHome ? 'hidden' : 'order-first'}
          size="md"
          aria-label="이전 페이지로 이동"
          onClick={() => navigate(-1)}
        >
          <Icon id="arrow_left" />
        </Button>
      )}
      {editHide === false ? (
        <Button
          type="button"
          onClick={toggleEditMode}
          variant="tertiary"
          aria-label={`${isEditMode ? '완료' : '편집'} 모드로 전환`}
        >
          {isEditMode ? '완료' : '편집'}
        </Button>
      ) : searchBtn === false ? (
        <Button
          type="button"
          variant="tertiary"
          size="default"
          aria-label={`검색 페이지로 이동`}
          onClick={() => navigate(`/search`)}
        >
          <Icon id={'search'} />
        </Button>
      ) : null}
    </header>
  );
}

export default Header;
