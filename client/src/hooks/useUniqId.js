import { useId } from 'react';

export function useUniqId(prefix = '', suffix = '') {
  const id = useId();
  return prefix + id + suffix;
}
