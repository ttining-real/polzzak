import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { client } from '@/api/openAPI/client';
import { fetchAroundList } from '@/api/openAPI/utils/fetchAroundList';
import {
  fetchFavoriteItems,
  fetchPolzzakItems,
} from '@/api/openAPI/utils/fetchMapFilterData';
import { fetchMapSearchList } from '@/api/openAPI/utils/fetchMapSearchList';
import { getRegionCodeFromCoords } from '@/api/openAPI/utils/getAreaCodesFromCoords';
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
  const [searchParams] = useSearchParams();
  const searchWord = searchParams.get('search');
  const category = searchParams.get('category');

  useEffect(() => {
    if (!myLocation || (!selectedFilter && !searchWord)) {
      setMarkerData([]);
      return;
    }

    const fetchMarkers = async () => {
      const userId = useAuthStore.getState().user?.id;
      let markers: MarkerDataTypes[] = [];

      try {
        if (selectedFilter === '#favorite') {
          if (!userId) return;

          const favorites = await fetchFavoriteItems(userId);
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

          markers = detailResponses
            .map((res) => res.data?.response?.body?.items?.item?.[0])
            .filter(Boolean)
            .map((item) => ({
              contentid: item.contentid,
              contenttypeid: item.contenttypeid,
              title: item.title,
              mapx: item.mapx,
              mapy: item.mapy,
            }));
        } else if (selectedFilter === '#polzzak') {
          if (!userId) return;

          const polzzaks = await fetchPolzzakItems(userId);
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

          markers = detailResponses
            .map((res) => res.data?.response?.body?.items?.item?.[0])
            .filter(Boolean)
            .map((item) => ({
              contentid: item.contentid,
              contenttypeid: item.contenttypeid,
              title: item.title,
              mapx: item.mapx,
              mapy: item.mapy,
            }));
        } else if (selectedFilter) {
          const categoryRes = await fetchAroundList({
            mapX: myLocation.lng,
            mapY: myLocation.lat,
            contentTypeId: selectedFilter,
          });

          const rawItems = categoryRes.data?.response?.body?.items?.item;
          const categoryItems = Array.isArray(rawItems)
            ? rawItems
            : rawItems
              ? [rawItems]
              : [];

          const categoryMarkers = categoryItems.map((item) => ({
            contentid: item.contentid,
            contenttypeid: item.contenttypeid,
            title: item.title,
            mapx: item.mapx,
            mapy: item.mapy,
          }));

          if (searchWord) {
            markers = categoryMarkers.filter((catItem) =>
              catItem.title.toLowerCase().includes(searchWord.toLowerCase()),
            );
          } else {
            markers = categoryMarkers;
          }
        } else if (searchWord) {
          if (!myLocation) return;

          try {
            const result = await getRegionCodeFromCoords(
              myLocation.lng,
              myLocation.lat,
            );
            const regionCode = result.regionCode;
            const areaCode = regionCode.substring(0, 1); // "1"

            const searchResults = await fetchMapSearchList({
              keyword: searchWord,
              areaCode,
              // sigunguCode,
            });

            markers = searchResults.map((item) => ({
              contentid: item.contentid,
              contenttypeid: item.contenttypeid,
              title: item.title,
              mapx: item.mapx,
              mapy: item.mapy,
            }));
          } catch (err) {
            console.error('지역 코드 조회 에러:', err);
          }
        }

        setMarkerData(markers);
      } catch (err) {
        console.error('❌ 마커 데이터 패칭 중 에러 발생:', err);
        setMarkerData([]);
      }
    };

    fetchMarkers();
  }, [selectedFilter, myLocation, searchWord, category]);
}
