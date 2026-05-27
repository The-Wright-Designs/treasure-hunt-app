"use client";

import classNames from "classnames";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface CardSliderProps {
  slides: string[];
  cssClasses?: string;
}

const CardSlider = ({ slides, cssClasses }: CardSliderProps) => {
  return (
    <div className={classNames("overflow-x-clip", cssClasses)}>
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ dynamicBullets: true }}
        autoplay={{ delay: 8000, disableOnInteraction: true }}
        loop={true}
        spaceBetween={20}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="bg-white rounded-[6px] p-3">
            <p className="h-[120px]">{slide}</p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardSlider;
