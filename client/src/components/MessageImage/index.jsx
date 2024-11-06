import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import DateMessagePopover from 'src/components/DateMessagePopover';
import { BubbleContainer } from 'src/components/MessageBubble/styles';
import { useComponentWidth } from 'src/hooks/useComponentSize';
import useMessageDate from 'src/hooks/useMessageDate';
import { Image, ImageBubble, ImageSkeleton } from './styles';

function MessageImage({
  data, isOwn = false, date,
}) {
  const { toggleDate, displayDate } = useMessageDate();
  const [isLoad, setIsLoad] = useState(false);
  const [rowRef, rowWidth] = useComponentWidth();

  const [skeletonSize, setSkeletonSize] = useState({
    height: data?.height || 300,
    width: data?.width || 500,
  });

  useEffect(() => {
    if (rowWidth) {
      setSkeletonSize((oldSize) => ({
        // Set the width to the row width if the image is larger
        width: oldSize.width > rowWidth ? rowWidth : oldSize.width,
        // If the image is larger than the row, scale the height to keep the aspect ratio
        height: oldSize.width > rowWidth ? (rowWidth / oldSize.width) * oldSize.height : oldSize.height,
      }));
    }
  }, [rowWidth]);

  return (
    <BubbleContainer $isOwn={isOwn} ref={rowRef}>
      <ImageBubble
        onClick={toggleDate}
        style={!isLoad ? skeletonSize : {}}
      >
        {!isLoad && (
          <ImageSkeleton />
        )}
        <Image
          src={data?.src}
          alt={data?.alt}
          onLoad={() => setIsLoad(true)}
        />
      </ImageBubble>
      {displayDate && (
        <DateMessagePopover date={date} />
      )}
    </BubbleContainer>
  );
}

MessageImage.propTypes = {
  data: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
  }).isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  isOwn: PropTypes.bool,
};

const MemoizedMessageImage = React.memo(MessageImage);
export default MemoizedMessageImage;
