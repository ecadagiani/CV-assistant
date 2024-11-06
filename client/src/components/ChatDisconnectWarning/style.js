import {
  BORDER_RADIUS,
  FONT_SIZE, FONT_WEIGHT, GUTTER,
} from 'src/styles';
import { colors } from 'src/styles/colors';
import styled from 'styled-components';

export const DisconnectContainer = styled.div`
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  backdrop-filter: blur(2px);
  padding: ${GUTTER};
  border-radius: ${BORDER_RADIUS.medium};
`;
export const DisconnectBlock = styled.div`
  color: ${colors.system.warningText};
  font-weight: ${FONT_WEIGHT.bold};
  font-size: ${FONT_SIZE.medium};
  // upper case 
  text-transform: uppercase;

  svg {
    display: inline-block;
    width: 2em;
    height: 2em;
    box-sizing: content-box;
    padding-right: 0.4em;
    vertical-align: text-bottom;

    fill: ${colors.system.warningText};
  }
`;
