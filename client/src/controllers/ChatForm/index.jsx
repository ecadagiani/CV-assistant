import React from 'react';
import { useRecoilValue } from 'recoil';
import FormContactSimple from 'src/components/FormContactSimple';
import FormDefault from 'src/components/FormDefault';
import { INPUT_TYPE } from 'src/constants';
import { inputTypeState } from 'src/store/input';
import FormTransition from './FormTransition';
import { FormContainer } from './styles';

function ChatForm() {
  const input = useRecoilValue(inputTypeState);
  let showedType = input?.type;
  switch (input?.type) {
    case INPUT_TYPE.CONTACT_SIMPLE:
      showedType = INPUT_TYPE.CONTACT_SIMPLE;
      break;
    case INPUT_TYPE.DEFAULT:
    default:
      showedType = INPUT_TYPE.DEFAULT;
      break;
  }

  return (
    <FormContainer>
      <FormTransition
        show={showedType === INPUT_TYPE.CONTACT_SIMPLE}
      >
        <FormContactSimple />
      </FormTransition>
      <FormTransition
        show={showedType === INPUT_TYPE.DEFAULT}
      >
        <FormDefault />
      </FormTransition>
    </FormContainer>
  );
}

const MemoizedChatForm = React.memo(ChatForm);
export default MemoizedChatForm;
