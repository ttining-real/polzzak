import { Link } from 'react-router-dom';

import { Carousel, CarouselContent } from '@/components/Home/Carousel';
import ThemeItemCard, { ThemeItem } from '@/components/Home/ThemeItemCard';

export interface ThemeItemProps {
  header: string;
  moreUrl: string;
  itemList: ThemeItem[];
}

function CarouselThemes({ header, moreUrl, itemList }: ThemeItemProps) {
  return (
    <section>
      <header className="mb-4 flex w-full justify-between px-6">
        <h3 className="fs-16 font-bold">{header}</h3>
        <Link to={moreUrl} className="fs-14">
          더보기
        </Link>
      </header>

      <Carousel>
        <CarouselContent className="gap-4 px-6">
          {itemList.map((item, idx) => (
            <ThemeItemCard key={`${item.contentid}-${idx}`} item={item} />
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

export default CarouselThemes;
