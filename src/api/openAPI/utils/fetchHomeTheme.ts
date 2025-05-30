import { client } from '@/api/openAPI/client';
import { ThemeItem } from '@/components/Home/ThemeItemCard';

interface HomeThemes extends ThemeItem {
  [key: string]: string;
}
async function fetchRecommendTour(keyword: string) {
  try {
    const res = await client.get('/searchKeyword2', {
      params: {
        keyword: keyword,
        numOfRows: '70',
        pageNo: '1',
        arrange: 'R',
      },
    });
    const items = res.data?.response?.body?.items?.item ?? [];
    const randomTour = items
      .filter(
        (item: HomeThemes) =>
          item.contenttypeid === '12' || item.contenttypeid === '15',
      )
      .splice(0, 7);
    return randomTour.map((item: HomeThemes) => ({
      contentid: item.contentid,
      title: item.title,
      firstimage: item.firstimage,
      addr1: item.addr1,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export { fetchRecommendTour };

async function fetchGetFestival() {
  const eventStartDate = getPreviousMonthStart();

  try {
    const res = await client.get('/searchFestival2', {
      params: {
        pageNo: '1',
        numOfRows: '70',
        eventStartDate: eventStartDate,
      },
    });
    const items = res.data?.response?.body?.items?.item ?? [];
    const ongoingFestivals = items
      .filter((item: HomeThemes) =>
        isFestivalInCurrentMonth(item.eventstartdate, item.eventenddate),
      )
      .splice(0, 7);
    return ongoingFestivals;
  } catch (err) {
    console.error(err);
    return [];
  }
}

const getPreviousMonthStart = () => {
  const now = new Date();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();
  return `${year}${String(month).padStart(2, '0')}15`;
};

const parseFestivalDate = (dateStr: string): Date => {
  const year = Number(dateStr.slice(0, 4));
  const month = Number(dateStr.slice(4, 6)) - 1;
  const day = Number(dateStr.slice(6, 8));
  return new Date(year, month, day);
};

const isFestivalInCurrentMonth = (start: string, end: string): boolean => {
  const now = new Date();
  const startDate = parseFestivalDate(start);
  const endDate = parseFestivalDate(end);

  return startDate <= now && now <= endDate;
};

export { fetchGetFestival };
