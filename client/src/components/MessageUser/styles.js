import { FONT_SIZE, FONT_WEIGHT, GUTTER } from 'src/styles';
import { colors } from 'src/styles/colors';
import styled from 'styled-components';

export const Splitter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${GUTTER};
  
  &::before, &::after {
    content: '';
    flex: 1;  
    border-bottom: 1px solid ${colors.system.text};
  }
`;
export const SplitterText = styled.span`
  padding: 0 ${GUTTER};
  font-size: ${FONT_SIZE.large};
  font-weight: ${FONT_WEIGHT.light};
  color: ${colors.system.text};
`;
