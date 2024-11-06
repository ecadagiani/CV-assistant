import Color from 'color';
import { css } from 'styled-components';
import { BORDER_RADIUS, GUTTER, SHADOWS } from '..';
import { colors } from '../colors';

export const bubbleStyle = css`
  padding: ${GUTTER};
  min-height: 2em;
  border-radius: ${BORDER_RADIUS.medium};
`;

export const bubbleGlassStyle = css`
  ${bubbleStyle}

  background: ${Color(colors.system.bubble).fade(0.4).rgb().string()};
  box-shadow: ${SHADOWS.small};
  backdrop-filter: blur(7.3px);
  -webkit-backdrop-filter: blur(7.3px);
  border: 1px solid rgba(255, 255, 255, 0.19);

  @media (prefers-reduced-transparency: reduce) {
    background: ${colors.system.bubble};
    backdrop-filter: none;
  }
`;

export const bubbleOpaqueStyle = css`
  ${bubbleStyle}

  background-color: ${colors.system.bubble};
  box-shadow: ${SHADOWS.small};
`;
