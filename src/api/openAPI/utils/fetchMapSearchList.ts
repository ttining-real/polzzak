import { AxiosResponse } from 'axios';

import { client } from '@/api/openAPI/client';
import { MarkerDataTypes } from '@/types/mapDataType';

interface OpenAPIResponse<T> {
  response: {
    body: {
      items: {
        item: T[];
      };
    };
  };
}

interface detailItem {
  [key: string]: string;
}

interface FetchMapSearchListParams {
  keyword: string;
  areaCode?: string;
  sigunguCode?: string;
}

export async function fetchMapSearchList({
  keyword,
  areaCode,
  sigunguCode,
}: FetchMapSearchListParams): Promise<MarkerDataTypes[]> {
  if (!keyword) return [];

  try {
    const res: AxiosResponse<OpenAPIResponse<detailItem>> = await client.get(
      '/searchKeyword1',
      {
        params: {
          pageNo: 1,
          numOfRows: 10,
          keyword,
          ...(areaCode ? { areaCode } : {}),
          ...(sigunguCode ? { sigunguCode } : {}),
        },
      },
    );

    const items = res.data?.response?.body?.items?.item ?? [];

    return (Array.isArray(items) ? items : [items]).map((item) => ({
      contentid: item.contentid,
      title: item.title,
      addr1: item.addr1,
      firstimage: item.firstimage,
      mapx: item.mapx,
      mapy: item.mapy,
      contenttypeid: item.contenttypeid,
    }));
  } catch (error) {
    console.error('키워드 검색 실패:', error);
    return [];
  }
}
