import { keyframes } from 'styled-components';

export const verticalShake = ({ shakeSize = '5px', durationRatio = 1 }) => keyframes` 
  0% { transform: translateY(0) }
  ${Math.round(durationRatio * 25)}% { transform: translateY(${shakeSize}) }
  ${Math.round(durationRatio * 50)}% { transform: translateY(-${shakeSize}) }
  ${Math.round(durationRatio * 75)}% { transform: translateY(${shakeSize}) }
  ${Math.round(durationRatio * 100)}% { transform: translateY(0) } 
  100% { transform: translateY(0) }
`;

export const horizontalShake = ({ shakeSize = '5px', durationRatio = 1 }) => keyframes` 
  0% { transform: translateX(0) }
  ${Math.round(durationRatio * 25)}% { transform: translateX(${shakeSize}) }
  ${Math.round(durationRatio * 50)}% { transform: translateX(-${shakeSize}) }
  ${Math.round(durationRatio * 75)}% { transform: translateX(${shakeSize}) }
  ${Math.round(durationRatio * 100)}% { transform: translateX(0) } 
  100% { transform: translateX(0) }
`;

export const fadeSlide = ({ direction = 'left', translationSize = '5px', opacityStart = 0 }) => keyframes`
  0% {
    opacity: ${opacityStart};
    transform: translateX(${direction === 'left' ? translationSize : `-${translationSize}`});
    display: none;
  }
  1% {
    display: block;
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;
