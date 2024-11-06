import { GUTTER, ZINDEX } from 'src/styles';
import { timelineContainerStyle } from 'src/styles/base/timelineContainer';
import styled from 'styled-components';

export const ChatContainer = styled.div`
  padding: 0;
  height: 100vh;
  overflow: hidden;
`;

export const BottomContainer = styled.div`
  ${timelineContainerStyle}
  z-index: ${ZINDEX.bottomContainer};
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 calc(${GUTTER} / 2);
  padding-bottom: calc(env(safe-area-inset-bottom) + ${GUTTER});
`;
