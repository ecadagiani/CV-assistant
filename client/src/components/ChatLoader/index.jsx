import { useRecoilValue } from 'recoil';
import { isChatLoaderVisibleState } from 'src/store/chat';
import { Loader, LoaderContainer, LoaderContent } from './style';

function ChatLoader() {
  const isChatLoaderVisible = useRecoilValue(isChatLoaderVisibleState);
  if (isChatLoaderVisible) {
    return (
      <LoaderContainer>
        <Loader>
          <LoaderContent />
        </Loader>
      </LoaderContainer>
    );
  }

  return null;
}

export default ChatLoader;
