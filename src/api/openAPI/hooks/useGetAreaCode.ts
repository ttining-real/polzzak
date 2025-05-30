import { useEffect, useState } from 'react';
interface areaCodeListTypes {
  code: string;
  name: string;
  rnum: string;
}

function useGetAreaCode() {
  const [areaCodeList, setAreaCodeList] = useState<areaCodeListTypes[]>([]);

  useEffect(() => {
    const fetchAreaCode = async () => {
      try {
        const res = await fetch(
          `/tourapi/${import.meta.env.VITE_OPEN_API_BASE_URL}/areaCode2?MobileApp=AppTest&MobileOS=ETC&pageNo=1&numOfRows=17&_type=json&serviceKey=${import.meta.env.VITE_OPEN_API_KEY}`,
        );
        const data = await res.json();
        const items = data?.response?.body?.items?.item ?? [];
        setAreaCodeList(items);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAreaCode();
  }, []);

  return areaCodeList;
}

export { useGetAreaCode };
