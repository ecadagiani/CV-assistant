import { css } from 'styled-components';
import { TIMELINE_WIDTH } from '..';

export const timelineContainerStyle = css`
  max-width: ${TIMELINE_WIDTH};
  margin: 0 auto;
  width: 100%;
`;

export const timelineMessageContainerStyle = css`
  max-width: calc(${TIMELINE_WIDTH} - 25px);
  margin: 0 auto;
  width: 100%;
`;
