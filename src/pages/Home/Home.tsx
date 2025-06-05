import { useQuery } from '@tanstack/react-query';

import {
  fetchGetFestival,
  fetchRecommendTour,
} from '@/api/openAPI/utils/fetchHomeTheme';
import supabase from '@/api/supabase';
import Category from '@/components/Category/Category';
import CarouselThemes, {
  ThemeItemProps,
} from '@/components/Home/CarouselThemes';
import CarouselVisual from '@/components/Home/CarouselVisual';

const getYear = () => new Date().getFullYear();
const getMonth = () => new Date().getMonth() + 1;

const getThemeTitle = () => {
  const year = getYear();
  const month = getMonth();

  if (month >= 3 && month <= 4) {
    return {
      title: '벚꽃 하면 바로 이곳',
      url: `search/result?30q=벚꽃&startDate=${year}0301&endDate=${year}0430`,
      keyword: '벚꽃',
    };
  } else if (month >= 5 && month <= 6) {
    return {
      title: '봄바람 타고 떠나고 싶은 이곳',
      url: `search/result?q=봄&startDate=${year}0501&endDate=${year}0630`,
      keyword: '봄',
    };
  } else if (month >= 7 && month <= 9) {
    return {
      title: '시원한 바다와 함께하는 여름',
      url: `search/result?q=바다&startDate=${year}0701&endDate=${year}0930`,
      keyword: '바다',
    };
  } else if (month >= 10 && month <= 11) {
    return {
      title: '단풍 하면 바로 이곳',
      url: `search/result?q=단풍&startDate=${year}1001&endDate=${year}1130`,
      keyword: '단풍',
    };
  } else if (month === 12) {
    return {
      title: '따듯한 크리스마스를 즐길 이곳',
      url: `search/result?q=크리스마스&startDate=${year}1201&endDate=${year}1231`,
      keyword: '크리스마스',
    };
  } else {
    return {
      title: '흰 눈 사이로 썰매를 타며 즐기기 좋은 이곳',
      url: `search/result?q=겨울&startDate=${year}0101&endDate=${year}0228`,
      keyword: '겨울',
    };
  }
};

const fetchRestaurant = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('home-recommend').select('*');

  if (error) throw error;

  const updatedData = data.map((item) => ({
    ...item,
    contentid: item.content_id,
    contenttypeid: '39',
  }));
  return updatedData;
};

function Home() {
  const themeTitle = getThemeTitle();

  const { data: recommendThemes = [], isLoading: isLoadingRecommend } =
    useQuery({
      queryKey: ['recommendThemes-home', themeTitle.keyword],
      queryFn: () => fetchRecommendTour(themeTitle.keyword),
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    });

  const { data: festivalOfTheMonth = [], isLoading: isLoadingFestival } =
    useQuery({
      queryKey: ['festival-home'],
      queryFn: () => fetchGetFestival(),
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    });

  const { data: recommendRestaurants = [], isLoading: isLoadingRestaurants } =
    useQuery({
      queryKey: ['restaurant-home'],
      queryFn: fetchRestaurant,
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    });

  const themeRecommendations: ThemeItemProps[] = [
    {
      header: themeTitle.title,
      moreUrl: themeTitle.url,
      itemList: [...recommendThemes],
    },
    {
      header: '이달의 축제',
      moreUrl: `search/result?startDate=${getYear()}${String(getMonth()).padStart(2, '0')}01&endDate=${getYear()}${String(getMonth()).padStart(2, '0')}30&theme=축제`,
      itemList: [...festivalOfTheMonth],
    },
    {
      header: '지금 떠오르는 맛집',
      moreUrl: 'search/result?theme=맛집',
      itemList: [...recommendRestaurants],
    },
  ];

  return (
    <main className="flex h-full w-full flex-1 flex-col gap-6 overflow-auto pb-8">
      <CarouselVisual />
      <Category />
      {isLoadingRecommend ? (
        <p>Skeleton UI</p>
      ) : (
        <CarouselThemes
          key={themeRecommendations[0].header}
          header={themeRecommendations[0].header}
          moreUrl={themeRecommendations[0].moreUrl}
          itemList={themeRecommendations[0].itemList}
        />
      )}
      {isLoadingFestival ? (
        <p>Skeleton UI</p>
      ) : (
        <CarouselThemes
          key={themeRecommendations[1].header}
          header={themeRecommendations[1].header}
          moreUrl={themeRecommendations[1].moreUrl}
          itemList={themeRecommendations[1].itemList}
        />
      )}
      {isLoadingRestaurants ? (
        <p>Skeleton UI</p>
      ) : (
        <CarouselThemes
          key={themeRecommendations[2].header}
          header={themeRecommendations[2].header}
          moreUrl={themeRecommendations[2].moreUrl}
          itemList={themeRecommendations[2].itemList}
        />
      )}
    </main>
  );
}

export default Home;
