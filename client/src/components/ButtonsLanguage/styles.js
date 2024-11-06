import Color from 'color';
import { GUTTER, SHADOWS } from 'src/styles';
import { bubbleGlassStyle } from 'src/styles/base/bubble';
import { buttonStyle } from 'src/styles/base/button';
import { timelineMessageContainerStyle } from 'src/styles/base/timelineContainer';
import { colors } from 'src/styles/colors';
import styled from 'styled-components';

export const ButtonsLanguageTimelineContainer = styled.div`
  ${timelineMessageContainerStyle}
  display: flex;
`;
export const ButtonsLanguageContainer = styled.div`
  display: flex;
  gap: ${GUTTER};
`;
export const Button = styled.button`
  ${buttonStyle}
  ${bubbleGlassStyle}

  display: flex;
  align-items: center;
  justify-content: center;
  width: 2em;
  height: 2em;
  font-size: 1.5em;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: ${SHADOWS.medium};

  &:hover {
    ${({ $selected }) => (!$selected && `
    box-shadow: ${SHADOWS.small};
    `)}
  }

  ${({ $selected }) => $selected && `
    border: 1.8px solid rgba(255, 255, 255, 0.30);
    box-shadow: ${SHADOWS.elevations.inset}, ${SHADOWS.medium};
  `}

  ${({ $selected }) => !$selected && `
    background: ${Color(colors.system.bubble).fade(0.1).rgb()
    .string()};
  `}
`;
