import { useEffect, useState } from 'react';

import { client } from '@/api/openAPI/client';

interface detailsTypes {
  overview: string;
  contentid: string;
  sigungucode: string;
  cat1: string;
  cat2: string;
  cat3: string;
  addr1: string;
  addr2: string;
  zipcode: string;
  mapx: string;
  mapy: string;
  mlevel: string;
  cpyrhtDivCd: string;
  contenttypeid: string;
  booktour: string;
  createdtime: string;
  homepage: string;
  modifiedtime: string;
  tel: string;
  telname: string;
  title: string;
  firstimage: string;
  firstimage2: string;
  areacode: string;
}

function useGetDetailCommon(contentId: string) {
  const [details, setDetails] = useState<detailsTypes[]>([]);

  useEffect(() => {
    const fetchDetailCommon = async () => {
      try {
        const res = await client.get('/detailCommon1', {
          params: {
            pageNo: '1',
            numOfRows: '20',
            defaultYN: 'Y',
            firstImageYN: 'Y',
            areacodeYN: 'Y',
            catcodeYN: 'Y',
            addrinfoYN: 'Y',
            mapinfoYN: 'Y',
            overviewYN: 'Y',
            contentId,
          },
        });
        const items = res.data?.response?.body?.items?.item[0] ?? [];

        setDetails(items);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDetailCommon();
  }, [contentId]);

  return details;
}

export { useGetDetailCommon };
