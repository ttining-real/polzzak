import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchContentDetail } from '@/api/openAPI/utils/fetchContentDetail';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import RabbitFace from '@/components/RabbitFace/RabbitFace';
import { useSearchStore } from '@/store/useSearchStore';

export interface ListItemProps {
  [key: string]: string;
  // contentid: string;
  // contenttypeid: string;
  // title: string;
  // addr1: string;
  // image: string;
  // eventstartdate: string;
  // eventenddate: string;
  // opentimefood: string;
  // usetime: string;
  // usetimeleports: string;
  // usetimeculture: string;
  // opentime: string;
  // checkintime: string;
  // checkouttime: string;
  // restdate: string;
  // reviews: number;
  // likes: number;
}

interface ListItemData {
  data: ListItemProps[];
}

function ListItem({ data }: ListItemData) {
  const navigate = useNavigate();
  const { detailData, setDetailData } = useSearchStore();
  const handleFavorite = (contentid: string) => {
    console.log(`즐겨찾기 저장!, ${contentid}`);
  };
  const getAddress = (address: string = '') => {
    const addressStr = address || '';
    const [city = '', province = ''] = addressStr.split(' ');
    return { city, province };
  };

  useEffect(() => {
    const fetchDetails = async () => {
      const results: ListItemProps[] = await Promise.all(
        data.map(async (item) => {
          const detail = await fetchContentDetail(
            item.contentid!,
            item.contenttypeid!,
            true,
          );
          return {
            ...detail,
            contentid: item.contentid,
          };
        }),
      );
      setDetailData(results);
    };

    fetchDetails();
  }, [data, setDetailData]);

  const changeDate = (date: string) => {
    const yy = date.slice(0, 4);
    const mm = date.slice(4, 6);
    const dd = date.slice(6, 8);
    return `${yy}.${mm}.${dd}`;
  };
  const handleMoveDetail = (id: string) => {
    navigate(`/contents/${id}`);
  };

  console.log(data);

  return (
    <ul className="flex flex-col gap-6">
      {detailData.map((item, index) => {
        const { city, province } = getAddress(item?.addr1);
        const time = [
          item.opentimefood,
          item.usetime,
          item.usetimeleports,
          item.usetimeculture,
          item.opentime,
          item.restdate,
        ];

        return (
          <li
            key={`${item.contentid}-${index}`}
            onClick={() => handleMoveDetail(item.contentid)}
          >
            <div className="flex-start relative flex w-full items-center gap-4">
              <div className="bg-primary/10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl object-cover">
                {item.image === '' ? (
                  <RabbitFace alt="이미지 준비 중입니다." />
                ) : (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full"
                  />
                )}
              </div>
              <div className="flex w-0 flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <h3
                    className="fs-14 ls lh w-full truncate font-semibold text-black"
                    aria-label={item.title}
                  >
                    {item.title}
                  </h3>
                  <Button
                    variant="tertiary"
                    size="md"
                    className='m-0.5 h-6 w-6 [&_svg:not([class*="size-"])]:size-5'
                    onClick={(e) => {
                      e.preventDefault();
                      handleFavorite(item.contentid);
                    }}
                    // aria-label={isCheck ? '즐겨찾기 취소' : '즐겨찾기 추가'}
                    aria-live="polite"
                  >
                    <Icon
                      id={
                        // isCheck[item.contentid] ? 'favorite_on' : 'favorite_off'
                        !item.contentid ? 'favorite_on' : 'favorite_off'
                      }
                      className="text-primary"
                    />
                  </Button>
                </div>
                <>
                  {time.map(
                    (text, index) =>
                      text && (
                        <span
                          className="fs-14 ls lh font-regular text-gray07"
                          key={index}
                        >
                          {text}
                        </span>
                      ),
                  )}
                  {item.eventstartdate && (
                    <span className="fs-14 ls lh font-regular text-gray07">
                      {changeDate(item?.eventstartdate)} &#126;{' '}
                      {changeDate(item?.eventenddate)}
                    </span>
                  )}
                  {item.checkintime && (
                    <span className="fs-14 ls lh font-regular text-gray07">
                      {`체크인 : ${item?.checkintime}, 체크아웃 : ${item?.checkouttime}`}
                    </span>
                  )}
                </>
                {item.addr1 && (
                  <span className="fs-14 ls lh font-regular text-gray07 inline-flex items-center">
                    {city}
                    <Icon
                      id="chevron_right"
                      size={16}
                      className="text-gray07"
                    />
                    {province}
                  </span>
                )}
                <dl className="fs-14 ls lh font-regular text-gray07 flex items-center gap-2">
                  <div
                    className="flex items-center gap-1"
                    aria-label="즐겨찾기 수"
                  >
                    <dt>
                      <Icon id="favorite_off" size={16} />
                    </dt>
                    <dd className="align-top">
                      {/* {item.likes >= 999 ? '999+' : item.likes} */}
                    </dd>
                  </div>
                  <div className="flex items-center gap-1" aria-label="리뷰 수">
                    <dt>
                      <Icon id="review" size={16} />
                    </dt>
                    <dd>
                      {/* {item.reviews >= 999 ? '999+' : item.reviews} */}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default ListItem;
