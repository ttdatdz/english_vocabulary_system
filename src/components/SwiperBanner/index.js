import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './SwiperBanner.scss';

import banner1 from '../../assets/images/Banner1.png';
import banner2 from '../../assets/images/Banner2.png';

const SwiperBanner = () => {
    return (
        <Swiper className='SwiperBanner'
            spaceBetween={30}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            modules={[Navigation, Pagination, Autoplay]}
        >
            <SwiperSlide>
                <img src={banner1} alt="Banner 1" className="SwiperBanner__banner" />
            </SwiperSlide>
            <SwiperSlide>
                <img src={banner2} alt="Banner 2" className="SwiperBanner__banner" />
            </SwiperSlide>
        </Swiper>
    );
};

export default SwiperBanner;
