import styled, { css } from 'styled-components';

import {
  DEVICE,
  FONT_SIZE, FONT_WEIGHT,
  SHADOWS,
} from 'src/styles';
import { bubbleGlassStyle } from 'src/styles/base/bubble';
import { buttonStyle } from 'src/styles/base/button';
import { timelineMessageContainerStyle } from 'src/styles/base/timelineContainer';
import { colors } from 'src/styles/colors';

export const zIndex = {
  EVENT_LINK: 1,
  EVENT_LINE: 1,
  EVENT_POINT: 1,
  EVENT_LINE_TITLE: 2,
  EVENT_CARD: 3,
};

const desktopTimelineVar = {
  UNIT: 'px',
  PADDING_TOP: 20,
  PADDING_BOTTOM: 0,
  MONTH_HEIGHT: 140,
  SCALE_THICKNESS: 1,
  SCALE_COLOR: '#000',
  SCALE_LEFT_PADDING: '5rem',
  GRADUATIONS_WIDTH: 7,
  GRADUATIONS_NAME_PADDING: 8,
  GRADUATION_LIMIT_LENGTH: 5,
  GRADUATION_SKIP_DASH_LENGTH: 6,
  GRADUATION_SKIP_DASH_SPACE: 4,
  EVENT_LINE_THICKNESS: 16,
  EVENT_LINE_GAP: 10,
  EVENT_LINE_TITLE_COLOR: '#fff',
  EVENT_LINE_TITLE_WRITING_MODE: 'lr',
  EVENT_LINE_TITLE_TRANSFORM: 'translateY(-50%)',
  EVENT_LINE_SKIP_DASH_LENGTH: 12,
  EVENT_LINE_SKIP_DASH_SPACE: 20,
  EVENT_POINT_COLOR: '#fff',
  EVENT_POINT_SIZE: 12,
  EVENT_LINK_THICKNESS: 1,
  EVENT_LINK_COLOR: '#000',
  EVENT_LINK_MIN_WIDTH: 50,
  EVENT_LINK_MAX_WIDTH: 200,
  EVENT_CARD_LINK_OFFSET: -22,
  EVENT_CARD_MIN_WIDTH: 260,
  EVENT_CARD_MAX_WIDTH: 600,
  EVENT_CARD_GUTTER: '0.4rem',
  EVENT_CARD_TITLE_SIZE: FONT_SIZE.medium,
  EVENT_CARD_ICON_TITLE_SIZE: '1.5rem', // FONT_SIZE.large,
  EVENT_CARD_SKILL_ICON_SIZE: FONT_SIZE.large,
  EVENT_CARD_DURATION_SIZE: FONT_SIZE.small,
  EVENT_CARD_TEXT_SIZE: FONT_SIZE.small,
};

const mobileTimelineVar = {
  ...desktopTimelineVar,
  MONTH_HEIGHT: 230,
  SCALE_LEFT_PADDING: '1.5rem',
  EVENT_LINE_TITLE_WRITING_MODE: 'tb-rl',
  EVENT_LINE_SKIP_DASH_LENGTH: 30,
  EVENT_LINE_SKIP_DASH_SPACE: 25,
  EVENT_LINK_MIN_WIDTH: 30,
  EVENT_LINK_MAX_WIDTH: 200,
  EVENT_CARD_MIN_WIDTH: 180,
  EVENT_CARD_MAX_WIDTH: 500,
};

