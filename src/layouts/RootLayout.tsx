import { Suspense, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router-dom';

import supabase from '@/api/supabase';
import Header from '@/components/Header/Header';
import NavMenu from '@/components/NavMenu/NavMenu';
import { useAuthStore } from '@/store/useAuthStore';
import { useHeaderStore } from '@/store/useHeaderStore';

// ✅ 상수 분리
const HEADER_TITLES: Record<string, string> = {
  '/': '🐰폴짝🐰',
  '/login': '로그인',
  '/login/find-id': '아이디 찾기',
  '/login/reset-password': '비밀번호 재설정',
  '/search': '검색',
  '/map': '지도',
  '/polzzak': '폴짝',
  '/polzzak/add': '폴짝 추가',
  '/my': 'MY',
  '/my/edit': '내 정보',
  '/my/edit/nickname': '닉네임 설정',
  '/my/edit/password': '비밀번호 설정',
  '/my/edit/phone-number': '휴대폰 번호 설정',
  '/my/edit/email': '이메일 설정',
  '/my/favorites': '즐겨찾기',
};

const HIDDEN_NAV_PATHS = new Set([
  '/search',
  '/login',
  '/splash',
  '/polzzak/add',
]);

const HIDDEN_HEADER_PATHS = new Set(['/map', '/splash']);

function RootLayout() {
  // 앱 시작 시, 세션 복원 처리
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user ?? null;

      useAuthStore.setState({
        session,
        user,
        isAuthenticated: !!session,
      });
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.setState({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const location = useLocation();
  const path = location.pathname;
  const isRegisterPath = path.startsWith('/register');
  const isEditPath = path.startsWith('/polzzak/edit');

  const { contentsTitle } = useHeaderStore();

  // ✅ useMemo 최적화 (path가 변경될 때만 연산 실행)
  const headerTitle = useMemo(() => {
    if (isRegisterPath) return '회원가입';
    if (isEditPath) return '폴짝 편집';
    if (contentsTitle) return contentsTitle;
    return HEADER_TITLES[path] || '🐰폴짝🐰';
  }, [path, isRegisterPath, isEditPath, contentsTitle]);

  const showHeader = useMemo(() => {
    return ![...HIDDEN_HEADER_PATHS].some((hiddenPath) =>
      path.startsWith(hiddenPath),
    );
  }, [path]);
  const showNav = useMemo(
    () => !(HIDDEN_NAV_PATHS.has(path) || isRegisterPath || isEditPath),
    [path, isRegisterPath, isEditPath],
  );
  const editHide = useMemo(() => path !== '/my/favorites', [path]);
  const searchBtn = useMemo(() => path !== '/', [path]);

  return (
    <>
      <Helmet>
        <title>폴짝</title>
        <meta property="og:title" content="폴짝" />
        <meta property="twitter:title" content="폴짝" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="" />
        <meta name="description" content="국내 여행지를 찾고 싶을 땐, 폴짝!" />
        <meta
          name="og:description"
          content="국내 여행지를 찾고 싶을 땐, 폴짝!"
        />
        <meta name="og:image" content="" />
        <meta name="og:site_name" content="국내 여행지를 찾고 싶을 땐, 폴짝!" />
        <meta name="og:site_author" content="nowashgirls" />
      </Helmet>
      {showHeader && (
        <Header title={headerTitle} editHide={editHide} searchBtn={searchBtn} />
      )}
      {showNav && <NavMenu />}

      <Suspense>
        <Outlet />
      </Suspense>
    </>
  );
}

export default RootLayout;
