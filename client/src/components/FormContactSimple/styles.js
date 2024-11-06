import Color from 'color';
import {
  BORDER_RADIUS,
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  GUTTER,
  SHADOWS,
} from 'src/styles';
import { bubbleGlassStyle } from 'src/styles/base/bubble';
import { buttonStyle } from 'src/styles/base/button';
import { colors } from 'src/styles/colors';
import { verticalShake } from 'src/styles/keyframes';
import styled, { css } from 'styled-components';

export const Form = styled.form`
  ${bubbleGlassStyle}
  box-shadow: ${SHADOWS.large};
  padding: ${GUTTER};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  gap: calc(${GUTTER} * 1.5);
  
  animation: ${verticalShake({ durationRatio: 0.5, shakeSize: '5px' })} 1s ease-in-out infinite;
  animation-direction: alternate;
  animation-play-state: ${({ $shake }) => ($shake ? 'running' : 'paused')};
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const InputLabel = styled.label`
`;

export const InputText = styled.span`
  padding-left: calc(${GUTTER} / 2);
  padding-bottom: calc(${GUTTER} / 2);
  font-size: ${FONT_SIZE.medium};
`;

const inputsStyle = css`
  display: block;
  width: 100%;
  border: none;
  background-color: ${colors.system.textBackground};
  color: ${colors.system.text};
  border-radius: ${BORDER_RADIUS.small};
  padding: calc(${GUTTER} / 2 ) ${GUTTER};
  font-size: ${FONT_SIZE.large};
  box-shadow: ${SHADOWS.elevations.medium};
`;

export const InputEmail = styled.input`
  ${inputsStyle}
`;

export const InputName = styled.input`
  ${inputsStyle}
`;

export const TextAreaBody = styled.textarea`
  ${inputsStyle}
  
  flex-grow: 1;
  resize: none;
  font-family: ${FONT_FAMILY};
  padding: ${GUTTER};
  max-height: 25vh;
  min-height: 6rem; // 3 rows
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: ${GUTTER};
`;

export const SubmitButton = styled.button`
  ${buttonStyle}
  padding: calc(${GUTTER} / 2) ${GUTTER};
  text-transform: lowercase;
  background-color: ${colors.blue};
  color: ${colors.system.bubbleContainer};
  font-weight: ${FONT_WEIGHT.regular};
  border-radius: ${BORDER_RADIUS.small};
  font-size: ${FONT_SIZE.medium};

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;

  &:hover {
    box-shadow: ${SHADOWS.medium};
  }

  ${(props) => props.$formIsInvalid && css`
    color: ${Color(colors.system.bubbleContainer).fade(0.4).rgb().string()};
    background-color: ${Color(colors.blue).fade(0.4).rgb().string()};
    cursor: default;
    &:hover {
      box-shadow: none;
    }
  `}

  &:disabled{
    color: ${Color(colors.system.bubbleContainer).fade(0.4).rgb().string()};
    background-color: ${Color(colors.blue).fade(0.4).rgb().string()};
    cursor: not-allowed;
    &:hover {
      box-shadow: none;
    }
  }
  
`;

export const CancelButton = styled(SubmitButton)`
  background-color: transparent;
  color: ${colors.grey5};

  &:hover {
    box-shadow: none;
    scale: 1.05;
  }

  &:disabled{
    color: ${colors.grey2};
    background-color: transparent;
    cursor: not-allowed;
    &:hover {
      box-shadow: none;
      scale: 1;
    }
  }
`;

export const ErrorMessage = styled.span`
  position: absolute;
  color: ${(new Color(colors.red)).darken(0.2).hex()};
  font-size: ${FONT_SIZE.small};
  font-weight: ${FONT_WEIGHT.regular};
  padding-left: ${GUTTER};
  min-height: 1rem;
`;
