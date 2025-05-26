import { client } from '@/api/openAPI/client';

interface SearchList {
  keyword?: string;
  date?: { startDate: Date | null; endDate: Date | null };
  region?: string;
  theme?: string[];
  startDate?: string;
  endDate?: string;
}

interface ItemTypes {
  [key: string]: string;
}

const REGION_MAP: Record<string, string> = {
  서울: '1',
  인천: '2',
  대전: '3',
  대구: '4',
  광주: '5',
  부산: '6',
  울산: '7',
  세종: '8',
  경기: '31',
  강원: '32',
  충북: '33',
  충남: '34',
  경북: '35',
  경남: '36',
  전북: '37',
  전남: '38',
  제주: '39',
};

async function fetchSearchList({
  keyword = '',
  region = '',
  startDate,
  endDate,
}: SearchList) {
  const results: ItemTypes[] = [];
  const regionCode = REGION_MAP[region] || '';

  try {
    if (keyword) {
      try {
        const keywordResponse = await client.get(`/searchKeyword1`, {
          params: {
            keyword,
            pageNo: 1,
            numOfRows: 10,
          },
        });

        const items = keywordResponse?.data?.response?.body?.items?.item;
        if (items) {
          const itemsArray = Array.isArray(items) ? items : [items];
          results.push(...itemsArray);
        }
      } catch (error) {
        console.error('키워드 검색 중 오류 발생:', error);
      }
    }

    if (startDate) {
      try {
        const festivalResponse = await client.get(`/searchFestival1`, {
          params: {
            eventStartDate: startDate,
            ...(endDate ? { eventEndDate: endDate } : {}),
            pageNo: 1,
            numOfRows: 10,
            ...(regionCode ? { areaCode: regionCode } : {}),
          },
        });

        const items = festivalResponse?.data?.response?.body?.items?.item;
        if (items) {
          const itemsArray = Array.isArray(items) ? items : [items];
          results.push(...itemsArray);
        }
      } catch (error) {
        console.error('날짜 검색 중 오류 발생:', error);
      }
    }

    if (region) {
      try {
        const regionResponse = await client.get(`/areaBasedList1`, {
          params: {
            areaCode: regionCode,
            pageNo: 1,
            numOfRows: 10,
          },
        });

        const items = regionResponse?.data?.response?.body?.items?.item;
        if (items) {
          const itemsArray = Array.isArray(items) ? items : [items];
          results.push(...itemsArray);
        }
      } catch (error) {
        console.error('지역 검색 중 오류 발생:', error);
      }
    }

    const uniqueResults = results.reduce((acc, item) => {
      if (
        item &&
        item.contentid &&
        !acc.some(
          (existing: ItemTypes) => existing.contentid === item.contentid,
        )
      ) {
        acc.push(item);
      }
      return acc;
    }, []);

    return uniqueResults;
  } catch (error) {
    console.error('검색 중 오류 발생:', error);
    return [];
  }
}

export { fetchSearchList };
