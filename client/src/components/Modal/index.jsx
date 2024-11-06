import { Dialog, Transition } from '@headlessui/react';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import CloseIcon from 'src/assets/icons/close.svg?react';

import * as Styled from './styles';

function Modal({
  isOpen,
  onClose,
  children = null,
  withOverlay = true,
  withCloseButton = true,
  withPanelStyle = true,
  size = 'medium',
  buttons = null,
  ...rest
}) {
  return (
    <Transition
      show={isOpen}
      as={Fragment}
    >
      <Dialog
        onClose={onClose}
        {...rest}
      >
        {withOverlay && (
          <Transition.Child
            as={Fragment}
            enter="transition-enter"
            enterFrom="transition-enterFrom"
            enterTo="transition-enterTo"
            leave="transition-leave"
            leaveFrom="transition-leaveFrom"
            leaveTo="transition-leaveTo"
          >
            <Styled.Overlay aria-hidden="true" />
          </Transition.Child>
        )}
        <Styled.ScrollContainer>
          <Styled.CenterContainer>
            <Transition.Child
              as={Fragment}
              enter="transition-enter"
              enterFrom="transition-enterFrom"
              enterTo="transition-enterTo"
              leave="transition-leave"
              leaveFrom="transition-leaveFrom"
              leaveTo="transition-leaveTo"
            >
              <Styled.Panel $size={size} $withPanelStyle={withPanelStyle}>
                <Styled.ModalButtonsContainer>
                  { withCloseButton && (
                    <Styled.CloseModalButton onClick={onClose}>
                      <CloseIcon />
                    </Styled.CloseModalButton>
                  )}
                  {buttons}
                </Styled.ModalButtonsContainer>
                {children}
              </Styled.Panel>
            </Transition.Child>
          </Styled.CenterContainer>
        </Styled.ScrollContainer>
      </Dialog>
    </Transition>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  withOverlay: PropTypes.bool,
  withCloseButton: PropTypes.bool,
  withPanelStyle: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  buttons: PropTypes.node,
};

Modal.Title = Dialog.Title;
Modal.Description = Dialog.Description;
Modal.Card = Styled.ModalCard;
Modal.Button = Styled.ModalButton;

export default Modal;
