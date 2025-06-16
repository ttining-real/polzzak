import { MutableRefObject } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Button from '@/components/Button/Button';
import { Carousel, CarouselContent } from '@/components/Home/Carousel';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import { FILTER_LIST } from '@/lib/filterMap';
import { useDialogStore } from '@/store/useDialogStore';
import { useMapSearchStore } from '@/store/useMapSearchStore';
import { LatLng } from '@/types/LatLng';
import { FilterType } from '@/types/mapDataType';

interface MapHeaderProps {
  mapRef: MutableRefObject<kakao.maps.Map | null>;
  myLocation: LatLng | null;
  isLoggedIn: boolean;
  selectedFilter: FilterType | null;
  onFilterChange: (type: FilterType | null) => void;
}

function MapHeader({
  mapRef,
  myLocation,
  isLoggedIn,
  selectedFilter,
  onFilterChange,
}: MapHeaderProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openModal, closeModal } = useDialogStore();
  const { searchValue, setSearchValue } = useMapSearchStore();

  const handleLocationClick = () => {
    if (!mapRef.current || !myLocation) return;

    mapRef.current.setCenter(
      new kakao.maps.LatLng(myLocation.lat, myLocation.lng),
    );
  };

  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const onSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const current = new URLSearchParams(searchParams);

      if (searchValue) {
        current.set('search', searchValue);
        openModal();
      } else {
        current.delete('search');
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
          {FILTER_LIST.filter(({ filterName }) => {
            const isPrivate =
              filterName === 'favorite' || filterName === 'polzzak';
            return isLoggedIn || !isPrivate;
          }).map(({ type, filterName, renderText }) => {
            const isActive = selectedFilter === type;
            return (
              <Button
                key={filterName}
                variant="secondary"
                size="md"
                className={`hover:border-primary/80 hover:text-primary h-[40px] gap-[4px] rounded-full border-1 bg-white px-3 hover:bg-white ${isActive ? 'bg-primary border-primary hover:bg-primary hover:border-primary text-white hover:text-white hover:brightness-110' : ''}`}
                onClick={() => {
                  if (selectedFilter === type) {
                    onFilterChange(null);
                  } else {
                    onFilterChange(type);
                  }
                }}
              >
                <img src={`/icons/${filterName}.png`} width={18} height={18} />
                {renderText}
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
