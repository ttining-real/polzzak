import { useEffect } from 'react';

import { client } from '@/api/openAPI/client';
import { fetchAroundList } from '@/api/openAPI/utils/fetchAroundList';
import {
  fetchFavoriteItems,
  fetchPolzzakItems,
} from '@/api/openAPI/utils/fetchMapFilterData';
import { useAuthStore } from '@/store/useAuthStore';
import { LatLng } from '@/types/LatLng';
import { FilterType, MarkerDataTypes } from '@/types/mapDataType';

interface Props {
  myLocation: LatLng | null;
  selectedFilter: FilterType | null;
  setMarkerData: (data: MarkerDataTypes[]) => void;
}

export function useFetchMarkers({
  myLocation,
  selectedFilter,
  setMarkerData,
}: Props) {
  useEffect(() => {
    if (!myLocation || !selectedFilter) return;

    const fetchMarkers = async () => {
      const userId = useAuthStore.getState().user?.id;
      if (
        (selectedFilter === '#favorite' || selectedFilter === '#polzzak') &&
        !userId
      )
        return;

      try {
        if (selectedFilter === '#favorite') {
          const favorites = await fetchFavoriteItems(userId!);
          const contentIds = favorites.flatMap((folder) =>
            folder.ex_favorite.map((fav) => fav.content_id),
          );

          const detailResponses = await Promise.all(
            contentIds.map((contentId) =>
              client.get(`detailCommon1`, {
                params: {
                  pageNo: '1',
                  numOfRows: '20',
                  defaultYN: 'Y',
                  firstImageYN: 'Y',
                  areacodeYN: 'Y',
                  catcodeYN: 'Y',
                  addrinfoYN: 'Y',
                  mapinfoYN: 'Y',
                  overviewYN: 'Y',
                  contentId,
                },
              }),
            ),
          );

          const markerData = detailResponses
            .map((res) => res.data?.response?.body?.items?.item[0])
            .filter(Boolean)
            .map((item) => ({
              contentid: item.contentid,
              contenttypeid: item.contenttypeid,
              title: item.title,
              mapx: item.mapx,
              mapy: item.mapy,
            }));

          setMarkerData(markerData);
        } else if (selectedFilter === '#polzzak') {
          const polzzaks = await fetchPolzzakItems(userId!);
          const contentIds = polzzaks.flatMap((polzzak) =>
            polzzak.ex_polzzak_schedule.flatMap((schedule) =>
              (schedule.ex_polzzak_detail || []).map(
                (detail) => detail.content_id,
              ),
            ),
          );

          const detailResponses = await Promise.all(
            contentIds.map((contentId) =>
              client.get(`detailCommon1`, {
                params: {
                  pageNo: '1',
                  numOfRows: '20',
                  defaultYN: 'Y',
                  firstImageYN: 'Y',
                  areacodeYN: 'Y',
                  catcodeYN: 'Y',
                  addrinfoYN: 'Y',
                  mapinfoYN: 'Y',
                  overviewYN: 'Y',
                  contentId,
                },
              }),
            ),
          );

          const markerData = detailResponses
            .map((res) => res.data?.response?.body?.items?.item[0])
            .filter(Boolean)
            .map((item) => ({
              contentid: item.contentid,
              contenttypeid: item.contenttypeid,
              title: item.title,
              mapx: item.mapx,
              mapy: item.mapy,
            }));

          setMarkerData(markerData);
        } else {
          const res = await fetchAroundList({
            mapX: myLocation.lng,
            mapY: myLocation.lat,
            ...(selectedFilter && { contentTypeId: selectedFilter }),
          });

          const rawItem = res.data?.response?.body?.items?.item;

          const itemArray = Array.isArray(rawItem)
            ? rawItem
            : rawItem
              ? [rawItem]
              : [];

          const mappedArray: MarkerDataTypes[] = itemArray.map((item) => ({
            contentid: item.contentid,
            contenttypeid: item.contenttypeid,
            title: item.title,
            mapx: item.mapx,
            mapy: item.mapy,
          }));

          setMarkerData(mappedArray);
        }
      } catch (err) {
        console.error('❌ 마커 데이터 패칭 중 에러 발생:', err);
      }
    };

    fetchMarkers();
  }, [myLocation, selectedFilter]);
}
