import { useEffect, useState } from 'react';

interface PetTourItemType {
  acmpyNeedMtr: string;
  acmpyPsblCpam: string;
  acmpyTypeCd: string;
  contentid: string;
  etcAcmpyInfo: string;
  petTursmInfo: string;
  relaAcdntRiskMtr: string;
  relaFrnshPrdlst: string;
  relaPosesFclty: string;
  relaPurcPrdlst: string;
  relaRntlPrdlst: string;
}

function useGetDetailPetTour() {
  const [petTourInfo, setPetTourInfo] = useState<PetTourItemType[]>([]);

  useEffect(() => {
    const fetchPetTourInfo = async () => {
      try {
        const res = await fetch(
          `/tourapi/${import.meta.env.VITE_OPEN_API_BASE_URL}/detailPetTour2?serviceKey=${import.meta.env.VITE_OPEN_API_KEY}&MobileOS=ETC&MobileApp=polzzak&_type=json`,
        );

        const data = await res.json();
        const items = data?.response?.body?.items?.item ?? [];

        setPetTourInfo(items);
      } catch (err) {
        console.error('⚠️ 데이터를 불러오는 중 오류 발생:', err);
      }
    };

    fetchPetTourInfo();
  }, []);

  return petTourInfo;
}

export { useGetDetailPetTour };
