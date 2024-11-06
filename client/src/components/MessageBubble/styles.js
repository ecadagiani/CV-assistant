import { DateContainer } from 'src/components/DateMessagePopover/styles';
import { bubbleGlassStyle } from 'src/styles/base/bubble';
import { timelineMessageContainerStyle } from 'src/styles/base/timelineContainer';
import styled from 'styled-components';

export const BubbleContainer = styled.div`
  ${timelineMessageContainerStyle}

  display: flex;
  justify-content: ${(props) => (props.$isOwn ? 'flex-end' : 'flex-start')};
  text-align: ${(props) => (props.$isOwn ? 'right' : 'left')};

  position: relative;
  ${DateContainer} {
    ${(props) => (props.$isOwn ? 'right: 0;' : 'left: 0;')}
  }
`;

export const Bubble = styled.div`
  ${bubbleGlassStyle}
  display: inline-block;
  min-width: 60%;
  max-width: 80%;
  text-align: justify;
  overflow-wrap: break-word;
  // white-space: pre-wrap; // this lead to big space (not resizable) between each line

  pre, code {
    overflow: hidden;
  }
`;
