import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/Home/Carousel';
import RabbitFace from '@/components/RabbitFace/RabbitFace';

const banner = [
  {
    src: 'images/visual_1.png',
    alt: '친구와 함께 서울로 폴짝',
    text: ['친구와 함께', '서울로 폴짝'],
    url: '/search/result?region=서울',
  },
  {
    src: 'images/visual_2.png',
    alt: '연인과 함께 제주로 폴짝',
    text: ['연인과 함께', '제주도로 폴짝'],
    url: '/search/result?region=제주',
  },
  {
    src: 'images/visual_3.png',
    alt: '가족과 함께 부산으로 폴짝',
    text: ['가족과 함께', '부산으로 폴짝'],
    url: '/search/result?region=부산',
  },
];

function CarouselVisual() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    const handleSelect = () => setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', handleSelect);

    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

  return (
    <div className="relative">
      <Carousel
        className="h-auto min-h-[15rem] w-full"
        opts={{ loop: true }}
        setApi={setApi}
      >
        <CarouselContent>
          {banner.map((item, index) => (
            <CarouselItem key={index} className="relative">
              <Link to={item.url}>
                <h3 className="absolute bottom-[14%] left-[14%] flex flex-col gap-0 text-xl font-bold text-white sm:gap-0 sm:text-xl md:gap-1 md:text-3xl lg:text-4xl">
                  <RabbitFace
                    src="/images/rabbit.svg"
                    alt="깡총"
                    className="mb-2 w-[32px] sm:w-[32px] md:w-[48px]"
                  />
                  {item.text.map((text, index) => (
                    <p key={index}>{text}</p>
                  ))}
                </h3>
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-full min-h-[15rem] w-full"
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 py-2 text-center text-sm text-white">
        {banner.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            aria-pressed={current === index + 1}
            className={`size-2 rounded-full border border-white/20 transition-all ${
              current === index + 1 ? 'bg-primary w-4' : 'w-2 bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default CarouselVisual;
