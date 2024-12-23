import { useEffect } from 'react';

const useMount = (callback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, []);
};

export default useMount;
