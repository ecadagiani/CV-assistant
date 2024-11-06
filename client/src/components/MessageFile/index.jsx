import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DownloadIcon from 'src/assets/icons/download.svg?react';
import PdfIcon from 'src/assets/icons/file_pdf.svg?react';
import DateMessagePopover from 'src/components/DateMessagePopover';
import { Bubble, BubbleContainer } from 'src/components/MessageBubble/styles';
import useMessageDate from 'src/hooks/useMessageDate';
import MessageLine from '../MessageLine';
import {
  DownloadLink,
  FileContainer,
  FileIconContainer,
  FileName,
  FileTextContainer,
} from './styles';

function MessageFile({
  data, isOwn = false, date,
}) {
  const { t } = useTranslation();
  const { toggleDate, displayDate } = useMessageDate();

  return (
    <MessageLine>
      <BubbleContainer $isOwn={isOwn}>
        <Bubble onClick={toggleDate}>
          <FileContainer>
            <FileIconContainer
              href={data.url}
              target="_blank"
            >
              {data.fileType === 'application/pdf' && <PdfIcon />}
            </FileIconContainer>
            <FileTextContainer>
              <FileName>{data.name}</FileName>
              <DownloadLink
                href={data.url}
                target="_blank"
                download
              >
                {t('download')}
                <DownloadIcon />
              </DownloadLink>
            </FileTextContainer>
          </FileContainer>
        </Bubble>
        {displayDate && (
        <DateMessagePopover date={date} />
        )}
      </BubbleContainer>
    </MessageLine>
  );
}

MessageFile.propTypes = {
  data: PropTypes.shape({
    url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
  }).isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  isOwn: PropTypes.bool,
};

const MemoizedMessageFile = React.memo(MessageFile);
export default MemoizedMessageFile;
