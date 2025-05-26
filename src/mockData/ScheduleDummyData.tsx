export const ScheduleDummyData = [
  {
    id: 0,
    name: '인천에서 술 먹기',
    startDate: new Date(2025, 2, 15),
    endDate: new Date(2025, 2, 16),
    area: ['인천'],
    img: 'rabbit.png',
  },
  {
    id: 1,
    name: '시골쥐 상경하다',
    startDate: new Date(2025, 2, 22),
    endDate: new Date(2025, 2, 23),
    area: ['서울', '인천', '경기'],
    img: 'rabbit.png',
  },
  {
    id: 2,
    name: '떠나요 셋이서',
    startDate: new Date(2025, 3, 28),
    endDate: new Date(2025, 4, 2),
    area: ['부산', '제주'],
    img: 'rabbit.png',
  },
];

export interface Bookmark {
  id: number;
  name: string;
  storage: {
    id: number;
    imgUrl: string;
    title: string;
    start_date: string;
    end_date: string;
    region: string;
    district: string;
    favorite_count: number;
    review_count: number;
  }[];
}
