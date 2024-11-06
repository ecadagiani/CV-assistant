import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { USER_MESSAGE_TYPE } from 'src/constants';
import { showAllConversationsState } from 'src/store/chat';
import MessageBubble from '../MessageBubble';
import { Splitter, SplitterText } from './styles';

function ConversationSplitter({ date }) {
  const { i18n } = useTranslation();
  return (
    <Splitter>
      <SplitterText>
        { date.toLocaleString(i18n.language, {
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        }) }
      </SplitterText>
    </Splitter>
  );
}

ConversationSplitter.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

function MessageUser({
  data, isOwn = true, date,
}) {
  const { t } = useTranslation();
  const showAllConversations = useRecoilValue(showAllConversationsState);

  if (!data) {
    return null;
  }

  let text = '';
  switch (data?.type) {
    case USER_MESSAGE_TYPE.INITIATE:
      if (!showAllConversations) return null;
      return (
        <ConversationSplitter date={date} />
      );
    case USER_MESSAGE_TYPE.DEFAULT:
      text = data.content.text;
      break;
    case USER_MESSAGE_TYPE.CONTACT_SIMPLE_CANCEL:
      text = t('userMessage:cancel_simple_contact');
      break;
    case USER_MESSAGE_TYPE.CONTACT_SIMPLE_SEND:
      text = t('userMessage:send_simple_contact', data.content);
      break;
    default:
      return null;
  }
  return (
    <MessageBubble
      text={text}
      isOwn={isOwn}
      date={date}
    />
  );
}

MessageUser.propTypes = {
  data: PropTypes.shape({
    type: PropTypes.string,
    content: PropTypes.oneOfType([
      PropTypes.shape({
        text: PropTypes.string,
      }),
      PropTypes.shape({
        email: PropTypes.string,
        name: PropTypes.string,
        body: PropTypes.string,
      }),
    ]),
  }),
  date: PropTypes.instanceOf(Date).isRequired,
  isOwn: PropTypes.bool,
};


const MemoizedMessageUser = React.memo(MessageUser);
export default MemoizedMessageUser;
