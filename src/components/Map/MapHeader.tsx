import { MutableRefObject, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Button from '@/components/Button/Button';
import { Carousel, CarouselContent } from '@/components/Home/Carousel';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import { useDialogStore } from '@/store/useDialogStore';
import { LatLng } from '@/types/LatLng';

interface MapHeaderProps {
  mapRef: MutableRefObject<kakao.maps.Map | null>;
  myLocation: LatLng | null;
  isLoggedIn: boolean;
}

function MapHeader({ mapRef, myLocation, isLoggedIn }: MapHeaderProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { closeModal } = useDialogStore();
  const [searchValue, setSearchValue] = useState('');

  const MAP_FILTER = [
    { contentTypeId: '', category: 'favorite', label: '즐겨찾기' },
    { contentTypeId: '', category: 'polzzak', label: '나의폴짝' },
    { contentTypeId: '39', category: 'food', label: '음식점' },
    { contentTypeId: '15', category: 'festival', label: '축제' },
    { contentTypeId: '12', category: 'tour', label: '관광지' },
    { contentTypeId: '28', category: 'leports', label: '레포츠' },
    { contentTypeId: '38', category: 'shopping', label: '쇼핑' },
    { contentTypeId: '32', category: 'hotels', label: '숙박' },
    { contentTypeId: '14', category: 'cultural', label: '문화시설' },
  ];

  const handleFilterClick = (category: string) => {
    const current = new URLSearchParams(searchParams);
    const isActive = searchParams.get('category') === category;

    if (isActive) {
      current.delete('category');
      closeModal();
    } else {
      current.set('category', category);
    }

    navigate({
      pathname: '/map',
      search: current.toString(),
    });
  };

  const handleLocationClick = () => {
    if (!mapRef.current || !myLocation) return;

    mapRef.current.setCenter(
      new kakao.maps.LatLng(myLocation.lat, myLocation.lng),
    );
  };

  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const current = new URLSearchParams(searchParams);

      if (searchValue) {
        current.set('keyword', searchValue);
      } else {
        current.delete('keyword');
        closeModal();
      }
      navigate({
        pathname: '/map',
        search: current.toString(),
      });
    }
  };

  return (
    <>
      <header className="absolute top-4 right-4 left-4 z-10 m-auto flex flex-col justify-between gap-2">
        <Input
          label="검색"
          hideLabel={true}
          value={searchValue}
          onChange={onChangeSearch}
          onKeyDown={onSearchKeyDown}
          placeholder="검색어를 입력해 주세요."
          className="bg-white"
        >
          <Button variant="tertiary" size="md" className="text-gray05">
            <Icon id="search" />
          </Button>
        </Input>
      </header>
      <Carousel
        opts={{ loop: false }}
        className="absolute top-[62px] right-0 left-0 z-10 py-2"
      >
        <CarouselContent className="flex gap-1 first-of-type:ml-4 last-of-type:mr-4">
          {MAP_FILTER.filter(({ category }) => {
            const isPrivate = category === 'favorite' || category === 'polzzak';
            return isLoggedIn || !isPrivate;
          }).map(({ category, label }) => {
            const isActive = searchParams.get('category') === category;
            return (
              <Button
                key={category}
                variant="secondary"
                size="md"
                className={`h-[40px] gap-[4px] rounded-full px-3.5 ${isActive ? 'bg-primary hover:bg-primary text-white hover:text-white hover:brightness-110' : ''}`}
                onClick={() => handleFilterClick(category)}
              >
                <img src={`/icons/${category}.png`} width={18} height={18} />
                {label}
              </Button>
            );
          })}
        </CarouselContent>
      </Carousel>
      <Button
        variant="secondary"
        size="md"
        className="absolute top-[120px] right-4 z-10 h-10 w-10"
        onClick={handleLocationClick}
      >
        <Icon id="location" />
      </Button>
    </>
  );
}

export default MapHeader;
