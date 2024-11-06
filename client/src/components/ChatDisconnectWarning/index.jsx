import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DisconnectIcon from 'src/assets/icons/disconnect.svg?react';
import { useSocket } from 'src/hooks/useSocket';
import { DisconnectBlock, DisconnectContainer } from './style';

function ChatDisconnectWarning() {
  const { t } = useTranslation();
  const { isConnected } = useSocket();

  // dirty but simple: set a timer to delay the warning message
  const [isMounting, setIsMounting] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounting(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // display a warning if socket is created but not connected
  if (!isMounting && !isConnected) {
    return (
      <DisconnectContainer>
        <DisconnectBlock>
          <DisconnectIcon />
          {t('Chat is disconnected')}
        </DisconnectBlock>
      </DisconnectContainer>
    );
  }

  return null;
}

export default ChatDisconnectWarning;
