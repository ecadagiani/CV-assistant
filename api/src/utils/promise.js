/* eslint-disable import/prefer-default-export */
import BPromise from 'bluebird';

export function BPromisify(promise) {
  return new BPromise((resolve, reject) => {
    promise.then(resolve).catch(reject);
  });
}
