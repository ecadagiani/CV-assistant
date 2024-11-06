import PropTypes from 'prop-types';
import Modal from 'src/components/Modal';
import {
  AlertButtonCancel, AlertButtonConfirm, AlertButtonContainer, AlertContainer, AlertText, AlertTitle,
} from './styles';

function Alert({
  title,
  isOpen,
  confirmButtonText,
  onConfirm,
  onCancel,
  text = null,
  showCancelButton = false,
  cancelButtonText = null,
  buttons = null,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} withCloseButton={false} size="small">
      <AlertContainer>
        <AlertTitle>{title}</AlertTitle>
        {text && (<AlertText>{text}</AlertText>)}
        {buttons ? (
          <AlertButtonContainer>{buttons}</AlertButtonContainer>
        ) : (
          <AlertButtonContainer>
            {showCancelButton && (
            <AlertButtonCancel onClick={onCancel}>{cancelButtonText}</AlertButtonCancel>
            )}
            <AlertButtonConfirm onClick={onConfirm}>{confirmButtonText}</AlertButtonConfirm>
          </AlertButtonContainer>
        )}
      </AlertContainer>
    </Modal>
  );
}

Alert.propTypes = {
  title: PropTypes.node.isRequired,
  text: PropTypes.node,
  isOpen: PropTypes.bool.isRequired,
  confirmButtonText: PropTypes.node.isRequired,
  showCancelButton: PropTypes.bool,
  cancelButtonText: PropTypes.node,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  buttons: PropTypes.node,
};

export default Alert;
