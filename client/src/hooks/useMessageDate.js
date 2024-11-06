import debounce from 'debounce';
import { useCallback, useState } from 'react';

function useMessageDate() {
  const [displayDate, setDisplayDate] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleDate = useCallback(debounce(() => {
    setDisplayDate((v) => !v);
  }, 300, true), []);
  return { toggleDate, displayDate };
}

export default useMessageDate;