import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { client } from '@/api/openAPI/client';
import { fetchAroundList } from '@/api/openAPI/utils/fetchAroundList';
import {
  fetchFavoriteItems,
  fetchPolzzakItems,
} from '@/api/openAPI/utils/fetchMapFilterData';
import { fetchMapSearchList } from '@/api/openAPI/utils/fetchMapSearchList';
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
  const [categoryMarkers, setCategoryMarkers] = useState<MarkerDataTypes[]>([]);
  const [searchMarkers, setSearchMarkers] = useState<MarkerDataTypes[]>([]);

  // ✅ 필터링 마커
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
        let markers: MarkerDataTypes[] = [];

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

          markers = itemArray.map((item) => ({
            contentid: item.contentid,
            contenttypeid: item.contenttypeid,
            title: item.title,
            mapx: item.mapx,
            mapy: item.mapy,
          }));
        }

        console.log(markers);

        setCategoryMarkers(markers);
      } catch (err) {
        console.error('❌ 마커 데이터 패칭 중 에러 발생:', err);
      }
    };

    fetchMarkers();
  }, [myLocation, selectedFilter]);

  // 🔍 검색어 마커
  useEffect(() => {
    const word = searchParams.get('search');

    if (!word) {
      setSearchMarkers([]);
      return;
    }

    fetchMapSearchList({
      keyword: word,
    }).then((result) => {
      setSearchMarkers(result);
    });
  }, [searchParams]);

  // ✅ 최종 결과 마커
  useEffect(() => {
    const hasSearch = !!searchParams.get('search');
    const hasCategory = !!searchParams.get('category');

    if (hasSearch && hasCategory) {
      const intersected = categoryMarkers.filter((catItem) =>
        searchMarkers.some(
          (searchItem) =>
            String(searchItem.contentid) === String(catItem.contentid),
        ),
      );
      setMarkerData(intersected);
    } else if (hasCategory) {
      setMarkerData(categoryMarkers);
    } else if (hasSearch) {
      setMarkerData(searchMarkers);
    } else {
      setMarkerData([]);
    }
    console.log(
      '🐰 categoryMarkers:',
      categoryMarkers.map((m) => m.contentid),
    );
    console.log(
      '🔍 searchMarkers:',
      searchMarkers.map((m) => m.contentid),
    );
  }, [searchParams, categoryMarkers, searchMarkers]);
}
