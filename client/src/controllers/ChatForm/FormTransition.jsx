import { Transition } from '@headlessui/react';
import PropTypes from 'prop-types';
import { useScrollChatToBottom } from 'src/hooks/useChatScroll';
import { FormTransitionContainer } from './styles';

function FormTransition({ show, children }) {
  const scrollChatToBottom = useScrollChatToBottom();

  return (
    <Transition
      show={show}
      $isSelected={show}
      as={FormTransitionContainer}
      enter="transition-enter"
      enterFrom="transition-enterFrom"
      enterTo="transition-enterTo"
      leave="transition-leave"
      leaveFrom="transition-leaveFrom"
      leaveTo="transition-leaveTo"
      afterEnter={scrollChatToBottom}
    >
      {children}
    </Transition>
  );
}
FormTransition.propTypes = {
  show: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default FormTransition;
