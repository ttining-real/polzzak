import { useSearchStore } from '@/store/useSearchStore';

export const dropdownData = [
  {
    label: '정렬',
    list: [
      {
        name: '최신 순',
        onClick: () => useSearchStore.getState().sortSearchResults('latest'),
      },
      {
        name: '즐겨찾기 순',
        onClick: () => useSearchStore.getState().sortSearchResults('favorite'),
      },
      {
        name: '리뷰 많은 순',
        onClick: () => useSearchStore.getState().sortSearchResults('review'),
      },
      {
        name: '오래된 순',
        onClick: () => useSearchStore.getState().sortSearchResults('oldest'),
      },
    ],
  },
  {
    label: '지역',
    list: [
      {
        name: '서울',
        onClick: () => useSearchStore.getState().setRegion('서울'),
      },
      {
        name: '제주',
        onClick: () => useSearchStore.getState().setRegion('제주'),
      },
      {
        name: '경기',
        onClick: () => useSearchStore.getState().setRegion('경기'),
      },
      {
        name: '충남',
        onClick: () => useSearchStore.getState().setRegion('충남'),
      },
      {
        name: '인천',
        onClick: () => useSearchStore.getState().setRegion('인천'),
      },
      {
        name: '대구',
        onClick: () => useSearchStore.getState().setRegion('대구'),
      },
      {
        name: '대전',
        onClick: () => useSearchStore.getState().setRegion('대전'),
      },
      {
        name: '경남',
        onClick: () => useSearchStore.getState().setRegion('경남'),
      },
      {
        name: '부산',
        onClick: () => useSearchStore.getState().setRegion('부산'),
      },
      {
        name: '전북',
        onClick: () => useSearchStore.getState().setRegion('전북'),
      },
      {
        name: '울산',
        onClick: () => useSearchStore.getState().setRegion('울산'),
      },
      {
        name: '광주',
        onClick: () => useSearchStore.getState().setRegion('광주'),
      },
      {
        name: '강원',
        onClick: () => useSearchStore.getState().setRegion('강원'),
      },
      {
        name: '경북',
        onClick: () => useSearchStore.getState().setRegion('경북'),
      },
      {
        name: '전남',
        onClick: () => useSearchStore.getState().setRegion('전남'),
      },
      {
        name: '충북',
        onClick: () => useSearchStore.getState().setRegion('충북'),
      },
      {
        name: '세종',
        onClick: () => useSearchStore.getState().setRegion('세종'),
      },
    ],
  },
  {
    label: '월',
    list: Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, '0');
      return {
        name: `${i + 1}월`,
        onClick: () => {
          useSearchStore.getState().setMonth(month);
        },
      };
    }),
  },
  {
    label: '테마',
    list: [
      { name: '가족 여행', onClick: () => console.log('ok') },
      { name: '커플 여행', onClick: () => console.log('ok') },
      { name: '친구들과 함께', onClick: () => console.log('ok') },
      { name: '반려동물과 함께', onClick: () => console.log('ok') },
      { name: '맛집', onClick: () => console.log('ok') },
      { name: '축제', onClick: () => console.log('ok') },
      { name: '관광지', onClick: () => console.log('ok') },
    ],
  },
];