function getCssTimelineVariables(v = desktopTimelineVar) {
  return css`
    --padding_top: ${v.PADDING_TOP}${v.UNIT};
    --padding_bottom: ${v.PADDING_BOTTOM}${v.UNIT};
    --month_height: ${v.MONTH_HEIGHT}${v.UNIT};
    --scale_thickness: ${v.SCALE_THICKNESS}${v.UNIT};
    --scale_color: ${v.SCALE_COLOR};
    --scale_left_padding: ${v.SCALE_LEFT_PADDING};
    --graduations_width: ${v.GRADUATIONS_WIDTH}${v.UNIT};
    --graduations_left: -${Math.floor(v.GRADUATIONS_WIDTH / 2)}${v.UNIT};
    --graduations_name_padding: ${v.GRADUATIONS_NAME_PADDING}${v.UNIT};
    --graduation_limit_length: ${v.GRADUATION_LIMIT_LENGTH}${v.UNIT};
    --graduation_skip_dash_length: ${v.GRADUATION_SKIP_DASH_LENGTH}${v.UNIT};
    --graduation_skip_dash_space: ${v.GRADUATION_SKIP_DASH_SPACE}${v.UNIT};
    --event_line_thickness: ${v.EVENT_LINE_THICKNESS}${v.UNIT};
    --event_line_gap: ${v.EVENT_LINE_GAP}${v.UNIT};
    --event_line_title_color: ${v.EVENT_LINE_TITLE_COLOR};
    --event_line_title_writing_mode: ${v.EVENT_LINE_TITLE_WRITING_MODE};
    --event_line_title_transform: ${v.EVENT_LINE_TITLE_TRANSFORM};
    --event_line_skip_dash_length: ${v.EVENT_LINE_SKIP_DASH_LENGTH}${v.UNIT};
    --event_line_skip_dash_space: ${v.EVENT_LINE_SKIP_DASH_SPACE}${v.UNIT};
    --event_point_size: ${v.EVENT_POINT_SIZE}${v.UNIT};
    --event_point_color: ${v.EVENT_POINT_COLOR};
    --event_link_thickness: ${v.EVENT_LINK_THICKNESS}${v.UNIT};
    --event_link_color: ${v.EVENT_LINK_COLOR};
    --event_link_min_width: ${v.EVENT_LINK_MIN_WIDTH}${v.UNIT};
    --event_link_max_width: ${v.EVENT_LINK_MAX_WIDTH}${v.UNIT};
    --event_card_gutter: ${v.EVENT_CARD_GUTTER};
    --event_card_link_offset: ${v.EVENT_CARD_LINK_OFFSET}${v.UNIT};
    --event_card_min_width: ${v.EVENT_CARD_MIN_WIDTH}${v.UNIT};
    --event_card_max_width: ${v.EVENT_CARD_MAX_WIDTH}${v.UNIT};
    --event_card_icon_title_size: ${v.EVENT_CARD_ICON_TITLE_SIZE};
    --event_card_title_size: ${v.EVENT_CARD_TITLE_SIZE};
    --event_card_skill_icon_size: ${v.EVENT_CARD_SKILL_ICON_SIZE};
    --event_card_duration_size: ${v.EVENT_CARD_DURATION_SIZE};
    --event_card_text_size: ${v.EVENT_CARD_TEXT_SIZE};
  `;
}

export function getEventLineLeft(timelinePosition) {
  // eslint-disable-next-line max-len
  return `calc(var(--scale_left_padding) + var(--event_line_gap) * ${timelinePosition} + var(--event_line_thickness) * ${timelinePosition - 1})`;
}

export function getEventPointLeft(timelinePosition) {
  return `calc(
      var(--scale_left_padding)
      + var(--event_line_gap) * ${timelinePosition}
      + var(--event_line_thickness) * ${Math.max(timelinePosition - 1, 0)}
      + (var(--event_line_thickness) / 2) * ${timelinePosition === 0 ? 0 : 1}
    )`;
}

export const TimelineContainer = styled.div`
  ${timelineMessageContainerStyle}  
  font-size: ${FONT_SIZE.small};
  padding-top: var(--padding_top);
  padding-bottom: var(--padding_bottom);

  ${getCssTimelineVariables(mobileTimelineVar)}
  @media ${DEVICE.tablet} {
    ${getCssTimelineVariables(desktopTimelineVar)}
  }
`;

export const MonthContainer = styled.div`
  position: relative;
  height: var(--month_height);
  padding-left: var(--scale_left_padding);
`;

export const LastMonthContainer = styled(MonthContainer)`
  height: var(--graduation_limit_length);
  ${({ $lastEventHeight }) => css`
    padding-bottom: calc(${$lastEventHeight}px - var(--month_height));
  `}
`;

export const GraduationLine = styled.div`
  position: relative;
  width: var(--scale_thickness);
  height: 100%;

  ${({ $isSkip }) => !$isSkip && css`
    background-color: var(--scale_color);
  `}

  ${({ $isFirst }) => $isFirst && css`
    &::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 0;
      width: var(--scale_thickness);
      height: var(--graduation_limit_length);
      background-color: var(--scale_color);
      border-top-left-radius: calc(var(--scale_thickness) / 2);
      border-top-right-radius: calc(var(--scale_thickness) / 2);
    }
  `}

`;

