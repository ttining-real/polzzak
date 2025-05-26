import { client } from '@/api/openAPI/client';

interface SearchList {
  keyword?: string;
  date?: { startDate: Date | null; endDate: Date | null };
  region?: string;
  theme?: string[];
  startDate?: string;
  endDate?: string;
}

// interface SearchResult {
//   title: string;
//   addr1: string;
//   contentid: string;
// }

// interface ThemeItem {
//   cat1?: string;
//   contentTypeId: number;
// }

// type ThemeName =
//   | '반려동물과 함께'
//   | '가족 여행'
//   | '커플 여행'
//   | '친구들과 함께'
//   | '맛집'
//   | '축제'
//   | '관광지'
//   | '숙박';

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

// const THEME_MAP: Record<ThemeName, ThemeItem[]> = {
//   '반려동물과 함께': [{ contentTypeId: 12 }, { contentTypeId: 39 }],
//   '가족 여행': [
//     { contentTypeId: 12 },
//     { contentTypeId: 15 },
//     { contentTypeId: 32 },
//   ],
//   '커플 여행': [{ contentTypeId: 12 }, { contentTypeId: 39 }],
//   '친구들과 함께': [{ contentTypeId: 28 }, { contentTypeId: 38 }],
//   맛집: [{ contentTypeId: 39 }],
//   축제: [{ contentTypeId: 15 }],
//   관광지: [{ contentTypeId: 12 }, { contentTypeId: 12 }],
//   숙박: [{ contentTypeId: 32 }],
// };
/* 
#cat1
- A01 : 자연
- A02 : 인문(문화/예술/역사)
- A03 : 레포츠
- A04 : 쇼핑
- A05 : 음식
- B02 : 숙박
- C01 : 추천코스
# contenttypeid 
12:관광지, 14:문화시설, 15:축제공연행사, 28:레포츠, 32:숙박, 38:쇼핑, 39:음식점
*/

async function fetchSearchList({
  keyword = '',
  region = '',
  startDate,
  endDate,
}: SearchList) {
  const results: any[] = [];
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

    // if (theme.length > 0) {
    //   try {
    //   } catch (error) {
    //     console.error('테마 검색 중 오류 발생:', error);
    //   }
    // }
    // if (theme.length > 0) {
    //   try {
    //     const themeRequests = theme
    //       .flatMap((themeName) => THEME_MAP[themeName as ThemeName]) // 테마 조합 펼치기
    //       .map(({ cat1, contentTypeId }) =>
    //         client.get(`/areaBasedSyncList1`, {
    //           params: {
    //             numOfRows: 10,
    //             pageNo: 1,
    //             ...(regionCode ? { areaCode: regionCode } : {}),
    //             ...(cat1 ? { cat1 } : {}),
    //             contentTypeId,
    //           },
    //         }),
    //       );

    //     const responses = await Promise.allSettled(themeRequests);

    //     for (const res of responses) {
    //       if (res.status === 'fulfilled') {
    //         const items = res.value?.data?.response?.body?.items?.item;
    //         if (items) {
    //           const itemsArray = Array.isArray(items) ? items : [items];
    //           results.push(...itemsArray);
    //         }
    //       } else {
    //         console.error('⛔ 테마 API 호출 실패:', res.reason);
    //       }
    //     }
    //   } catch (error) {
    //     console.error('테마 검색 중 오류 발생:', error);
    //   }
    // }

    const uniqueResults = results.reduce((acc, item) => {
      if (
        item &&
        item.contentid &&
        !acc.some((existing: any) => existing.contentid === item.contentid)
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
