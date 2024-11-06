import { DefaultValue } from 'recoil';

/**
 * localStorageEffect is a custom effect for Recoil that synchronizes a Recoil state with a corresponding value in the browser's local storage.
 * not used
 * @param {string} key - The key used to store the value in local storage.
 * @param {object} options - Optional configuration options.
 * @param {boolean} options.withQueryStringInit - If true, initializes the Recoil state with the value from the query string if available.
 * @returns {function} - The effect function that can be used with Recoil's useRecoilEffect hook.
 */
export const localStorageEffect = (key, { withQueryStringInit = false } = {}) => ({ setSelf, onSet }) => {
  let value;
  if (withQueryStringInit) {
    const urlParams = new URLSearchParams(window.location.search);
    const queryStringValue = urlParams.get(key);
    if (queryStringValue) {
      value = JSON.parse(queryStringValue);
      localStorage.setItem(key, JSON.stringify(value)); // save to local storage
    }
  }

  // if no query string, get local storage key value
  if (!value && localStorage.getItem(key)) {
    try {
      value = JSON.parse(localStorage.getItem(key));
    } catch (error) { /* empty */ }
  }

  if (value) {
    setSelf(value);
  }

  onSet((newValue) => {
    if (newValue instanceof DefaultValue) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(newValue));
    }
  });
};

/**
 * queryStringInitEffect is a custom effect for Recoil that initializes a Recoil state with a value from the query string.
 * @param {string} key - The key used to retrieve the value from the query string.
 * @returns {function} - The effect function that can be used with Recoil's useRecoilEffect hook.
 */
export const queryStringInitEffect = (key) => ({ setSelf, onSet }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const queryStringValue = urlParams.get(key);
  if (queryStringValue) {
    setSelf(JSON.parse(queryStringValue));
  }
};
