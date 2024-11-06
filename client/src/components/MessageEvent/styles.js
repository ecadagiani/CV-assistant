import styled from 'styled-components';

import { BubbleContainer } from 'src/components/MessageBubble/styles';
import {
  DEVICE,
  FONT_SIZE,
  FONT_WEIGHT,
  GUTTER,
} from 'src/styles';
import { Swiper } from 'swiper/react';

export const BubbleEventContainer = styled(BubbleContainer)`
  padding-bottom: ${GUTTER};
`;

export const DescriptionBlock = styled.div`
  position: relative;
`;

export const Title = styled.h2`
  font-size: ${FONT_SIZE.large};
  font-weight: ${FONT_WEIGHT.bold};
  padding-bottom: ${GUTTER};
`;

export const Date = styled.span`
  font-size: ${FONT_SIZE.small};
  font-weight: ${FONT_WEIGHT.light};
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  text-align: right;
`;

export const LocaleDate = styled.span`
`;
export const DateDuration = styled.span`
`;

export const TitleSkillIconContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${GUTTER};
  padding-bottom: ${GUTTER};
  padding-left: calc(${GUTTER} / 2);
`;

export const TitleSkillIcon = styled.img`
  display: inline-block;
  width: 2em;
  height: 2em;
`;

export const Description = styled.div`
  text-align: justify;
`;

const skillUsageBarHeight = '1em';
export const SkillUsageBarContainer = styled.ul`
  list-style: none;
  width: 100%;
  padding: 0;

  & > *:first-child {
    border-top-left-radius: calc(${skillUsageBarHeight} / 2);
    border-bottom-left-radius: calc(${skillUsageBarHeight} / 2);
  }
  // round last child
  & > *:last-child {
    border-top-right-radius: calc(${skillUsageBarHeight} / 2);
    border-bottom-right-radius: calc(${skillUsageBarHeight} / 2);
  }

  display: none;
  @media ${DEVICE.tablet}{
    display: flex;
  }
`;
export const SkillUsageBarItem = styled.li`
  width: ${({ $ratio }) => $ratio * 100}%;
  background-color: ${({ $color }) => $color};
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3em;
  padding: 0 2px;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;

export const SkillUsageBarIcons = styled.img`
  height: 2em;
  width: 2em;
  object-fit: contain;
  // filter to update to white
  filter: invert(100%) grayscale(100%) brightness(800%);
`;

export const SkillTextContainer = styled.ul`
  list-style: none;
  padding: ${GUTTER};
  margin: 0;
`;

export const SkillTextItem = styled.li`
  display: flex;
  gap: calc(${GUTTER} / 2);
  padding-bottom: ${GUTTER};

  &.highlighted{
    // font-weight: ${FONT_WEIGHT.bold};
  }

  &:first-child {
    padding-bottom: calc(${GUTTER} * 2);
  }
`;

export const SkillTextIcon = styled.img`
  display: inline-block;
  width: 2em;
  height: 2em;
`;

export const SkillTextText = styled.div`
  text-align: justify;
`;

export const SkillTextTitle = styled.span`
  font-weight: ${FONT_WEIGHT.bold};

  &::after {
    content: ': ';
  }
`;
export const SlideContainer = styled.div`
  width: 60vw;
  min-width: 100%;
`;

export const Slide = styled(Swiper)`
  overflow: visible;
  .swiper-pagination {
    top: calc(100% + (${GUTTER} / 2));
    bottom: unset;
  }
  .swiper-button-prev, .swiper-button-next {

    &.swiper-button-prev{
      right: 75%;
      left: unset;
    }
    &.swiper-button-next{
      left: 75%;
      right: unset;
    }
      
    top: 0;
    height: 100%;
    width: 100%;
    &:after {
      content: '';
    }
    &:focus {
      outline: none;
    }

    display: none;
    @media ${DEVICE.tablet} {
      display: block;
    }
  }

  .swiper-slide{
    ${({ $width }) => $width && `
      width: ${$width};
    `}
  }
`;
