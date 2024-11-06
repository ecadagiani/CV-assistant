import Color from 'color';
import {
  BORDER_RADIUS,
  FONT_FAMILY,
  FONT_SIZE,
  GUTTER,
  SHADOWS,
  ZINDEX,
} from 'src/styles';
import { bubbleOpaqueStyle } from 'src/styles/base/bubble';
import { buttonStyle } from 'src/styles/base/button';
import { colors } from 'src/styles/colors';
import { verticalShake } from 'src/styles/keyframes';
import styled, { css } from 'styled-components';

export const FormContainer = styled.div`
  display: flex;
  align-items: center;
  gap: calc(${GUTTER} * 1.5);
`;

export const Form = styled.form`
  ${bubbleOpaqueStyle}
  box-shadow: ${SHADOWS.large};
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0;
  flex-grow: 1;
  
  animation: ${verticalShake({ durationRatio: 0.5, shakeSize: '5px' })} 1s ease-in-out infinite;
  animation-direction: alternate;
  animation-play-state: ${({ $shake }) => ($shake ? 'running' : 'paused')};
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const SubmitButton = styled.button`
  ${buttonStyle}
  padding: ${GUTTER};
  display: flex;
  background-color: transparent;
  color: ${colors.system.submitButton};
  align-items: center;
  height: 4em;

  &:disabled {
    color: ${Color(colors.system.submitButton).lighten(0.2).hex()};
    cursor: not-allowed;
  }
`;

export const InputTextArea = styled.textarea`
  border: none;
  background-color: transparent;
  font-size: ${FONT_SIZE.large};
  color: ${colors.system.text};
  flex-grow: 1;
  resize: none;
  font-family: ${FONT_FAMILY};
  padding: ${GUTTER};
  max-height: 40vh;
  align-self: center;
`;

export const SettingsContainer = styled.div`
  ${({ $isMobile }) => $isMobile && css`
    position: fixed;
    right: calc(${GUTTER} / 2);
    top: calc(${GUTTER} / 2);
  `}
`;

export const SettingsPopoverContainer = styled.div`
  position: relative;
`;

export const SettingsPopoverButton = styled.button`
  ${bubbleOpaqueStyle}
  border-radius: 50%;
  width: 3.8em;
  height: 3.8em;
  border: none;
  box-shadow: ${SHADOWS.large};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1;
  padding: 0;
  
  svg{
    width: 1.8em;
    fill: ${colors.system.submitButton};
  }

  &:hover {
    box-shadow: ${SHADOWS.medium};
  }


  ${({ $isMobile }) => $isMobile && css`
    width: 2.5em;
    height: 2.5em;

    svg{
      width: 1em;
    }      
  `}
`;

export const SettingsPopoverPanel = styled.div`
  transition: all 400ms cubic-bezier(0.15, 0.59, 0.3, 1);
  position: absolute;
  z-index: ${ZINDEX.modalOverlay};
  bottom: 100%;
  right: 0;
  padding-bottom: ${GUTTER};

  @media (prefers-reduced-motion: no-preference) {
    &.transition-enter{
    }
    &.transition-enterFrom{
      opacity: 0;
      transform: translate(20%, 0);
    }
    &.transition-enterTo{
      opacity: 1;
      transform: translate(0, 0);
    }
    &.transition-leave{
    }
    &.transition-leaveFrom{
      opacity: 1;
      transform: translate(0, 0);
    }
    &.transition-leaveTo{
      opacity: 0;
      transform: translate(-20%, 0);
    }
  }


  ${({ $isMobile }) => $isMobile && css`
    top: 100%;
    right: 0;
    bottom: auto;
    padding-top: ${GUTTER};
    padding-bottom: 0;
  `}
`;

export const SettingsItemContainer = styled.div`
  ${bubbleOpaqueStyle}
  box-shadow: ${SHADOWS.large};
  padding: 0;
  list-style: none;
  margin: 0;
  min-width: 9em;
  padding: calc(${GUTTER} * 0.5);
  display: flex;
  flex-direction: column;
  gap: calc(${GUTTER} * 0.2);
`;

export const SettingsItem = styled.button`
  ${buttonStyle}
  padding: ${GUTTER} calc(${GUTTER} * 1.5);
  border-radius: ${BORDER_RADIUS.small};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-transform: capitalize;
  white-space: nowrap;
  min-width: max-content;

  &:hover:not(:disabled) {
    background-color: ${Color(colors.system.bubble).darken(0.1).hex()};
  }

  &:disabled {
    cursor: not-allowed;
    color: ${Color(colors.system.text).lighten(0.5).hex()};
  }

  svg {
    width: 1.5em;
    padding-left: 0.4em;
    flex-shrink: 0;
  }
`;
