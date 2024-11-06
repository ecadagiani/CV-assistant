import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { useRecoilValue } from 'recoil';
import MessageBubble from 'src/components/MessageBubble';
import MessageWithImage from 'src/components/MessageBubbleWithImage';
import MessageImage from 'src/components/MessageImage';
import Skills from 'src/components/MessageSkills';
import Timeline from 'src/components/MessageTimeline';
import { RESPONSE_TYPE } from 'src/constants';
import { messageStateWithContent } from 'src/store/messages';
import ButtonsLanguage from '../../components/ButtonsLanguage';
import ChatLoader from '../../components/ChatLoader';
import MessageAI from '../../components/MessageAI';
import MessageEvent from '../../components/MessageEvent';
import MessageFile from '../../components/MessageFile';
import MessageUser from '../../components/MessageUser';
import FormSpacer from './FormSpacer';
import { MessagesContainer, ScrollContainer } from './styles';

const ChatMessagesList = forwardRef(({ formHeight = 0 }, ref) => {
  const messages = useRecoilValue(messageStateWithContent);

  return (
    <ScrollContainer ref={ref} id="message-list">
      <MessagesContainer id="messages-container">
        <ButtonsLanguage />
        {messages.map((message) => (
          {
            [RESPONSE_TYPE.TEXT_RESPONSE]: (
              <MessageBubble
                key={message.id}
                text={message.content}
                isOwn={message.isOwn}
                date={message.date}
              />
            ),
            [RESPONSE_TYPE.LLM_RESPONSE]: (
              <MessageAI
                key={message.id}
                text={message.content?.text}
                isVerified={message.content?.isVerified}
                isOwn={message.isOwn}
                date={message.date}
              />
            ),
            [RESPONSE_TYPE.USER_MESSAGE]: (
              <MessageUser
                key={message.id}
                data={message.content}
                isOwn={message.isOwn}
                date={message.date}
              />
            ),
            [RESPONSE_TYPE.IMAGE]: (
              <MessageImage
                key={message.id}
                data={message.content}
                isOwn={message.isOwn}
                date={message.date}
              />
            ),
            [RESPONSE_TYPE.TEXT_WITH_IMAGE]: (
              <MessageWithImage
                key={message.id}
                text={message.content?.text}
                picture={message.content?.picture}
                pictureAlt={message.content?.pictureAlt}
                isOwn={message.isOwn}
                date={message.date}
              />
            ),
            [RESPONSE_TYPE.SKILLS]: (
              <Skills
                key={message.id}
                date={message.date}
                skillsData={message.content}
              />
            ),
            [RESPONSE_TYPE.TIMELINE]: (
              <Timeline
                key={message.id}
                timelineData={message.content}
                date={message.date}
              />
            ),
            [RESPONSE_TYPE.EVENT]: (
              <MessageEvent
                key={message.id}
                event={message.content}
                date={message.date}
              />
            ),
            [RESPONSE_TYPE.FILE]: (
              <MessageFile
                key={message.id}
                data={message.content}
                isOwn={message.isOwn}
                date={message.date}
              />
            ),
          }[message.type]
        ))}
        <ChatLoader />
        <FormSpacer height={formHeight} />
      </MessagesContainer>
    </ScrollContainer>
  );
});

ChatMessagesList.propTypes = {
  formHeight: PropTypes.number,
};

export default ChatMessagesList;
