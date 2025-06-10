import { createBrowserRouter, Outlet } from 'react-router-dom';

import RootLayout from '@/layouts/RootLayout';
import {
  Contents,
  FindEmail,
  Home,
  Login,
  Map,
  My,
  MyReviews,
  NotFound,
  Notice,
  Polzzak,
  Register,
  ResetPassword,
  ResetPasswordCallback,
  Search,
  SignUpCallback,
  Splash,
  Terms,
} from '@/pages';
import ViewDetails from '@/pages/Contents/ViewDetails';
import {
  Edit as UserEdit,
  Email,
  NickName,
  Password,
  PhoneNumber,
} from '@/pages/My/Edit';
import { Favorites, FavoritesDetails } from '@/pages/My/Favorites';
import { AddNEdit, AddPlan, Schedule } from '@/pages/Polzzak';
import SearchResult from '@/pages/Search/SearchResult';

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/login',
        element: <Outlet />,
        children: [
          { index: true, element: <Login /> },
          { path: 'find-email', element: <FindEmail /> },
          { path: 'reset-password', element: <ResetPassword /> },
          {
            path: 'reset-password-callback',
            element: <ResetPasswordCallback />,
          },
        ],
      },
      {
        path: '/register',
        element: <Outlet />,
        children: [
          { index: true, element: <Register /> },
          { path: 'sign-up-callback', element: <SignUpCallback /> },
        ],
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/search/result',
        element: <SearchResult />,
      },
      {
        path: '/map',
        element: <Map />,
      },
      {
        path: '/polzzak',
        element: <Polzzak />,
        children: [
          {
            index: true,
            element: <Polzzak />,
          },
          {
            path: 'add',
            element: <AddNEdit />,
          },
          {
            path: 'edit/:id',
            element: <AddNEdit />,
          },
          {
            path: ':id',
            element: <Schedule />,
            children: [
              {
                path: 'addplan',
                element: <AddPlan />,
              },
            ],
          },
        ],
      },
      {
        path: '/my',
        element: <My />,
        children: [
          {
            index: true,
            element: <My />,
          },
          {
            path: 'edit',
            element: <UserEdit />,
            children: [
              {
                index: true,
                element: <UserEdit />,
              },
              {
                path: 'nickname',
                element: <NickName />,
              },
              {
                path: 'password',
                element: <Password />,
              },
              {
                path: 'phone-number',
                element: <PhoneNumber />,
              },
              {
                path: 'email',
                element: <Email />,
              },
            ],
          },
          {
            path: 'favorites',
            element: <Favorites />,
          },
          {
            path: 'favorites/:id',
            element: <FavoritesDetails />,
          },
          {
            path: 'my-reviews',
            element: <MyReviews />,
          },
        ],
      },
      {
        path: '/contents',
        element: <Contents />,
        children: [{ path: ':id', element: <ViewDetails /> }],
      },
      {
        path: '/splash',
        element: <Splash />,
      },
      {
        path: '/notice',
        element: <Notice />,
      },
      {
        path: '/terms',
        element: <Terms />,
      },
    ],
  },
  { path: '*', element: <NotFound /> },
];

const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
});

export default router;
