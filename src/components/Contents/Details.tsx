import { useEffect, useState } from 'react';

import Button from '@/components/Button/Button';
import { Review, reviewData } from '@/components/Contents/Review';
import Input from '@/components/Input/Input';

const DUMMY_DATA = [
  {
    id: '000',
    userId: 'c4ff296a-b2a1-4c33-8710-3f7efac11df1',
    userName: '홀딱벗은래빗',
    review: '여기 찐 맛집 인정ㅋㅋ',
    contentId: '3485244',
  },
  {
    id: '111',
    userId: 'aaaaaaa',
    userName: '나는야거북거북이',
    review:
      '좀 비싸긴 함.. 근데 인사에 올리기 좋음ㅎㅎ 커플끼리 오기 딱 좋아잉잉잉잉잉잉잉잉잉잉잉',
    contentId: '3485244',
  },
];

interface DetailsTypes {
  info: {
    title?: string;
    addr1?: string;
    opentimefood?: string;
    restdatefood?: string;
    infocenterfood?: string;
    firstmenu?: string;
    treatmenu?: string;
    parkingfood?: string;
    eventstartdate?: string;
    eventenddate?: string;
    sponsor1tel?: string;
    usetimefestival?: string;
    usetime?: string;
    restdate?: string;
    infocenter?: string;
    parking?: string;
    expguide?: string;
    usetimeculture?: string;
    infocenterculture?: string;
    restdateculture?: string;
    parkingfee?: string;
    usefee?: string;
    spendtime?: string;
    checkintime?: string;
    checkouttime?: string;
    infocenterlodging?: string;
    parkinglodging?: string;
    subfacility?: string;
    restdateshopping?: string;
    parkingshopping?: string;
    opentime?: string;
    restroom?: string;
    chkcreditcardshopping?: string;
    saleitem?: string;
    infocentershopping?: string;
    reservation?: string;
    usetimeleports?: string;
    parkingleports?: string;
    parkingfeeleports?: string;
  };
  data: {
    contenttypeid?: string;
    title?: string;
    addr1?: string;
    addr2?: string;
    overview?: string;
    telname?: string;
    tel?: string;
  };
  reviewRef?: React.RefObject<HTMLDivElement | null>;
  userId?: string;
}