export const GraduationTick = styled.span`
  position: absolute;
  height: var(--scale_thickness);
  width: var(--graduations_width);
  background-color: var(--scale_color);
  border-radius: calc(var(--scale_thickness) / 2);
  top: 0;
  left: var(--graduations_left);
`;

export const GraduationName = styled.p`
  position: absolute;
  right: 0;
  top: 0;
  text-align: right;
  font-size: ${FONT_SIZE.small};
  line-height: ${FONT_SIZE.small};
  font-weight: ${FONT_WEIGHT.light};
  
  transform: var(--event_line_title_transform);
  padding-right: var(--graduations_name_padding);
  writing-mode: var(--event_line_title_writing_mode);
  `;

export const GraduationNameYear = styled.span`
  display: block;
`;

export const EventContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

  ${(props) => (props.$isLine ? css`
    left: ${getEventLineLeft(props.$timelinePosition)};
  ` : css`
    left: ${getEventPointLeft(props.$timelinePosition)};
  `)}

  ${(props) => props.$style}
`;

export const EventLineContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: var(--event_line_thickness);
  height: calc(var(--month_height) * ${(props) => props.$nbMonths});
  z-index: ${zIndex.EVENT_LINE};
  cursor: pointer;
  svg {
    overflow: visible;
    position: absolute;
    filter: ${SHADOWS.dropShadow.small};
  }
  
`;

export const EventLineTitle = styled.span`
  position: absolute;
  top: 0;
  z-index: ${zIndex.EVENT_LINE_TITLE};

  text-align: center;
  writing-mode: vertical-rl;

  padding: 1em 0;
  text-transform: uppercase;
  font-weight: ${FONT_WEIGHT.bold};
  font-size: calc(var(--event_line_thickness) - 2px);
  vertical-align: middle;
  line-height: var(--event_line_thickness);
  color: var(--event_line_title_color);
`;

export const Point = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
  width: var(--event_point_size);
  height: var(--event_point_size);
  
  z-index: ${zIndex.EVENT_POINT};
  border-radius: 50%;
  border: ${(props) => (props.$timelinePosition > 0 ? 'none' : '1px solid var(--scale_color)')};
  background-color: var(--event_point_color);

`;

export const CardLink = styled.span`
  height: var(--event_link_thickness);
  flex-grow: 1;
  background-color: var(--event_link_color);
  max-width: var(--event_link_max_width);
  min-width: var(--event_link_min_width);
  z-index: ${zIndex.EVENT_LINK};
`;

export const Card = styled.div`
  ${bubbleGlassStyle}
  position: relative;
  top: var(--event_card_link_offset);
  min-width: var(--event_card_min_width);
  max-width: var(--event_card_max_width);
  z-index: ${zIndex.EVENT_CARD};
`;

export const CardTopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: row-reverse;
  flex-wrap: wrap;
`;

export const CardTitleContainer = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const CardEventDuration = styled.span`
  align-self: flex-start;
  font-size: var(--event_card_duration_size);
  line-height: var(--event_card_duration_size);
  font-weight: ${FONT_WEIGHT.light};
`;

export const CardIcon = styled.img`
  height: var(--event_card_icon_title_size);
  width: var(--event_card_icon_title_size);

`;
export const CardTitle = styled.h3`
  font-size: var(--event_card_title_size);
  font-weight: ${FONT_WEIGHT.bold};
  padding: 0 var(--event_card_gutter);
`;

export const CardContentContainer = styled.div`
  padding: var(--event_card_gutter);
`;

export const CardSkillsIconsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--event_card_skill_icon_size) / 2);
  padding-bottom: calc(var(--event_card_gutter) / 2);
`;

export const CardSkillsIcons = styled.img`
  height: var(--event_card_skill_icon_size);
  width: var(--event_card_skill_icon_size);
`;

export const CardText = styled.div`
  font-size: var(--event_card_text_size);
  text-align: justify;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: var(--event_card_text_lines); 
  -webkit-line-clamp: var(--event_card_text_lines);
  -webkit-box-orient: vertical;
`;

export const CardReadMoreButton = styled.button`
  ${buttonStyle}
  padding-left: 0.5rem;
  color: ${colors.system.link};
  text-decoration: underline;
  text-decoration-color: ${colors.system.linkUnderline};
  
  &:hover {
    text-decoration-color: inherit;
  }
`;
