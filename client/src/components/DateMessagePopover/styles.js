import { FONT_SIZE, GUTTER } from 'src/styles';
import styled from 'styled-components';

export const DateContainer = styled.span`
  position: absolute;
  top: calc(100% + 1px);
  display: block;
  padding: 0 ${GUTTER};
  font-size: ${FONT_SIZE.extraSmall};
`;
