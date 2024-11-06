import axios from 'axios';
import PropTypes from 'prop-types';
import {
  useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import {
  conversationIdState,
  incognitoState,
  showAllConversationsState, userIdState,
} from 'src/store/chat';
import useMount from '../../hooks/useMount';
import { connect, emitInitializeConversation, socket } from '../../services/socket';
import onSendResponseSocket from './onSendResponseSocket';
import onSendStreamSocket from './onSendStreamSocket';
import SocketContext, { contextDefaultValue } from './socketContext';
import startSocket from './startSocket';

function SocketProvider({ children }) {
  const { i18n } = useTranslation();
  const showAllConversations = useRecoilValue(showAllConversationsState);
  const userId = useRecoilValue(userIdState);
  const conversationId = useRecoilValue(conversationIdState);
  const incognitoMode = useRecoilValue(incognitoState);
  const [isConnected, setIsConnected] = useState(false);

  /** ***************
   * Listen for socket events
   **************** */
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('send_responses', onSendResponseSocket);
    socket.on('send_stream', onSendStreamSocket);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('send_responses');
    };
  }, []);

  /** ***************
   * Initialize the chat on mount
   **************** */
  useMount(() => {
    const source = axios.CancelToken.source();
    startSocket({ // call /api/start to get userId and conversationId, and old messages
      userId,
      conversationId,
      language: i18n.language,
      allConversations: showAllConversations,
    }, source.token).then((data) => {
      // create a socket connection
      connect(data.userId, data.conversationId);
      // initialize the conversation
      socket.once('ready', () => {
        emitInitializeConversation(data.userId, data.conversationId, i18n.language, incognitoMode);
      });
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('initialize socket on mount', err);
    });

    // disconnect the socket on unmount and cancel the request
    return () => {
      source.cancel();
      socket.disconnect();
    };
  });

  /** ***************
   * Provide the socket context
   **************** */
  const contextValue = useMemo(() => ({
    ...contextDefaultValue,
    isConnected,
  }), [isConnected]);
    // reset]);
  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
}
SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SocketProvider;
