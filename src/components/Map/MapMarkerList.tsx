import { MapMarker } from 'react-kakao-maps-sdk';

import { useDialogStore } from '@/store/useDialogStore';
import { MakerDataTypes } from '@/types/mapDataType';

interface Props {
  data: MakerDataTypes[];
  onMakerClick?: (marker) => void;
}

const getMarkerSrc = (contentTypeId: string) => {
  switch (contentTypeId) {
    case '39':
      return '/marker/map_food.svg';
    case '15':
      return '/marker/map_festival.svg';
    case '12':
      return '/marker/map_tour.svg';
    case '28':
      return '/marker/map_leports.svg';
    case '38':
      return '/marker/map_shopping.svg';
    case '32':
      return '/marker/map_hotels.svg';
    case '14':
      return '/marker/map_cultural.svg';
    default:
      return '/marker/map_marker.svg';
  }
};

export default function MapMarkerList({ data, onMakerClick }: Props) {
  // 다이얼로그 상태
  const { openModal } = useDialogStore();

  if (!Array.isArray(data)) {
    console.warn('⚠️ 마커 데이터는 배열이어야 합니다. : ', data);
    return null;
  }

  return (
    <>
      {data.map((marker) => (
        <MapMarker
          key={marker.contentid}
          position={{ lat: Number(marker.mapy), lng: Number(marker.mapx) }}
          image={{
            src: getMarkerSrc(marker.contenttypeid ?? ''),
            size: { width: 28, height: 28 },
            options: { offset: { x: 14, y: 14 } },
          }}
          onClick={() => {
            console.log(`${marker.title} 마커 클릭!`);

            onMakerClick?.(marker);
            openModal();
          }}
        />
      ))}
    </>
  );
}
