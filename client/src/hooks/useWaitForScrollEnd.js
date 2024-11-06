import { useCallback } from 'react';

/**
 * Custom hook to wait for the end of scrolling on a specified element.
 *
 * @param {React.RefObject} elementRef - The reference to the scrollable element.
 * @param {number} [delay=100] - The delay between scroll checks in milliseconds.
 * @param {number} [maxDelay=5000] - The maximum delay to wait for scroll end in milliseconds.
 * @returns {Promise<void>} A promise that resolves when scrolling has ended or the maximum delay is reached.
 */
const useWaitForScrollEnd = (elementRef, delay = 100, maxDelay = 5000) => useCallback(() => new Promise((resolve) => {
  let lastScrollTop = elementRef.current.scrollTop;
  let timeoutId;
  let elapsedTime = 0;

  const checkScroll = () => {
    const currentScrollTop = elementRef.current.scrollTop;
    // Check if the scroll position has changed
    if (currentScrollTop !== lastScrollTop) {
      lastScrollTop = currentScrollTop;
      clearTimeout(timeoutId); // clear the previous timeout
      timeoutId = setTimeout(() => { // set a new timeout, to debounce the scroll event
        elapsedTime += delay; // increment the elapsed time
        if (elapsedTime >= maxDelay) { // if the maximum delay is reached, resolve the promise
          resolve();
        } else {
          requestAnimationFrame(checkScroll); // otherwise, check the scroll position again
        }
      }, delay);
    } else {
      // if the scroll position has not changed, resolve the promise
      resolve();
    }
  };

  requestAnimationFrame(checkScroll);
}), [elementRef, delay, maxDelay]);

export default useWaitForScrollEnd;