function Details({ info, data, reviewRef, userId }: DetailsTypes) {
  const [reviewList, setReviewList] = useState<reviewData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const toggleMoreButton = () => {
    setIsOpen(!isOpen);
  };
  const changeDate = (date: string) => {
    if (!date) return;
    const yy = date.slice(0, 4);
    const mm = date.slice(4, 6);
    const dd = date.slice(6, 8);
    return `${yy}.${mm}.${dd}`;
  };

  useEffect(() => {
    setReviewList(DUMMY_DATA);
    // 서버 연결 필요
  }, []);

  const renderByContentTypeId = () => {
    if (!data.contenttypeid) return;
    switch (data.contenttypeid) {
      case '12':
        return {
          infoItems: [
            { label: '장소명', value: `${data.title}` },
            { label: '운영시간', value: `${info.usetime}` },
            { label: '휴무일', value: `${info.restdate}` },
            {
              label: '주소',
              value: data.addr2
                ? `${data.addr1} ${data.addr2}`
                : `${data.addr1}`,
            },
            { label: '문의', value: `${info.infocenter}` },
            { label: '주차여부', value: `${info.parking}` },
            { label: '체험활동', value: `${info.expguide ?? ''}` },
          ],
          overview: [
            {
              label: '관광지 소개',
              value: `${data.overview}`,
            },
          ],
        };
      case '14':
        return {
          infoItems: [
            { label: '시설명', value: `${data.title}` },
            { label: '운영시간', value: `${info.usetimeculture}` },
            { label: '휴무일', value: `${info.restdateculture}` },
            {
              label: '주소',
              value: data.addr2
                ? `${data.addr1} ${data.addr2}`
                : `${data.addr1}`,
            },
            { label: '문의', value: `${info.infocenterculture}` },
            { label: '입장료', value: `${info.usefee}` },
            { label: '소요시간', value: `${info.spendtime}` },
            { label: '주차여부', value: `${info.parkingfee}` },
          ],
          overview: [
            {
              label: '시설 소개',
              value: `${data.overview}`,
            },
          ],
        };
      case '15':
        return {
          infoItems: [
            { label: '행사명', value: `${data.title}` },
            {
              label: '운영시간',
              value: `${changeDate(info.eventstartdate ?? '')} ~ ${changeDate(info.eventenddate ?? '')}`,
            },
            { label: '휴무일', value: '1월 1일, 설날 및 추석 연휴' },
            {
              label: '주소',
              value: data.addr2
                ? `${data.addr1} ${data.addr2}`
                : `${data.addr1}`,
            },
            {
              label: '문의',
              value: `${info.sponsor1tel ? info.sponsor1tel : data.tel}`,
            },
            {
              label: '입장료',
              value: `${info.usetimefestival ? info.usetimefestival : '없음'}`,
            },
          ],
          overview: [
            {
              label: '행사 소개',
              value: `${data.overview}`,
            },
          ],
        };
      case '25':
        return {
          infoItems: [
            { label: '코스명', value: `${data.title}` },
            {
              label: '주소',
              value: data.addr2
                ? `${data.addr1} ${data.addr2}`
                : `${data.addr1}`,
            },
          ],
          overview: [
            {
              label: '코스 소개',
              value: `${data.overview}`,
            },
          ],
        };
      case '28':
        return {
          infoItems: [
            { label: '장소명', value: `${data.title}` },
            {
              label: '이용시간',
              value: `${info.usetimeleports}`,
            },
            { label: '예약', value: `${info.reservation}` },
            { label: '휴무일', value: '1월 1일, 설날 및 추석 연휴' },
            {
              label: '주소',
              value: data.addr2
                ? `${data.addr1} ${data.addr2}`
                : `${data.addr1}`,
            },
            {
              label: '문의',
              value: `${info.sponsor1tel ? info.sponsor1tel : data.tel}`,
            },
            {
              label: '입장료',
              value: `${info.usetimefestival ? info.usetimefestival : '없음'}`,
            },
            {
              label: '주차여부',
              value: `${info.parkingleports}`,
            },
            {
              label: '주차요금',
              value: `${info.parkingfeeleports}`,
            },
          ],
          overview: [
            {
              label: '장소 소개',
              value: `${data.overview}`,
            },
          ],
        };
      case '32':
        return {
          infoItems: [
            { label: '숙소명', value: `${data.title}` },
            { label: '체크인', value: `${info.checkintime}` },
            { label: '체크아웃', value: `${info.checkouttime}` },
            {
              label: '주소',
              value: data.addr2
                ? `${data.addr1} ${data.addr2}`
                : `${data.addr1}`,
            },
            { label: '문의', value: `${info.infocenterlodging}` },
            { label: '주차여부', value: `${info.parkinglodging}` },
            { label: '편의시설', value: `${info.subfacility}` },
          ],
          overview: [
            {
              label: '숙소 소개',
              value: `${data.overview}`,
            },
          ],
        };
      case '38':
        return {
          infoItems: [
            { label: '장소명', value: `${data.title}` },
            { label: '운영시간', value: `${info.opentime}` },
            { label: '휴무일', value: `${info.restdateshopping}` },
            {
              label: '주소',
              value: data.addr2
                ? `${data.addr1} ${data.addr2}`
                : `${data.addr1}`,
            },
            {
              label: '문의',
              value:
                data.telname && data.tel
                  ? `${data.telname} ${data.tel}`
                  : (info.infocentershopping ?? ''),
            },
            { label: '판매품목', value: info.saleitem ?? '' },
            { label: '카드사용', value: `${info.chkcreditcardshopping}` },
            { label: '화장실', value: `${info.restroom}` },
            { label: '주차여부', value: `${info.parkingshopping}` },
          ],
          overview: [
            {
              label: '장소 소개',
              value: `${data.overview}`,
            },
          ],
        };
      case '39':
        return {
          infoItems: [
            { label: '상호명', value: `${data.title}` },
            { label: '영업시간', value: `${info.opentimefood}` },
            { label: '휴무일', value: `${info.restdatefood}` },
            {
              label: '주소',
              value: data.addr2
                ? `${data.addr1} ${data.addr2}`
                : `${data.addr1}`,
            },
            { label: '문의', value: `${info.infocenterfood}` },
            { label: '대표메뉴', value: `${info.firstmenu}` },
            { label: '기타메뉴', value: `${info.treatmenu}` },
            { label: '주차여부', value: `${info.parkingfood}` },
          ],
          overview: [
            {
              label: '음식점 소개',
              value: `${data.overview}`,
            },
          ],
        };
      default:
        return { infoItems: [], overview: [] };
    }
  };
  const { infoItems, overview } = renderByContentTypeId() ?? {
    infoItems: [],
    overview: [],
  };

  const deleteBr = (value: string) => value.replace(/<br\s*\/?>/g, ' ');
  const handleAddReview = () => {
    // 서버 연결 필요
    setInputValue('');
    setReviewList((prev) => [
      ...prev,
      {
        id: '222',
        userId: 'c4ff296a-b2a1-4c33-8710-3f7efac11df1',
        userName: '홀딱벗은래빗',
        review: inputValue.trim(),
        contentId: '3485244',
      },
    ]);
  };

  return (
    <section className="flex flex-col gap-6">
      {/* 홈 */}
      <div className="flex flex-col gap-2">
        <h3 className="fs-14 border-b-gray03 w-full border-b border-solid p-2 font-bold text-black">
          이용안내
        </h3>
        <dl className="flex w-full flex-col gap-1 px-2">
          {infoItems
            .filter(
              (item) => (item.value && item.value.trim() !== '') || undefined,
            )
            .map((item, index) => (
              <div key={index} className="flex items-start justify-start gap-2">
                <dt className="fs-13 lh ls min-w-[50px] shrink-0 font-semibold whitespace-nowrap">
                  {item.label}
                </dt>
                <dd className="fs-13 lh ls whitespace-pre-line">
                  {deleteBr(item.value)}
                </dd>
              </div>
            ))}
        </dl>
      </div>

      {/* 추가정보 */}
      {overview.map((item, index) => (
        <div className="flex flex-col gap-2" key={index}>
          <h3 className="fs-14 border-b-gray03 w-full border-b border-solid p-2 font-bold text-black">
            {item.label}
          </h3>
          <p
            className={`fs-13 font-Regular px-2 text-black ${isOpen ? 'h-auto' : 'h-[84px] overflow-hidden'}`}
          >
            {item.value}
          </p>
          <Button
            onClick={toggleMoreButton}
            variant="tertiary"
            className="fs-13 text-gray07 font-Regular h-[1.3125rem] w-full p-0"
            aria-expanded={`${isOpen ? 'true' : 'false'}`}
          >
            {`${isOpen ? '접기' : '더보기'}`}
          </Button>
        </div>
      ))}

      {/* 리뷰 */}
      <div className="flex flex-col gap-4">
        <h3
          ref={reviewRef}
          className="fs-14 border-b-gray03 flex w-full gap-2 border-b border-solid p-2 font-bold text-black"
        >
          리뷰
          <span className="fs-13 text-primary font-semibold">
            {reviewList.length}
          </span>
        </h3>
        <div className="relative flex items-center justify-center gap-2">
          <Input
            label="리뷰 작성"
            hideLabel={true}
            placeholder={
              userId ? '리뷰를 작성해 주세요!' : '로그인 후 이용해 주세요!'
            }
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
            }}
            disabled={!userId}
          />
          <Button
            disabled={!userId || inputValue.trim() === ''}
            onClick={handleAddReview}
          >
            등록
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {reviewList.length ? (
            reviewList.map((data) => (
              <Review
                reviewId={data.id}
                userId={data.userId}
                userName={data.userName}
                review={data.review}
                currentUser={userId}
                setReviewList={setReviewList}
              />
            ))
          ) : (
            <Review />
          )}
        </div>
      </div>
    </section>
  );
}

export default Details;
