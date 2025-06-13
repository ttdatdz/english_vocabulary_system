import CardItemComment from "../CardItemComment";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './SwiperComment.scss';

export default function SwiperComment({ evaluates }) {
    return (
        <div className="swiper-comment-wrapper">
            <Swiper
                spaceBetween={20}
                centeredSlides={true}
                slidesPerView={3}
                pagination={{ clickable: true }}
                navigation
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                modules={[Navigation, Pagination, Autoplay]}
                loop={true}
                className="Container-listComments__Swiper"
            >
                {
                    (evaluates.map((item) => {
                        return (
                            <SwiperSlide><CardItemComment item={item} /></SwiperSlide>
                        )
                    }))
                }
            </Swiper>
        </div>
    );
}
