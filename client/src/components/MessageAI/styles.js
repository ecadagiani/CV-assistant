import { Bubble } from 'src/components/MessageBubble/styles';
import {
  FONT_SIZE, FONT_WEIGHT, GUTTER, SHADOWS,
} from 'src/styles';
import { colors } from 'src/styles/colors';

import styled from 'styled-components';

export const BubbleAI = styled(Bubble)`

`;

export const AIBadge = styled.span`
  display: flex;  
  align-items: center;
  gap: 0.25rem;
  position: absolute;
  border-radius: calc(${FONT_SIZE.small} + ${GUTTER} / 2);
  padding: 0 calc(${GUTTER} / 1.5);
  background-color: ${colors.grey5};
  color: #fff;
  font-size: ${FONT_SIZE.small};
  height: calc(${FONT_SIZE.small} + ${GUTTER} / 2 );
  bottom: 0;
  right: 0;
  transform: translate(-100%, 50%);
  cursor: pointer;
  box-shadow: ${SHADOWS.small};
  font-weight: ${FONT_WEIGHT.bold};

  svg{
    width: 1rem;
    height: 1rem;
  }
`;
