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
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="bg-white rounded-[6px] p-3 pb-8">
              <p>{slide}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardSlider;
