import Color from 'color';

import { BubbleContainer } from 'src/components/MessageBubble/styles';
import {
  DEVICE, FONT_SIZE, GUTTER,
} from 'src/styles';
import { bubbleOpaqueStyle } from 'src/styles/base/bubble';
import { colors } from 'src/styles/colors';
import styled, { css } from 'styled-components';

const desktopSkillVar = {
  UNIT: 'px',
  ROW_SIZE: 100,
  COL_SIZE: 105,
  BORDER_COLOR: '#101010',
  LINK_DIAG_OFFSET: 50,
  LINK_DIAG_OFFSET_DIRTY_ADJUSTMENT: 1,
  LINK_THICKNESS: 0.6,
  SKILL_BORDER_THICKNESS: 1,
  SKILL_DIAMETER: 50,
  SKILL_IMAGE_PADDING: 2,
  SKILL_NAME_PADDING: 1,
  SKILL_POINT_SIZE: 12,
  SKILL_POINT_PADDING: 12,
  SKILL_FONT_SIZE: FONT_SIZE.medium,
};

const mobileSkillVar = {
  ...desktopSkillVar,
  ROW_SIZE: 70,
  COL_SIZE: 70,
  LINK_DIAG_OFFSET: 35,
  LINK_DIAG_OFFSET_DIRTY_ADJUSTMENT: 1,
  LINK_THICKNESS: 0.5,
  SKILL_BORDER_THICKNESS: 0.8,
  SKILL_DIAMETER: 30,
  SKILL_IMAGE_PADDING: 2,
  SKILL_NAME_PADDING: 1,
  SKILL_POINT_SIZE: 8,
  SKILL_POINT_PADDING: 8,
  SKILL_FONT_SIZE: FONT_SIZE.small,
};

function getCssSkillVariables(v = desktopSkillVar) {
  const diagonalLength = Math.sqrt((v.ROW_SIZE ** 2) + (v.COL_SIZE ** 2));
  const linkDiagonalLength = diagonalLength - ((v.LINK_DIAG_OFFSET / v.ROW_SIZE) * diagonalLength);
  // eslint-disable-next-line max-len
  const linkDiagonalOffsetLength = ((v.LINK_DIAG_OFFSET / v.ROW_SIZE) * v.COL_SIZE) - v.LINK_DIAG_OFFSET_DIRTY_ADJUSTMENT;
  const skillPointTranslate = (v.SKILL_DIAMETER / 2) + v.SKILL_POINT_PADDING;
  const skillImageSize = (Math.cos(Math.PI / 4) * v.SKILL_DIAMETER) - (v.SKILL_IMAGE_PADDING * 2);

  return css`
    --row_size: ${v.ROW_SIZE}${v.UNIT};
    --col_size: ${v.COL_SIZE}${v.UNIT};
    --link_diagonal_length: ${linkDiagonalLength}${v.UNIT};
    --link_diagonal_offset_length: ${linkDiagonalOffsetLength}${v.UNIT};

    --link_thickness: ${v.LINK_THICKNESS}${v.UNIT};
    --skill_border_thickness: ${v.SKILL_BORDER_THICKNESS}${v.UNIT};
    --skill_diameter: ${v.SKILL_DIAMETER}${v.UNIT};
    --skill_point_translate: ${skillPointTranslate}${v.UNIT};
    --skill_image_size: ${skillImageSize}${v.UNIT};
    --skill_name_padding: ${v.SKILL_NAME_PADDING}${v.UNIT};
    --skill_point_size: ${v.SKILL_POINT_SIZE}${v.UNIT};
    --skill_font_size: ${v.SKILL_FONT_SIZE};

    --border_color: ${v.BORDER_COLOR};
    --link_color: ${Color(v.BORDER_COLOR).lighten(10).hex()};
  `;
}

function getYOffset(y) {
  return `calc(var(--row_size) * ${y} + (var(--row_size) / 2))`;
}

function getXOffset(x) {
  return `calc(var(--col_size) * ${x} + (var(--col_size) / 2))`;
}

function getSkillPointAngle(position) {
  const skillPointAngle = 30;
  return position * skillPointAngle - (180 + (skillPointAngle * 2));
}

