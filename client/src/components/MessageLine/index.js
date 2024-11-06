import styled, { keyframes } from 'styled-components';

export const messageAppearAnimation = keyframes`
  0% {
    bottom: -20px;
    opacity: 0;
  }

  100% {
    bottom: 0;
    opacity: 1;
  }
`;

const MessageLine = styled.div`
  width: 100%;
  animation: ${messageAppearAnimation} 0.4s ease-in-out;
  position: relative;
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
export default MessageLine;
