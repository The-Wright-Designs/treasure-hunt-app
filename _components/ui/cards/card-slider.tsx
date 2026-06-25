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
        className="bg-white rounded-[6px]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <p className="h-full p-3 pb-10">{slide}</p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardSlider;
