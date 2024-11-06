import { bubbleGlassStyle } from 'src/styles/base/bubble';
import { timelineMessageContainerStyle } from 'src/styles/base/timelineContainer';
import { colors } from 'src/styles/colors';
import styled from 'styled-components';

export const LoaderContainer = styled.div`
  ${timelineMessageContainerStyle}
`;
export const Loader = styled.div`
  ${bubbleGlassStyle}
  display: inline-block;
`;

export const LoaderContent = styled.div`
  width: 2em;
  aspect-ratio: 2;
  --_g: no-repeat radial-gradient(circle closest-side, ${colors.system.text} 90%, #0000);
  background: 
    var(--_g) 0%   50%,
    var(--_g) 50%  50%,
    var(--_g) 100% 50%;
  background-size: calc(100%/3) 50%;
  animation: dot_loader 1s infinite linear;

  @keyframes dot_loader {
    20%{background-position:0%   0%, 50%  50%,100%  50%}
    40%{background-position:0% 100%, 50%   0%,100%  50%}
    60%{background-position:0%  50%, 50% 100%,100%   0%}
    80%{background-position:0%  50%, 50%  50%,100% 100%}
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
