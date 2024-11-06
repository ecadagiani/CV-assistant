import { Dialog } from '@headlessui/react';
import {
  BORDER_RADIUS,
  DEVICE,
  GUTTER,
  SHADOWS,
  ZINDEX,
} from 'src/styles';
import { buttonStyle } from 'src/styles/base/button';
import { colors } from 'src/styles/colors';
import styled, { css } from 'styled-components';

const buttonSize = '2em';

export const Overlay = styled.div`
  background: rgba(255, 255, 255, 0.20);
  backdrop-filter: blur(5px);
  position: fixed;
  inset: 0;
  z-index: ${ZINDEX.modalOverlay};

  @media (prefers-reduced-motion: no-preference) {
    &.transition-enter{
      transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    &.transition-enterFrom{
      opacity: 0;      
    }
    &.transition-enterTo{
      opacity: 1;      
    }
    &.transition-leave{
      transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);      
    }
    &.transition-leaveFrom{
      opacity: 1;           
    }
    &.transition-leaveTo{
      opacity: 0;      
    }
  }
`;

export const ScrollContainer = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${ZINDEX.modalOverlay + 1};
  overflow-y: auto;
`;

export const CenterContainer = styled.div`
  display: flex;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  overflow-x: clip;
  padding: ${GUTTER};


  padding-top: calc(${GUTTER} + ${buttonSize} + ${GUTTER});
  @media ${DEVICE.tablet} {
    padding-top: ${GUTTER};
  }
`;

const modalStyle = css`
  background-color: ${colors.system.textBackground};
  border-radius: ${BORDER_RADIUS.medium};
  box-shadow: ${SHADOWS.medium};
  padding: ${GUTTER} calc(${GUTTER} * 2);
`;

export const Panel = styled(Dialog.Panel)`
  position: relative;
  width: 90vw;
  ${(props) => {
    if (props.$size === 'small') return 'max-width: 300px;';
    if (props.$size === 'medium') return 'max-width: 450px;';
    if (props.$size === 'large') return 'max-width: 600px;';
    return '';
  }}

  gap: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (prefers-reduced-motion: no-preference) {
    &.transition-enter{
      transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    &.transition-enterFrom{
      opacity: 0;      
      transform: translate(0, -2%) scale(0.96);
    }
    &.transition-enterTo{
      opacity: 1;      
      transform: scale(1);
    }
    &.transition-leave{
      transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);      
    }
    &.transition-leaveFrom{
      opacity: 1;           
    }
    &.transition-leaveTo{
      opacity: 0;      
    }
  }


  ${(props) => (props.$withPanelStyle ? modalStyle : '')}
`;

export const ModalButtonsContainer = styled.div`
  position: absolute;
  display: flex;
  gap: ${GUTTER};

  bottom: calc(100% + ${GUTTER});
  right: 0;
  flex-direction: row-reverse;

  @media ${DEVICE.tablet} {
    flex-direction: column;
    left: calc(100% + ${GUTTER});
    top: 0;
    right: unset;
    bottom: unset;
  }
`;

export const ModalButton = styled.button`
  ${modalStyle}
  ${buttonStyle}

  height: ${buttonSize};
  width: ${buttonSize};
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  svg{
    height: 70%;
    width: 70%;
    fill: ${colors.system.text};
  }

  &:hover {
    box-shadow: ${SHADOWS.large};
  }
`;

export const CloseModalButton = styled(ModalButton)`
  svg{
    height: 80%;
    width: 80%;
  }
`;

export const ModalCard = styled.div`
  ${modalStyle}
`;
