/* eslint-disable react/no-unknown-property */

import { RecoilRoot } from 'recoil';
import RecoilNexus from 'recoil-nexus';
import Scene3D from 'src/components/Scene3D';
import StyleProvider from 'src/styles/StyleProvider';
import Chat from '../Chat';
import { AppContainer } from './styles';

function App() {
  return (
    <AppContainer id="App">
      <RecoilRoot>
        <RecoilNexus />
        <StyleProvider>
          <Scene3D />
          <Chat />
        </StyleProvider>
      </RecoilRoot>
    </AppContainer>
  );
}

export default App;
