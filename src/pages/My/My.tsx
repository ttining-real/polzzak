import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Modal from '@/components/Modal/Modal';
import MenuItem from '@/components/My/MenuItem';
import Profile from '@/components/Profile/Profile';
import UserMenu, { MenuItemTypes } from '@/components/UserMenu/UserMenu';
import { useToast } from '@/hooks/useToast';
import RequireLogin from '@/pages/RequireLogin';
import { useModalStore } from '@/store/useModalStore';
import { useUserStore } from '@/store/useUserStore';

function My() {
  const location = useLocation();
  const isMyPage = location.pathname === '/my';
  const CURRENT_USER =
    sessionStorage.getItem('user') || localStorage.getItem('user');

  const { openModal } = useModalStore();
  const user = useUserStore((state) => state.user);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);
  const showToast = useToast();

  const handleLogoutClick = () => {
    openModal('logout');
  };

  const menus = [
    { label: '공지사항', href: '/notice' },
    { label: '서비스 이용약관', href: '/terms' },
    { label: '로그아웃', onClick: handleLogoutClick },
  ];

  const userMenus: MenuItemTypes[] = [
    {
      label: '즐겨찾기',
      icon: 'favorite_off',
      path: '/my/favorites',
    },
    {
      label: '나의폴짝',
      icon: 'calendar',
      path: '/polzzak',
    },
    {
      label: '나의리뷰',
      icon: 'review',
      path: '/my/my-reviews',
    },
    {
      label: '고객센터',
      icon: 'customer',
      onClick: () => {
        showToast(
          '[polzzak@gmail.com] 으로 문의해 주세요.',
          'top-[64px]',
          2500,
        );
      },
    },
  ];

  useEffect(() => {
    if (isMyPage) {
      fetchUserInfo();
    }
  }, [isMyPage, fetchUserInfo]);

  return (
    <main className="flex h-full w-full flex-1 flex-col overflow-auto p-6">
      <h1 className="sr-only">마이페이지</h1>
      {!CURRENT_USER ? (
        <RequireLogin />
      ) : isMyPage ? (
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <div className="text-center">
              사용자 정보를 불러오는 중입니다...
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : user ? (
            <Profile userInfo={user} />
          ) : (
            <div className="text-center">사용자 정보를 불러올 수 없습니다.</div>
          )}
          <UserMenu menus={userMenus} />
          <MenuItem menus={menus} />
          <Modal mode="alert" type="logout" />
        </div>
      ) : (
        <Outlet />
      )}
    </main>
  );
}

export default My;
