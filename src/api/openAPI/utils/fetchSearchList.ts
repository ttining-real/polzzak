import { client } from '@/api/openAPI/client';
import { DetailCommonDataType } from '@/types/detailCommonDataType';

interface SearchList {
  keyword?: string;
  date?: { startDate: Date | null; endDate: Date | null };
  region?: string;
  theme?: string[];
  startDate?: string;
  endDate?: string;
  pageNo?: number;
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

const THEME_MAP: Record<string, string> = {
  관광지: '12',
  맛집: '39',
  축제: '15',
};

type ThemeType =
  | '가족 여행'
  | '커플 여행'
  | '친구들과 함께'
  | '반려동물과 함께';

async function fetchSearchList({
  keyword = '',
  region = '',
  theme = [],
  startDate,
  endDate,
  pageNo = 1,
}: SearchList) {
  const results: ItemTypes[] = [];
  const regionCode = REGION_MAP[region] || '';

  try {
    if (keyword) {
      try {
        const keywordResponse = await client.get(`/searchKeyword2`, {
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
        const festivalResponse = await client.get(`/searchFestival2`, {
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
        const regionResponse = await client.get(`/areaBasedList2`, {
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

    if (theme && theme.length > 0) {
      const directThemes = theme.filter((t) => THEME_MAP[t]);
      const styleThemes = theme.filter((t) => !THEME_MAP[t]);

      for (const selectedTheme of directThemes) {
        try {
          const contentTypeId = THEME_MAP[selectedTheme];
          const themeResponse = await client.get(`/areaBasedList2`, {
            params: {
              contentTypeId,
              pageNo,
              numOfRows: 10,
              ...(regionCode ? { areaCode: regionCode } : {}),
            },
          });

          const items = themeResponse?.data?.response?.body?.items?.item;
          if (items) {
            const itemsArray = Array.isArray(items) ? items : [items];
            results.push(...itemsArray);
          }
        } catch (error) {
          console.error(`테마 검색 중 오류 발생 (${selectedTheme}):`, error);
        }
      }

      if (styleThemes.length > 0) {
        let combinedKeywords: string[] = [];

        if (styleThemes.length === 1) {
          const selectedTheme = styleThemes[0];
          switch (selectedTheme) {
            case '가족 여행':
              combinedKeywords = ['가족', '아이', '어린이', '키즈', '체험'];
              break;
            case '커플 여행':
              combinedKeywords = ['데이트', '커플', '로맨틱', '야경'];
              break;
            case '친구들과 함께':
              combinedKeywords = ['친구', '그룹', '단체', '액티비티'];
              break;
            case '반려동물과 함께':
              combinedKeywords = [
                '펜션',
                '반려동물',
                '애완동물',
                '강아지',
                '애견',
              ];
              break;
          }
        } else {
          const keywordMap: Record<ThemeType, string[]> = {
            '가족 여행': ['가족', '아이', '어린이', '키즈', '체험'],
            '커플 여행': ['데이트', '커플', '로맨틱', '야경'],
            '친구들과 함께': ['친구', '그룹', '단체', '액티비티'],
            '반려동물과 함께': [
              '펜션',
              '애완동물',
              '반려동물',
              '강아지',
              '애견',
            ],
          };
          const themeKeywords = styleThemes.map(
            (theme) => keywordMap[theme as ThemeType] || [],
          );

          if (themeKeywords.length >= 2) {
            for (let i = 0; i < Math.min(2, themeKeywords[0].length); i++) {
              for (let j = 0; j < Math.min(2, themeKeywords[1].length); j++) {
                combinedKeywords.push(
                  `${themeKeywords[0][i]} ${themeKeywords[1][j]}`,
                );
              }
            }
          }

          themeKeywords.forEach((keywords) => {
            combinedKeywords.push(...keywords.slice(0, 2));
          });
        }

        const contentTypes = [
          { id: '12', name: '관광지' },
          { id: '39', name: '맛집' },
          { id: '15', name: '축제' },
        ];

        for (const searchKeyword of combinedKeywords) {
          try {
            const keywordResponse = await client.get(`/searchKeyword1`, {
              params: {
                keyword: searchKeyword,
                pageNo,
                numOfRows: styleThemes.length > 1 ? 2 : 3,
                ...(regionCode ? { areaCode: regionCode } : {}),
              },
            });

            const items = keywordResponse?.data?.response?.body?.items?.item;
            if (items) {
              const itemsArray = Array.isArray(items) ? items : [items];
              results.push(...itemsArray);
            }
          } catch (error) {
            console.error(
              `키워드 검색 중 오류 발생 (${searchKeyword}):`,
              error,
            );
          }

          if (styleThemes.length === 1) {
            for (const contentType of contentTypes) {
              try {
                const typeKeywordResponse = await client.get(
                  `/searchKeyword1`,
                  {
                    params: {
                      keyword: searchKeyword,
                      contentTypeId: contentType.id,
                      pageNo,
                      numOfRows: 2,
                      ...(regionCode ? { areaCode: regionCode } : {}),
                    },
                  },
                );

                const items =
                  typeKeywordResponse?.data?.response?.body?.items?.item;
                if (items) {
                  const itemsArray = Array.isArray(items) ? items : [items];
                  results.push(...itemsArray);
                }
              } catch (error) {
                console.error(
                  `${contentType.name} 키워드 검색 중 오류 발생 (${searchKeyword}):`,
                  error,
                );
              }
            }
          }
        }
      }
    }

    const uniqueResults = results.reduce<DetailCommonDataType[]>(
      (acc, item) => {
        if (
          item &&
          item.contentid &&
          !acc.some(
            (existing: DetailCommonDataType) =>
              existing.contentid === item.contentid,
          )
        ) {
          acc.push(item);
        }
        return acc;
      },
      [],
    );

    return uniqueResults;
  } catch (error) {
    console.error('검색 중 오류 발생:', error);
    return [];
  }
}

export { fetchSearchList };
