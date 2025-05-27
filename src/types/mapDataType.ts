import { FILTER_LIST } from '@/lib/filterMap';

export interface MarkerDataTypes {
  contentid: string;
  contenttypeid?: string;
  title: string;
  mapx: string;
  mapy: string;
  addr1?: string;
  addr2?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  areacode?: string;
  booktour?: string;
  createdtime?: string;
  dist?: string;
  firstimage?: string;
  firstimage2?: string;
  cpyrhtDivCd?: string;
  mlevel?: string;
  modifiedtime?: string;
  sigungucode?: string;
  tel?: string;
}

export interface aroundDataTypes {
  addr1: string;
  addr2: string;
  areacode: string;
  booktour: string;
  cat1: string;
  cat2: string;
  cat3: string;
  contentid: string;
  contenttypeid: string;
  createdtime: string;
  dist: string;
  firstimage: string;
  firstimage2: string;
  cpyrhtDivCd: string;
  mapx: string;
  mapy: string;
  mlevel: string;
  modifiedtime: string;
  sigungucode: string;
  tel: string;
  title: string;
}

export type FilterType = (typeof FILTER_LIST)[number]['type'];
