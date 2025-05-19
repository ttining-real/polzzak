import { MapMarker } from 'react-kakao-maps-sdk';

interface MarkerData {
  contentid: string;
  contenttypeid: string;
  mapx: string;
  mapy: string;
  title: string;
}

interface Props {
  data: MarkerData[];
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

export default function MapMarkerList({ data }: Props) {
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
            src: getMarkerSrc(marker.contenttypeid),
            size: { width: 28, height: 28 },
            options: { offset: { x: 14, y: 14 } },
          }}
          onClick={() => {
            console.log(`${marker.title} 마커 클릭!`);
          }}
        />
      ))}
    </>
  );
}
