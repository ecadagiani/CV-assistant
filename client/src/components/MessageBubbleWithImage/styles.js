import { BubbleContainer } from 'src/components/MessageBubble/styles';

import MessageLine from 'src/components/MessageLine';
import {
  DEVICE, GUTTER, TIMELINE_GAP, TIMELINE_WIDTH,
} from 'src/styles';
import { bubbleOpaqueStyle } from 'src/styles/base/bubble';
import { timelineMessageContainerStyle } from 'src/styles/base/timelineContainer';
import styled from 'styled-components';

export const MessageLineWithProfilPics = styled(MessageLine)`

  gap: ${TIMELINE_GAP};
  display: flex;
  flex-direction: column;

  @media ${DEVICE.desktop} {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0;
  }

  & ${BubbleContainer} {
    @media ${DEVICE.desktop} {
      margin: 0;
    }

  }
`;

export const ImageContainer = styled.div`
  ${timelineMessageContainerStyle}

  display: flex;
  justify-content: flex-start;

  @media ${DEVICE.desktop} {
    justify-content: flex-end;
    width: calc((100vw - ${TIMELINE_WIDTH}) / 2);
    margin: 0;
    padding-right: ${GUTTER};
  }
`;

export const Image = styled.img`
  ${bubbleOpaqueStyle}
  padding: 0;

  object-fit: cover;
  aspect-ratio: 2/3;
  max-width: 12rem;
`;
