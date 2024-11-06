import PropTypes from 'prop-types';
import React from 'react';
import DateMessagePopover from 'src/components/DateMessagePopover';
import { Bubble, BubbleContainer } from 'src/components/MessageBubble/styles';
import TextChat from 'src/components/TextChat';
import useMessageDate from 'src/hooks/useMessageDate';
import { Image, ImageContainer, MessageLineWithProfilPics } from './styles';

function MessageWithImage({
  text, picture, pictureAlt, isOwn = false, date,
}) {
  const { toggleDate, displayDate } = useMessageDate();

  return (
    <MessageLineWithProfilPics $isOwn={isOwn}>
      <ImageContainer>
        <Image src={picture} alt={pictureAlt} />
      </ImageContainer>
      <BubbleContainer $isOwn={isOwn}>
        <Bubble onClick={toggleDate}>
          <TextChat text={text} />
        </Bubble>
        {displayDate && (
        <DateMessagePopover date={date} />
        )}
      </BubbleContainer>
    </MessageLineWithProfilPics>
  );
}

MessageWithImage.propTypes = {
  text: PropTypes.string.isRequired,
  picture: PropTypes.string.isRequired,
  pictureAlt: PropTypes.string.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  isOwn: PropTypes.bool,
};

const MemoizedMessageWithImage = React.memo(MessageWithImage);
export default MemoizedMessageWithImage;
