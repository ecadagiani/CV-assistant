import { createContext } from 'react';

export const contextDefaultValue = {
  isConnected: false,
  reset: () => {},
};

const SocketContext = createContext(contextDefaultValue);

export default SocketContext;
