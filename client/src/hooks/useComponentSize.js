import { useCallback, useState } from 'react';

export function useComponentHeight() {
  const [height, setheight] = useState(0);

  const ref = useCallback((node) => {
    if (!node) return;
    const resizeObserver = new ResizeObserver(() => {
      setheight(node.getBoundingClientRect().height);
    });
    resizeObserver.observe(node);
  }, []);

  return [ref, height];
}

export function useComponentWidth() {
  const [width, setWidth] = useState(0);

  const ref = useCallback((node) => {
    if (!node) return;
    const resizeObserver = new ResizeObserver(() => {
      setWidth(node.getBoundingClientRect().width);
    });
    resizeObserver.observe(node);
  }, []);

  return [ref, width];
}
