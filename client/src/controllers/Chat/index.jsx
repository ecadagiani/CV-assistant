import ChatButtonsList from 'src/controllers/ChatButtonsList';
import ChatForm from 'src/controllers/ChatForm';
import ChatMessagesList from 'src/controllers/ChatMessagesList';
import SocketProvider from 'src/controllers/Socket';
import { ChatInputFocusContext, useCreateContextChatInputFocus } from 'src/hooks/inputHooks';
import { ScrollChatContext, useCreateContextChatScroll } from 'src/hooks/useChatScroll';
import { useComponentHeight } from 'src/hooks/useComponentSize';
import ChatDisconnectWarning from '../../components/ChatDisconnectWarning';
import { BottomContainer, ChatContainer } from './styles';

function Chat() {
  const [bottomContainerRef, bottomHeight] = useComponentHeight();
  const { messageListRef, scrollChatContextValue } = useCreateContextChatScroll();
  const chatInputFocusContextValue = useCreateContextChatInputFocus();
  return (
    <SocketProvider>
      <ScrollChatContext.Provider value={scrollChatContextValue}>
        <ChatInputFocusContext.Provider value={chatInputFocusContextValue}>
          <ChatContainer id="chat-container">
            <ChatMessagesList ref={messageListRef} formHeight={bottomHeight} />
            <BottomContainer ref={bottomContainerRef}>
              <ChatDisconnectWarning />
              <ChatButtonsList />
              <ChatForm />
            </BottomContainer>
          </ChatContainer>
        </ChatInputFocusContext.Provider>
      </ScrollChatContext.Provider>
    </SocketProvider>
  );
}

export default Chat;
