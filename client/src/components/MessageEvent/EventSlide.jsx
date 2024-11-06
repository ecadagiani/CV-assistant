import PropTypes from 'prop-types';
import {
  EffectCoverflow,
  Keyboard,
  Navigation,
  Pagination,
} from 'swiper/modules';
import { SwiperSlide } from 'swiper/react';
import * as Styled from './styles';

function EventSlide({
  title,
  captures = [],
  capturesOptions = {},
}) {
  if (captures.length === 0) return null;

  return (
    <Styled.SlideContainer>
      <Styled.Slide
        effect="coverflow"
        grabCursor
        modules={[Keyboard, Pagination, Navigation, EffectCoverflow]}
        coverflowEffect={{
          rotate: 30,
          stretch: 0,
          depth: -200,
          modifier: 0.7,
          slideShadows: true,
        }}
        pagination={{
          enabled: true,
          clickable: true,
        }}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        navigation={{
          enabled: true,
        }}
        $width={capturesOptions && capturesOptions?.width}
        centeredSlides
        slidesPerView="auto"
        rewind={captures.length > 3}
        initialSlide={1}
      >
        { captures.map((capture) => (
          <SwiperSlide key={capture}>
            <img
              src={capture}
              alt={title}
            />
          </SwiperSlide>
        ))}
      </Styled.Slide>
    </Styled.SlideContainer>
  );
}

EventSlide.propTypes = {
  title: PropTypes.string.isRequired,
  capturesOptions: PropTypes.object,
  captures: PropTypes.arrayOf(PropTypes.string),
};

export default EventSlide;
