import { AxiosResponse } from 'axios';

import { client } from '@/api/openAPI/client';

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

interface DataTypes {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  mapx: number;
  mapy: number;
  contenttypeid: string;
}

export async function fetchMapSearchList(
  keyword: string,
): Promise<DataTypes[]> {
  if (!keyword) return [];

  try {
    const res: AxiosResponse<OpenAPIResponse<detailItem>> = await client.get(
      '/searchKeyword1',
      {
        params: {
          serviceKey: import.meta.env.VITE_OPEN_API_KEY,
          MobileApp: 'polzzak',
          MobileOS: 'ETC',
          _type: 'json',
          pageNo: 1,
          numOfRows: 10,
          keyword,
        },
      },
    );

    const items = res.data?.response?.body?.items?.item ?? [];

    return (Array.isArray(items) ? items : [items]).map((item) => ({
      contentid: item.contentid,
      title: item.title,
      addr1: item.addr1,
      firstimage: item.firstimage,
      mapx: parseFloat(item.mapx),
      mapy: parseFloat(item.mapy),
      contenttypeid: item.contenttypeid,
    }));
  } catch (error) {
    console.error('키워드 검색 실패:', error);
    return [];
  }
}
