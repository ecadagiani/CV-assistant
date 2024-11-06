import { useEffect, useRef } from 'react';

function useEventListener(eventName, handler, element = window, eventOptions = {}) {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener, eventOptions);

    // eslint-disable-next-line consistent-return
    return () => { element.removeEventListener(eventName, eventListener); };
  }, [eventName, element, eventOptions]);
}
export default useEventListener;
