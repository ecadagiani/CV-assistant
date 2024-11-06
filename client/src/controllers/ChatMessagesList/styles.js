import { GUTTER, TIMELINE_GAP } from 'src/styles';
import styled from 'styled-components';

export const ScrollContainer = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  height: 100vh;
  padding: ${GUTTER};
`;

export const MessagesContainer = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: ${TIMELINE_GAP};
`;

export const FormSpacerBlock = styled.div`
  box-sizing: content-box;
`;
