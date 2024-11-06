import { bubbleOpaqueStyle } from 'src/styles/base/bubble';
import styled from 'styled-components';

export const ImageBubble = styled.div`
  ${bubbleOpaqueStyle}
  position: relative;
  padding: 0;
  overflow: hidden;
`;

export const Image = styled.img`
  object-fit: contain;
`;

export const ImageSkeleton = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  backdrop-filter: blur(10px);

  background: hsla(0, 0%, 92%, 0.8);
  background: linear-gradient(110deg, hsla(0, 0%, 92%, 0.8) 8%, hsla(0, 0%, 96%, 0.8) 18%, hsla(0, 0%, 92%, 0.8) 33%);
  background-size: 200% 100%;
  animation: 2s shine linear infinite;

  @keyframes shine {
    to {
      background-position-x: -200%;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    background: hsla(0, 0%, 92%, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
