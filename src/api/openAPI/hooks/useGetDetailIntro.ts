import { useEffect, useState } from 'react';

interface detailIntroTypes {
  contentId: string;
  contentTypeId: string;
}

function useGetDetailIntro({ contentId, contentTypeId }: detailIntroTypes) {
  const [detailIntro, setDetailIntro] = useState([]);

  useEffect(() => {
    const fetchAreaCode = async () => {
      try {
        const res = await fetch(
          `/tourapi/${import.meta.env.VITE_OPEN_API_BASE_URL}/detailIntro1?MobileApp=AppTest&MobileOS=ETC&pageNo=1&numOfRows=17&_type=json&serviceKey=${import.meta.env.VITE_OPEN_API_KEY}&contentId=${contentId}&contentTypeId=${contentTypeId}`,
        );
        const data = await res.json();
        const items = data?.response?.body?.items?.item ?? [];
        setDetailIntro(items);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAreaCode();
  }, [contentId, contentTypeId]);

  return detailIntro;
}

export { useGetDetailIntro };