export const SkillsContainer = styled(BubbleContainer)`
  ${getCssSkillVariables(mobileSkillVar)}
  justify-content: center;

  @media ${DEVICE.tablet} {
    justify-content: flex-start;
    ${getCssSkillVariables(desktopSkillVar)}
  }
`;

export const SwiperContainer = styled.div`
  max-width: 250px;
  @media ${DEVICE.tablet} {
    max-width: 400px;
  }

  padding-bottom: calc(${GUTTER} + 25px);
  .swiper {
    margin: 0;
    overflow: visible;
  }
  .swiper-slide {
    overflow: visible;
  }
  .swiper-pagination {
    top: calc(100% + (${GUTTER} / 2));
    bottom: unset;
  }
  .swiper-button-prev, .swiper-button-next {
    top: 0;
    height: 100%;
    width: 50px;
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
`;

export const SkillCard = styled.div`
  ${bubbleOpaqueStyle};
  overflow: hidden;
`;

export const SkillTree = styled.div`
  position: relative;
  margin: 0 auto;
  width: calc(var(--col_size) * ${(props) => props.$nbColumns});
  height: calc(var(--row_size) * ${(props) => props.$nbRows});
`;

export const SkillTreeItem = styled.div`
  position: absolute;

  left: ${(props) => getXOffset(props.$x)};
  top: ${(props) => getYOffset(props.$y)};
  transform: translateX(-50%) translateY(-50%);
`;

const Link = styled.span`
  position: absolute;
  background-color: var(--link_color);
`;

export const LinkVertical = styled(Link)`
  width: var(--link_thickness);
  height: var(--row_size);
  left: ${(props) => getXOffset(props.$fromPos.x)};
  top: ${(props) => getYOffset(props.$fromPos.y)};
  transform: translateX(-50%);
`;

export const LinkDiagonal = styled(Link)`
  height: var(--link_diagonal_length);
  width: var(--link_thickness);
  left: ${(props) => getXOffset(props.$toPos.x)};
  top: ${(props) => getYOffset(props.$toPos.y)};
  transform-origin: top;
  transform: rotate(${(props) => (props.$fromPos.x < props.$toPos.x ? 135 : -135)}deg);

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    width: var(--link_diagonal_offset_length);
    height: var(--link_thickness);
    background-color: var(--link_color);
    ${(props) => (
    props.$fromPos.x < props.$toPos.x
      ? `
        left: 0;
        transform-origin: left;
        transform: rotate(45deg) translateY(-50%);
      ` : `
        right: 0;
        transform-origin: right;
        transform: rotate(-45deg) translateY(-50%);
      `)}
  }
`;

export const SkillCircle = styled.div`
  border: var(--skill_border_thickness) solid var(--border_color);
  background-color: white;
  border-radius: 50%;
  height: var(--skill_diameter);
  width: var(--skill_diameter);

  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  font-size: ${FONT_SIZE.small};
`;

export const SkillName = styled.p`
  display: inline-block;
  position: absolute;
  top: 100%;
  text-align: center;
  overflow: visible;
  white-space: nowrap;
  padding: var(--skill_name_padding) 0;
  color: var(--border_color);
  font-size: var(--skill_font_size);

  ${({ $shrinkText }) => $shrinkText && `
    max-width: 200%;
    overflow: hidden;
    text-overflow: ellipsis;
  `}

  ${({ $highlight }) => $highlight && `
    font-weight: bold;
  `}
`;

export const SkillImage = styled.img`
  height: calc(var(--skill_image_size) * ${(props) => props.$transformImageSize});
  width: calc(var(--skill_image_size) * ${(props) => props.$transformImageSize});
  overflow: hidden;
  object-fit: contain;
`;

export const SkillPoint = styled.span`
  display: block;
  border: var(--skill_border_thickness) solid var(--border_color);
  box-sizing: border-box;
  background-color: ${(props) => (props.$isAchieve ? 'var(--border_color)' : colors.system.textBackground)};
  height: var(--skill_point_size);
  width: var(--skill_point_size);
  border-radius: 50%;
  position: absolute;
  top:  calc(50% - var(--skill_point_size) / 2); 
  left: calc(50% - var(--skill_point_size) / 2);
  
  transform:
      rotate(${({ $position }) => getSkillPointAngle($position)}deg)
      translateY(var(--skill_point_translate));
`;
