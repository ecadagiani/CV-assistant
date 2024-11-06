import {
  BORDER_RADIUS,
  FONT_SIZE, FONT_WEIGHT, GUTTER,
  SHADOWS,
} from 'src/styles';
import { buttonStyle } from 'src/styles/base/button';
import { colors } from 'src/styles/colors';
import styled from 'styled-components';

export const AlertContainer = styled.div`
`;

export const AlertTitle = styled.h2`
  font-size: ${FONT_SIZE.large};
  font-weight: ${FONT_WEIGHT.regular};
  text-transform: uppercase;
  text-align: center;
  padding-bottom: calc(${GUTTER} / 2);
`;

export const AlertText = styled.p`
  text-align: justify;
  font-size: ${FONT_SIZE.medium};
  font-weight: ${FONT_WEIGHT.light};
  padding-bottom: calc(${GUTTER} / 2);
`;

export const AlertButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${GUTTER};
`;

export const AlertButton = styled.button`
  ${buttonStyle}
  font-weight: ${FONT_WEIGHT.regular};
  border-radius: ${BORDER_RADIUS.small};
  font-size: ${FONT_SIZE.medium};
  padding: calc(${GUTTER} / 2) ${GUTTER};

  &:hover {
    box-shadow: ${SHADOWS.small};
  }
`;

export const AlertButtonConfirm = styled(AlertButton)`
  background-color: ${colors.blue};
  color: ${colors.system.textBackground};
`;

export const AlertButtonCancel = styled(AlertButton)`
  background-color: ${colors.red};
  color: ${colors.system.textBackground};
`;
