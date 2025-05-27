export const FILTER_LIST = [
  {
    type: '#favorite',
    filterName: 'favorite',
    renderText: '즐겨찾기',
  },
  {
    type: '#polzzak',
    filterName: 'polzzak',
    renderText: '나의폴짝',
  },
  {
    type: '39',
    filterName: 'food',
    renderText: '음식점',
  },
  {
    type: '15',
    filterName: 'festival',
    renderText: '축제/공연/행사',
  },
  {
    type: '12',
    filterName: 'tour',
    renderText: '관광지',
  },
  {
    type: '28',
    filterName: 'leports',
    renderText: '레포츠',
  },
  {
    type: '38',
    filterName: 'shopping',
    renderText: '쇼핑',
  },
  {
    type: '32',
    filterName: 'hotels',
    renderText: '숙박',
  },
  {
    type: '14',
    filterName: 'cultural',
    renderText: '문화시설',
  },
];

export const filterNameToType = (filterName: string): string | undefined => {
  return FILTER_LIST.find((f) => f.filterName === filterName)?.type;
};

export const typeToFilterName = (type: string): string | undefined => {
  return FILTER_LIST.find((f) => f.type === type)?.filterName;
};

export const typeToRenderText = (type: string): string | undefined => {
  return FILTER_LIST.find((f) => f.type === type)?.renderText;
};
