import { Link } from 'react-router-dom';

import { CarouselItem } from '@/components/Home/Carousel';

import RabbitFace from '../RabbitFace/RabbitFace';

export interface ThemeItem {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
}

function ThemeItemCard({ item }: { item: ThemeItem }) {
  const { contentid, firstimage, title, addr1 } = item;

  return (
    <CarouselItem className="shrink-0 basis-[150px]">
      {/* 상세페이지 생성 후 수정 */}
      <Link to={`/contents/${contentid}`}>
        <figure>
          <div className="bg-primary/10 flex aspect-[4/3] w-full items-center justify-center rounded-md">
            {firstimage ? (
              <img
                src={firstimage}
                alt={title}
                className="aspect-[4/3] w-full rounded-md object-cover object-center"
              />
            ) : (
              <RabbitFace alt="이미지 준비 중입니다." size={55} />
            )}
          </div>
          <figcaption className="mt-2 px-1">
            <p className="fs-14 lh truncate font-medium">{title}</p>
            <p className="fs-13 text-gray06 lh truncate">{addr1}</p>
          </figcaption>
        </figure>
      </Link>
    </CarouselItem>
  );
}

export default ThemeItemCard;
