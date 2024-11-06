import PropTypes from 'prop-types';
import React from 'react';
import {
  EffectCards, Keyboard, Navigation, Pagination,
} from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import MessageLine from 'src/components/MessageLine';
import SkillColumn from './SkillColumn';
import { SkillsContainer, SwiperContainer } from './styles';

// eslint-disable-next-line no-unused-vars
function Skills({ skillsData, date }) {
  return (
    <MessageLine>
      <SkillsContainer>
        <SwiperContainer>
          <Swiper
            effect="cards"
            grabCursor
            modules={[Keyboard, Pagination, Navigation, EffectCards]}
            cardsEffect={{
              slideShadows: false,
            }}
            rewind
            centeredSlides
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
          >
            {skillsData.map(({ skills, links, key }) => (
              <SwiperSlide
                key={key}
              >
                <SkillColumn
                  skills={skills}
                  skillLinks={links}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </SwiperContainer>
      </SkillsContainer>
    </MessageLine>
  );
}

Skills.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  skillsData: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    skills: PropTypes.objectOf(PropTypes.shape({
      item: PropTypes.shape({
        name: PropTypes.string.isRequired,
        tooltipText: PropTypes.string,
        image: PropTypes.string.isRequired,
        transformImageSize: PropTypes.number,
        score: PropTypes.number.isRequired,
        highlight: PropTypes.bool,
        shrinkText: PropTypes.bool,
      }),
      variant: PropTypes.shape({
        name: PropTypes.string.isRequired,
        tooltipText: PropTypes.string,
        image: PropTypes.string.isRequired,
        transformImageSize: PropTypes.number,
        score: PropTypes.number.isRequired,
        highlight: PropTypes.bool,
        shrinkText: PropTypes.bool,
      }),
    })).isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    })).isRequired,
  })).isRequired,
};

const MemoizedSkills = React.memo(Skills);
export default MemoizedSkills;
