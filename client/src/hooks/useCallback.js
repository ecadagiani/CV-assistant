import { useCallback, useEffect, useRef } from 'react';

export const useMemoizedCallback = (callback, dependencies) => {
  // avoid the use of this hook. Only for non important callbacks
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...dependencies]);
  return useCallback((...args) => ref.current(...args), [ref]);
};
