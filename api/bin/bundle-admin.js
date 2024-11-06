// eslint-disable-next-line import/no-unresolved
import { bundle } from '@adminjs/bundler';
import { componentLoader } from '../src/admin/components.js';

// WARNING: this not work (in "^3.0.0"), when you use `window.AdminJS.env` in components

(async () => {
  await bundle({
    componentLoader,
    destinationDir: '.adminjs',
  });
})();
