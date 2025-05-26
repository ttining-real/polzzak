import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useGetDetailCommon } from '@/api/openAPI';
import Button from '@/components/Button/Button';
import Details from '@/components/Contents/Details';
import Icon from '@/components/Icon/Icon';
import UserMenu, { MenuItemTypes } from '@/components/UserMenu/UserMenu';
import { useHeaderStore } from '@/store/useHeaderStore';
import { useSearchStore } from '@/store/useSearchStore';

const userMenu: MenuItemTypes[] = [
  {
    label: '즐겨찾기',
    icon: 'favorite_off',
    path: '/',
  },
  {
    label: '폴짝추가',
    icon: 'calendar',
    path: '/',
  },
  {
    label: '리뷰작성',
    icon: 'review',
    path: '/',
  },
  {
    label: '공유하기',
    icon: 'share',
    path: '/',
  },
];

function ViewDetails() {
  const { id } = useParams();
  const { detailData } = useSearchStore();
  const info = detailData.filter((item) => item.contentid === id);
  const data = useGetDetailCommon(id as string);
  const setContentsTitle = useHeaderStore((state) => state.setContentsTitle);

  useEffect(() => {
    if (data.length > 0) {
      setContentsTitle(data[0].title);
    }
    return () => {
      setContentsTitle(null);
    };
  }, [data, setContentsTitle]);

  return (
    <div className="flex flex-col gap-4">
      <figure className="bg-primary/10 flex h-full min-h-[230px] w-full flex-col items-center justify-center rounded-2xl">
        {info.length > 0 ? (
          info[0].image ? (
            <>
              <img
                src={info[0].image}
                alt=""
                className="h-full w-full rounded-2xl"
              />
              <figcaption className="sr-only">{info[0].title}</figcaption>
            </>
          ) : (
            <>
              <img
                src="/images/rabbit_face.png"
                alt=""
                className="mb-4 aspect-square h-12"
              />
              <figcaption className="">등록된 이미지가 없습니다.</figcaption>
            </>
          )
        ) : (
          <div className="text-center">이미지를 불러오는 중 입니다.</div>
        )}
      </figure>
      <UserMenu menus={userMenu} />
      {data[0] && info[0] ? (
        <Details info={info[0]} data={data[0]} />
      ) : (
        <div>데이터를 불러오는 중 입니다.</div>
      )}
      <Button variant={'float'}>
        <Icon id="arrow_top" />
      </Button>
    </div>
  );
}

export default ViewDetails;
